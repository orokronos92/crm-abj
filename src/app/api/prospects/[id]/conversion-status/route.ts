import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * API Endpoint: Vérifier si une conversion est en cours pour un prospect
 *
 * GET /api/prospects/[id]/conversion-status
 *
 * Utilisé par le frontend avant d'ouvrir le modal de conversion
 * pour éviter les tentatives de conversion en double
 */

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const idProspect = id

    // Vérifier si conversion en cours
    const conversionEnCours = await prisma.conversionEnCours.findFirst({
      where: {
        idProspect,
        typeAction: 'CONVERTIR_CANDIDAT',
        statutAction: 'EN_COURS'
      },
      select: {
        idConversion: true,
        dateDebut: true,
        formationRetenue: true
      }
    })

    if (conversionEnCours) {
      const dureeMinutes = Math.floor((Date.now() - conversionEnCours.dateDebut.getTime()) / 60000)

      return NextResponse.json({
        enCours: true,
        message: `Une conversion est déjà en cours depuis ${dureeMinutes} minute${dureeMinutes > 1 ? 's' : ''}. Vous serez notifié lorsqu'elle sera terminée.`,
        data: {
          idConversion: conversionEnCours.idConversion,
          dateDebut: conversionEnCours.dateDebut,
          formationRetenue: conversionEnCours.formationRetenue
        }
      })
    }

    return NextResponse.json({
      enCours: false,
      message: 'Aucune conversion en cours'
    })

  } catch (error) {
    console.error('[API] Erreur vérification conversion-status:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne serveur'
      },
      { status: 500 }
    )
  }
}
