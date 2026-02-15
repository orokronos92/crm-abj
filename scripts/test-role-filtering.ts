/**
 * Script pour tester le filtrage des notifications par rôle
 */

const API_URL = 'http://localhost:3000/api/notifications'

async function testRoleFiltering(role: string) {
  console.log(`\n📋 Test filtrage pour rôle: ${role}`)
  console.log('=' .repeat(40))

  try {
    const response = await fetch(`${API_URL}?role=${role}&limit=10`)

    if (!response.ok) {
      console.error('❌ Erreur:', response.status, response.statusText)
      return
    }

    const result = await response.json()

    if (result.success) {
      const notifications = result.data.notifications || []
      const counts = result.data.counts || {}

      console.log(`✅ Total notifications: ${counts.total || notifications.length}`)
      console.log(`📌 Non lues: ${counts.nonLues || 0}`)

      console.log('\nPremières notifications:')
      notifications.slice(0, 5).forEach((n: any) => {
        console.log(`  - [${n.audience}] ${n.titre}`)
      })

      // Vérifier les audiences
      const audiences = new Set(notifications.map((n: any) => n.audience))
      console.log(`\n📊 Audiences présentes: ${Array.from(audiences).join(', ')}`)

      // Vérifier qu'on n'a pas d'audience non autorisée
      if (role === 'professeur') {
        const hasAdminNotifs = notifications.some((n: any) => n.audience === 'ADMIN')
        if (hasAdminNotifs) {
          console.error('⚠️ PROBLÈME: Des notifications ADMIN sont visibles pour un formateur!')
        } else {
          console.log('✅ Filtrage correct: Aucune notification ADMIN')
        }
      }

    } else {
      console.error('❌ Erreur API:', result.error)
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error)
  }
}

async function main() {
  console.log('🔍 TEST DU FILTRAGE PAR RÔLE\n')

  // Tester chaque rôle
  await testRoleFiltering('admin')
  await testRoleFiltering('professeur')
  await testRoleFiltering('eleve')

  console.log('\n✨ Tests terminés!')
}

main()