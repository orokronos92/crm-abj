import prisma from '../src/lib/prisma'

async function checkNotifications() {
  const count = await prisma.notification.count()
  const unread = await prisma.notification.count({ where: { lue: false } })
  const urgent = await prisma.notification.count({ where: { priorite: 'URGENTE' } })

  console.log('=================================')
  console.log('NOTIFICATIONS EN BASE DE DONNEES')
  console.log('=================================')
  console.log(`Total: ${count} notifications`)
  console.log(`Non lues: ${unread}`)
  console.log(`Urgentes: ${urgent}`)

  const latest = await prisma.notification.findMany({
    take: 5,
    orderBy: { creeLe: 'desc' },
    select: {
      idNotification: true,
      titre: true,
      priorite: true,
      lue: true,
      audience: true,
      creeLe: true
    }
  })

  console.log('\nDernieres notifications:')
  console.log('---------------------------------')
  latest.forEach(n => {
    const status = n.lue ? '[LUE]' : '[NON LUE]'
    console.log(`ID ${n.idNotification}: ${n.titre}`)
    console.log(`   Priorite: ${n.priorite} | Audience: ${n.audience} | ${status}`)
    console.log('')
  })

  process.exit(0)
}

checkNotifications().catch(console.error)