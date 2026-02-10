import { PrismaClient } from '@prisma/client'

const DATABASE_URL = "postgresql://postgres:admin@127.0.0.1:5432/postgres?schema=public"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Connexion PostgreSQL réussie!')

    // Lister les bases de données
    const result = await prisma.$queryRaw`SELECT datname FROM pg_database WHERE datistemplate = false;`
    console.log('📊 Bases de données:', result)

    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Erreur de connexion:', error.message)
    process.exit(1)
  }
}

testConnection()
