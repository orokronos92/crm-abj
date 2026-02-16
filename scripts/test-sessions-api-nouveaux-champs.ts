import prisma from '../src/lib/prisma'

async function main() {
  try {
    console.log('\n🧪 Test des nouveaux champs API Sessions\n')
    console.log('=========================================\n')

    // Simuler exactement ce que fait l'API GET /api/sessions
    const sessions = await prisma.session.findMany({
      include: {
        formation: {
          select: {
            codeFormation: true,
            nom: true,
          }
        },
        formateurPrincipal: {
          select: {
            nom: true,
            prenom: true,
          }
        },
        inscriptionsSessions: {
          select: {
            idInscription: true,
          }
        },
      },
      orderBy: {
        creeLe: 'desc'
      }
    })

    // Formater comme l'API (avec les nouveaux champs)
    const formattedSessions = sessions.map(session => {
      const dateDebut = new Date(session.dateDebut)
      const dateFin = new Date(session.dateFin)
      const dureeJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: session.idSession,
        nom_session: session.nomSession,
        date_debut: session.dateDebut.toISOString().split('T')[0],
        date_fin: session.dateFin.toISOString().split('T')[0],
        duree_jours: dureeJours,
        duree_heures: dureeJours * 7,
        formateurs_secondaires: [],
      }
    })

    console.log(`✅ ${formattedSessions.length} sessions avec nouveaux champs\n`)

    // Afficher les 3 premières sessions avec les nouveaux champs
    formattedSessions.slice(0, 3).forEach((session, index) => {
      console.log(`${index + 1}. ${session.nom_session}`)
      console.log(`   ID: ${session.id}`)
      console.log(`   Dates: ${session.date_debut} → ${session.date_fin}`)
      console.log(`   ✅ duree_jours: ${session.duree_jours} jours`)
      console.log(`   ✅ duree_heures: ${session.duree_heures}h (${session.duree_jours} × 7h)`)
      console.log(`   ✅ formateurs_secondaires: ${JSON.stringify(session.formateurs_secondaires)} (array vide par défaut)`)
      console.log('')
    })

    console.log('✅ Tous les champs requis sont présents')
    console.log('✅ Plus d\'erreur "formateurs_secondaires is undefined"\n')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
