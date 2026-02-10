import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:admin@127.0.0.1:5432/abj_crm_dev?schema=public"
    }
  }
})

async function installExtension() {
  try {
    console.log('📦 Installation de l\'extension pg_trgm...')
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
    console.log('✅ Extension pg_trgm installée')

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

installExtension()
