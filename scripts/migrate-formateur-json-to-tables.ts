import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migration des données JSON formateurs vers tables relationnelles\n')

  // 1. Extraire les données relationnelles existantes
  console.log('📥 Extraction des données relationnelles...')
  const formateurs = await prisma.formateur.findMany({
    select: {
      idFormateur: true,
      nom: true,
      prenom: true,
      portfolioRealisations: true,
      certificationsPro: true,
      formationsCont: true
    }
  })

  const formateursAvecDonnees = formateurs.filter(
    f => f.portfolioRealisations.length > 0 || f.certificationsPro.length > 0 || f.formationsCont.length > 0
  )

  console.log(`✓ ${formateursAvecDonnees.length} formateurs avec données à migrer\n`)

  // Sauvegarder les données relationnelles
  const jsonBackup: any = {}

  for (const formateur of formateursAvecDonnees) {
    jsonBackup[formateur.idFormateur] = {
      nom: `${formateur.prenom} ${formateur.nom}`,
      portfolioRealisations: formateur.portfolioRealisations,
      certificationsPro: formateur.certificationsPro,
      formationsCont: formateur.formationsCont
    }
  }

  console.log('📋 Backup JSON créé:')
  console.log(JSON.stringify(jsonBackup, null, 2))
  console.log('\n✅ Données sauvegardées pour migration ultérieure')
  console.log('\n📝 Prochaines étapes:')
  console.log('1. Appliquer les changements de schéma avec: npx prisma db push --accept-data-loss')
  console.log('2. Exécuter le script de repopulation des nouvelles tables')
  console.log('\n⚠️  Note: Les données JSON seront perdues mais sauvegardées ci-dessus pour migration manuelle')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
