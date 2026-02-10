import { PrismaClient } from '@prisma/client'

// Utiliser l'URL du .env
const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Test de connexion avec .env...')
    console.log('URL depuis .env: DATABASE_URL')

    // Test simple
    const count = await prisma.prospect.count()
    console.log('✅ Nombre de prospects:', count)

    // Test avec données
    const first3 = await prisma.prospect.findMany({
      take: 3,
      select: {
        nom: true,
        prenom: true
      }
    })
    console.log('✅ Premiers prospects:', first3)

    console.log('✅ Connexion OK!')
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
