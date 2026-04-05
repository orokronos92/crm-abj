/**
 * API Route: Reset Password
 * POST : Génère un nouveau mot de passe temporaire pour un utilisateur
 * Utilisé par n8n après création d'un formateur pour obtenir le passwordTemp
 * Sécurisé par API Key (NOTIFICATIONS_API_KEY)
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Vérification API Key
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.NOTIFICATIONS_API_KEY) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { idUtilisateur } = body

    if (!idUtilisateur || typeof idUtilisateur !== 'number') {
      return NextResponse.json(
        { success: false, error: 'idUtilisateur requis (number)' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { idUtilisateur },
      select: { idUtilisateur: true, email: true, nom: true, prenom: true, role: true, statutCompte: true }
    })

    if (!utilisateur) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Générer un mot de passe temporaire lisible (lettres + chiffres, 12 caractères)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    const passwordTemp = Array.from({ length: 12 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

    // Hasher et sauvegarder
    const hashedPassword = await bcrypt.hash(passwordTemp, 10)

    await prisma.utilisateur.update({
      where: { idUtilisateur },
      data: { motDePasseHash: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      passwordTemp,
      utilisateur: {
        idUtilisateur: utilisateur.idUtilisateur,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role
      }
    })
  } catch (error) {
    console.error('Erreur POST /api/auth/reset-password:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
