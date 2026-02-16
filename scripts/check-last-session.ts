import prisma from '../src/lib/prisma'

async function checkLastSession() {
  const session = await prisma.session.findFirst({
    orderBy: { idSession: 'desc' },
    include: {
      formation: true,
      formateurPrincipal: true
    }
  })

  if (!session) {
    console.log('Aucune session trouvée')
    return
  }

  console.log('📋 Dernière session créée:')
  console.log('   ID:', session.idSession)
  console.log('   Nom:', session.nomSession)
  console.log('   Formation:', session.formation?.nom)
  console.log('   Capacité max:', session.capaciteMax)
  console.log('   Nb inscrits:', session.nbInscrits)
  console.log('   Formateur principal ID:', session.formateurPrincipalId)
  console.log('   Formateur principal:', session.formateurPrincipal ? `${session.formateurPrincipal.prenom} ${session.formateurPrincipal.nom}` : 'NULL')
  console.log('   Salle principale:', session.sallePrincipale)
  console.log('   Statut:', session.statutValidation)

  if (session.notes) {
    const meta = JSON.parse(session.notes)
    console.log('\n📊 Métadonnées:')
    if (meta.formateurs) {
      console.log('   Formateurs dans meta:', meta.formateurs.map((f: any) => `${f.nom} (ID: ${f.id})`).join(', '))
    }
    if (meta.salles) {
      console.log('   Salles dans meta:', meta.salles.map((s: any) => s.nom).join(', '))
    }
  }

  await prisma.$disconnect()
}

checkLastSession()
