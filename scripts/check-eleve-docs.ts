import prisma from '../src/lib/prisma'

async function main() {
  const eleves = await prisma.eleve.findMany({
    take: 3,
    include: { candidat: { include: { documentsCandidat: { take: 3 } } } }
  })

  for (const e of eleves) {
    console.log('Eleve', e.idEleve, '| candidat:', e.candidat?.idCandidat, '| docs:', e.candidat?.documentsCandidat?.length ?? 0)
    if (e.candidat?.documentsCandidat?.length) {
      const d = e.candidat.documentsCandidat[0]
      console.log('  Doc:', d.typeDocument, '|', d.statut, '|', d.nomFichier ?? 'sans nom')
    }
  }

  const total = await prisma.documentCandidat.count()
  console.log('\nTotal docs en base:', total)
}

main().catch(console.error).finally(() => prisma.$disconnect())
