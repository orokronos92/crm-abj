import prisma from '../src/lib/prisma.js'

async function testFormateurProfil() {
  console.log('=== Test Profil Formateur Pierre Durand (userId: 22) ===\n')

  try {
    const userId = 22

    console.log(`1. Recherche du formateur avec idUtilisateur = ${userId}...`)

    const formateur = await prisma.formateur.findUnique({
      where: { idUtilisateur: userId },
      include: {
        diplomes: { orderBy: { dateObtention: 'desc' } },
        certificationsPro: { orderBy: { dateObtention: 'desc' } },
        formationsPedagogiques: { orderBy: { dateFormation: 'desc' } },
        portfolioRealisations: { orderBy: { annee: 'desc' } },
        competencesTech: { orderBy: { domaine: 'asc' } },
        formationsCont: { orderBy: { dateDebut: 'desc' } },
        veillePro: { orderBy: { dateActivite: 'desc' } }
      }
    })

    if (!formateur) {
      console.error('❌ Aucun formateur trouvé avec idUtilisateur = 22')
      console.log('\nFormateurs disponibles:')
      const allFormateurs = await prisma.formateur.findMany({
        select: { idFormateur: true, nom: true, prenom: true, idUtilisateur: true }
      })
      console.table(allFormateurs)
      return
    }

    console.log(`✅ Formateur trouvé: ${formateur.prenom} ${formateur.nom}`)
    console.log(`   ID: ${formateur.idFormateur}`)
    console.log(`   Email: ${formateur.email}`)
    console.log(`   Téléphone: ${formateur.telephone || 'N/A'}`)
    console.log(`   Expérience métier: ${formateur.anneesExperience || 0} ans`)
    console.log(`   Expérience enseignement: ${formateur.anneesEnseignement || 0} ans`)

    console.log(`\n2. Vérification des données liées:`)
    console.log(`   - Diplômes: ${formateur.diplomes.length}`)
    console.log(`   - Certifications: ${formateur.certificationsPro.length}`)
    console.log(`   - Formations pédagogiques: ${formateur.formationsPedagogiques.length}`)
    console.log(`   - Portfolio: ${formateur.portfolioRealisations.length}`)
    console.log(`   - Compétences: ${formateur.competencesTech.length}`)
    console.log(`   - Formations continues: ${formateur.formationsCont.length}`)
    console.log(`   - Veille pro: ${formateur.veillePro.length}`)

    console.log('\n3. Test mapping des données (comme fait par l\'API):')
    try {
      // Test diplomes
      if (formateur.diplomes.length > 0) {
        const d = formateur.diplomes[0]
        console.log(`   ✓ Diplôme: ${d.nomDiplome}, obtenu le ${d.dateObtention.toISOString().split('T')[0]}`)
      }

      // Test formations pédagogiques
      if (formateur.formationsPedagogiques.length > 0) {
        const f = formateur.formationsPedagogiques[0]
        console.log(`   ✓ Formation péda: ${f.intitule}, date ${f.dateFormation.toISOString().split('T')[0]}`)
      }

      // Test portfolio
      if (formateur.portfolioRealisations.length > 0) {
        const p = formateur.portfolioRealisations[0]
        console.log(`   ✓ Portfolio: ${p.titre}, année ${p.annee}`)
      }

      // Test formations continues
      if (formateur.formationsCont.length > 0) {
        const fc = formateur.formationsCont[0]
        console.log(`   ✓ Formation continue: ${fc.intitule}, ${fc.dureeHeures}h`)
      }

      // Test veille
      if (formateur.veillePro.length > 0) {
        const v = formateur.veillePro[0]
        console.log(`   ✓ Veille: ${v.nomActivite}, type ${v.type}`)
      }

      console.log('\n✅ Tous les champs sont accessibles - L\'API devrait fonctionner')
    } catch (mappingError: any) {
      console.error('\n❌ ERREUR lors du mapping:', mappingError.message)
      throw mappingError
    }

  } catch (error: any) {
    console.error('\n❌ ERREUR:', error.message)
    console.error('Stack:', error.stack)
  }
}

testFormateurProfil()
  .finally(() => prisma.$disconnect())
