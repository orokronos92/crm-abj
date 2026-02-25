import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/notifications/create-action
 *
 * Crée une notification depuis le CRM (actions admin).
 * Côté serveur uniquement — utilise NOTIFICATIONS_API_KEY sans l'exposer au client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      sourceAgent = 'admin',
      categorie,
      type,
      priorite = 'NORMALE',
      titre,
      message,
      audience = 'ADMIN',
      entiteType,
      entiteId,
      actionRequise = false,
      typeAction,
    } = body

    if (!categorie || !type || !titre || !message) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants : categorie, type, titre, message' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        sourceAgent,
        categorie,
        type,
        priorite,
        titre,
        message,
        audience,
        entiteType: entiteType || null,
        entiteId: entiteId || null,
        actionRequise,
        typeAction: typeAction || null,
        lue: false,
        archivee: false,
      },
      select: {
        idNotification: true,
        categorie: true,
        type: true,
        titre: true,
        actionRequise: true,
        creeLe: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: notification,
    })
  } catch (error) {
    console.error('❌ Erreur POST /api/notifications/create-action:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
}
