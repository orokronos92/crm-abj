import prisma from '../src/lib/prisma'

async function main() {
  const formateurs = await prisma.formateur.findMany({
    select: {
      idFormateur: true,
      nom: true,
      prenom: true,
      email: true
    }
  })

  console.log('Formateurs en base:', formateurs)
  await prisma.$disconnect()
}

main().catch(console.error)