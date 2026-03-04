import prisma from '../src/lib/prisma'

async function main() {
  const sessions = await prisma.session.findMany({
    take: 5,
    orderBy: { creeLe: 'desc' },
    select: {
      idSession: true,
      nomSession: true,
      capaciteMax: true,
      nbInscrits: true,
      idSalle: true,
      notes: true,
      salle: { select: { nom: true, capaciteMax: true } }
    }
  })

  for (const s of sessions) {
    console.log(`\n--- Session #${s.idSession}: ${s.nomSession}`)
    console.log(`  capaciteMax (session):  ${s.capaciteMax}`)
    console.log(`  nbInscrits:             ${s.nbInscrits}`)
    console.log(`  salle: ${s.salle?.nom ?? 'null'} | capaciteMax salle: ${s.salle?.capaciteMax ?? 'null'}`)
    if (s.notes) {
      try {
        const meta = JSON.parse(s.notes)
        console.log(`  notes.nbParticipants:   ${meta.nbParticipants ?? 'non défini'}`)
      } catch {
        console.log(`  notes: (non parseable)`)
      }
    } else {
      console.log(`  notes: null`)
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
