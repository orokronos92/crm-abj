import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/sessions/[id]/desister
 *
 * Annule l'inscription d'un candidat ou élève et déclenche la promotion
 * automatique du premier EN_ATTENTE (priorité ELEVE > CANDIDAT, puis position).
 *
 * Body: { idInscription: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id, 10)

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de session invalide' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { idInscription } = body

    if (!idInscription) {
      return NextResponse.json(
        { success: false, error: 'idInscription requis' },
        { status: 400 }
      )
    }

    // Charger l'inscription à annuler
    const inscription = await prisma.inscriptionSession.findUnique({
      where: { idInscription },
      select: {
        idInscription: true,
        idSession: true,
        statutInscription: true,
        idEleve: true,
        idCandidat: true,
      },
    })

    if (!inscription) {
      return NextResponse.json(
        { success: false, error: 'Inscription introuvable' },
        { status: 404 }
      )
    }

    if (inscription.idSession !== sessionId) {
      return NextResponse.json(
        { success: false, error: 'Inscription n\'appartient pas à cette session' },
        { status: 400 }
      )
    }

    if (inscription.statutInscription === 'ANNULE') {
      return NextResponse.json(
        { success: false, error: 'Inscription déjà annulée' },
        { status: 400 }
      )
    }

    const etaitInscrit = inscription.statutInscription === 'INSCRIT' || inscription.statutInscription === 'CONFIRME'

    // Utiliser une transaction pour annuler + promouvoir atomiquement
    const result = await prisma.$transaction(async (tx) => {
      // 1. Annuler l'inscription
      await tx.inscriptionSession.update({
        where: { idInscription },
        data: {
          statutInscription: 'ANNULE',
          motifAnnulation: 'Désistement admin',
        },
      })

      let promeuu = null

      // 2. Si c'était un inscrit → libérer une place + promouvoir
      if (etaitInscrit) {
        // Décrementer nbInscrits
        await tx.session.update({
          where: { idSession: sessionId },
          data: { nbInscrits: { decrement: 1 } },
        })

        // Trouver le premier EN_ATTENTE par priorité (1=ELEVE, 2=CANDIDAT) puis position
        const premierEnAttente = await tx.inscriptionSession.findFirst({
          where: {
            idSession: sessionId,
            statutInscription: 'EN_ATTENTE',
          },
          orderBy: [
            { priorite: 'asc' },        // 1=ELEVE avant 2=CANDIDAT
            { positionAttente: 'asc' },  // puis ordre d'arrivée
          ],
          include: {
            eleve: {
              include: {
                candidat: {
                  include: {
                    prospect: { select: { nom: true, prenom: true } },
                  },
                },
              },
            },
            candidat: {
              include: {
                prospect: { select: { nom: true, prenom: true } },
              },
            },
          },
        })

        if (premierEnAttente) {
          // Promouvoir vers INSCRIT
          await tx.inscriptionSession.update({
            where: { idInscription: premierEnAttente.idInscription },
            data: {
              statutInscription: 'INSCRIT',
              dateConfirmation: new Date(),
              positionAttente: null,
              notifiePar: 'auto',
            },
          })

          // Incrémenter nbInscrits
          await tx.session.update({
            where: { idSession: sessionId },
            data: { nbInscrits: { increment: 1 } },
          })

          // Recompacter les positions d'attente restantes
          const restantsEnAttente = await tx.inscriptionSession.findMany({
            where: {
              idSession: sessionId,
              statutInscription: 'EN_ATTENTE',
              idInscription: { not: premierEnAttente.idInscription },
            },
            orderBy: [
              { priorite: 'asc' },
              { positionAttente: 'asc' },
            ],
          })

          for (let i = 0; i < restantsEnAttente.length; i++) {
            await tx.inscriptionSession.update({
              where: { idInscription: restantsEnAttente[i].idInscription },
              data: { positionAttente: i + 1 },
            })
          }

          // Préparer les infos du promu
          const nomPromu = premierEnAttente.eleve
            ? `${premierEnAttente.eleve.candidat?.prospect?.prenom} ${premierEnAttente.eleve.candidat?.prospect?.nom}`
            : `${premierEnAttente.candidat?.prospect?.prenom} ${premierEnAttente.candidat?.prospect?.nom}`

          promeuu = {
            idInscription: premierEnAttente.idInscription,
            type: premierEnAttente.idEleve ? 'eleve' : 'candidat',
            nom: nomPromu,
          }
        }
      }

      return { etaitInscrit, promeuu }
    })

    return NextResponse.json({
      success: true,
      message: etaitInscrit
        ? result.promeuu
          ? `Désistement enregistré. ${result.promeuu.nom} a été promu depuis la liste d'attente.`
          : 'Désistement enregistré. Aucun candidat en liste d\'attente.'
        : 'Retiré de la liste d\'attente.',
      promotion: result.promeuu,
    })
  } catch (error) {
    console.error('❌ Erreur POST /api/sessions/[id]/desister:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du désistement' },
      { status: 500 }
    )
  }
}
