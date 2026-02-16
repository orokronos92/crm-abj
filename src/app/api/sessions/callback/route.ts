import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/sessions/callback
 *
 * Webhook appelé par n8n (Marjorie) après analyse du planning.
 * Met à jour la session avec le résultat de l'analyse IA.
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'API key n8n
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { idSession, validation, planningIA, rapport } = body

    if (!idSession) {
      return NextResponse.json({ error: 'idSession requis' }, { status: 400 })
    }

    // Vérifier que la session existe
    const session = await prisma.session.findUnique({
      where: { idSession },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Mettre à jour selon le résultat de validation
    if (validation === 'VALIDE') {
      await prisma.session.update({
        where: { idSession },
        data: {
          statutValidation: 'VALIDE',
          planningIA: planningIA || null,
          rapportIA: rapport || null,
          dateValidationIA: new Date(),
        },
      })

      // TODO: Créer une notification pour l'admin
      // await createNotification({
      //   titre: 'Session validée par Marjorie',
      //   message: `La session ${session.nomSession} a été validée et attend diffusion`,
      //   categorie: 'PLANNING',
      //   audience: 'ADMIN',
      //   lienAction: `/admin/sessions/${idSession}`,
      // })

      return NextResponse.json({
        success: true,
        message: 'Session validée par Marjorie',
        idSession,
      })
    }

    if (validation === 'REFUSE') {
      await prisma.session.update({
        where: { idSession },
        data: {
          statutValidation: 'REFUSE',
          rapportIA: rapport || 'Refusé par Marjorie',
          motifRefus: body.motif || 'Contraintes incompatibles',
          dateRefusIA: new Date(),
        },
      })

      // TODO: Créer une notification pour l'admin
      // await createNotification({
      //   titre: 'Session refusée par Marjorie',
      //   message: `La session ${session.nomSession} a été refusée : ${body.motif}`,
      //   categorie: 'PLANNING',
      //   priorite: 'HAUTE',
      //   audience: 'ADMIN',
      //   lienAction: `/admin/sessions/${idSession}`,
      // })

      return NextResponse.json({
        success: true,
        message: 'Session refusée par Marjorie',
        idSession,
        motif: body.motif,
      })
    }

    return NextResponse.json({ error: 'Validation invalide' }, { status: 400 })
  } catch (error) {
    console.error('Erreur callback Marjorie:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
