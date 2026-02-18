/**
 * API Route: Formateurs
 * POST : Créer un nouveau formateur avec compte utilisateur
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { formateurWebhooks } from '@/lib/webhook-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      nom,
      prenom,
      email,
      telephone,
      adresse,
      codePostal,
      ville,
      specialites,
      tarifJournalier,
      siret,
      anneesExperience,
      anneesEnseignement,
      bio,
      notes
    } = body

    // Validation des champs obligatoires
    if (!nom || !prenom || !email) {
      return NextResponse.json(
        { success: false, error: 'Nom, prénom et email sont obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const emailExiste = await prisma.utilisateur.findUnique({
      where: { email }
    })

    if (emailExiste) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Créer l'utilisateur ET le formateur dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le compte utilisateur
      // Mot de passe temporaire généré aléatoirement
      const passwordTemp = Math.random().toString(36).slice(-10)
      const hashedPassword = await bcrypt.hash(passwordTemp, 10)

      const utilisateur = await tx.utilisateur.create({
        data: {
          email,
          nom,
          prenom,
          role: 'professeur',
          motDePasseHash: hashedPassword,
          statutCompte: 'ACTIF'
        }
      })

      // 2. Créer la fiche formateur
      const formateur = await tx.formateur.create({
        data: {
          idUtilisateur: utilisateur.idUtilisateur,
          nom,
          prenom,
          email,
          telephone,
          adresse,
          codePostal,
          ville,
          specialites: specialites || [],
          tarifJournalier: tarifJournalier ? parseFloat(tarifJournalier.toString()) : null,
          siret,
          anneesExperience,
          anneesEnseignement,
          bio,
          notes,
          statut: 'EN_COURS_INTEGRATION', // Statut initial
          dossierComplet: false
        }
      })

      return { utilisateur, formateur }
    })

    // ===== FIRE-AND-FORGET : Notifier Marjorie du nouveau formateur =====
    // Marjorie va envoyer un email de bienvenue et demander les documents requis
    formateurWebhooks.nouveauFormateur({
      idFormateur: result.formateur.idFormateur,
      email: result.formateur.email,
      nom: result.formateur.nom,
      prenom: result.formateur.prenom,
      telephone: result.formateur.telephone || undefined,
      specialites: result.formateur.specialites as string[]
    }).then(webhookResult => {
      if (!webhookResult.success) {
        console.error(`[API] ❌ Webhook échoué pour nouveau formateur ${result.formateur.idFormateur}:`, webhookResult.error)
      } else {
        console.log(`[API] ✅ Webhook nouveau formateur envoyé avec succès pour ${result.formateur.prenom} ${result.formateur.nom}`)
      }
    }).catch(error => {
      console.error(`[API] ❌ Erreur critique webhook nouveau formateur ${result.formateur.idFormateur}:`, error)
    })

    return NextResponse.json({
      success: true,
      formateur: {
        id: result.formateur.idFormateur,
        nom: result.formateur.nom,
        prenom: result.formateur.prenom,
        email: result.formateur.email,
        statut: result.formateur.statut
      },
      message: 'Formateur créé avec succès. Marjorie va lui demander les documents requis par email.'
    })
  } catch (error: any) {
    console.error('Erreur création formateur:', error)

    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email déjà utilisé' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du formateur' },
      { status: 500 }
    )
  }
}
