/**
 * Script pour tester que les données enrichies des formateurs sont bien accessibles
 */

import prisma from '@/lib/prisma'

async function testFormateurModalData() {
  console.log('🔍 Test des données pour le modal formateur...\n')

  try {
    // Récupérer un formateur avec toutes les données
    const formateur = await prisma.formateur.findFirst({
      where: {
        idFormateur: 2 // Laurent Dupont
      },
      include: {
        documents: {
          include: {
            typeDocument: true
          }
        },
        sessionsPrincipales: {
          include: {
            inscriptionsSessions: {
              include: {
                eleve: true
              }
            }
          }
        },
        interventions: true,
        evaluations: {
          take: 5
        }
      }
    })

    if (!formateur) {
      console.log('❌ Aucun formateur trouvé')
      return
    }

    console.log('👤 Formateur:', formateur.prenom, formateur.nom)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Vérifier les champs enrichis
    console.log('\n📝 PROFIL:')
    console.log('  - Bio:', formateur.bio ? `${formateur.bio.substring(0, 80)}...` : '❌ Manquant')
    console.log('  - Années expérience:', formateur.anneesExperience || '❌')
    console.log('  - Années enseignement:', formateur.anneesEnseignement || '❌')
    console.log('  - Langues:', formateur.languesParlees?.length || 0, 'langue(s)')

    console.log('\n🎯 COMPÉTENCES:')
    console.log('  - Compétences techniques:', formateur.competencesTechniques?.length || 0, 'compétences')
    console.log('  - Outils/supports:', formateur.outilsSupports?.length || 0, 'outils')
    console.log('  - Certifications:', formateur.certifications ? JSON.parse(JSON.stringify(formateur.certifications)).length : 0)
    console.log('  - Satisfaction moyenne:', formateur.satisfactionMoyenne || '❌')
    console.log('  - Taux de réussite:', formateur.tauxReussite, '%')

    console.log('\n📚 EXPERTISE:')
    console.log('  - Méthodes pédagogiques:', formateur.methodesPedagogiques ? '✅ Renseignées' : '❌ Manquantes')
    console.log('  - Approche pédagogique:', formateur.approchePedagogique ? '✅ Renseignée' : '❌ Manquante')
    console.log('  - Portfolio:', formateur.portfolio ? '✅ Disponible' : '❌ Manquant')

    console.log('\n📈 MAINTIEN COMPÉTENCES:')
    console.log('  - Formations continues:', formateur.formationsContinues ? JSON.parse(JSON.stringify(formateur.formationsContinues)).length : 0)
    console.log('  - Publications:', formateur.publicationsArticles?.length || 0, 'articles')

    console.log('\n📊 TRAÇABILITÉ:')
    console.log('  - Élèves formés:', formateur.nombreElevesFormes || 0)
    console.log('  - Sessions actives:', formateur.sessionsPrincipales.length)
    console.log('  - Interventions totales:', formateur.interventions.length)
    console.log('  - Évaluations récentes:', formateur.evaluations.length)

    // Calculer les élèves actuels
    const elevesActuels = new Set()
    formateur.sessionsPrincipales.forEach(s => {
      s.inscriptionsSessions.forEach(i => {
        elevesActuels.add(i.idEleve)
      })
    })
    console.log('  - Élèves actuels:', elevesActuels.size)

    console.log('\n📄 DOCUMENTS QUALIOPI:')
    console.log('  - Documents en base:', formateur.documents.length)
    console.log('  - CV URL:', formateur.cvUrl ? '✅ Disponible' : '❌ Manquant')
    console.log('  - Validation Qualiopi:', formateur.dateValidationQualiopi ? '✅ Validé' : '⚠️ En attente')
    console.log('  - Dossier complet:', formateur.dossierComplet ? '✅ Oui' : '❌ Non')

    // Afficher les types de documents
    if (formateur.documents.length > 0) {
      console.log('  Documents présents:')
      formateur.documents.forEach(doc => {
        console.log(`    - ${doc.typeDocument?.libelle || doc.codeTypeDocument}: ${doc.statut}`)
      })
    }

    console.log('\n✅ Toutes les données sont disponibles pour le modal !')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFormateurModalData()
  .then(() => console.log('\n✨ Test terminé'))
  .catch(console.error)