import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/planning/salles
 *
 * Retourne toutes les salles avec leur occupation par mois pour une année donnée.
 * L'occupation est calculée sur la base des jours réellement occupés (sessions + événements)
 * divisés par le nombre de jours du mois.
 *
 * Query params:
 * - annee: number (défaut: année courante)
 *
 * Pour chaque salle retourne :
 * - infos salle (nom, capacite, equipements…)
 * - mois[0..11] : { occupation: number (0-100), sessions: [], evenements: [], reservations: [] }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const annee = parseInt(searchParams.get('annee') || String(new Date().getFullYear()), 10)

    const debutAnnee = new Date(annee, 0, 1)
    const finAnnee = new Date(annee, 11, 31, 23, 59, 59)

    // Récupérer toutes les salles actives
    const salles = await prisma.salle.findMany({
      where: { statut: 'ACTIVE' },
      orderBy: { nom: 'asc' },
      select: {
        idSalle: true,
        nom: true,
        code: true,
        capaciteMax: true,
        equipements: true,
        formationsCompatibles: true,
        disponibleWeekend: true,
        disponibleSoir: true,
      }
    })

    // Récupérer les sessions qui chevauchent l'année
    // Note : pas de filtre idSalle car les sessions CAP ont leurs salles
    // stockées dans reservationSalle (plusieurs salles par session), pas dans session.idSalle
    const sessions = await prisma.session.findMany({
      where: {
        dateDebut: { lte: finAnnee },
        dateFin: { gte: debutAnnee },
        statutSession: { notIn: ['ANNULEE'] }
      },
      select: {
        idSession: true,
        idSalle: true,
        nomSession: true,
        dateDebut: true,
        dateFin: true,
        capaciteMax: true,
        nbInscrits: true,
        statutSession: true,
        formation: {
          select: { nom: true, codeFormation: true }
        }
      }
    })

    // Récupérer les événements de l'année (avec salle String pour l'instant)
    const evenements = await prisma.evenement.findMany({
      where: {
        date: { gte: debutAnnee, lte: finAnnee },
        statut: { notIn: ['ANNULE'] }
      },
      select: {
        idEvenement: true,
        type: true,
        titre: true,
        date: true,
        heureDebut: true,
        heureFin: true,
        salle: true,
        nombreParticipants: true,
        statut: true,
      }
    })

    // Récupérer les réservations détaillées (créneaux horaires) si elles existent
    // C'est LA source primaire pour les sessions multi-salles (CAP : chaque matière
    // peut être dans une salle différente, n8n crée une reservationSalle par matière)
    const reservations = await prisma.reservationSalle.findMany({
      where: {
        dateDebut: { lte: finAnnee },
        dateFin: { gte: debutAnnee },
        statut: { not: 'ANNULE' }
      },
      select: {
        idReservation: true,
        idSalle: true,
        idSession: true,
        idEvenement: true,
        dateDebut: true,
        dateFin: true,
        statut: true,
        matiere: true,
      }
    })

    // Index des sessions par id pour lookup rapide
    const sessionsById = new Map(sessions.map(s => [s.idSession, s]))

    // Calculer l'occupation par salle et par mois
    const sallesAvecOccupation = salles.map(salle => {
      // Source primaire : reservationSalle (couvre les sessions multi-salles créées par n8n)
      const reservationsDeSalle = reservations.filter(r => r.idSalle === salle.idSalle)

      // Source secondaire : sessions dont idSalle correspond directement (sessions simples)
      const sessionsDeSalleDirect = sessions.filter(s =>
        s.idSalle === salle.idSalle &&
        // Ne pas double-compter si une reservationSalle existe déjà pour cette session+salle
        !reservationsDeSalle.some(r => r.idSession === s.idSession)
      )

      const evenementsDeSalle = evenements.filter(e => e.salle === salle.nom)

      const mois = Array.from({ length: 12 }, (_, moisIdx) => {
        const debutMois = new Date(annee, moisIdx, 1)
        const finMois = new Date(annee, moisIdx + 1, 0, 23, 59, 59)
        const nbJoursDansMois = new Date(annee, moisIdx + 1, 0).getDate()

        // Réservations de la salle ce mois
        const reservationsCeMois = reservationsDeSalle.filter(r => {
          const rDebut = new Date(r.dateDebut)
          const rFin = new Date(r.dateFin)
          return rDebut <= finMois && rFin >= debutMois
        })

        // Sessions directes (sans reservationSalle) ce mois
        const sessionsDirCeMois = sessionsDeSalleDirect.filter(s => {
          const sDebut = new Date(s.dateDebut)
          const sFin = new Date(s.dateFin)
          return sDebut <= finMois && sFin >= debutMois
        })

        // Événements du mois
        const evenementsCeMois = evenementsDeSalle.filter(evt => {
          const evtDate = new Date(evt.date)
          return evtDate >= debutMois && evtDate <= finMois
        })

        // Calculer les jours réellement occupés (Set pour éviter doublons)
        const joursOccupes = new Set<number>()

        // Jours via reservationSalle (source principale pour sessions CAP multi-salles)
        reservationsCeMois.forEach(r => {
          const rDebut = new Date(r.dateDebut)
          const rFin = new Date(r.dateFin)
          const dateDebutEffective = rDebut < debutMois ? debutMois : rDebut
          const dateFinEffective = rFin > finMois ? finMois : rFin
          const current = new Date(dateDebutEffective)
          while (current <= dateFinEffective) {
            joursOccupes.add(current.getDate())
            current.setDate(current.getDate() + 1)
          }
        })

        // Jours via sessions directes (sessions simples sans reservationSalle)
        sessionsDirCeMois.forEach(s => {
          const sDebut = new Date(s.dateDebut)
          const sFin = new Date(s.dateFin)
          const dateDebutEffective = sDebut < debutMois ? debutMois : sDebut
          const dateFinEffective = sFin > finMois ? finMois : sFin
          const current = new Date(dateDebutEffective)
          while (current <= dateFinEffective) {
            joursOccupes.add(current.getDate())
            current.setDate(current.getDate() + 1)
          }
        })

        evenementsCeMois.forEach(evt => {
          const evtDate = new Date(evt.date)
          joursOccupes.add(evtDate.getDate())
        })

        const occupation = joursOccupes.size > 0
          ? Math.round((joursOccupes.size / nbJoursDansMois) * 100)
          : 0

        // Sessions associées à cette salle ce mois (via reservations OU direct)
        const sessionIdsViares = new Set(reservationsCeMois.map(r => r.idSession).filter(Boolean))
        const sessionsDirIds = new Set(sessionsDirCeMois.map(s => s.idSession))
        const allSessionIds = new Set([...sessionIdsViares, ...sessionsDirIds])

        const sessionsCeMois = [...allSessionIds]
          .map(id => sessionsById.get(id!))
          .filter(Boolean) as typeof sessions

        return {
          moisIndex: moisIdx,
          occupation,
          joursOccupes: joursOccupes.size,
          nbJoursDansMois,
          sessions: sessionsCeMois.map(s => ({
            id: s.idSession,
            nom: s.nomSession,
            formation: s.formation.nom,
            codeFormation: s.formation.codeFormation,
            dateDebut: s.dateDebut,
            dateFin: s.dateFin,
            capacite: s.capaciteMax,
            inscrits: s.nbInscrits,
            statut: s.statutSession,
          })),
          evenements: evenementsCeMois.map(e => ({
            id: e.idEvenement,
            type: e.type,
            titre: e.titre,
            date: e.date,
            heureDebut: e.heureDebut,
            heureFin: e.heureFin,
            participants: e.nombreParticipants,
          })),
          reservations: reservationsCeMois.map(r => ({
            id: r.idReservation,
            idSession: r.idSession,
            idEvenement: r.idEvenement,
            dateDebut: r.dateDebut,
            dateFin: r.dateFin,
            statut: r.statut,
            matiere: r.matiere,
          })),
        }
      })

      return {
        id: salle.idSalle,
        nom: salle.nom,
        code: salle.code,
        capaciteMax: salle.capaciteMax,
        equipements: salle.equipements,
        formationsCompatibles: salle.formationsCompatibles,
        disponibleWeekend: salle.disponibleWeekend,
        disponibleSoir: salle.disponibleSoir,
        mois,
      }
    })

    return NextResponse.json({
      success: true,
      annee,
      salles: sallesAvecOccupation,
    })

  } catch (error) {
    console.error('❌ Erreur GET /api/planning/salles:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du calcul d\'occupation des salles' },
      { status: 500 }
    )
  }
}
