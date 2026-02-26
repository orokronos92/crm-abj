import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/planning/formateurs
 *
 * Retourne tous les formateurs actifs avec leur statut par mois pour une année donnée.
 *
 * Pour chaque formateur et chaque mois :
 * - statut: 'session' | 'disponible' | 'indisponible' | 'libre'
 * - sessions: sessions confirmées ce mois
 * - disponibilites: créneaux de disponibilité déclarés
 * - nbJoursSession: jours effectivement en session
 * - nbJoursDisponibles: jours déclarés disponibles (hors session)
 *
 * Query params:
 * - annee: number (défaut: année courante)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const annee = parseInt(searchParams.get('annee') || String(new Date().getFullYear()), 10)

    const debutAnnee = new Date(annee, 0, 1)
    const finAnnee = new Date(annee, 11, 31, 23, 59, 59)

    // Récupérer tous les formateurs actifs
    const formateurs = await prisma.formateur.findMany({
      where: { statut: 'ACTIF' },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
      select: {
        idFormateur: true,
        nom: true,
        prenom: true,
        email: true,
        specialites: true,
        tarifJournalier: true,
      }
    })

    // Sessions de l'année avec formateurs
    const sessions = await prisma.session.findMany({
      where: {
        formateurPrincipalId: { not: null },
        dateDebut: { lte: finAnnee },
        dateFin: { gte: debutAnnee },
        statutSession: { notIn: ['ANNULEE'] }
      },
      select: {
        idSession: true,
        formateurPrincipalId: true,
        nomSession: true,
        dateDebut: true,
        dateFin: true,
        statutSession: true,
        formation: { select: { nom: true, codeFormation: true } }
      }
    })

    // Disponibilités déclarées de l'année
    const disponibilites = await prisma.disponibiliteFormateur.findMany({
      where: {
        date: { gte: debutAnnee, lte: finAnnee }
      },
      select: {
        idDisponibilite: true,
        idFormateur: true,
        date: true,
        creneauJournee: true,
        typeDisponibilite: true,
        idSession: true,
        formationConcernee: true,
      }
    })

    // Calculer le statut par formateur et par mois
    const formateursAvecPlanning = formateurs.map(formateur => {
      const sessionsFormateur = sessions.filter(
        s => s.formateurPrincipalId === formateur.idFormateur
      )
      const dispoFormateur = disponibilites.filter(
        d => d.idFormateur === formateur.idFormateur
      )

      const mois = Array.from({ length: 12 }, (_, moisIdx) => {
        const debutMois = new Date(annee, moisIdx, 1)
        const finMois = new Date(annee, moisIdx + 1, 0, 23, 59, 59)

        // Sessions ce mois
        const sessionsCeMois = sessionsFormateur.filter(session => {
          const sessionDebut = new Date(session.dateDebut)
          const sessionFin = new Date(session.dateFin)
          return sessionDebut <= finMois && sessionFin >= debutMois
        })

        // Disponibilités ce mois
        const dispoCeMois = dispoFormateur.filter(d => {
          const dDate = new Date(d.date)
          return dDate >= debutMois && dDate <= finMois
        })

        // Jours en session
        const joursSession = new Set<number>()
        sessionsCeMois.forEach(session => {
          const sessionDebut = new Date(session.dateDebut)
          const sessionFin = new Date(session.dateFin)
          const dateDebutEffective = sessionDebut < debutMois ? debutMois : sessionDebut
          const dateFinEffective = sessionFin > finMois ? finMois : sessionFin

          const current = new Date(dateDebutEffective)
          while (current <= dateFinEffective) {
            joursSession.add(current.getDate())
            current.setDate(current.getDate() + 1)
          }
        })

        // Jours disponibles déclarés (hors jours en session)
        const joursDisponibles = new Set<number>()
        dispoCeMois
          .filter(d => d.typeDisponibilite === 'DISPONIBLE')
          .forEach(d => {
            const jour = new Date(d.date).getDate()
            if (!joursSession.has(jour)) {
              joursDisponibles.add(jour)
            }
          })

        // Jours indisponibles
        const joursIndisponibles = new Set<number>()
        dispoCeMois
          .filter(d => d.typeDisponibilite === 'INDISPONIBLE')
          .forEach(d => {
            joursIndisponibles.add(new Date(d.date).getDate())
          })

        // Statut dominant du mois
        let statut: 'session' | 'disponible' | 'indisponible' | 'libre'
        if (joursSession.size > 0) {
          statut = 'session'
        } else if (joursDisponibles.size > 0) {
          statut = 'disponible'
        } else if (joursIndisponibles.size > 0) {
          statut = 'indisponible'
        } else {
          statut = 'libre' // Pas d'info déclarée
        }

        return {
          moisIndex: moisIdx,
          statut,
          nbJoursSession: joursSession.size,
          nbJoursDisponibles: joursDisponibles.size,
          nbJoursIndisponibles: joursIndisponibles.size,
          sessions: sessionsCeMois.map(s => ({
            id: s.idSession,
            nom: s.nomSession,
            formation: s.formation.nom,
            codeFormation: s.formation.codeFormation,
            dateDebut: s.dateDebut,
            dateFin: s.dateFin,
            statut: s.statutSession,
          })),
          disponibilites: dispoCeMois.map(d => ({
            id: d.idDisponibilite,
            date: d.date,
            creneau: d.creneauJournee,
            type: d.typeDisponibilite,
          })),
        }
      })

      return {
        id: formateur.idFormateur,
        nom: formateur.nom,
        prenom: formateur.prenom,
        nomComplet: `${formateur.prenom} ${formateur.nom}`,
        email: formateur.email,
        specialites: formateur.specialites,
        tarifJournalier: formateur.tarifJournalier,
        mois,
      }
    })

    // Calculer le nombre de formateurs disponibles par mois (pour alertes)
    const nbFormateursDisponiblesParMois = Array.from({ length: 12 }, (_, moisIdx) => {
      const count = formateursAvecPlanning.filter(f => {
        const m = f.mois[moisIdx]
        return m.statut === 'disponible' || m.statut === 'libre'
      }).length
      return { moisIndex: moisIdx, count, alerte: count < 2 }
    })

    return NextResponse.json({
      success: true,
      annee,
      formateurs: formateursAvecPlanning,
      alertesDisponibilite: nbFormateursDisponiblesParMois,
    })

  } catch (error) {
    console.error('❌ Erreur GET /api/planning/formateurs:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du calcul des disponibilités formateurs' },
      { status: 500 }
    )
  }
}
