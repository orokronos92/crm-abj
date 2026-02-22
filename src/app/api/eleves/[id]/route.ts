import { NextRequest, NextResponse } from 'next/server'
import { EleveService } from '@/services/eleve.service'
import prisma from '@/lib/prisma'

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
 * Appelé par n8n pour stocker l'analyse IA Marjorie
 * Body: { analyse_ia: string, api_key?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const eleveId = parseInt(id, 10)

    if (isNaN(eleveId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Vérification API Key (requête venant de n8n)
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.NOTIFICATIONS_API_KEY
    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { analyse_ia } = body

    if (!analyse_ia || typeof analyse_ia !== 'string') {
      return NextResponse.json(
        { error: 'Le champ analyse_ia est requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'élève existe
    const eleve = await prisma.eleve.findUnique({
      where: { idEleve: eleveId },
      select: { idEleve: true, numeroDossier: true }
    })

    if (!eleve) {
      return NextResponse.json({ error: 'Élève non trouvé' }, { status: 404 })
    }

    // Stocker l'analyse IA
    await prisma.eleve.update({
      where: { idEleve: eleveId },
      data: {
        analyseIa: analyse_ia,
        dateAnalyseIa: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Analyse IA stockée avec succès',
      idEleve: eleveId,
      numeroDossier: eleve.numeroDossier
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élève:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'élève' },
      { status: 500 }
    )
  }
}