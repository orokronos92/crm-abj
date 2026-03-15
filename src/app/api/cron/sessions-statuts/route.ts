import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const CRON_API_KEY = process.env.CRON_API_KEY

export async function POST(request: NextRequest) {
  // Vérification API Key
  const apiKey = request.headers.get('x-api-key')
  if (!CRON_API_KEY || apiKey !== CRON_API_KEY) {
    return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const maintenant = new Date()
    const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate())

    // Récupérer toutes les sessions actives (hors ANNULEE et TERMINEE)
    const sessionsRaw = await prisma.session.findMany({
      where: {
        statutSession: {
          notIn: ['ANNULEE', 'TERMINEE'],
        },
      },
      select: {
        idSession: true,
        nomSession: true,
        statutSession: true,
        dateDebut: true,
        dateFin: true,
      },
    })

    // Filtrer côté TypeScript les sessions sans dates (Prisma ne supporte pas { not: null } sur DateTime nullable)
    const sessions = sessionsRaw.filter(
      (s): s is typeof s & { dateDebut: Date; dateFin: Date } =>
        s.dateDebut !== null && s.dateFin !== null
    )

    const resultats = {
      traites: 0,
      enCours: 0,
      terminees: 0,
      inchanges: 0,
      erreurs: [] as string[],
    }

    for (const session of sessions) {
      if (!session.dateDebut || !session.dateFin) {
        resultats.inchanges++
        continue
      }

      const dateDebut = new Date(session.dateDebut)
      const dateFin = new Date(session.dateFin)

      // Normaliser les dates (sans heure) pour comparaison
      const dateDebutJour = new Date(dateDebut.getFullYear(), dateDebut.getMonth(), dateDebut.getDate())
      const dateFinJour = new Date(dateFin.getFullYear(), dateFin.getMonth(), dateFin.getDate())

      let nouveauStatut: string | null = null

      if (dateFinJour < aujourdhui) {
        // La date de fin est passée → TERMINEE
        if (session.statutSession !== 'TERMINEE') {
          nouveauStatut = 'TERMINEE'
        }
      } else if (dateDebutJour <= aujourdhui && dateFinJour >= aujourdhui) {
        // On est entre la date de début et la date de fin → EN_COURS
        // Ne pas écraser COMPLETE si la session est déjà complète mais encore en cours
        if (session.statutSession !== 'EN_COURS' && session.statutSession !== 'COMPLETE') {
          nouveauStatut = 'EN_COURS'
        } else if (session.statutSession === 'COMPLETE') {
          // Session complète et la date a démarré → passer EN_COURS
          // (les inscrits sont là, la session commence)
          nouveauStatut = 'EN_COURS'
        }
      }

      if (nouveauStatut) {
        try {
          await prisma.session.update({
            where: { idSession: session.idSession },
            data: { statutSession: nouveauStatut },
          })

          if (nouveauStatut === 'EN_COURS') resultats.enCours++
          if (nouveauStatut === 'TERMINEE') resultats.terminees++
        } catch (err) {
          resultats.erreurs.push(`Session ${session.idSession} (${session.nomSession}): ${err}`)
        }
      } else {
        resultats.inchanges++
      }

      resultats.traites++
    }

    const message = `Cron sessions-statuts : ${resultats.traites} sessions traitées, ${resultats.enCours} → EN_COURS, ${resultats.terminees} → TERMINEE, ${resultats.inchanges} inchangées`

    console.log(message)
    if (resultats.erreurs.length > 0) {
      console.error('Erreurs:', resultats.erreurs)
    }

    return NextResponse.json({
      success: true,
      message,
      resultats,
      executeLe: maintenant.toISOString(),
    })
  } catch (error) {
    console.error('Erreur cron sessions-statuts:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
