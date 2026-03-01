import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const actifParam = searchParams.get('actif')
    const categorieParam = searchParams.get('categorie')

    const where: { actif?: boolean; categorie?: string } = {}

    if (actifParam === 'true') {
      where.actif = true
    }
    if (categorieParam) {
      where.categorie = categorieParam
    }

    const matieres = await prisma.matiere.findMany({
      where,
      select: {
        idMatiere: true,
        nom: true,
        code: true,
        categorie: true,
        actif: true
      },
      orderBy: [
        { categorie: 'asc' },
        { nom: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      matieres,
      total: matieres.length
    })

  } catch (error) {
    console.error('[API] Erreur récupération matières:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne serveur',
        matieres: []
      },
      { status: 500 }
    )
  }
}
