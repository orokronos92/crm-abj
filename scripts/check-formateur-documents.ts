/**
 * Script pour vérifier les documents des formateurs
 * et s'assurer que les placeholders sont créés
 */

import prisma from '@/lib/prisma'
import { FormateurRepository } from '@/repositories/formateur.repository'

async function checkFormateurDocuments() {
  console.log('🔍 Vérification des documents formateur...\n')

  const repository = new FormateurRepository()

  try {
    // Récupérer un formateur
    const formateur = await prisma.formateur.findFirst({
      orderBy: { idFormateur: 'asc' }
    })

    if (!formateur) {
      console.log('❌ Aucun formateur trouvé')
      return
    }

    console.log(`📋 Formateur: ${formateur.prenom} ${formateur.nom} (ID: ${formateur.idFormateur})`)
    console.log('=' .repeat(60))

    // Récupérer les types de documents
    const allDocumentTypes = await prisma.typeDocumentFormateur.findMany({
      orderBy: { ordreAffichage: 'asc' }
    })
    console.log(`\n📝 Types de documents disponibles: ${allDocumentTypes.length}`)
    allDocumentTypes.forEach(type => {
      console.log(`  - ${type.code}: ${type.libelle} (${type.obligatoire ? 'Obligatoire' : 'Optionnel'})`)
    })

    // Récupérer les documents existants du formateur
    const existingDocs = await prisma.documentFormateur.findMany({
      where: { idFormateur: formateur.idFormateur },
      include: { typeDocument: true }
    })
    console.log(`\n📁 Documents existants en base: ${existingDocs.length}`)
    existingDocs.forEach(doc => {
      console.log(`  - ${doc.codeTypeDocument}: ${doc.statut}`)
    })

    // Récupérer via repository (avec placeholders)
    const formateurDetail = await repository.findById(formateur.idFormateur)

    if (!formateurDetail) {
      console.log('❌ Impossible de récupérer les détails via repository')
      return
    }

    console.log(`\n✨ Documents après traitement repository: ${formateurDetail.documents?.length || 0}`)

    if (formateurDetail.documents) {
      // Séparer par catégorie comme dans l'UI
      const documentsAdministratifs = formateurDetail.documents.filter((doc: any) =>
        ['CV', 'CNI', 'RCP', 'STATUT'].includes(doc.codeTypeDocument)
      )

      const documentsQualifications = formateurDetail.documents.filter((doc: any) =>
        ['DIPLOME', 'FORMATION_PEDAGOGIQUE', 'CERTIFICAT_QUALIOPI'].includes(doc.codeTypeDocument)
      )

      const documentsVeille = formateurDetail.documents.filter((doc: any) =>
        ['FORMATIONS_SUIVIES', 'PORTFOLIO', 'EVALUATIONS'].includes(doc.codeTypeDocument)
      )

      console.log('\n📊 Répartition par catégorie:')
      console.log(`  - Administratifs: ${documentsAdministratifs.length}`)
      documentsAdministratifs.forEach((doc: any) => {
        console.log(`    • ${doc.codeTypeDocument}: ${doc.statut} (ID: ${doc.idDocument})`)
      })

      console.log(`  - Qualifications: ${documentsQualifications.length}`)
      documentsQualifications.forEach((doc: any) => {
        console.log(`    • ${doc.codeTypeDocument}: ${doc.statut} (ID: ${doc.idDocument})`)
      })

      console.log(`  - Veille professionnelle: ${documentsVeille.length}`)
      documentsVeille.forEach((doc: any) => {
        console.log(`    • ${doc.codeTypeDocument}: ${doc.statut} (ID: ${doc.idDocument})`)
      })

      // Vérifier les placeholders (idDocument = 0)
      const placeholders = formateurDetail.documents.filter((doc: any) => doc.idDocument === 0)
      console.log(`\n🆕 Placeholders créés: ${placeholders.length}`)
      placeholders.forEach((doc: any) => {
        console.log(`  - ${doc.codeTypeDocument}: ${doc.libelle}`)
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFormateurDocuments()
  .then(() => console.log('\n✅ Vérification terminée'))
  .catch(console.error)