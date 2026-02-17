import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const actifParam = searchParams.get('actif')

    const where: any = {}

    // Filtrer par statut actif si demandé
    if (actifParam === 'true') {
      where.actif = true
    }

    const formations = await prisma.formation.findMany({
      where,
      select: {
        idFormation: true,
        codeFormation: true,
        nom: true,
        categorie: true,
        dureeJours: true,
        dureeHeures: true,
        niveauRequis: true,
        diplomeDelivre: true,
        tarifStandard: true,
        description: true,
        actif: true
      },
      orderBy: [
        { categorie: 'asc' },
        { nom: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      formations,
      total: formations.length
    })

  } catch (error) {
    console.error('[API] Erreur récupération formations:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne serveur',
        formations: []
      },
      { status: 500 }
    )
  }
}
