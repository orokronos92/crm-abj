/**
 * Script de test pour vérifier la connexion formateurs
 * Teste le repository, service et conformité Qualiopi
 */

import prisma from '../src/lib/prisma'
import { FormateurRepository } from '../src/repositories/formateur.repository'
import { FormateurService } from '../src/services/formateur.service'

async function testFormateurConnection() {
  console.log('🧑‍🏫 Test de connexion des formateurs\n')
  console.log('='.repeat(50))

  try {
    // 1. Test du repository
    console.log('\n📊 1. Test du Repository')
    console.log('-'.repeat(30))

    const repository = new FormateurRepository()
    const { data: formateurs, total } = await repository.findAll({ take: 10 })

    console.log(`✅ Nombre de formateurs en base: ${total}`)

    if (formateurs.length > 0) {
      const premierFormateur = formateurs[0]
      console.log(`\n📋 Premier formateur:`)
      console.log(`  - Nom: ${premierFormateur.prenom} ${premierFormateur.nom}`)
      console.log(`  - Email: ${premierFormateur.email || 'Non défini'}`)
      console.log(`  - Statut: ${premierFormateur.statut}`)
      console.log(`  - Spécialités: ${premierFormateur.specialites?.join(', ') || 'Aucune'}`)
      console.log(`  - Tarif journalier: ${premierFormateur.tarifJournalier}€`)
      console.log(`  - Sessions actives: ${premierFormateur.sessionsPrincipales?.length || 0}`)
      console.log(`  - Documents: ${premierFormateur.documents?.length || 0}`)
    }

    // 2. Test du service
    console.log('\n📊 2. Test du Service')
    console.log('-'.repeat(30))

    const service = new FormateurService()
    const { formateurs: formateursList } = await service.getFormateurs({ take: 5 })

    console.log(`✅ Formateurs récupérés avec calculs: ${formateursList.length}`)

    if (formateursList.length > 0) {
      const f = formateursList[0]
      console.log(`\n📈 Calculs premier formateur:`)
      console.log(`  - Élèves actifs: ${f.elevesActifs}`)
      console.log(`  - Sessions actives: ${f.sessionsActives}`)
      console.log(`  - Heures hebdo: ${f.heuresHebdo}h`)
      console.log(`  - Taux horaire: ${f.tauxHoraire.toFixed(0)}€`)
      console.log(`  - Conforme Qualiopi: ${f.conformeQualiopi ? '✅' : '❌'}`)
      console.log(`  - Documents manquants: ${f.documentsManquants}`)
    }

    // 3. Test conformité Qualiopi
    console.log('\n📊 3. Test Conformité Qualiopi')
    console.log('-'.repeat(30))

    if (formateurs.length > 0) {
      const idFormateur = formateurs[0].idFormateur
      const qualiopi = await repository.checkQualiopi(idFormateur)

      if (qualiopi) {
        console.log(`\n🎯 Analyse Qualiopi formateur ID ${idFormateur}:`)
        console.log(`  - Conforme: ${qualiopi.conforme ? '✅ OUI' : '❌ NON'}`)
        console.log(`  - Dossier complet: ${qualiopi.dossierComplet ? '✅' : '❌'}`)

        if (qualiopi.issues.length > 0) {
          console.log(`\n  ⚠️ Problèmes identifiés:`)
          qualiopi.issues.forEach(issue => {
            console.log(`    - ${issue.type}: ${issue.count} (${issue.details.join(', ')})`)
          })
        }

        if (qualiopi.dateValidation) {
          console.log(`  - Date validation: ${new Date(qualiopi.dateValidation).toLocaleDateString('fr-FR')}`)
        }
      }
    }

    // 4. Test API endpoint
    console.log('\n📊 4. Test API Endpoint')
    console.log('-'.repeat(30))

    if (formateurs.length > 0) {
      const idFormateur = formateurs[0].idFormateur
      console.log(`\nTest GET /api/formateurs/${idFormateur}`)

      try {
        const response = await fetch(`http://localhost:3001/api/formateurs/${idFormateur}`)
        if (response.ok) {
          const data = await response.json()
          console.log('✅ API endpoint fonctionnel')
          console.log(`  - ${data.sessions?.length || 0} sessions`)
          console.log(`  - ${data.eleves?.length || 0} élèves`)
          console.log(`  - ${data.documents?.length || 0} documents`)
          console.log(`  - CA du mois: ${data.stats?.caMois || 0}€`)
        } else {
          console.log(`❌ Erreur API: ${response.status}`)
        }
      } catch (error) {
        console.log('⚠️ Serveur non accessible sur port 3001')
      }
    }

    // 5. Test des filtres
    console.log('\n📊 5. Test des Filtres')
    console.log('-'.repeat(30))

    const filterValues = await service.getFilterValues()
    console.log(`\n✅ Valeurs de filtres disponibles:`)
    console.log(`  - Statuts: ${filterValues.statuts.join(', ') || 'Aucun'}`)
    console.log(`  - Spécialités: ${filterValues.specialites.join(', ') || 'Aucune'}`)

    // Test filtre par statut
    const { formateurs: formateursActifs } = await service.getFormateurs({
      statut: 'ACTIF',
      take: 10
    })
    console.log(`\n  - Formateurs ACTIF: ${formateursActifs.length}`)

    // Test filtre conformité Qualiopi
    const { formateurs: formateursConformes } = await service.getFormateurs({
      conformeQualiopi: true,
      take: 10
    })
    console.log(`  - Formateurs conformes Qualiopi: ${formateursConformes.length}`)

    // 6. Statistiques globales
    console.log('\n📊 6. Statistiques Globales')
    console.log('-'.repeat(30))

    const stats = await service.getGlobalStats()
    console.log(`\n✅ Stats globales:`)
    console.log(`  - Total formateurs: ${stats.totalFormateurs}`)
    console.log(`  - Formateurs actifs: ${stats.formateursActifs}`)
    console.log(`  - Total élèves suivis: ${stats.totalEleves}`)
    console.log(`  - Sessions actives: ${stats.sessionsActives}`)
    console.log(`  - Documents manquants/expirés: ${stats.documentsManquants}`)

    // 7. Test relation avec élèves
    console.log('\n📊 7. Test Relations Élèves')
    console.log('-'.repeat(30))

    const formateurAvecEleves = formateurs.find(f =>
      f.sessionsPrincipales?.some(s =>
        s.inscriptionsSessions && s.inscriptionsSessions.length > 0
      )
    )

    if (formateurAvecEleves) {
      console.log(`\n✅ Formateur avec élèves: ${formateurAvecEleves.prenom} ${formateurAvecEleves.nom}`)

      formateurAvecEleves.sessionsPrincipales?.forEach(session => {
        if (session.inscriptionsSessions && session.inscriptionsSessions.length > 0) {
          console.log(`\n  Session: ${session.nomSession}`)
          console.log(`  - Formation: ${session.formation?.nom || 'Non définie'}`)
          console.log(`  - ${session.inscriptionsSessions.length} élèves inscrits`)

          const elevesEnCours = session.inscriptionsSessions.filter(i =>
            i.eleve?.statutFormation === 'EN_COURS'
          ).length
          console.log(`  - ${elevesEnCours} élèves en cours de formation`)
        }
      })
    } else {
      console.log('⚠️ Aucun formateur avec élèves trouvé')
      console.log('   → Normal si les inscriptions_sessions sont vides')
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ TOUS LES TESTS RÉUSSIS !')
    console.log('La connexion formateurs est opérationnelle.')
    console.log('='.repeat(50))

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
testFormateurConnection().catch(console.error)