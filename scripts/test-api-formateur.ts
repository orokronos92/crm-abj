/**
 * Script pour tester l'API formateur et voir ce qui est retourné
 */

async function testApiFormateur() {
  console.log('🔍 Test API /api/formateurs/2...\n')

  try {
    const response = await fetch('http://localhost:3000/api/formateurs/2')

    if (!response.ok) {
      console.log('❌ Erreur API:', response.status, response.statusText)
      return
    }

    const data = await response.json()

    console.log('✅ API Response reçue')
    console.log('Documents:', data.documents?.length || 0)

    if (data.documents && data.documents.length > 0) {
      console.log('\n📋 Premier document:')
      console.log(JSON.stringify(data.documents[0], null, 2))

      // Vérifier les documents par catégorie
      const documentsAdministratifs = data.documents.filter((doc: any) =>
        ['CV', 'CNI', 'RCP', 'STATUT'].includes(doc.codeTypeDocument)
      )

      console.log('\n📊 Documents administratifs filtrés:', documentsAdministratifs.length)

      // Afficher tous les codeTypeDocument
      console.log('\n📝 Tous les codeTypeDocument:')
      data.documents.forEach((doc: any) => {
        console.log(`  - ${doc.codeTypeDocument || 'UNDEFINED'}: ${doc.libelle}`)
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testApiFormateur()
  .then(() => console.log('\n✅ Test terminé'))
  .catch(console.error)