import prisma from '../src/lib/prisma'

async function main() {
  const [prospects, candidats, eleves] = await Promise.all([
    prisma.prospect.count(),
    prisma.candidat.count(),
    prisma.eleve.count(),
  ])

  console.log('=== ÉTAT DE LA BASE ===')
  console.log('Prospects:', prospects)
  console.log('Candidats:', candidats)
  console.log('Eleves:', eleves)

  if (prospects > 0) {
    const sample = await prisma.prospect.findMany({
      take: 5,
      select: { idProspect: true, nom: true, prenom: true, statutProspect: true, formationPrincipale: true },
      orderBy: { creeLe: 'desc' }
    })
    console.log('\n=== 5 DERNIERS PROSPECTS ===')
    for (const p of sample) {
      console.log(`  ${p.nom} ${p.prenom} | statut: ${p.statutProspect} | formation: ${p.formationPrincipale}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
