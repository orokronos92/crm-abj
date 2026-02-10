import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Correction des nbEchanges...\n')

  // Récupérer tous les prospects
  const prospects = await prisma.prospect.findMany({
    select: {
      idProspect: true,
      datePremierContact: true,
      dateDernierContact: true
    }
  })

  console.log(`📊 ${prospects.length} prospects à corriger\n`)

  for (const prospect of prospects) {
    if (!prospect.datePremierContact || !prospect.dateDernierContact) {
      continue
    }

    // Calculer nbEchanges basé sur la différence de dates
    const premier = new Date(prospect.datePremierContact)
    const dernier = new Date(prospect.dateDernierContact)
    const nbJours = Math.floor((dernier.getTime() - premier.getTime()) / (1000 * 60 * 60 * 24))

    // Si même jour = 1 échange, sinon calculer
    const nbEchanges = nbJours === 0 ? 1 : Math.max(1, Math.ceil(nbJours / 10))

    // Update
    await prisma.prospect.update({
      where: { idProspect: prospect.idProspect },
      data: { nbEchanges }
    })

    console.log(`✅ ${prospect.idProspect}: ${nbJours} jours → ${nbEchanges} échanges`)
  }

  console.log('\n✨ Correction terminée !')
  await prisma.$disconnect()
}

main().catch(console.error)
