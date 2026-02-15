import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * API Route GET /api/salles
 *
 * Récupère la liste des salles avec filtres optionnels
 *
 * Query params:
 * - disponibleWeekend: boolean (optionnel)
 * - disponibleSoir: boolean (optionnel)
 * - capaciteMin: number (optionnel)
 * - statut: string (optionnel, défaut: ACTIVE)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Récupération des paramètres de filtrage
    const disponibleWeekendParam = searchParams.get('disponibleWeekend')
    const disponibleSoirParam = searchParams.get('disponibleSoir')
    const capaciteMinParam = searchParams.get('capaciteMin')
    const statutParam = searchParams.get('statut')

    // Construction du filtre Prisma
    const where: any = {}

    // Filtre par statut (défaut: ACTIVE)
    where.statut = statutParam || 'ACTIVE'

    // Filtre disponibilité weekend
    if (disponibleWeekendParam !== null) {
      where.disponibleWeekend = disponibleWeekendParam === 'true'
    }

    // Filtre disponibilité soir
    if (disponibleSoirParam !== null) {
      where.disponibleSoir = disponibleSoirParam === 'true'
    }

    // Filtre capacité minimum
    if (capaciteMinParam !== null) {
      const capaciteMin = parseInt(capaciteMinParam, 10)
      if (!isNaN(capaciteMin)) {
        where.capaciteMax = { gte: capaciteMin }
      }
    }

    // Requête avec filtres
    const salles = await prisma.salle.findMany({
      where,
      orderBy: { nom: 'asc' },
      select: {
        idSalle: true,
        nom: true,
        code: true,
        capaciteMax: true,
        surfaceM2: true,
        etage: true,
        equipements: true,
        formationsCompatibles: true,
        disponibleWeekend: true,
        disponibleSoir: true,
        statut: true,
        motifIndisponibilite: true,
        dateDebutIndispo: true,
        dateFinIndispo: true
      }
    })

    return NextResponse.json({
      success: true,
      salles
    })

  } catch (error) {
    console.error('❌ Erreur GET /api/salles:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des salles'
      },
      { status: 500 }
    )
  }
}
