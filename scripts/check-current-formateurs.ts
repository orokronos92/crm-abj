import prisma from '@/lib/prisma'

async function checkFormateurs() {
  const formateurs = await prisma.formateur.findMany({
    select: {
      idFormateur: true,
      nom: true,
      prenom: true,
      bio: true,
      anneesExperience: true,
      satisfactionMoyenne: true,
      competencesTechniques: true
    }
  })

  console.log('📊 État actuel des formateurs:\n')
  formateurs.forEach(f => {
    console.log(`ID ${f.idFormateur}: ${f.prenom} ${f.nom}`)
    console.log(`  Bio: ${f.bio ? '✅ Présente' : '❌ Manquante'}`)
    console.log(`  Années exp: ${f.anneesExperience || '❌ Non renseigné'}`)
    console.log(`  Satisfaction: ${f.satisfactionMoyenne || '❌ Non renseigné'}`)
    console.log(`  Compétences: ${f.competencesTechniques?.length || 0} compétences`)
    console.log('')
  })

  await prisma.$disconnect()
}

checkFormateurs().catch(console.error)