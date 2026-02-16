import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { SessionFormData, SessionAIPayload } from '@/components/admin/session-form/session-form.types'

/**
 * POST /api/sessions/validate
 *
 * Reçoit les données du formulaire de création de session,
 * crée une session en BDD avec statut "EN_ATTENTE_VALIDATION",
 * envoie le payload vers n8n pour analyse par Marjorie,
 * retourne l'ID de la session créée.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Le formulaire envoie { type: 'COURTE'|'CAP', data: {...} }
    const sessionType = body.type
    const formData = body.data

    // Construire le payload pour l'AI selon le type de formation
    let aiPayload: SessionAIPayload

    if (sessionType === 'COURTE' && formData.dataCourte) {
      const data = formData.dataCourte

      aiPayload = {
        sourceForm: 'creation_session',
        type: 'COURTE',
        demandePar: 'admin', // TODO: Récupérer l'utilisateur connecté
        dateCreation: new Date().toISOString(),
        informationsGenerales: {
          codeFormation: data.codeFormation,
          dateDebutGlobale: data.dateDebut,
          dateFin: data.dateFin,
          nbParticipants: data.nbParticipants,
        },
        rythmeEtContraintes: {
          joursActifs: data.joursActifs,
          weekendAutorise: data.joursActifs.includes('SAMEDI') || data.joursActifs.includes('DIMANCHE'),
        },
        ressources: {
          formateursPlanifierPlusTard: data.formateurId === undefined || data.formateurId === 'SANS_FORMATEUR',
          sallesPlanifierPlusTard: data.salleId === undefined,
        },
        objectifOptimisation: 'Formation courte simple - Priorité : disponibilité salle et formateur',
      }

      // Trouver ou créer la formation
      let formation = await prisma.formation.findFirst({
        where: { codeFormation: data.codeFormation }
      })

      if (!formation) {
        // Si la formation n'existe pas, utiliser CAP_BJ par défaut
        formation = await prisma.formation.findFirst({
          where: { codeFormation: 'CAP_BJ' }
        })
      }

      if (!formation) {
        return NextResponse.json(
          { error: 'Aucune formation disponible en base de données' },
          { status: 400 }
        )
      }

      // Préparer les métadonnées pour la session COURTE
      const metadonnees = {
        description: data.description,
        nbParticipants: data.nbParticipants,
        joursActifs: data.joursActifs,
        salleId: data.salleId,
        formateurId: data.formateurId
      }

      // Créer la session en BDD
      const session = await prisma.session.create({
        data: {
          idFormation: formation.idFormation,
          nomSession: `${data.codeFormation} - ${new Date(data.dateDebut).toLocaleDateString('fr-FR')}`,
          dateDebut: new Date(data.dateDebut),
          dateFin: new Date(data.dateFin),
          capaciteMax: data.nbParticipants,
          nbInscrits: 0,
          statutSession: 'PREVUE',
          statutValidation: 'EN_ANALYSE', // Envoyé vers Marjorie
          sallePrincipale: data.salleId ? `Salle ${data.salleId}` : null,
          formateurPrincipalId: data.formateurId && data.formateurId !== 'SANS_FORMATEUR' ? data.formateurId : null,
          notes: JSON.stringify(metadonnees), // Sauvegarder les métadonnées
        },
      })

      // Envoyer vers n8n (webhook Marjorie)
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_SESSION_VALIDATION || 'http://localhost:5678/webhook/validate-session'

      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...aiPayload,
            idSession: session.idSession,
          }),
        })

        if (!n8nResponse.ok) {
          console.error('Erreur n8n:', await n8nResponse.text())
        }
      } catch (n8nError) {
        console.error('Erreur appel n8n:', n8nError)
        // On continue même si n8n échoue, la session est créée en BDD
      }

      // Retourner une proposition temporaire en attendant l'analyse de Marjorie
      return NextResponse.json({
        idSession: session.idSession,
        statut: 'EN_ANALYSE',
        // Métadonnées de la session pour afficher la synthèse complète
        type: 'COURTE' as const,
        dateDebutGlobale: data.dateDebut,
        dateFin: data.dateFin,
        joursActifs: data.joursActifs,
        // Planning généré (vide en attente de Marjorie)
        planningGenere: {
          seances: [],
          total_heures_formation: 0, // Sera calculé par Marjorie
          nb_participants: data.nbParticipants,
          statsOccupation: {
            salles: [],
            formateurs: [],
          },
          rapportIA: 'Analyse en cours par Marjorie... Cela peut prendre quelques instants.',
        },
      })
    }

    if (sessionType === 'CAP' && formData.dataCAP) {
      const data = formData.dataCAP

      // Calculer le total des heures du programme
      const totalHeuresProgramme = data.programme.reduce((sum, m) => sum + m.heures, 0)

      // Préparer les métadonnées complètes pour la session
      const metadonnees = {
        programme: data.programme,
        plageHoraire: data.plageHoraire,
        periodesInterdites: data.periodesInterdites,
        notesComplementaires: data.notesComplementaires,
        totalHeuresProgramme, // Total calculé
        nbParticipants: data.nbParticipants, // Nombre de participants
        formateurs: data.formateurs,
        salles: data.salles
      }

      aiPayload = {
        sourceForm: 'creation_session',
        type: 'CAP',
        demandePar: 'admin', // TODO: Récupérer l'utilisateur connecté
        dateCreation: new Date().toISOString(),
        informationsGenerales: {
          codeFormation: data.codeFormation,
          nomSession: data.nomSession,
          dateDebutGlobale: data.dateDebutGlobale,
          dureeMois: data.dureeMois,
          nbParticipants: data.nbParticipants,
        },
        plageHoraire: data.plageHoraire,
        rythmeEtContraintes: {
          joursActifs: data.joursActifs,
          weekendAutorise: data.joursActifs.includes('SAMEDI') || data.joursActifs.includes('DIMANCHE'),
          periodesInterdites: data.periodesInterdites,
        },
        programme: data.programme,
        totalHeuresProgramme,
        ressources: {
          formateurs: data.formateurs,
          formateurMultiMatieresAutorise: data.formateurMultiMatieresAutorise,
          salles: data.salles,
          salleMultiMatieresAutorise: data.salleMultiMatieresAutorise,
          formateursPlanifierPlusTard: data.formateursPlanifierPlusTard,
          sallesPlanifierPlusTard: data.sallesPlanifierPlusTard,
        },
        contraintesPedagogiques: {
          matieresEnParallele: data.matieresEnParallele,
          notesComplementaires: data.notesComplementaires,
        },
        objectifOptimisation:
          'Formation CAP longue durée - Priorité : respect programme pédagogique, disponibilité formateurs qualifiés, optimisation occupation salles',
      }

      // Créer la session en BDD
      const dateDebut = new Date(data.dateDebutGlobale)
      const dateFin = new Date(dateDebut)
      dateFin.setMonth(dateFin.getMonth() + data.dureeMois)

      // Trouver ou créer la formation
      let formation = await prisma.formation.findFirst({
        where: { codeFormation: data.codeFormation }
      })

      if (!formation) {
        // Si la formation n'existe pas, utiliser CAP_BJ par défaut
        formation = await prisma.formation.findFirst({
          where: { codeFormation: 'CAP_BJ' }
        })
      }

      if (!formation) {
        return NextResponse.json(
          { error: 'Aucune formation disponible en base de données' },
          { status: 400 }
        )
      }

      // Calculer le formateur principal (celui qui enseigne le plus d'heures)
      let formateurPrincipalId = null
      if (data.formateurs.length > 0 && data.programme.length > 0) {
        // Map pour compter les heures par formateur
        const heuresParFormateur = new Map<number, number>()

        // Initialiser avec 0 heures pour chaque formateur
        data.formateurs.forEach(f => heuresParFormateur.set(f.id, 0))

        // Calculer les heures pour chaque formateur
        data.programme.forEach(matiere => {
          // Trouver les formateurs qui enseignent cette matière
          data.formateurs.forEach(formateur => {
            if (formateur.matieres.includes(matiere.nom)) {
              const heuresActuelles = heuresParFormateur.get(formateur.id) || 0
              heuresParFormateur.set(formateur.id, heuresActuelles + matiere.heures)
            }
          })
        })

        // Trouver le formateur avec le plus d'heures
        let maxHeures = 0
        heuresParFormateur.forEach((heures, formateurId) => {
          if (heures > maxHeures) {
            maxHeures = heures
            formateurPrincipalId = formateurId
          }
        })
      }

      const session = await prisma.session.create({
        data: {
          idFormation: formation.idFormation,
          nomSession: data.nomSession,
          dateDebut: dateDebut,
          dateFin: dateFin,
          capaciteMax: data.nbParticipants,
          nbInscrits: 0,
          statutSession: 'PREVUE',
          statutValidation: 'EN_ANALYSE', // Envoyé vers Marjorie
          sallePrincipale: data.salles.length > 0 ? data.salles[0].nom : null,
          formateurPrincipalId: formateurPrincipalId, // Formateur qui enseigne le plus d'heures
          notes: JSON.stringify(metadonnees), // Sauvegarder toutes les métadonnées
        },
      })

      // Envoyer vers n8n (webhook Marjorie)
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_SESSION_VALIDATION || 'http://localhost:5678/webhook/validate-session'

      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...aiPayload,
            idSession: session.idSession,
          }),
        })

        if (!n8nResponse.ok) {
          console.error('Erreur n8n:', await n8nResponse.text())
        }
      } catch (n8nError) {
        console.error('Erreur appel n8n:', n8nError)
        // On continue même si n8n échoue, la session est créée en BDD
      }

      return NextResponse.json({
        idSession: session.idSession,
        statut: 'EN_ANALYSE',
        // Métadonnées de la session pour afficher la synthèse complète
        type: 'CAP' as const,
        nomSession: data.nomSession,
        dateDebutGlobale: data.dateDebutGlobale,
        dureeMois: data.dureeMois,
        joursActifs: data.joursActifs,
        plageHoraire: data.plageHoraire,
        programme: data.programme,
        formateurs: data.formateurs,
        salles: data.salles,
        // Planning généré (vide en attente de Marjorie)
        planningGenere: {
          seances: [],
          total_heures_formation: totalHeuresProgramme, // Total calculé depuis le programme
          nb_participants: data.nbParticipants,
          statsOccupation: {
            salles: [],
            formateurs: [],
          },
          rapportIA: 'Analyse en cours par Marjorie... Cela peut prendre quelques instants.',
        },
      })
    }

    return NextResponse.json(
      { error: 'Type de formation invalide ou données manquantes' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erreur création session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
