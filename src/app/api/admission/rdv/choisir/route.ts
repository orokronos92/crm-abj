import { NextRequest, NextResponse } from 'next/server'
import { confirmerCreneauRdv } from '@/lib/rdv-utils'

/**
 * POST /api/admission/rdv/choisir
 * Route publique — pas d'auth requise
 *
 * Body: { token: string, idCandidat: number }
 *
 * Confirme le créneau choisi par le candidat depuis le mini-calendrier.
 * Délègue à confirmerCreneauRdv() qui gère les race conditions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, idCandidat } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'Token manquant' }, { status: 400 })
    }

    const idCandidatNum = idCandidat ? parseInt(String(idCandidat), 10) : null

    const resultat = await confirmerCreneauRdv(token, idCandidatNum)

    if (!resultat.success && !resultat.alreadyConfirmed) {
      return NextResponse.json(
        { success: false, error: resultat.error },
        { status: resultat.errorStatus ?? 500 }
      )
    }

    console.log(`[ADMISSION] ✅ Créneau choisi — token ${token.slice(0, 8)}... — candidat ${idCandidatNum ?? 'inconnu'}`)

    return NextResponse.json({
      success: true,
      alreadyConfirmed: resultat.alreadyConfirmed ?? false,
      rdv: resultat.rdv,
    })

  } catch (error) {
    console.error('[ADMISSION] Erreur choix créneau:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}
