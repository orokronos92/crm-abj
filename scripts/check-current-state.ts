import prisma from '../src/lib/prisma'

async function checkCurrentState() {
  console.log('🔍 Vérification de l\'état actuel de la base de données\n')
  console.log('=' .repeat(50))

  try {
    // Compter les enregistrements dans chaque table importante
    const counts = {
      'Utilisateurs': await prisma.utilisateur.count(),
      'Prospects': await prisma.prospect.count(),
      'Candidats': await prisma.candidat.count(),
      'Notifications': await prisma.notification.count(),
      'Formateurs': await prisma.formateur.count(),
      'Formations': await prisma.formation.count(),
      'Documents Formateur': await prisma.documentFormateur.count(),
      'Types Documents': await prisma.typeDocument.count(),
      'Types Documents Formateur': await prisma.typeDocumentFormateur.count(),
      'Sessions': await prisma.session.count(),
      'Élèves': await prisma.eleve.count()
    }

    console.log('\n📊 Nombre d\'enregistrements par table:\n')
    Object.entries(counts).forEach(([table, count]) => {
      const icon = count > 0 ? '✅' : '❌'
      console.log(`${icon} ${table}: ${count}`)
    })

    // Vérifier les notifications
    if (counts['Notifications'] === 0) {
      console.log('\n⚠️ ATTENTION: Aucune notification en base!')
      console.log('Les notifications doivent être recréées.')
    }

    // Vérifier les prospects/candidats
    if (counts['Prospects'] === 0 && counts['Candidats'] === 0) {
      console.log('\n⚠️ ATTENTION: Aucun prospect ni candidat en base!')
      console.log('Les données métier doivent être recréées.')
    }

    console.log('\n' + '=' .repeat(50))

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentState()