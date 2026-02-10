import prisma from './src/lib/prisma'

async function main() {
  // Récupérer un candidat pour voir la structure
  const candidat = await prisma.candidat.findFirst()

  console.log('=== STRUCTURE CANDIDAT ===\n')
  console.log(JSON.stringify(candidat, null, 2))

  // Compter les candidats
  const total = await prisma.candidat.count()
  console.log(`\n📊 Total candidats: ${total}`)

  // Voir les statuts distincts
  const statuts = await prisma.candidat.findMany({
    distinct: ['statutDossier'],
    select: { statutDossier: true }
  })
  console.log('\n📋 Statuts dossier distincts:')
  statuts.forEach(s => console.log(`  - ${s.statutDossier}`))

  // Voir les financements distincts
  const financements = await prisma.candidat.findMany({
    distinct: ['modeFinancement'],
    select: { modeFinancement: true }
  })
  console.log('\n💰 Modes de financement distincts:')
  financements.forEach(f => console.log(`  - ${f.modeFinancement}`))

  await prisma.$disconnect()
}

main().catch(console.error)
