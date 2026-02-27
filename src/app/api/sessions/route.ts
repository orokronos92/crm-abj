import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/sessions
 *
 * Récupère la liste des sessions depuis la base de données
 * avec possibilité de filtrer par statut
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statutFilter = searchParams.get('statut')
    const idFormationParam = searchParams.get('idFormation')

    // Construire le filtre
    const where: any = {}

    // Filtrer par formation si demandé
    if (idFormationParam) {
      where.idFormation = parseInt(idFormationParam, 10)
    }

    // Filtrer par statut de validation
    if (statutFilter && statutFilter !== 'TOUS') {
      where.statutValidation = statutFilter
    }

    // Filtrer par statut de session (pour modal conversion candidat)
    // Accepte plusieurs statuts séparés par virgule
    const statutSessionParam = searchParams.get('statutSession')
    if (statutSessionParam) {
      const statuts = statutSessionParam.split(',')
      where.statutSession = {
        in: statuts
      }
    }

    // Récupérer les sessions avec leurs relations
    const sessions = await prisma.session.findMany({
      where,
      include: {
        formation: {
          select: {
            codeFormation: true,
            nom: true,
          }
        },
        formateurPrincipal: {
          select: {
            nom: true,
            prenom: true,
          }
        },
        salle: {
          select: {
            nom: true,
          }
        },
        inscriptionsSessions: {
          select: {
            idInscription: true,
          }
        },
        reservationsSalles: {
          select: {
            dateDebut: true,
            dateFin: true,
            statut: true,
          }
        },
      },
      orderBy: {
        creeLe: 'desc'
      }
    })

    // Formater les données pour correspondre à la structure attendue par le frontend
    const formattedSessions = sessions.map(session => {
      // Calculer la durée en jours
      const dateDebut = new Date(session.dateDebut)
      const dateFin = new Date(session.dateFin)
      const dureeJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))

      // Extraire les vraies données depuis les métadonnées
      let totalHeures = 0
      let nbParticipants: number | null = null // Sera rempli depuis les métadonnées ou capaciteMax
      let formateurPrincipal = session.formateurPrincipal
        ? `${session.formateurPrincipal.prenom} ${session.formateurPrincipal.nom}`
        : 'Non assigné'
      let salle = session.salle?.nom || session.sallePrincipale || 'Non assignée'

      if (session.notes) {
        try {
          const metadata = JSON.parse(session.notes)

          // Récupérer le total d'heures depuis le programme (CAP) ou les métadonnées (COURTE)
          if (metadata.totalHeuresProgramme) {
            totalHeures = metadata.totalHeuresProgramme
          } else if (metadata.programme && Array.isArray(metadata.programme)) {
            totalHeures = metadata.programme.reduce((sum: number, m: any) => sum + (m.heures || 0), 0)
          }

          // nbParticipants des métadonnées ignoré — n8n écrit directement capaciteMax en BDD
          // Les anciennes métadonnées contiennent la capacité de la salle (ex: 80) et non le nb de participants

          // Récupérer le formateur principal depuis les métadonnées si pas déjà défini
          if (formateurPrincipal === 'Non assigné' && metadata.formateurs && metadata.formateurs.length > 0) {
            // Si on a le programme, calculer le formateur avec le plus d'heures
            if (metadata.programme && Array.isArray(metadata.programme)) {
              const heuresParFormateur = new Map<number, { nom: string, heures: number }>()
              metadata.formateurs.forEach((f: any) => {
                heuresParFormateur.set(f.id, { nom: f.nom, heures: 0 })
              })
              metadata.programme.forEach((matiere: any) => {
                metadata.formateurs.forEach((formateur: any) => {
                  if (formateur.matieres && formateur.matieres.includes(matiere.nom)) {
                    const data = heuresParFormateur.get(formateur.id)
                    if (data) {
                      data.heures += matiere.heures || 0
                      heuresParFormateur.set(formateur.id, data)
                    }
                  }
                })
              })
              let maxHeures = 0
              heuresParFormateur.forEach((data) => {
                if (data.heures > maxHeures) {
                  maxHeures = data.heures
                  formateurPrincipal = data.nom
                }
              })
            } else {
              // Sinon prendre le premier formateur
              formateurPrincipal = metadata.formateurs[0].nom
            }
          }

          // Récupérer la salle depuis les métadonnées pour les formations COURTE
          if (salle === 'Non assignée' && metadata.salles && metadata.salles.length > 0) {
            salle = metadata.salles[0].nom
          } else if (salle === 'Non assignée' && metadata.salleId) {
            salle = `Salle ${metadata.salleId}`
          }
        } catch (e) {
          console.error('Erreur parsing métadonnées session:', e)
        }
      }

      // Calculer les vraies heures depuis les réservations (créneaux précis)
      // Sommer (dateFin - dateDebut) pour chaque réservation non annulée
      const heuresReservations = session.reservationsSalles
        .filter(r => r.statut !== 'ANNULE')
        .reduce((sum, r) => {
          const dureeMs = new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()
          return sum + dureeMs / (1000 * 60 * 60)
        }, 0)

      // Compter les jours distincts occupés par les réservations
      const joursDistinctsReservations = new Set(
        session.reservationsSalles
          .filter(r => r.statut !== 'ANNULE')
          .map(r => new Date(r.dateDebut).toISOString().split('T')[0])
      ).size

      // Priorité : réservations réelles > métadonnées > fenêtre de dates × 7h (estimation)
      const dureeHeuresFinale = heuresReservations > 0
        ? Math.round(heuresReservations)
        : totalHeures > 0
        ? totalHeures
        : null

      const dureeJoursFinale = joursDistinctsReservations > 0
        ? joursDistinctsReservations
        : dureeJours

      return {
        id: session.idSession,
        formation: session.formation?.nom || 'Formation non définie',
        code_formation: session.formation?.codeFormation || '',
        nom_session: session.nomSession,
        formateur_principal: formateurPrincipal,
        salle: salle,
        capacite_max: session.capaciteMax ?? 0,
        places_prises: session.nbInscrits || session.inscriptionsSessions.length,
        liste_attente: 0, // TODO: implémenter liste d'attente
        date_debut: session.dateDebut.toISOString().split('T')[0],
        date_fin: session.dateFin.toISOString().split('T')[0],
        statut: session.statutValidation,
        statut_session: session.statutSession,
        planning_ia: session.planningIA,
        rapport_ia: session.rapportIA,
        notes: session.notes,
        // Champs supplémentaires pour le modal de détail
        duree_jours: dureeJoursFinale,
        duree_heures: dureeHeuresFinale, // null si pas encore planifié
        formateurs_secondaires: [], // À implémenter plus tard si nécessaire
      }
    })

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      total: formattedSessions.length
    })

  } catch (error) {
    console.error('Erreur récupération sessions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur',
        sessions: [],
        total: 0
      },
      { status: 500 }
    )
  }
}
