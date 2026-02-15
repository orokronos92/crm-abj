import prisma from '../src/lib/prisma'

async function checkProspectsDetail() {
  const all = await prisma.prospect.findMany({
    select: {
      idProspect: true,
      nom: true,
      prenom: true,
      statutProspect: true
    },
    orderBy: { nom: 'asc' }
  })

  console.log('TOUS LES PROSPECTS EN BASE:')
  console.log('=' .repeat(50))
  all.forEach(p => {
    console.log(`  ${p.prenom} ${p.nom} → ${p.statutProspect}`)
  })

  console.log('\nPROSPECTS DISPONIBLES (pas CANDIDAT/ELEVE):')
  console.log('=' .repeat(50))
  const disponibles = all.filter(p => !['CANDIDAT', 'ELEVE'].includes(p.statutProspect || ''))
  disponibles.forEach(p => {
    console.log(`  ${p.prenom} ${p.nom} → ${p.statutProspect}`)
  })

  console.log('\nRÉSUMÉ:')
  console.log('=' .repeat(50))
  console.log(`TOTAL en base: ${all.length} prospects`)
  console.log(`DISPONIBLES (affichés page Prospects): ${disponibles.length}`)
  console.log(`MASQUÉS (CANDIDAT/ELEVE): ${all.length - disponibles.length}`)

  await prisma.$disconnect()
}

checkProspectsDetail()