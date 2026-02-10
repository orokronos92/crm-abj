import { DashboardService } from './src/services/dashboard.service'

async function testDashboard() {
  const service = new DashboardService()

  console.log('🔄 Test du Dashboard Service...\n')

  try {
    const stats = await service.getStats()

    console.log('✅ Statistiques récupérées:')
    console.log('📊 Prospects:', stats.prospects.total)
    console.log('📝 Candidats:', stats.candidats.total)
    console.log('🎓 Élèves:', stats.eleves.total)
    console.log('👨‍🏫 Formateurs:', stats.formateurs.total)
    console.log('🎯 Taux conversion:', stats.conversion.taux + '%')
    console.log('💰 CA Réalisé:', stats.finance.caRealise + '€')
    console.log('💰 CA Prévisionnel:', stats.finance.caPrevisionnel + '€')

    const prospects = await service.getRecentProspects(3)
    console.log('\n📧 Derniers prospects:', prospects.length)

    const formations = await service.getFormationsStats()
    console.log('📚 Formations demandées:', formations.length)

    console.log('\n✅ Dashboard Service fonctionne correctement!')
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    process.exit()
  }
}

testDashboard()