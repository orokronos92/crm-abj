/**
 * Nettoyage salles : garde uniquement les 4 vraies salles de l'ABJ (IDs 1-4)
 * - Atelier S  (id 1)
 * - Atelier B2 (id 2)
 * - Atelier B1 (id 3)
 * - Salle C    (id 4)
 */
import prisma from '../src/lib/prisma'

const FAUSSES_SALLES = [5, 6, 7, 8, 9, 10, 11, 12, 14, 18]

async function main() {
  console.log('\n🧹 NETTOYAGE SALLES ABJ\n')

  // 1. Sessions liées aux fausses salles
  const sessionsUpdate = await prisma.session.updateMany({
    where: { idSalle: { in: FAUSSES_SALLES } },
    data: { idSalle: null }
  })
  console.log(`Sessions détachées des fausses salles : ${sessionsUpdate.count}`)

  // 2. Réservations liées aux fausses salles
  const resaDelete = await prisma.reservationSalle.deleteMany({
    where: { idSalle: { in: FAUSSES_SALLES } }
  })
  console.log(`Réservations supprimées : ${resaDelete.count}`)

  // 3. Supprimer les fausses salles
  const sallesDelete = await prisma.salle.deleteMany({
    where: { idSalle: { in: FAUSSES_SALLES } }
  })
  console.log(`Salles supprimées : ${sallesDelete.count}`)

  // 4. Vérifier ce qui reste
  const salles = await prisma.salle.findMany({
    select: { idSalle: true, nom: true, code: true, capaciteMax: true, statut: true },
    orderBy: { idSalle: 'asc' }
  })
  console.log('\n✅ Salles restantes :')
  salles.forEach(s => console.log(`  [${s.idSalle}] ${s.nom} (${s.code}) — ${s.capaciteMax} places — ${s.statut}`))
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
