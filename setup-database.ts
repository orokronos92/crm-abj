import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:admin@127.0.0.1:5432/postgres?schema=public"
    }
  }
})

async function setupDatabase() {
  try {
    console.log('🔧 Configuration de la base de données...\n')

    // Vérifier si la base existe
    const databases: any = await prisma.$queryRaw`
      SELECT datname FROM pg_database WHERE datname = 'abj_crm_dev';
    `

    if (databases.length > 0) {
      console.log('✅ La base abj_crm_dev existe déjà')
    } else {
      console.log('📦 Création de la base abj_crm_dev...')
      await prisma.$executeRawUnsafe('CREATE DATABASE abj_crm_dev;')
      console.log('✅ Base abj_crm_dev créée')
    }

    await prisma.$disconnect()
    console.log('\n✅ Configuration terminée!')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Lancez: npx prisma db push')
    console.log('2. Lancez: npm run db:seed')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

setupDatabase()
