import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/sessions/[id]/diffuser
 *
 * Diffuse la session validée vers les formateurs et élèves concernés.
 * Créé les tuiles de planning pour chaque participant.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const idSession = parseInt(id, 10)

    if (isNaN(idSession)) {
      return NextResponse.json({ error: 'ID session invalide' }, { status: 400 })
    }

    // Vérifier que la session existe et est VALIDE
    const session = await prisma.session.findUnique({
      where: { idSession },
      include: {
        formation: true,
        formateurPrincipal: true,
        inscriptionsSessions: {
          include: {
            eleve: {
              include: {
                utilisateur: true,
              },
            },
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    if (session.statutValidation !== 'VALIDE') {
      return NextResponse.json(
        { error: 'Session non validée par Marjorie' },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    await prisma.session.update({
      where: { idSession },
      data: {
        statutValidation: 'DIFFUSEE',
        statutSession: 'CONFIRMEE',
        dateDiffusion: new Date(),
        // diffuseePar: userId, // TODO: Récupérer l'utilisateur connecté
      },
    })

    // TODO: Créer des notifications pour les formateurs et élèves
    // const formateurs = [session.formateurPrincipal]
    // const eleves = session.inscriptionsSessions.map(i => i.eleve)

    // for (const formateur of formateurs) {
    //   await createNotification({
    //     titre: 'Nouvelle session planifiée',
    //     message: `Session ${session.nomSession} du ${session.dateDebut} au ${session.dateFin}`,
    //     categorie: 'PLANNING',
    //     audience: 'SPECIFIQUE',
    //     idUtilisateurCible: formateur.idUtilisateur,
    //     lienAction: `/formateur/sessions/${idSession}`,
    //   })
    // }

    return NextResponse.json({
      success: true,
      message: 'Session diffusée avec succès',
      idSession,
      nbFormateurs: session.formateurPrincipal ? 1 : 0,
      nbEleves: session.inscriptionsSessions.length,
    })
  } catch (error) {
    console.error('Erreur diffusion session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
