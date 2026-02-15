import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const formateurs = await prisma.formateur.findMany({
    select: {
      idFormateur: true,
      nom: true,
      prenom: true,
      portfolio: true,
      certifications: true,
      formationsContinues: true
    }
  })

  console.log('\n📊 Données JSON existantes des formateurs:\n')
  console.log(JSON.stringify(formateurs, null, 2))

  console.log('\n📋 Résumé:')
  console.log(`Total formateurs: ${formateurs.length}`)
  console.log(`Avec portfolio: ${formateurs.filter(f => f.portfolio).length}`)
  console.log(`Avec certifications: ${formateurs.filter(f => f.certifications).length}`)
  console.log(`Avec formations continues: ${formateurs.filter(f => f.formationsContinues).length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
