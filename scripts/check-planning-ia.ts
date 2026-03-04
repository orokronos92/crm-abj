import prisma from '../src/lib/prisma'

async function main() {
  const sessions = await prisma.session.findMany({
    take: 3,
    orderBy: { idSession: 'desc' },
    select: { idSession: true, nomSession: true, planningIA: true, notes: true }
  })

  sessions.forEach(s => {
    console.log(`=== Session ${s.idSession} — ${s.nomSession} ===`)
    if (s.planningIA) {
      const p = typeof s.planningIA === 'string' ? JSON.parse(s.planningIA as string) : s.planningIA as any
      console.log('planning_ia keys:', Object.keys(p))
      if (p.seances) {
        console.log(`seances count: ${p.seances.length}`)
        console.log('exemple séance 0:', JSON.stringify(p.seances[0]))
        console.log('exemple séance 1:', JSON.stringify(p.seances[1]))
      }
    } else {
      console.log('planning_ia: NULL')
    }
    console.log('notes:', s.notes ? s.notes.substring(0, 150) : 'NULL')
    console.log()
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
