import prisma from './src/lib/prisma'

async function main() {
  // Récupérer un candidat avec son prospect
  const candidat = await prisma.candidat.findFirst({
    include: {
      prospect: {
        select: {
          nom: true,
          prenom: true,
          emails: true,
          telephones: true,
          dateDernierContact: true,
          nbEchanges: true
        }
      }
    }
  })

  console.log('=== CANDIDAT AVEC PROSPECT ===\n')
  console.log(JSON.stringify(candidat, null, 2))

  await prisma.$disconnect()
}

main().catch(console.error)
