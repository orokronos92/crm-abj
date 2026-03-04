import prisma from '../src/lib/prisma'

async function main() {
  const reservations = await prisma.reservationSalle.findMany({
    take: 20,
    orderBy: { dateDebut: 'desc' },
    include: {
      session: {
        select: {
          idSession: true,
          nomSession: true,
          formation: { select: { nom: true, codeFormation: true } }
        }
      },
      evenement: { select: { idEvenement: true, titre: true, type: true } },
      salle: { select: { nom: true } }
    }
  })

  console.log(`\n=== ${reservations.length} réservations ===\n`)
  reservations.forEach(r => {
    console.log(`ID ${r.idReservation} | Salle: ${r.salle.nom}`)
    console.log(`  ${r.dateDebut.toISOString()} → ${r.dateFin.toISOString()}`)
    if (r.session) {
      console.log(`  Session: [${r.session.idSession}] ${r.session.nomSession}`)
      console.log(`  Formation: ${r.session.formation?.nom} (${r.session.formation?.codeFormation})`)
    }
    if (r.evenement) {
      console.log(`  Événement: [${r.evenement.idEvenement}] ${r.evenement.titre} (${r.evenement.type})`)
    }
    console.log(`  Statut: ${r.statut}`)
    console.log()
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
