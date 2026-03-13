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

    // Récupérer les réservations de salle pour l'onglet planning
    const reservations = await prisma.reservationSalle.findMany({
      where: {
        idSession: sessionId,
        statut: { not: 'ANNULE' },
      },
      select: {
        idReservation: true,
        dateDebut: true,
        dateFin: true,
        matiere: true,
        statut: true,
        notes: true,
        salle: {
          select: {
            idSalle: true,
            nom: true,
          },
        },
        formateur: {
          select: {
            idFormateur: true,
            nom: true,
            prenom: true,
          },
        },
      },
      orderBy: { dateDebut: 'asc' },
    })

    return NextResponse.json({
      success: true,
      sessionId,
      eleves: tous,  // Tous pour compatibilité descendante
      inscrits,
      listeAttente,
      total: tous.length,
      nbInscrits: inscrits.length,
      nbAttente: listeAttente.length,
      reservations,
    })
  } catch (error) {
    console.error('❌ Erreur GET /api/sessions/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des élèves de la session' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sessions/[id]
 *
 * Mise à jour partielle d'une session.
 * Actuellement : assignation du formateur principal (formateurPrincipalId).
 */
export async function PATCH(
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
    const { formateurPrincipalId } = body

    // Vérifier que la session existe
    const session = await prisma.session.findUnique({
      where: { idSession: sessionId },
      select: { idSession: true, nomSession: true, statutSession: true }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session introuvable' },
        { status: 404 }
      )
    }

    // Mettre à jour le formateur principal + cascade sur les réservations
    const [updated] = await prisma.$transaction([
      prisma.session.update({
        where: { idSession: sessionId },
        data: { formateurPrincipalId: formateurPrincipalId ?? null },
        select: {
          idSession: true,
          nomSession: true,
          formateurPrincipalId: true,
          formateurPrincipal: { select: { nom: true, prenom: true } }
        }
      }),
      prisma.reservationSalle.updateMany({
        where: {
          idSession: sessionId,
          statut: { not: 'ANNULE' },
        },
        data: { idFormateur: formateurPrincipalId ?? null },
      }),
    ])

    const nomFormateur = updated.formateurPrincipal
      ? `${updated.formateurPrincipal.prenom} ${updated.formateurPrincipal.nom}`
      : null

    console.log(`[PATCH /api/sessions/${sessionId}] Formateur principal → ${nomFormateur ?? 'aucun'}`)

    return NextResponse.json({
      success: true,
      message: nomFormateur
        ? `Formateur ${nomFormateur} assigné avec succès`
        : 'Formateur désassigné',
      formateurPrincipalId: updated.formateurPrincipalId,
      formateurPrincipal: nomFormateur,
    })

  } catch (error) {
    console.error('❌ Erreur PATCH /api/sessions/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sessions/[id]
 *
 * Soft delete d'une session avec effets en cascade :
 * - Session → statutSession = 'ANNULEE' (traçabilité : qui, quand, motif)
 * - InscriptionSession → statutInscription = 'ANNULE'
 * - ReservationSalle → statut = 'ANNULE' (couvre aussi les holds RDV)
 *
 * Interdit si la session est EN_COURS (formation active → intervention manuelle requise).
 */
export async function DELETE(
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

    // Récupérer la session pour vérifications
    const session = await prisma.session.findUnique({
      where: { idSession: sessionId },
      select: { idSession: true, nomSession: true, statutSession: true }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session introuvable' },
        { status: 404 }
      )
    }

    if (session.statutSession === 'ANNULEE') {
      return NextResponse.json(
        { success: false, error: 'Cette session est déjà annulée' },
        { status: 409 }
      )
    }

    if (session.statutSession === 'EN_COURS') {
      return NextResponse.json(
        { success: false, error: 'Impossible d\'annuler une session en cours. Toute intervention sur une session active doit être effectuée manuellement.' },
        { status: 422 }
      )
    }

    // Récupérer le motif depuis le body (optionnel)
    let motifAnnulation: string | null = null
    try {
      const body = await request.json()
      motifAnnulation = body.motif || null
    } catch {
      // Body absent ou invalide, motif reste null
    }

    const dateAnnulation = new Date()

    // Cascade atomique dans une transaction
    const [nbInscriptions, nbReservations] = await prisma.$transaction(async (tx) => {
      const inscriptions = await tx.inscriptionSession.updateMany({
        where: {
          idSession: sessionId,
          statutInscription: { notIn: ['ANNULE'] }
        },
        data: {
          statutInscription: 'ANNULE',
          motifAnnulation: motifAnnulation || 'Session annulée'
        }
      })

      const reservations = await tx.reservationSalle.updateMany({
        where: {
          idSession: sessionId,
          statut: { not: 'ANNULE' }
        },
        data: {
          statut: 'ANNULE',
          motifAnnulation: motifAnnulation || 'Session annulée'
        }
      })

      await tx.session.update({
        where: { idSession: sessionId },
        data: {
          statutSession: 'ANNULEE',
          motifAnnulation,
          dateAnnulation,
          // annulePar : null en mode démo (pas d'auth active)
        }
      })

      return [inscriptions.count, reservations.count]
    })

    console.log(`[DELETE /api/sessions/${sessionId}] ✅ Session "${session.nomSession}" annulée — ${nbInscriptions} inscriptions, ${nbReservations} réservations annulées`)

    return NextResponse.json({
      success: true,
      message: `Session "${session.nomSession}" annulée avec succès`,
      data: {
        sessionId,
        nbInscriptions,
        nbReservations
      }
    })

  } catch (error) {
    console.error('❌ Erreur DELETE /api/sessions/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'annulation de la session' },
      { status: 500 }
    )
  }
}
