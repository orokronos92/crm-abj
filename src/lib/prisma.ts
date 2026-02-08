/**
 * Configuration Prisma Client - Singleton pattern
 * Évite la création de multiples instances en développement
 */

import { PrismaClient } from '@prisma/client'

declare global {
  // Permet de stocker le client dans globalThis en dev
   
  var prisma: PrismaClient | undefined
}

// Configuration du client avec logging en dev
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })
}

// Utilise le singleton ou crée une nouvelle instance
const prisma = globalThis.prisma ?? prismaClientSingleton()

// En développement, garde la référence globale
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma