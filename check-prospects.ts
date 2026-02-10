import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.prospect.count()
  const prospects = await prisma.prospect.findMany({
    take: 5,
    select: {
      idProspect: true,
      nom: true,
      prenom: true,
      nbEchanges: true,
      datePremierContact: true,
      dateDernierContact: true
    }
  })

  console.log(`📊 Total prospects: ${count}\n`)

  if (prospects.length === 0) {
    console.log('❌ Aucun prospect - il faut lancer seed-enrichi.ts')
  } else {
    console.log('Exemples de prospects:\n')
    prospects.forEach(p => {
      console.log(`${p.prenom} ${p.nom}`)
      console.log(`  Échanges: ${p.nbEchanges}`)
      console.log(`  Premier: ${p.datePremierContact?.toISOString().split('T')[0]}`)
      console.log(`  Dernier: ${p.dateDernierContact?.toISOString().split('T')[0]}`)
      console.log('---')
    })

    const sansEchanges = prospects.filter(p => p.nbEchanges === 0).length
    if (sansEchanges > 0) {
      console.log(`\n⚠️ ${sansEchanges} prospects avec 0 échanges - il faut lancer seed-enrichi.ts`)
    } else {
      console.log('\n✅ Tous les prospects ont des échanges cohérents')
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
