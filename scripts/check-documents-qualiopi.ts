/**
 * Script pour vérifier l'affichage des documents Qualiopi
 * après la réorganisation de l'onglet documents
 */

import prisma from '@/lib/prisma'
import { FormateurRepository } from '@/repositories/formateur.repository'

async function checkDocumentsQualiopi() {
  console.log('🔍 Vérification de l\'affichage des documents Qualiopi...\n')

  const repository = new FormateurRepository()

  try {
    // Récupérer quelques formateurs pour test
    const formateurs = await prisma.formateur.findMany({
      take: 3,
      orderBy: { idFormateur: 'asc' }
    })

    for (const formateur of formateurs) {
      console.log(`\n📋 ${formateur.prenom} ${formateur.nom} (ID: ${formateur.idFormateur})`)
      console.log('=' .repeat(60))

      // Récupérer le détail complet avec tous les documents
      const detail = await repository.findById(formateur.idFormateur)

      if (!detail) {
        console.log('❌ Erreur: Impossible de récupérer les détails')
        continue
      }

      // Catégoriser les documents comme dans le composant
      const documentsAdministratifs = detail.documents?.filter((doc: any) =>
        ['CV', 'CNI', 'RCP', 'STATUT'].includes(doc.codeTypeDocument)
      ) || []

      const documentsQualifications = detail.documents?.filter((doc: any) =>
        ['DIPLOME', 'FORMATION_PEDAGOGIQUE', 'CERTIFICAT_QUALIOPI'].includes(doc.codeTypeDocument)
      ) || []

      const documentsVeille = detail.documents?.filter((doc: any) =>
        ['FORMATIONS_SUIVIES', 'PORTFOLIO', 'EVALUATIONS'].includes(doc.codeTypeDocument)
      ) || []

      // Compter seulement les obligatoires manquants
      const documentsObligatoiresManquants = detail.documents?.filter((doc: any) =>
        doc.statut === 'ATTENDU' && doc.typeDocument?.obligatoire === true
      ).length || 0

      const documentsValides = detail.documents?.filter((d: any) => d.statut === 'VALIDE').length || 0
      const documentsTotal = detail.documents?.length || 0

      // Vérifier la conformité
      const conforme = documentsObligatoiresManquants === 0

      console.log('\n📊 Statistiques:')
      console.log(`  • Documents totaux: ${documentsTotal}`)
      console.log(`  • Documents validés: ${documentsValides}`)
      console.log(`  • Documents obligatoires manquants: ${documentsObligatoiresManquants}`)
      console.log(`  • Conformité Qualiopi: ${conforme ? '✅ OUI' : '❌ NON'}`)

      console.log('\n📁 Documents administratifs et légaux:')
      for (const doc of documentsAdministratifs) {
        const obligatoire = doc.typeDocument?.obligatoire ? ' (*)' : ''
        console.log(`  - ${doc.typeDocument?.libelle || doc.codeTypeDocument}${obligatoire}: ${doc.statut}`)
      }

      console.log('\n🎓 Qualifications et diplômes:')
      for (const doc of documentsQualifications) {
        const obligatoire = doc.typeDocument?.obligatoire ? ' (*)' : ''
        console.log(`  - ${doc.typeDocument?.libelle || doc.codeTypeDocument}${obligatoire}: ${doc.statut}`)
      }

      console.log('\n📚 Veille professionnelle (optionnel):')
      if (documentsVeille.length > 0) {
        for (const doc of documentsVeille) {
          console.log(`  - ${doc.typeDocument?.libelle || doc.codeTypeDocument}: ${doc.statut}`)
        }
      } else {
        console.log('  Aucun document de veille (facultatif)')
      }

      // Vérification avec la méthode checkQualiopi
      const qualiopiCheck = await repository.checkQualiopi(formateur.idFormateur, true)

      console.log('\n🔍 Vérification Qualiopi (méthode checkQualiopi):')
      console.log(`  • Conforme: ${qualiopiCheck?.conforme ? '✅ OUI' : '❌ NON'}`)
      if (qualiopiCheck?.issues && qualiopiCheck.issues.length > 0) {
        console.log('  • Issues détectées:')
        for (const issue of qualiopiCheck.issues) {
          console.log(`    - ${issue.type}: ${issue.count} (${issue.details.join(', ')})`)
        }
      }
    }

    // Résumé global
    console.log('\n\n📈 RÉSUMÉ GLOBAL')
    console.log('=' .repeat(60))

    const allFormateurs = await prisma.formateur.findMany()
    let conformes = 0
    let nonConformes = 0

    for (const f of allFormateurs) {
      const check = await repository.checkQualiopi(f.idFormateur, true)
      if (check?.conforme) {
        conformes++
      } else {
        nonConformes++
      }
    }

    console.log(`Total formateurs: ${allFormateurs.length}`)
    console.log(`Conformes Qualiopi: ${conformes} (${Math.round(conformes / allFormateurs.length * 100)}%)`)
    console.log(`Non conformes: ${nonConformes} (${Math.round(nonConformes / allFormateurs.length * 100)}%)`)

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDocumentsQualiopi()