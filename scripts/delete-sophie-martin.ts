import prisma from '../src/lib/prisma'

async function deleteSophieMartin() {
  try {
    // D'abord vérifier si elle existe
    const sophie = await prisma.prospect.findFirst({
      where: {
        OR: [
          { nom: 'Martin', prenom: 'Sophie' },
          { idProspect: { contains: 'sophie.martin' } }
        ]
      }
    })

    if (sophie) {
      console.log(`🔍 Sophie Martin trouvée avec l'ID: ${sophie.idProspect}`)

      // Supprimer Sophie Martin
      await prisma.prospect.delete({
        where: { idProspect: sophie.idProspect }
      })

      console.log('✅ Sophie Martin supprimée de la base de données')
    } else {
      console.log('❌ Sophie Martin n\'existe pas en base')
    }
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteSophieMartin()