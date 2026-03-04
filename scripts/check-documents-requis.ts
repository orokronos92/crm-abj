import prisma from '../src/lib/prisma'

async function main() {
  // Formations disponibles
  const formations = await prisma.formation.findMany({
    select: { idFormation: true, codeFormation: true, nom: true },
    orderBy: { idFormation: 'asc' }
  })

  console.log('=== FORMATIONS ===')
  for (const f of formations) {
    console.log(`  [${f.idFormation}] ${f.codeFormation} — ${f.nom}`)
  }

  // Documents requis par formation
  console.log('\n=== DOCUMENTS REQUIS PAR FORMATION ===')
  const docs = await prisma.documentRequis.findMany({
    include: {
      formation: { select: { codeFormation: true, nom: true } },
      typeDocument: { select: { code: true, libelle: true, categorie: true } }
    },
    orderBy: [{ idFormation: 'asc' }, { ordreAffichage: 'asc' }]
  })

  if (docs.length === 0) {
    console.log('  ⚠️  AUCUN document requis en base !')
  } else {
    let currentFormation = ''
    for (const d of docs) {
      if (d.formation.codeFormation !== currentFormation) {
        currentFormation = d.formation.codeFormation
        console.log(`\n  [${currentFormation}] ${d.formation.nom}`)
      }
      console.log(`    - ${d.typeDocument.code} (${d.typeDocument.libelle}) | obligatoire: ${d.obligatoire} | catégorie: ${d.typeDocument.categorie}`)
    }
  }

  console.log(`\nTotal documents requis: ${docs.length}`)

  // Types de documents disponibles
  const types = await prisma.typeDocument.count()
  console.log(`Types de documents: ${types}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
