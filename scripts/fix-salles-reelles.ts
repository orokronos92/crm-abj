/**
 * Correction des salles : remplace les noms fictifs par les vraies salles ABJ
 * Atelier S (id 1), Atelier B2 (id 2), Atelier B1 (id 3), Salle C (id 4)
 */
import prisma from '../src/lib/prisma'

async function main() {
  console.log('\n🔧 CORRECTION NOMS SALLES ABJ\n')

  const updates = [
    { idSalle: 1, nom: 'Atelier S',  code: 'ATEL_S',  capaciteMax: 4  },
    { idSalle: 2, nom: 'Atelier B2', code: 'ATEL_B2', capaciteMax: 8  },
    { idSalle: 3, nom: 'Atelier B1', code: 'ATEL_B1', capaciteMax: 10 },
    { idSalle: 4, nom: 'Salle C',    code: 'SALLE_C', capaciteMax: 10 },
  ]

  for (const u of updates) {
    await prisma.salle.update({
      where: { idSalle: u.idSalle },
      data: { nom: u.nom, code: u.code, capaciteMax: u.capaciteMax }
    })
    console.log(`  ✅ id ${u.idSalle} → ${u.nom} (${u.code}) — ${u.capaciteMax} places`)
  }

  console.log('\n📋 Salles finales :')
  const salles = await prisma.salle.findMany({
    select: { idSalle: true, nom: true, code: true, capaciteMax: true, statut: true },
    orderBy: { idSalle: 'asc' }
  })
  salles.forEach(s => console.log(`  [${s.idSalle}] ${s.nom} (${s.code}) — ${s.capaciteMax} places — ${s.statut}`))
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
