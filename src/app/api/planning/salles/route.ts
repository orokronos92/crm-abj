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
        totalHeuresProgramme: true,
        formation: {
          select: { nom: true, codeFormation: true, dureeHeures: true }
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
        participantsInscrits: true,
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
        idCandidat: true,
        idLot: true,
        token: true,
        dateDebut: true,
        dateFin: true,
        statut: true,
        expiresAt: true,
        matiere: true,
        candidat: {
          select: {
            numeroDossier: true,
            prospect: { select: { nom: true, prenom: true } }
          }
        }
      }
    })

    // Pour les holds avec idLot, récupérer TOUS les candidats inscrits dans ce lot
    // (un hold est un bucket collectif : idCandidat ne pointe que vers le dernier ayant validé)
    const lotsIds = [...new Set(
      reservations
        .filter(r => r.token !== null && r.idLot !== null)
        .map(r => r.idLot as string)
    )]

    // Map idLot → liste de candidats inscrits
    const candidatsParLot = new Map<string, Array<{ nom: string; prenom: string; numeroDossier: string | null }>>()

    if (lotsIds.length > 0) {
      // Récupérer les candidats via les événements ENTRETIEN_PRESENTIEL liés à ce lot
      // On cherche les candidats dont dateRdvPresentiel est dans le range des holds J1 de ce lot
      const holdsJ1ParLot = new Map<string, Date>()
      reservations
        .filter(r => r.token !== null && r.idLot !== null)
        .forEach(r => {
          // On garde la plus ancienne date par lot (c'est le J1)
          const lotId = r.idLot as string
          const existing = holdsJ1ParLot.get(lotId)
          if (!existing || new Date(r.dateDebut) < existing) {
            holdsJ1ParLot.set(lotId, new Date(r.dateDebut))
          }
        })

      for (const [lotId, dateJ1] of holdsJ1ParLot.entries()) {
        const dateDebut = new Date(dateJ1)
        dateDebut.setHours(0, 0, 0, 0)
        const dateFin = new Date(dateJ1)
        dateFin.setHours(23, 59, 59, 999)

        const candidatsInscrits = await prisma.candidat.findMany({
          where: {
            dateRdvPresentiel: { gte: dateDebut, lte: dateFin },
          },
          select: {
            numeroDossier: true,
            prospect: { select: { nom: true, prenom: true } }
          }
        })

        if (candidatsInscrits.length > 0) {
          candidatsParLot.set(lotId, candidatsInscrits.map(c => ({
            nom: c.prospect?.nom ?? '',
            prenom: c.prospect?.prenom ?? '',
            numeroDossier: c.numeroDossier,
          })))
        }
      }
    }

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

        // Calcul horaire : heures occupées / capacité totale (13h/jour × nb jours du mois)
        // L'école est ouverte 08h–21h = 13h/jour
        const HEURES_PAR_JOUR = 13
        const capaciteTotaleHeures = nbJoursDansMois * HEURES_PAR_JOUR
        let heuresOccupees = 0

        // Réservations de cours (sans token = séances planifiées, pas holds RDV)
        // dateDebut/dateFin sont à l'heure précise → durée exacte
        reservationsCeMois
          .filter(r => r.token === null)
          .forEach(r => {
            const dureeH = (new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()) / (1000 * 3600)
            if (dureeH > 0) heuresOccupees += dureeH
          })

        // Sessions directes (sans reservationSalle associée)
        // On proratise les heures totales de la formation au nombre de jours dans ce mois
        sessionsDirCeMois.forEach(s => {
          const heuresFormation = s.totalHeuresProgramme ?? s.formation.dureeHeures ?? 0
          if (heuresFormation <= 0) return
          // Durée totale de la session en jours calendaires
          const debutSession = new Date(s.dateDebut)
          const finSession = new Date(s.dateFin)
          const dureeTotaleMs = finSession.getTime() - debutSession.getTime()
          const dureeTotaleJours = dureeTotaleMs / (1000 * 3600 * 24) + 1
          // Jours de la session dans ce mois
          const debutEffectif = debutSession < debutMois ? debutMois : debutSession
          const finEffectif = finSession > finMois ? finMois : finSession
          const joursDansMoisMs = finEffectif.getTime() - debutEffectif.getTime()
          const joursDansMois = joursDansMoisMs / (1000 * 3600 * 24) + 1
          // Prorata : heures formation × (jours dans ce mois / durée totale)
          const heuresProratisees = heuresFormation * (joursDansMois / dureeTotaleJours)
          heuresOccupees += heuresProratisees
        })

        // Événements : durée via heureDebut/heureFin (format HH:MM)
        evenementsCeMois.forEach(evt => {
          if (evt.heureDebut && evt.heureFin) {
            const [hD, mD] = evt.heureDebut.split(':').map(Number)
            const [hF, mF] = evt.heureFin.split(':').map(Number)
            const dureeH = (hF * 60 + mF - (hD * 60 + mD)) / 60
            if (dureeH > 0) heuresOccupees += dureeH
          }
        })

        const occupation = heuresOccupees > 0
          ? Math.min(100, Math.round((heuresOccupees / capaciteTotaleHeures) * 100))
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
          heuresOccupees: Math.round(heuresOccupees * 10) / 10,
          capaciteTotaleHeures,
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
            idEvenement: e.idEvenement,
            type: e.type,
            titre: e.titre,
            date: e.date,
            heureDebut: e.heureDebut,
            heureFin: e.heureFin,
            participants: e.nombreParticipants,
            nombreParticipants: e.nombreParticipants,
            participantsInscrits: e.participantsInscrits,
          })),
          // Réservations de session/cours : pas de token (créées par n8n pour planifier des cours)
          reservations: reservationsCeMois
            .filter(r => r.token === null)
            .map(r => ({
              id: r.idReservation,
              idSession: r.idSession,
              idEvenement: r.idEvenement,
              dateDebut: r.dateDebut,
              dateFin: r.dateFin,
              statut: r.statut,
              matiere: r.matiere,
            })),
          // Holds RDV entretien : ont un token (et idLot). Bucket collectif :
          // plusieurs candidats peuvent valider le même lot.
          // On récupère la liste complète via candidatsParLot (par dateRdvPresentiel).
          holds: reservationsCeMois
            .filter(r => r.token !== null)
            .map(r => {
              const candidatsDuLot = r.idLot ? (candidatsParLot.get(r.idLot) ?? []) : []
              // Fallback si aucun inscrit trouvé via lot : afficher le candidat lié directement
              const candidatsFallback = r.candidat
                ? [{ nom: r.candidat.prospect?.nom ?? '', prenom: r.candidat.prospect?.prenom ?? '', numeroDossier: r.candidat.numeroDossier ?? null }]
                : []
              const candidats = candidatsDuLot.length > 0 ? candidatsDuLot : candidatsFallback
              const nbInscrits = candidats.length
              const nomAffiche = nbInscrits > 1
                ? `${nbInscrits} inscrits`
                : candidats[0]
                  ? `${candidats[0].prenom} ${candidats[0].nom}`.trim() || candidats[0].numeroDossier || null
                  : null
              return {
                idReservation: r.idReservation,
                token: r.token,
                idCandidat: r.idCandidat,
                idLot: r.idLot,
                statut: r.statut,
                expiresAt: r.expiresAt,
                dateDebut: r.dateDebut,
                dateFin: r.dateFin,
                nomCandidat: nomAffiche,
                numeroDossier: candidats[0]?.numeroDossier ?? null,
                candidats,
                nbInscrits,
              }
            }),
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
