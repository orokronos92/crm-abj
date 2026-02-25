import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sessions/[id]
 *
 * Retourne le détail d'une session avec ses élèves inscrits.
 * Pour chaque élève : nom, prénom, numéro dossier, statut inscription, moyenne, absences.
 *
 * Chemin de relation : InscriptionSession → Eleve → Candidat → Prospect
 */
export async function GET(
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

    // Récupérer les inscriptions avec le détail élève
    const inscriptions = await prisma.inscriptionSession.findMany({
      where: {
        idSession: sessionId,
        statutInscription: { notIn: ['ANNULE'] },
      },
      select: {
        idInscription: true,
        statutInscription: true,
        positionAttente: true,
        priorite: true,
        dateInscription: true,
        eleve: {
          select: {
            idEleve: true,
            numeroDossier: true,
            statutFormation: true,
            candidat: {
              select: {
                prospect: {
                  select: {
                    nom: true,
                    prenom: true,
                  },
                },
              },
            },
            evaluations: {
              select: {
                note: true,
              },
              where: {
                note: { not: null },
              },
            },
            presences: {
              select: {
                statutPresence: true,
              },
              where: {
                idSession: sessionId,
              },
            },
          },
        },
        candidat: {
          select: {
            idCandidat: true,
            numeroDossier: true,
            prospect: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
      orderBy: [
        { priorite: 'asc' },
        { positionAttente: 'asc' },
        { idInscription: 'asc' },
      ],
    })

    // Formater les inscriptions
    const tous = inscriptions.map((inscription) => {
      // Cas 1 : Inscription avec un élève
      if (inscription.eleve) {
        const eleve = inscription.eleve
        const prospect = eleve.candidat?.prospect

        const notes = eleve.evaluations
          .map((e) => (e.note ? Number(e.note) : null))
          .filter((n): n is number => n !== null)
        const moyenne = notes.length > 0
          ? notes.reduce((sum, n) => sum + n, 0) / notes.length
          : 0

        const absences = eleve.presences.filter(
          (p) =>
            p.statutPresence === 'ABSENT' ||
            p.statutPresence === 'ABSENT_JUSTIFIE'
        ).length

        return {
          idInscription: inscription.idInscription,
          id: eleve.idEleve,
          type: 'eleve' as const,
          nom: prospect?.nom || 'Inconnu',
          prenom: prospect?.prenom || '',
          numeroDossier: eleve.numeroDossier,
          statutInscription: inscription.statutInscription || 'INSCRIT',
          priorite: inscription.priorite,
          positionAttente: inscription.positionAttente,
          dateInscription: inscription.dateInscription,
          moyenne,
          absences,
        }
      }

      // Cas 2 : Inscription avec un candidat
      if (inscription.candidat) {
        const candidat = inscription.candidat
        const prospect = candidat.prospect

        return {
          idInscription: inscription.idInscription,
          id: candidat.idCandidat,
          type: 'candidat' as const,
          nom: prospect?.nom || 'Inconnu',
          prenom: prospect?.prenom || '',
          numeroDossier: candidat.numeroDossier || '',
          statutInscription: inscription.statutInscription || 'EN_ATTENTE',
          priorite: inscription.priorite,
          positionAttente: inscription.positionAttente,
          dateInscription: inscription.dateInscription,
          moyenne: 0,
          absences: 0,
        }
      }

      return null
    }).filter((e): e is NonNullable<typeof e> => e !== null)

    // Séparer inscrits et liste d'attente
    const inscrits = tous.filter(
      (e) => e.statutInscription === 'INSCRIT' || e.statutInscription === 'CONFIRME'
    )
    const listeAttente = tous.filter(
      (e) => e.statutInscription === 'EN_ATTENTE'
    )

    return NextResponse.json({
      success: true,
      sessionId,
      eleves: tous,  // Tous pour compatibilité descendante
      inscrits,
      listeAttente,
      total: tous.length,
      nbInscrits: inscrits.length,
      nbAttente: listeAttente.length,
    })
  } catch (error) {
    console.error('❌ Erreur GET /api/sessions/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des élèves de la session' },
      { status: 500 }
    )
  }
}
