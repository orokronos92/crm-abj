import prisma from '../src/lib/prisma'

async function checkData() {
  const formateurs = await prisma.formateur.findMany({ take: 5 })
  console.log('Formateurs:', formateurs.map(f => ({ id: f.idFormateur, nom: f.nom })))
  
  const sessions = await prisma.session.count()
  console.log('Sessions:', sessions)
  
  await prisma.$disconnect()
}

checkData()
