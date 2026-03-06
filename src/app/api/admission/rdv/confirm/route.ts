import { NextRequest, NextResponse } from 'next/server'
import { confirmerCreneauRdv } from '@/lib/rdv-utils'

/**
 * GET /api/admission/rdv/confirm?token=XXXX[&candidat=ID]
 * Route publique — pas d'auth requise
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token manquant' }, { status: 400 })
  }

  const idCandidatParam = request.nextUrl.searchParams.get('candidat')
  const idCandidatConfirmant = idCandidatParam ? parseInt(idCandidatParam, 10) : null

  try {
    const resultat = await confirmerCreneauRdv(token, idCandidatConfirmant)

    if (!resultat.success && !resultat.alreadyConfirmed) {
      return NextResponse.json(
        { success: false, error: resultat.error },
        { status: resultat.errorStatus ?? 500 }
      )
    }

    console.log(`[ADMISSION] ✅ RDV confirmé via token — candidat ${idCandidatConfirmant ?? 'inconnu'}`)

    return NextResponse.json({
      success: true,
      alreadyConfirmed: resultat.alreadyConfirmed ?? false,
      rdv: resultat.rdv,
    })

  } catch (error) {
    console.error('[ADMISSION] Erreur confirmation RDV:', error)
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 })
  }
}
