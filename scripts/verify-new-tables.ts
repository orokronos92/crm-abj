import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Vérification des nouvelles tables formateur...\n')

  try {
    // Tester les 7 nouvelles tables
    const tables = [
      'formateurDiplome',
      'formateurCertification',
      'formateurFormationPedagogique',
      'formateurPortfolio',
      'formateurCompetenceTechnique',
      'formateurFormationContinue',
      'formateurVeilleProfessionnelle'
    ]

    for (const table of tables) {
      const count = await (prisma as any)[table].count()
      console.log(`✓ ${table}: ${count} enregistrements`)
    }

    console.log('\n✅ Toutes les tables ont été créées avec succès !')

    // Vérifier que les colonnes JSON ont bien été supprimées
    console.log('\n🔍 Vérification colonnes Formateur...')
    const formateur = await prisma.formateur.findFirst({
      select: {
        idFormateur: true,
        nom: true,
        prenom: true,
        // Ces relations doivent maintenant exister
        diplomes: true,
        certificationsPro: true,
        formationsPedagogiques: true,
        portfolioRealisations: true,
        competencesTech: true,
        formationsCont: true,
        veillePro: true
      }
    })

    if (formateur) {
      console.log(`✓ Formateur ${formateur.prenom} ${formateur.nom}:`)
      console.log(`  - Diplômes: ${formateur.diplomes.length}`)
      console.log(`  - Certifications: ${formateur.certificationsPro.length}`)
      console.log(`  - Formations pédagogiques: ${formateur.formationsPedagogiques.length}`)
      console.log(`  - Portfolio: ${formateur.portfolioRealisations.length}`)
      console.log(`  - Compétences techniques: ${formateur.competencesTech.length}`)
      console.log(`  - Formations continues: ${formateur.formationsCont.length}`)
      console.log(`  - Veille professionnelle: ${formateur.veillePro.length}`)
    }

    console.log('\n✅ Migration du schéma réussie !')
    console.log('\n📝 Prochaine étape: Repeupler les données depuis le backup JSON')

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
