import prisma from '../src/lib/prisma'

async function checkSession() {
  const session = await prisma.session.findUnique({
    where: { idSession: 12 }
  })

  if (!session) {
    console.log('Session 12 non trouvée')
    return
  }

  console.log('✅ Session trouvée:', session.nomSession)
  console.log('\n📋 Métadonnées sauvegardées dans notes:')

  const notes = JSON.parse(session.notes || '{}')
  console.log('   totalHeuresProgramme:', notes.totalHeuresProgramme + 'h')
  console.log('   nbParticipants:', notes.nbParticipants)
  console.log('   Programme:', notes.programme?.length + ' matières')
  console.log('\n✅ Les données sont bien sauvegardées en base !')

  await prisma.$disconnect()
}

checkSession()
