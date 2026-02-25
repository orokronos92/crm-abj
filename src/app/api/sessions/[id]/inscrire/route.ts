import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/sessions/[id]/inscrire
 *
 * Inscrit un candidat ou un élève à une session.
 * - Si place disponible + statut ELEVE → INSCRIT direct
 * - Si place disponible + statut CANDIDAT → EN_ATTENTE (priorité basse)
 * - Si session pleine → EN_ATTENTE (avec position dans la file)
 *
 * Body: { idCandidat?: number, idEleve?: number }
 * Règle : au moins un des deux est requis
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id, 10)

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'ID de session invalide' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { idCandidat, idEleve } = body

    if (!idCandidat && !idEleve) {
      return NextResponse.json(
        { success: false, error: 'idCandidat ou idEleve requis' },
        { status: 400 }
      )
    }

    // Charger la session
    const session = await prisma.session.findUnique({
      where: { idSession: sessionId },
      select: {
        idSession: true,
        nomSession: true,
        capaciteMax: true,
        nbInscrits: true,
        statutSession: true,
      },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session introuvable' },
        { status: 404 }
      )
    }

    if (session.statutSession === 'ANNULEE' || session.statutSession === 'TERMINEE') {
      return NextResponse.json(
        { success: false, error: 'Impossible de s\'inscrire à une session annulée ou terminée' },
        { status: 400 }
      )
    }

    // Vérifier si déjà inscrit
    const existingInscription = await prisma.inscriptionSession.findFirst({
      where: {
        idSession: sessionId,
        OR: [
          idCandidat ? { idCandidat } : {},
          idEleve ? { idEleve } : {},
        ].filter(c => Object.keys(c).length > 0),
        statutInscription: { notIn: ['ANNULE'] },
      },
    })

    if (existingInscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cette personne est déjà inscrite ou en liste d\'attente pour cette session',
          statutInscription: existingInscription.statutInscription,
        },
        { status: 409 }
      )
    }

    // Déterminer la priorité : 1 = ELEVE, 2 = CANDIDAT
    const priorite = idEleve ? 1 : 2

    // Vérifier s'il y a une place disponible
    const placesDisponibles = (session.capaciteMax || 0) - session.nbInscrits
    const sessionPleine = placesDisponibles <= 0

    // Pour un ELEVE avec place disponible → INSCRIT direct
    // Pour un CANDIDAT OU session pleine → EN_ATTENTE
    let statutInscription: string
    let positionAttente: number | null = null

    if (!sessionPleine && idEleve) {
      // Place dispo + c'est un élève → INSCRIT
      statutInscription = 'INSCRIT'
    } else {
      // Session pleine OU c'est un candidat → EN_ATTENTE
      statutInscription = 'EN_ATTENTE'

      // Calculer la position dans la file (par priorité)
      const dernierePosition = await prisma.inscriptionSession.findFirst({
        where: {
          idSession: sessionId,
          statutInscription: 'EN_ATTENTE',
        },
        orderBy: { positionAttente: 'desc' },
        select: { positionAttente: true },
      })

      positionAttente = (dernierePosition?.positionAttente || 0) + 1
    }

    // Créer l'inscription
    const inscription = await prisma.inscriptionSession.create({
      data: {
        idSession: sessionId,
        idCandidat: idCandidat || null,
        idEleve: idEleve || null,
        dateInscription: new Date(),
        statutInscription,
        priorite,
        positionAttente,
        notifiePar: 'admin',
      },
    })

    // Si INSCRIT → incrémenter nbInscrits
    if (statutInscription === 'INSCRIT') {
      await prisma.session.update({
        where: { idSession: sessionId },
        data: { nbInscrits: { increment: 1 } },
      })
    }

    return NextResponse.json({
      success: true,
      inscription: {
        idInscription: inscription.idInscription,
        statutInscription,
        positionAttente,
        priorite,
      },
      message: statutInscription === 'INSCRIT'
        ? 'Inscription confirmée'
        : `Ajouté en liste d\'attente (position ${positionAttente})`,
    })
  } catch (error) {
    console.error('❌ Erreur POST /api/sessions/[id]/inscrire:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
