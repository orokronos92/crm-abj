/**
 * API Planning Formateur
 * GET: Récupérer les sessions du formateur connecté
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || !session.user || session.user.role !== 'professeur') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const formateur = await prisma.formateur.findUnique({
      where: { idUtilisateur: session.user.id },
      select: { idFormateur: true },
    })

    if (!formateur) {
      return NextResponse.json({ success: false, error: 'Formateur non trouvé' }, { status: 404 })
    }

    const sessions = await prisma.session.findMany({
      where: {
        formateurPrincipalId: formateur.idFormateur,
        statutSession: { notIn: ['ANNULEE'] },
      },
      include: {
        formation: {
          select: { nom: true, dureeHeures: true },
        },
      },
      orderBy: { dateDebut: 'asc' },
    })

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const mapped = sessions.map((s) => {
      const debut = new Date(s.dateDebut)
      const fin = new Date(s.dateFin)
      fin.setHours(23, 59, 59)

      let filtre: 'EN_COURS' | 'A_VENIR' | 'TERMINE'
      if (fin < now) {
        filtre = 'TERMINE'
      } else if (debut <= now) {
        filtre = 'EN_COURS'
      } else {
        filtre = 'A_VENIR'
      }

      return {
        id: s.idSession,
        nomSession: s.nomSession || s.formation.nom,
        formation: s.formation.nom,
        dateDebut: s.dateDebut.toISOString().split('T')[0],
        dateFin: s.dateFin.toISOString().split('T')[0],
        salle: s.sallePrincipale || '—',
        nbInscrits: s.nbInscrits,
        capaciteMax: s.capaciteMax,
        statut: s.statutSession || 'PREVUE',
        filtre,
        dureeHeures: s.formation.dureeHeures,
        plagesHoraires: s.plagesHoraires,
      }
    })

    // Stats
    const sessionsEnCours = mapped.filter((s) => s.filtre === 'EN_COURS')
    const sessionsAVenir = mapped.filter((s) => s.filtre === 'A_VENIR')
    const totalEleves = mapped
      .filter((s) => s.filtre === 'EN_COURS')
      .reduce((sum, s) => sum + s.nbInscrits, 0)

    // Heures enseignées ce mois (sessions EN_COURS ou TERMINE ce mois)
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1)
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const heuresMois = sessions
      .filter((s) => {
        const debut = new Date(s.dateDebut)
        const fin = new Date(s.dateFin)
        return debut <= finMois && fin >= debutMois
      })
      .reduce((sum, s) => sum + (s.formation.dureeHeures || 0), 0)

    return NextResponse.json({
      success: true,
      sessions: mapped,
      stats: {
        sessionsEnCours: sessionsEnCours.length,
        sessionsAVenir: sessionsAVenir.length,
        totalEleves,
        heuresMois,
      },
    })
  } catch (error) {
    console.error('Erreur GET /api/formateur/planning:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
