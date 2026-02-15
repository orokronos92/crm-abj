import { NextRequest, NextResponse } from 'next/server'
import { EleveService } from '@/services/eleve.service'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/eleves/[id]
 * Récupère le détail complet d'un élève
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const eleveId = parseInt(id, 10)

    if (isNaN(eleveId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    const eleveService = new EleveService()
    const eleve = await eleveService.getEleveDetail(eleveId)

    return NextResponse.json(eleve)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'élève:', error)

    if (error instanceof Error && error.message === 'Élève non trouvé') {
      return NextResponse.json(
        { error: 'Élève non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'élève' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/eleves/[id]
 * Met à jour un élève (pour de futures fonctionnalités)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const eleveId = parseInt(id, 10)
    const body = await request.json()

    if (isNaN(eleveId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    // TODO: Implémenter la mise à jour avec validation des données
    // const eleveService = new EleveService()
    // const updatedEleve = await eleveService.updateEleve(eleveId, body)

    return NextResponse.json(
      { message: 'Fonctionnalité de mise à jour à venir' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élève:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'élève' },
      { status: 500 }
    )
  }
}