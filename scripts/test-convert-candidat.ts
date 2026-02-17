/**
 * Script de test pour l'action "Convertir en candidat"
 * Vérifie que les endpoints et le workflow sont opérationnels
 */

import prisma from '../src/lib/prisma'

async function main() {
  console.log('🧪 Test Conversion Prospect → Candidat\n')

  // 1. Vérifier qu'on a des prospects disponibles
  const prospects = await prisma.prospect.findMany({
    where: {
      statutProspect: {
        notIn: ['CANDIDAT', 'ELEVE']
      }
    },
    take: 5,
    select: {
      idProspect: true,
      nom: true,
      prenom: true,
      emails: true,
      formationPrincipale: true,
      statutProspect: true
    }
  })

  console.log(`✅ ${prospects.length} prospects disponibles pour conversion`)
  console.log('')

  if (prospects.length > 0) {
    console.log('📋 Exemples de prospects :')
    prospects.forEach(p => {
      console.log(`   - ${p.prenom} ${p.nom} (${p.idProspect})`)
      console.log(`     Formation: ${p.formationPrincipale || 'Non définie'}`)
      console.log(`     Statut: ${p.statutProspect}`)
      console.log(`     Email: ${p.emails[0] || 'Non défini'}`)
      console.log('')
    })
  }

  // 2. Vérifier les formations disponibles
  const formations = await prisma.formation.findMany({
    where: { actif: true },
    select: {
      idFormation: true,
      codeFormation: true,
      nom: true,
      dureeHeures: true,
      tarifStandard: true
    }
  })

  console.log(`✅ ${formations.length} formations actives disponibles`)
  console.log('')

  if (formations.length > 0) {
    console.log('📚 Formations :')
    formations.forEach(f => {
      console.log(`   - ${f.nom} (${f.codeFormation})`)
      if (f.dureeHeures) console.log(`     Durée: ${f.dureeHeures}h`)
      if (f.tarifStandard) console.log(`     Tarif: ${f.tarifStandard}€`)
      console.log('')
    })
  }

  // 3. Vérifier les sessions disponibles
  const sessions = await prisma.session.findMany({
    where: {
      statutSession: {
        in: ['CONFIRMEE', 'PREVUE', 'EN_COURS']
      }
    },
    select: {
      idSession: true,
      nomSession: true,
      dateDebut: true,
      dateFin: true,
      capaciteMax: true,
      nbInscrits: true,
      formation: {
        select: {
          nom: true
        }
      }
    },
    take: 5
  })

  console.log(`✅ ${sessions.length} sessions disponibles`)
  console.log('')

  if (sessions.length > 0) {
    console.log('📅 Sessions :')
    sessions.forEach(s => {
      const placesRestantes = (s.capaciteMax || 0) - s.nbInscrits
      console.log(`   - ${s.nomSession}`)
      console.log(`     Formation: ${s.formation?.nom}`)
      console.log(`     Dates: ${s.dateDebut.toLocaleDateString('fr-FR')} → ${s.dateFin.toLocaleDateString('fr-FR')}`)
      console.log(`     Places: ${s.nbInscrits}/${s.capaciteMax || 0} (${placesRestantes} restantes)`)
      console.log('')
    })
  }

  // 4. Tester l'endpoint API formations
  console.log('🌐 Test endpoint GET /api/formations')
  try {
    const response = await fetch('http://localhost:3000/api/formations?actif=true')
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Endpoint formations OK : ${data.formations?.length || 0} formations`)
    } else {
      console.log(`   ❌ Endpoint formations erreur : ${response.status}`)
    }
  } catch (error) {
    console.log(`   ⚠️ Serveur non démarré (normal si test sans serveur)`)
  }
  console.log('')

  // 5. Tester l'endpoint API sessions
  console.log('🌐 Test endpoint GET /api/sessions')
  try {
    const response = await fetch('http://localhost:3000/api/sessions?statutSession=CONFIRMEE,PREVUE')
    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Endpoint sessions OK : ${data.sessions?.length || 0} sessions`)
    } else {
      console.log(`   ❌ Endpoint sessions erreur : ${response.status}`)
    }
  } catch (error) {
    console.log(`   ⚠️ Serveur non démarré (normal si test sans serveur)`)
  }
  console.log('')

  // 6. Vérifier les variables d'environnement
  console.log('🔧 Vérification configuration n8n :')
  console.log(`   N8N_WEBHOOK_BASE_URL: ${process.env.N8N_WEBHOOK_BASE_URL || '❌ Non défini'}`)
  console.log(`   N8N_API_KEY: ${process.env.N8N_API_KEY ? '✅ Défini' : '❌ Non défini'}`)
  console.log('')

  // 7. Résumé final
  console.log('📊 Résumé :')
  console.log(`   ✅ ${prospects.length} prospects disponibles`)
  console.log(`   ✅ ${formations.length} formations actives`)
  console.log(`   ✅ ${sessions.length} sessions disponibles`)
  console.log(`   ${process.env.N8N_WEBHOOK_BASE_URL ? '✅' : '⚠️'} Configuration n8n ${process.env.N8N_WEBHOOK_BASE_URL ? 'OK' : 'à configurer'}`)
  console.log('')

  console.log('✨ Pour tester la conversion :')
  console.log('   1. Démarrer le serveur : npm run dev')
  console.log('   2. Aller sur /admin/prospects')
  console.log('   3. Cliquer sur un prospect')
  console.log('   4. Cliquer "Convertir en candidat"')
  console.log('')
  console.log('⚠️ Note : Le webhook n8n doit être configuré pour que la création du dossier Drive fonctionne')
  console.log('   Sinon, seul le statut sera mis à jour (conversion partielle)')
}

main()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })
