import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Vérifier si l'extension existe
    const result = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'pg_trgm'
    `

    console.log('Extension pg_trgm:', result)

    // Si elle n'existe pas, la créer
    if ((result as any[]).length === 0) {
      console.log('Installation de pg_trgm...')
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS pg_trgm`
      console.log('✅ Extension installée')
    } else {
      console.log('✅ Extension déjà présente')
    }

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
