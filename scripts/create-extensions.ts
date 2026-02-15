import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createExtensions() {
  console.log('Création des extensions PostgreSQL...')

  try {
    // Créer l'extension pg_trgm
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
    console.log('✅ Extension pg_trgm créée')

    // Créer l'extension uuid-ossp si nécessaire
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    console.log('✅ Extension uuid-ossp créée')

  } catch (error) {
    console.error('Erreur lors de la création des extensions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createExtensions()