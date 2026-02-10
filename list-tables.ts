import prisma from './src/lib/prisma'

async function main() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `

  console.log('=== TABLES EN BASE DE DONNÉES ===\n')
  tables.forEach((t) => {
    console.log(`📋 ${t.tablename}`)
  })

  console.log(`\n✅ Total: ${tables.length} tables`)

  await prisma.$disconnect()
}

main().catch(console.error)
