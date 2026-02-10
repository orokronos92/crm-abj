import prisma from './src/lib/prisma'

async function main() {
  console.log('=== TABLES DE RÉFÉRENCE ===\n')

  // Statuts documents
  const statutsDocs = await prisma.statutDocument.findMany({
    orderBy: { ordre: 'asc' }
  })
  console.log('📋 STATUTS_DOCUMENTS:')
  statutsDocs.forEach(s => {
    console.log(`  ${s.code.padEnd(15)} - ${s.libelle}`)
  })

  // Types documents
  const typesDocs = await prisma.typeDocument.findMany({
    orderBy: { ordreAffichage: 'asc' }
  })
  console.log('\n📄 TYPES_DOCUMENTS:')
  typesDocs.forEach(t => {
    console.log(`  ${t.code.padEnd(25)} - ${t.libelle}${t.obligatoire ? ' (OBLIGATOIRE)' : ''}`)
  })

  // Vérifier les valeurs distinctes dans candidats
  console.log('\n=== VALEURS RÉELLES DANS CANDIDATS ===\n')

  const statutsDossier = await prisma.$queryRaw<Array<{ statut_dossier: string }>>`
    SELECT DISTINCT statut_dossier FROM candidats WHERE statut_dossier IS NOT NULL ORDER BY statut_dossier
  `
  console.log('🗂️  STATUTS DOSSIER:')
  statutsDossier.forEach(s => console.log(`  - ${s.statut_dossier}`))

  const statutsFinancement = await prisma.$queryRaw<Array<{ statut_financement: string }>>`
    SELECT DISTINCT statut_financement FROM candidats WHERE statut_financement IS NOT NULL ORDER BY statut_financement
  `
  console.log('\n💰 STATUTS FINANCEMENT:')
  statutsFinancement.forEach(s => console.log(`  - ${s.statut_financement}`))

  const formations = await prisma.$queryRaw<Array<{ formation_retenue: string }>>`
    SELECT DISTINCT formation_retenue FROM candidats WHERE formation_retenue IS NOT NULL ORDER BY formation_retenue
  `
  console.log('\n🎓 FORMATIONS:')
  formations.forEach(f => console.log(`  - ${f.formation_retenue}`))

  await prisma.$disconnect()
}

main().catch(console.error)
