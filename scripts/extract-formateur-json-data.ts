import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const formateurs = await prisma.formateur.findMany({
    select: {
      idFormateur: true,
      nom: true,
      prenom: true,
      // Relations vers tables séparées (noms exacts du schéma)
      portfolioRealisations: true,
      certificationsPro: true,
      formationsCont: true,
      // Champs JSON existants (arrays)
      publicationsArticles: true,
      competencesTechniques: true,
      outilsSupports: true
    }
  })

  console.log('\n📊 Données JSON existantes des formateurs:\n')
  console.log(JSON.stringify(formateurs, null, 2))

  console.log('\n📋 Résumé:')
  console.log(`Total formateurs: ${formateurs.length}`)
  console.log(`Avec portfolio: ${formateurs.filter(f => f.portfolioRealisations && f.portfolioRealisations.length > 0).length}`)
  console.log(`Avec certifications: ${formateurs.filter(f => f.certificationsPro && f.certificationsPro.length > 0).length}`)
  console.log(`Avec formations continues: ${formateurs.filter(f => f.formationsCont && f.formationsCont.length > 0).length}`)
  console.log(`Avec publications: ${formateurs.filter(f => f.publicationsArticles && f.publicationsArticles.length > 0).length}`)
  console.log(`Avec compétences techniques: ${formateurs.filter(f => f.competencesTechniques && f.competencesTechniques.length > 0).length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
