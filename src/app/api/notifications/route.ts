/**
 * API pour récupérer les notifications
 * GET /api/notifications
 * Authentification requise via session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config.demo'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const categorie = searchParams.get('categorie')
    const priorite = searchParams.get('priorite')
    const nonLuesSeulement = searchParams.get('nonLues') === 'true'

    // Construction du filtre selon le rôle de l'utilisateur
    const where: any = {}

    // Filtre par audience selon le rôle
    if (session.user.role === 'admin') {
      // Admin voit TOUS, ADMIN et SPECIFIQUE (si c'est pour lui)
      where.OR = [
        { audience: 'TOUS' },
        { audience: 'ADMIN' },
        {
          AND: [
            { audience: 'SPECIFIQUE' },
            { idUtilisateurCible: session.user.id }
          ]
        }
      ]
    } else if (session.user.role === 'professeur') {
      // Professeur voit TOUS, FORMATEUR et SPECIFIQUE (si c'est pour lui)
      where.OR = [
        { audience: 'TOUS' },
        { audience: 'FORMATEUR' },
        {
          AND: [
            { audience: 'SPECIFIQUE' },
            { idUtilisateurCible: session.user.id }
          ]
        }
      ]
    } else if (session.user.role === 'eleve') {
      // Élève voit TOUS, ELEVE et SPECIFIQUE (si c'est pour lui)
      where.OR = [
        { audience: 'TOUS' },
        { audience: 'ELEVE' },
        {
          AND: [
            { audience: 'SPECIFIQUE' },
            { idUtilisateurCible: session.user.id }
          ]
        }
      ]
    }

    // Filtres additionnels
    if (categorie) where.categorie = categorie
    if (priorite) where.priorite = priorite
    if (nonLuesSeulement) where.lue = false

    // Récupération des notifications
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { creeLe: 'desc' },
        take: limit,
        skip: offset,
        select: {
          idNotification: true,
          sourceAgent: true,
          categorie: true,
          type: true,
          priorite: true,
          titre: true,
          message: true,
          icone: true,
          couleur: true,
          audience: true,
          entiteType: true,
          entiteId: true,
          lienAction: true,
          actionRequise: true,
          typeAction: true,
          lue: true,
          dateLecture: true,
          creeLe: true
        }
      }),
      prisma.notification.count({ where })
    ])

    // Compter les non-lues
    const nonLues = await prisma.notification.count({
      where: { ...where, lue: false }
    })

    // Compter les urgentes
    const urgentes = await prisma.notification.count({
      where: { ...where, priorite: 'URGENTE', lue: false }
    })

    // Compter celles qui requièrent une action
    const actionsRequises = await prisma.notification.count({
      where: { ...where, actionRequise: true, actionEffectuee: false }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        counts: {
          total,
          nonLues,
          urgentes,
          actionsRequises
        },
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des notifications',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// PATCH pour marquer comme lu
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, action } = body

    if (!notificationId || !action) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    if (action === 'markAsRead') {
      await prisma.notification.update({
        where: { idNotification: notificationId },
        data: {
          lue: true,
          dateLecture: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Notification marquée comme lue'
      })
    }

    if (action === 'markAllAsRead') {
      // Marquer toutes les notifications de l'utilisateur comme lues
      const where: any = {}

      // Même filtre par audience que pour GET
      if (session.user.role === 'admin') {
        where.OR = [
          { audience: 'TOUS' },
          { audience: 'ADMIN' },
          {
            AND: [
              { audience: 'SPECIFIQUE' },
              { idUtilisateurCible: session.user.id }
            ]
          }
        ]
      }
      // ... autres rôles

      await prisma.notification.updateMany({
        where: { ...where, lue: false },
        data: {
          lue: true,
          dateLecture: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Toutes les notifications marquées comme lues'
      })
    }

    return NextResponse.json(
      { error: 'Action invalide' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la mise à jour',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}