import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Chercher Sophie Martin
  const sophie = await prisma.prospect.findFirst({
    where: {
      OR: [
        { nom: 'Martin', prenom: 'Sophie' },
        { nom: { contains: 'Martin', mode: 'insensitive' } }
      ]
    },
    select: {
      idProspect: true,
      nom: true,
      prenom: true,
      nbEchanges: true,
      datePremierContact: true,
      dateDernierContact: true
    }
  })

  console.log('=== SOPHIE MARTIN ===\n')

  if (!sophie) {
    console.log('❌ Sophie Martin non trouvée en BDD')
  } else {
    console.log('ID:', sophie.idProspect)
    console.log('Nom:', sophie.prenom, sophie.nom)
    console.log('nbEchanges:', sophie.nbEchanges)
    console.log('Premier contact:', sophie.datePremierContact)
    console.log('Dernier contact:', sophie.dateDernierContact)

    if (sophie.datePremierContact && sophie.dateDernierContact) {
      const premier = new Date(sophie.datePremierContact)
      const dernier = new Date(sophie.dateDernierContact)
      const nbJours = Math.floor((dernier.getTime() - premier.getTime()) / (1000 * 60 * 60 * 24))

      console.log('\n📊 Analyse:')
      console.log(`Différence: ${nbJours} jours`)
      console.log(`Échanges attendus: ${nbJours === 0 ? 1 : Math.max(1, Math.ceil(nbJours / 10))}`)
      console.log(`Échanges actuels: ${sophie.nbEchanges}`)

      if (sophie.nbEchanges === 0) {
        console.log('\n⚠️ PROBLÈME: nbEchanges = 0 alors que dates existent')
      }
    }
  }

  // Voir tous les prospects avec 0 échanges
  console.log('\n=== TOUS LES PROSPECTS AVEC 0 ÉCHANGES ===\n')
  const zeros = await prisma.prospect.findMany({
    where: { nbEchanges: 0 },
    select: { idProspect: true, nom: true, prenom: true, datePremierContact: true, dateDernierContact: true }
  })

  if (zeros.length === 0) {
    console.log('✅ Aucun prospect avec 0 échanges')
  } else {
    zeros.forEach(p => {
      console.log(`- ${p.prenom} ${p.nom} (${p.idProspect})`)
    })
  }

  await prisma.$disconnect()
}

main().catch(console.error)
