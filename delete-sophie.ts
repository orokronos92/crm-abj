import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Suppression de Sophie Martin...\n')

  const sophie = await prisma.prospect.findFirst({
    where: { idProspect: 'PROS_TEST_001' }
  })

  if (!sophie) {
    console.log('❌ Sophie Martin non trouvée')
  } else {
    await prisma.prospect.delete({
      where: { idProspect: 'PROS_TEST_001' }
    })

    console.log('✅ Sophie Martin supprimée')
  }

  // Vérification finale
  const count = await prisma.prospect.count()
  const zeros = await prisma.prospect.count({ where: { nbEchanges: 0 } })

  console.log(`\n📊 Total prospects: ${count}`)
  console.log(`⚠️  Prospects avec 0 échanges: ${zeros}`)

  if (zeros === 0) {
    console.log('\n✨ Tous les prospects sont cohérents !')
  }

  await prisma.$disconnect()
}

main().catch(console.error)
