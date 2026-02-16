import prisma from '../src/lib/prisma'

async function main() {
  try {
    console.log('\n🔍 Test de l\'API Sessions (simulation)\n')
    console.log('=====================================\n')

    // Simuler ce que fait l'API GET /api/sessions
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

    // Formater comme l'API
    const formattedSessions = sessions.map(session => ({
      id: session.idSession,
      formation: session.formation?.nom || 'Formation non définie',
      code_formation: session.formation?.codeFormation || '',
      nom_session: session.nomSession,
      formateur_principal: session.formateurPrincipal
        ? `${session.formateurPrincipal.prenom} ${session.formateurPrincipal.nom}`
        : 'Non assigné',
      salle: session.sallePrincipale || 'Non assignée',
      capacite: session.capaciteMax,
      inscrits: session.nbInscrits || session.inscriptionsSessions.length,
      date_debut: session.dateDebut.toISOString().split('T')[0],
      date_fin: session.dateFin.toISOString().split('T')[0],
      statut: session.statutValidation,
      statut_session: session.statutSession,
    }))

    console.log('✅ Sessions récupérées:', formattedSessions.length)
    console.log('\n📋 Détails des sessions:\n')

    formattedSessions.forEach((session, index) => {
      console.log(`${index + 1}. ${session.nom_session}`)
      console.log(`   ID: ${session.id}`)
      console.log(`   Formation: ${session.formation} (${session.code_formation})`)
      console.log(`   Formateur: ${session.formateur_principal}`)
      console.log(`   Salle: ${session.salle}`)
      console.log(`   Capacité: ${session.inscrits}/${session.capacite}`)
      console.log(`   Dates: ${session.date_debut} → ${session.date_fin}`)
      console.log(`   Statut validation: ${session.statut}`)
      console.log(`   Statut session: ${session.statut_session}`)
      console.log('')
    })

    console.log('\n✅ L\'API devrait retourner exactement ces données\n')

    // Statistiques
    const stats = {
      total: formattedSessions.length,
      EN_ANALYSE: formattedSessions.filter(s => s.statut === 'EN_ANALYSE').length,
      EN_ATTENTE: formattedSessions.filter(s => s.statut === 'EN_ATTENTE').length,
      VALIDE: formattedSessions.filter(s => s.statut === 'VALIDE').length,
      totalInscrits: formattedSessions.reduce((sum, s) => sum + s.inscrits, 0),
      placesDisponibles: formattedSessions.reduce((sum, s) => sum + (s.capacite - s.inscrits), 0),
    }

    console.log('📊 Statistiques:')
    console.log(`   Total sessions: ${stats.total}`)
    console.log(`   En analyse: ${stats.EN_ANALYSE}`)
    console.log(`   En attente: ${stats.EN_ATTENTE}`)
    console.log(`   Validées: ${stats.VALIDE}`)
    console.log(`   Total inscrits: ${stats.totalInscrits}`)
    console.log(`   Places disponibles: ${stats.placesDisponibles}`)
    console.log('')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
