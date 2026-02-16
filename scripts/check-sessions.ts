import prisma from '../src/lib/prisma'

async function main() {
  try {
    const sessions = await prisma.session.findMany({
      take: 10,
      orderBy: { creeLe: 'desc' },
      select: {
        idSession: true,
        nomSession: true,
        statutValidation: true,
        dateDebut: true,
        dateFin: true,
        creeLe: true
      }
    })

    console.log('\n📋 Sessions récentes (10 dernières):')
    console.log('=====================================\n')

    if (sessions.length === 0) {
      console.log('❌ Aucune session trouvée dans la base de données\n')
    } else {
      sessions.forEach((session, index) => {
        console.log(`${index + 1}. Session #${session.idSession}`)
        console.log(`   Nom: ${session.nomSession}`)
        console.log(`   Statut: ${session.statutValidation}`)
        console.log(`   Dates: ${session.dateDebut.toLocaleDateString('fr-FR')} → ${session.dateFin.toLocaleDateString('fr-FR')}`)
        console.log(`   Créée le: ${session.creeLe.toLocaleString('fr-FR')}`)
        console.log('')
      })

      console.log(`✅ Total: ${sessions.length} session(s) trouvée(s)\n`)
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
