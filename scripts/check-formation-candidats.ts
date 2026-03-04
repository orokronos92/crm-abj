import prisma from '../src/lib/prisma'

async function main() {
  console.log('=== VÉRIFICATION CHAMP FORMATION CANDIDATS ===\n')

  const candidats = await prisma.candidat.findMany({
    take: 10,
    select: {
      idCandidat: true,
      numeroDossier: true,
      formationRetenue: true,
      formationsDemandees: true,
      statutDossier: true,
      prospect: {
        select: {
          nom: true,
          prenom: true,
          formationPrincipale: true,
          formationsSouhaitees: true,
        }
      }
    },
    orderBy: { idCandidat: 'desc' }
  })

  for (const c of candidats) {
    console.log(`--- Candidat ${c.idCandidat} (${c.numeroDossier}) ---`)
    console.log(`  Statut: ${c.statutDossier}`)
    console.log(`  formationRetenue: ${JSON.stringify(c.formationRetenue)}`)
    console.log(`  formationsDemandees: ${JSON.stringify(c.formationsDemandees)}`)
    console.log(`  prospect.nom: ${c.prospect?.nom}`)
    console.log(`  prospect.formationPrincipale: ${JSON.stringify(c.prospect?.formationPrincipale)}`)
    console.log(`  prospect.formationsSouhaitees: ${JSON.stringify(c.prospect?.formationsSouhaitees)}`)
    console.log('')
  }

  // Comptages
  const total = await prisma.candidat.count()
  const avecFormation = await prisma.candidat.count({ where: { formationRetenue: { not: null } } })
  const sansFormation = total - avecFormation

  console.log(`\n=== STATS ===`)
  console.log(`Total candidats: ${total}`)
  console.log(`Avec formationRetenue: ${avecFormation}`)
  console.log(`Sans formationRetenue (NULL): ${sansFormation}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
