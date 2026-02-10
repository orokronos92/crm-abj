import prisma from './src/lib/prisma'

async function main() {
  console.log('=== ANALYSE STATUTS PROSPECTS ===\n')

  // Statuts actuels
  const statuts = await prisma.$queryRaw<Array<{ statut_prospect: string, count: string }>>`
    SELECT statut_prospect, COUNT(*)::text as count
    FROM prospects
    WHERE statut_prospect IS NOT NULL
    GROUP BY statut_prospect
    ORDER BY statut_prospect
  `

  console.log('📊 STATUTS ACTUELS:')
  statuts.forEach(s => console.log(`  ${s.statut_prospect.padEnd(25)} → ${s.count} prospect(s)`))

  // Prospects avec candidats
  const prospectsAvecCandidats = await prisma.prospect.findMany({
    where: {
      candidats: {
        some: {}
      }
    },
    select: {
      idProspect: true,
      nom: true,
      prenom: true,
      statutProspect: true,
      candidats: {
        select: {
          numeroDossier: true,
          statutDossier: true
        }
      }
    }
  })

  console.log(`\n📋 PROSPECTS AVEC CANDIDATS: ${prospectsAvecCandidats.length}`)
  prospectsAvecCandidats.slice(0, 5).forEach(p => {
    console.log(`  ${p.prenom} ${p.nom} (${p.idProspect})`)
    console.log(`    statutProspect: ${p.statutProspect}`)
    p.candidats.forEach(c => {
      console.log(`    → Candidat ${c.numeroDossier}: ${c.statutDossier}`)
    })
  })

  // Vérifier les élèves
  const elevesCount = await prisma.eleve.count()
  console.log(`\n🎓 ÉLÈVES EN BASE: ${elevesCount}`)

  if (elevesCount > 0) {
    const eleves = await prisma.eleve.findMany({
      take: 3,
      include: {
        candidat: {
          select: {
            idProspect: true,
            prospect: {
              select: {
                nom: true,
                prenom: true,
                statutProspect: true
              }
            }
          }
        }
      }
    })

    console.log('  Exemples:')
    eleves.forEach(e => {
      const prospect = e.candidat?.prospect
      console.log(`  ${prospect?.prenom} ${prospect?.nom}`)
      console.log(`    statutProspect: ${prospect?.statutProspect}`)
    })
  }

  await prisma.$disconnect()
}

main().catch(console.error)
