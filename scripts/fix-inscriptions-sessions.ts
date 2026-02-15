/**
 * Script pour créer les inscriptions manquantes entre élèves et sessions
 * Cela permettra d'afficher les formateurs dans l'interface élèves
 */

import prisma from '../src/lib/prisma'

async function fixInscriptionsSessions() {
  console.log('🔧 Correction des inscriptions sessions manquantes\n')

  try {
    // 1. Récupérer tous les élèves
    const eleves = await prisma.eleve.findMany({
      include: {
        candidat: true
      }
    })

    console.log(`📚 ${eleves.length} élèves trouvés`)

    // 2. Récupérer toutes les sessions disponibles
    const sessions = await prisma.session.findMany({
      include: {
        formation: true
      }
    })

    console.log(`📅 ${sessions.length} sessions trouvées`)

    // 3. Mapper les codes formation élèves vers les codes formation sessions
    const formationMapping: Record<string, string> = {
      'CAP_BJ': 'CAP_BJ',
      'INIT_BJ': 'CAP_BJ',  // Initiation utilise la session CAP
      'PERF_SERTI': 'SERTI_N1',
      'CAO_DAO': 'CAO_DAO'
    }

    let inscriptionsCreees = 0

    // 4. Pour chaque élève, créer une inscription à la session appropriée
    for (const eleve of eleves) {
      if (!eleve.formationSuivie) {
        console.log(`⚠️ Élève ${eleve.idEleve} sans formation, ignoré`)
        continue
      }

      // Trouver le code formation correspondant
      const codeFormationSession = formationMapping[eleve.formationSuivie] || eleve.formationSuivie

      // Trouver une session correspondante
      const sessionCorrespondante = sessions.find(s =>
        s.formation?.codeFormation === codeFormationSession &&
        s.statutSession !== 'ANNULEE'
      )

      if (!sessionCorrespondante) {
        console.log(`⚠️ Pas de session trouvée pour ${eleve.formationSuivie} (élève ${eleve.idEleve})`)
        continue
      }

      // Vérifier si l'inscription existe déjà
      const inscriptionExistante = await prisma.inscriptionSession.findFirst({
        where: {
          idEleve: eleve.idEleve,
          idSession: sessionCorrespondante.idSession
        }
      })

      if (inscriptionExistante) {
        console.log(`✓ Inscription déjà existante pour élève ${eleve.idEleve} dans session ${sessionCorrespondante.idSession}`)
        continue
      }

      // Créer l'inscription
      await prisma.inscriptionSession.create({
        data: {
          idEleve: eleve.idEleve,
          idSession: sessionCorrespondante.idSession,
          dateInscription: eleve.creeLe || new Date(),
          statutInscription: 'CONFIRME'
        }
      })

      inscriptionsCreees++
      console.log(`✅ Inscription créée: Élève ${eleve.idEleve} (${eleve.formationSuivie}) → Session ${sessionCorrespondante.idSession} (${sessionCorrespondante.nomSession})`)
    }

    console.log(`\n✨ ${inscriptionsCreees} inscriptions créées`)

    // 5. Vérification finale
    const totalInscriptions = await prisma.inscriptionSession.count()
    console.log(`📊 Total inscriptions en base: ${totalInscriptions}`)

    // 6. Test : Vérifier qu'un élève a maintenant accès au formateur
    const eleveTest = await prisma.eleve.findFirst({
      include: {
        inscriptionsSessions: {
          include: {
            session: {
              include: {
                formateurPrincipal: true
              }
            }
          }
        }
      }
    })

    if (eleveTest?.inscriptionsSessions?.[0]?.session?.formateurPrincipal) {
      const formateur = eleveTest.inscriptionsSessions[0].session.formateurPrincipal
      console.log(`\n✅ TEST RÉUSSI: L'élève ${eleveTest.numeroDossier} a maintenant le formateur ${formateur.prenom} ${formateur.nom}`)
    } else {
      console.log('\n⚠️ TEST: Aucun formateur trouvé même après création des inscriptions')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixInscriptionsSessions()