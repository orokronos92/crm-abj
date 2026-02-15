/**
 * API Route pour récupérer le détail d'un formateur
 * GET /api/formateurs/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { FormateurService } from '@/services/formateur.service'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const formateurId = parseInt(id, 10)

    if (isNaN(formateurId)) {
      return NextResponse.json(
        { error: 'ID formateur invalide' },
        { status: 400 }
      )
    }

    const formateurService = new FormateurService()
    const formateur = await formateurService.getFormateurDetail(formateurId)

    return NextResponse.json(formateur)

  } catch (error) {
    console.error('Erreur récupération formateur:', error)

    if (error instanceof Error && error.message === 'Formateur non trouvé') {
      return NextResponse.json(
        { error: 'Formateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération du formateur' },
      { status: 500 }
    )
  }
}