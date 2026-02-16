import prisma from '../src/lib/prisma'

async function checkFormations() {
  try {
    console.log('🔍 Vérification des formations dans la base de données...\n')

    const formations = await prisma.formation.findMany({
      select: {
        idFormation: true,
        codeFormation: true,
        nom: true,
        categorie: true,
      },
      orderBy: {
        codeFormation: 'asc'
      }
    })

    if (formations.length === 0) {
      console.log('❌ Aucune formation trouvée dans la base de données')
    } else {
      console.log(`✅ ${formations.length} formation(s) trouvée(s):\n`)
      formations.forEach(f => {
        console.log(`  - Code: ${f.codeFormation}`)
        console.log(`    Nom: ${f.nom}`)
        console.log(`    Catégorie: ${f.categorie}`)
        console.log(`    ID: ${f.idFormation}\n`)
      })
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Erreur:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkFormations()
