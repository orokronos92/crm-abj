import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * PATCH /api/formateurs/[id]/statut
 * Change le statut d'un formateur (EN_COURS_INTEGRATION → ACTIF → INACTIF)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const formateurId = parseInt(id, 10)

    if (isNaN(formateurId)) {
      return NextResponse.json({ error: 'ID formateur invalide' }, { status: 400 })
    }

    const body = await request.json()
    const { nouveauStatut } = body

    // Validation du statut
    const statutsValides = ['EN_COURS_INTEGRATION', 'ACTIF', 'INACTIF', 'ARCHIVE']
    if (!nouveauStatut || !statutsValides.includes(nouveauStatut)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${statutsValides.join(', ')}` },
        { status: 400 }
      )
    }

    // Vérifier que le formateur existe
    const formateur = await prisma.formateur.findUnique({
      where: { idFormateur: formateurId },
      select: { statut: true, nom: true, prenom: true }
    })

    if (!formateur) {
      return NextResponse.json({ error: 'Formateur non trouvé' }, { status: 404 })
    }

    // Mettre à jour le statut
    const formateurMisAJour = await prisma.formateur.update({
      where: { idFormateur: formateurId },
      data: {
        statut: nouveauStatut,
        modifieLe: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Statut du formateur ${formateur.prenom} ${formateur.nom} changé de ${formateur.statut} à ${nouveauStatut}`,
      ancienStatut: formateur.statut,
      nouveauStatut: formateurMisAJour.statut
    })
  } catch (error) {
    console.error('Erreur lors du changement de statut formateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors du changement de statut' },
      { status: 500 }
    )
  }
}
