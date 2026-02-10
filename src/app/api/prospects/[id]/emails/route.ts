/**
 * API Route: GET /api/prospects/[id]/emails
 * Récupère l'historique des emails d'un prospect
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Récupérer tous les emails du prospect, triés par date (plus récent en premier)
    const emails = await prisma.historiqueEmail.findMany({
      where: {
        idProspect: id
      },
      select: {
        idEmail: true,
        dateReception: true,
        sens: true,
        objet: true
      },
      orderBy: {
        dateReception: 'desc'
      }
    })

    // Formater les données pour le frontend
    const formattedEmails = emails.map(email => ({
      id: email.idEmail,
      date: email.dateReception
        ? new Date(email.dateReception).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Date inconnue',
      objet: email.objet || '(Sans objet)',
      sens: email.sens === 'entrant' ? 'IN' : 'OUT'
    }))

    return NextResponse.json(formattedEmails)
  } catch (error) {
    console.error('Erreur lors de la récupération des emails:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des emails' },
      { status: 500 }
    )
  }
}
