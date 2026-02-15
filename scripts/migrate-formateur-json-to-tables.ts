import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migration des données JSON formateurs vers tables relationnelles\n')

  // 1. Extraire les données JSON existantes
  console.log('📥 Extraction des données JSON...')
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

  const formateursAvecDonnees = formateurs.filter(
    f => f.portfolio || f.certifications || f.formationsContinues
  )

  console.log(`✓ ${formateursAvecDonnees.length} formateurs avec données à migrer\n`)

  // Sauvegarder les données JSON
  const jsonBackup: any = {}

  for (const formateur of formateursAvecDonnees) {
    jsonBackup[formateur.idFormateur] = {
      nom: `${formateur.prenom} ${formateur.nom}`,
      portfolio: formateur.portfolio,
      certifications: formateur.certifications,
      formationsContinues: formateur.formationsContinues
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
