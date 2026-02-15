/**
 * Script pour ajouter des données statistiques additionnelles aux formateurs
 * Sessions, élèves, interventions, évaluations pour remplir les onglets
 */

import prisma from '@/lib/prisma'

async function addFormateurStatsData() {
  console.log('📊 Ajout de données statistiques pour les formateurs...')

  try {
    // Récupérer les formateurs enrichis
    const formateurs = await prisma.formateur.findMany({
      where: {
        idFormateur: { in: [2, 3, 4, 5] }
      },
      include: {
        sessionsPrincipales: {
          include: {
            inscriptionsSessions: {
              include: {
                eleve: true
              }
            }
          }
        }
      }
    })

    // Pour chaque formateur, créer des interventions
    for (const formateur of formateurs) {
      console.log(`\n👤 Traitement de ${formateur.prenom} ${formateur.nom}`)

      // Ajouter des interventions pour chaque session
      for (const session of formateur.sessionsPrincipales) {
        // Créer 3-4 interventions par session
        const nbInterventions = Math.floor(Math.random() * 2) + 3
        for (let i = 0; i < nbInterventions; i++) {
          const dateIntervention = new Date(session.dateDebut)
          dateIntervention.setDate(dateIntervention.getDate() + (i * 7)) // Une par semaine

          await prisma.interventionFormateur.create({
            data: {
              idFormateur: formateur.idFormateur,
              idSession: session.idSession,
              dateIntervention: dateIntervention,
              dureeHeures: 7.5, // Journée complète
              sujet: `Module ${i + 1} - ${session.nomSession}`,
              notes: `Intervention ${i + 1} sur ${nbInterventions}`,
              cout: formateur.tarifJournalier,
              factureNumero: `FAC-${formateur.idFormateur}-${session.idSession}-${i + 1}`,
              facturePayee: i < 2, // Les 2 premières sont payées
              datePaiement: i < 2 ? dateIntervention : null
            }
          })
        }

        // Pour chaque élève de la session, créer des évaluations et présences
        for (const inscription of session.inscriptionsSessions) {
          // Créer 2-3 évaluations par élève
          const nbEvaluations = Math.floor(Math.random() * 2) + 2
          for (let j = 0; j < nbEvaluations; j++) {
            const dateEval = new Date(session.dateDebut)
            dateEval.setDate(dateEval.getDate() + (j * 14)) // Une toutes les 2 semaines

            await prisma.evaluation.create({
              data: {
                idEleve: inscription.idEleve,
                idSession: session.idSession,
                idFormateur: formateur.idFormateur,
                typeEvaluation: j === 0 ? 'CONTROLE_CONTINU' : j === nbEvaluations - 1 ? 'EXAMEN_FINAL' : 'EXAMEN_BLANC',
                dateEvaluation: dateEval,
                note: 12 + Math.random() * 8, // Note entre 12 et 20
                noteSur: 20,
                appreciation: `Bon travail, ${j === 0 ? 'début prometteur' : j === nbEvaluations - 1 ? 'progression remarquable' : 'en bonne voie'}`,
                competencesValidees: formateur.competencesTechniques?.slice(0, 3) || [],
                competencesATravailler: formateur.competencesTechniques?.slice(3, 5) || [],
                commentaire: `Évaluation ${j + 1} - ${session.nomSession}`,
                valideParAdmin: true,
                dateValidation: dateEval
              }
            })
          }

          // Créer des présences (80-95% de présence)
          const nbJours = 20 // Session sur 4 semaines environ
          const tauxPresence = 0.8 + Math.random() * 0.15 // Entre 80% et 95%
          const nbPresences = Math.floor(nbJours * tauxPresence)

          for (let k = 0; k < nbJours; k++) {
            const dateCours = new Date(session.dateDebut)
            dateCours.setDate(dateCours.getDate() + k)

            // Sauter les weekends
            if (dateCours.getDay() === 0 || dateCours.getDay() === 6) continue

            const isPresent = k < nbPresences
            await prisma.presence.create({
              data: {
                idEleve: inscription.idEleve,
                idSession: session.idSession,
                dateCours: dateCours,
                demiJournee: 'JOURNEE_COMPLETE',
                statutPresence: isPresent ? 'PRESENT' : Math.random() > 0.5 ? 'ABSENT_JUSTIFIE' : 'ABSENT',
                justificatifFourni: !isPresent && Math.random() > 0.5,
                motifAbsence: !isPresent ? 'Maladie' : null,
                saisiPar: `${formateur.prenom} ${formateur.nom}`,
                commentaire: null
              }
            })
          }
        }
      }

      // Ajouter des publications si c'est un formateur avec des articles
      if (formateur.idFormateur === 3 || formateur.idFormateur === 5) {
        const publications = [
          'Nouvelles techniques de sertissage pour pierres fragiles - Journal des Métiers d\'Art 2023',
          'L\'évolution de la joaillerie contemporaine - Revue Francéclat 2023',
          'Guide pratique de la CAO pour artisans - Éditions Eyrolles 2022',
          'Traité moderne de gemmologie appliquée - Publications AFNOR 2023'
        ]

        await prisma.formateur.update({
          where: { idFormateur: formateur.idFormateur },
          data: {
            publicationsArticles: formateur.idFormateur === 3 ? publications.slice(0, 2) : publications.slice(2, 4)
          }
        })
      }
    }

    // Calculer et mettre à jour les statistiques des élèves
    const eleves = await prisma.eleve.findMany({
      include: {
        evaluations: true,
        presences: true
      }
    })

    for (const eleve of eleves) {
      const moyenneNotes = eleve.evaluations.length > 0
        ? eleve.evaluations.reduce((sum, e) => sum + Number(e.note || 0), 0) / eleve.evaluations.length
        : 0

      const totalPresences = eleve.presences.filter(p => p.statutPresence === 'PRESENT').length
      const totalAbsences = eleve.presences.filter(p => p.statutPresence === 'ABSENT').length
      const totalRetards = eleve.presences.filter(p => p.statutPresence === 'RETARD').length

      await prisma.eleve.update({
        where: { idEleve: eleve.idEleve },
        data: {
          notesMoyennes: moyenneNotes,
          absences: totalAbsences,
          retards: totalRetards
        }
      })

      console.log(`  ✅ Stats mises à jour pour ${eleve.idEleve}: moyenne ${moyenneNotes.toFixed(1)}, ${totalAbsences} absences`)
    }

    // Afficher un résumé
    const totalInterventions = await prisma.interventionFormateur.count()
    const totalEvaluations = await prisma.evaluation.count()
    const totalPresences = await prisma.presence.count()

    console.log('\n📈 Résumé des données ajoutées:')
    console.log(`  - ${totalInterventions} interventions formateurs`)
    console.log(`  - ${totalEvaluations} évaluations`)
    console.log(`  - ${totalPresences} enregistrements de présence`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addFormateurStatsData()
  .then(() => console.log('✨ Données statistiques ajoutées avec succès'))
  .catch(console.error)