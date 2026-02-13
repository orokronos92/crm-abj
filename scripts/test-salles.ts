/**
 * Script de test pour la table Salle
 * Vérifie le fonctionnement du système de gestion des salles
 */

import prisma from '../src/lib/prisma'

async function main() {
  console.log('\n🏢 TEST SYSTÈME SALLES\n')
  console.log('=' .repeat(60))

  // 1. Lister toutes les salles
  console.log('\n1️⃣ LISTE DES SALLES DISPONIBLES')
  console.log('-'.repeat(60))

  const salles = await prisma.salle.findMany({
    where: { statut: 'ACTIVE' },
    orderBy: { nom: 'asc' }
  })

  console.log(`✅ ${salles.length} salle(s) active(s)\n`)

  salles.forEach(salle => {
    const dispo = []
    if (salle.disponibleWeekend) dispo.push('WE')
    if (salle.disponibleSoir) dispo.push('Soir')
    const dispoStr = dispo.length > 0 ? ` [${dispo.join(', ')}]` : ''

    console.log(`📍 ${salle.nom}`)
    console.log(`   Code: ${salle.code} | Capacité: ${salle.capaciteMax} pers | ${salle.surfaceM2}m²${dispoStr}`)
    console.log(`   Équipements: ${salle.equipements.slice(0, 2).join(', ')}${salle.equipements.length > 2 ? '...' : ''}`)
    console.log('')
  })

  // 2. Recherche par capacité minimum
  console.log('\n2️⃣ SALLES AVEC CAPACITÉ ≥ 15 PERSONNES')
  console.log('-'.repeat(60))

  const grandesSalles = await prisma.salle.findMany({
    where: {
      capaciteMax: { gte: 15 },
      statut: 'ACTIVE'
    },
    orderBy: { capaciteMax: 'desc' }
  })

  grandesSalles.forEach(salle => {
    console.log(`   • ${salle.nom} (${salle.capaciteMax} pers)`)
  })

  // 3. Salles disponibles le weekend
  console.log('\n3️⃣ SALLES DISPONIBLES LE WEEKEND')
  console.log('-'.repeat(60))

  const sallesWeekend = await prisma.salle.findMany({
    where: {
      disponibleWeekend: true,
      statut: 'ACTIVE'
    }
  })

  console.log(`✅ ${sallesWeekend.length} salle(s) disponible(s) le weekend`)
  sallesWeekend.forEach(salle => {
    console.log(`   • ${salle.nom}`)
  })

  // 4. Salles par étage
  console.log('\n4️⃣ RÉPARTITION PAR ÉTAGE')
  console.log('-'.repeat(60))

  const sallesEtage0 = await prisma.salle.count({
    where: { etage: 0, statut: 'ACTIVE' }
  })
  const sallesEtage1 = await prisma.salle.count({
    where: { etage: 1, statut: 'ACTIVE' }
  })

  console.log(`   Rez-de-chaussée (étage 0): ${sallesEtage0} salle(s)`)
  console.log(`   Premier étage (étage 1): ${sallesEtage1} salle(s)`)

  // 5. Mise en maintenance d'une salle
  console.log('\n5️⃣ MISE EN MAINTENANCE (SOFT DELETE)')
  console.log('-'.repeat(60))

  const atelierC = await prisma.salle.findFirst({
    where: { code: 'ATEL_C' }
  })

  if (atelierC) {
    const salleEnMaintenance = await prisma.salle.update({
      where: { idSalle: atelierC.idSalle },
      data: {
        statut: 'MAINTENANCE',
        motifIndisponibilite: 'Rénovation système ventilation - travaux prévus 2 semaines',
        dateDebutIndispo: new Date('2026-03-01'),
        dateFinIndispo: new Date('2026-03-15')
      }
    })

    console.log('✅ Salle mise en maintenance :')
    console.log(`   Salle: ${salleEnMaintenance.nom}`)
    console.log(`   Statut: ${salleEnMaintenance.statut}`)
    console.log(`   Motif: ${salleEnMaintenance.motifIndisponibilite}`)
    console.log(`   Période: ${salleEnMaintenance.dateDebutIndispo?.toLocaleDateString('fr-FR')} → ${salleEnMaintenance.dateFinIndispo?.toLocaleDateString('fr-FR')}`)
  }

  // 6. Vérifier disponibilité d'une salle à une date
  console.log('\n6️⃣ VÉRIFICATION DISPONIBILITÉ SALLE')
  console.log('-'.repeat(60))

  const dateTest = new Date('2026-03-10')
  const salleTest = await prisma.salle.findFirst({
    where: { code: 'ATEL_C' }
  })

  if (salleTest) {
    const estDisponible = salleTest.statut === 'ACTIVE' ||
      (salleTest.statut === 'MAINTENANCE' &&
       salleTest.dateDebutIndispo &&
       salleTest.dateFinIndispo &&
       (dateTest < salleTest.dateDebutIndispo || dateTest > salleTest.dateFinIndispo))

    console.log(`Date test: ${dateTest.toLocaleDateString('fr-FR')}`)
    console.log(`Salle: ${salleTest.nom}`)

    if (!estDisponible) {
      console.log(`❌ INDISPONIBLE - En maintenance jusqu'au ${salleTest.dateFinIndispo?.toLocaleDateString('fr-FR')}`)
      console.log(`   Motif: ${salleTest.motifIndisponibilite}`)
    } else {
      console.log(`✅ DISPONIBLE`)
    }
  }

  // 7. Réactiver la salle après maintenance
  console.log('\n7️⃣ RÉACTIVATION SALLE (FIN MAINTENANCE)')
  console.log('-'.repeat(60))

  if (atelierC) {
    const salleReactivee = await prisma.salle.update({
      where: { idSalle: atelierC.idSalle },
      data: {
        statut: 'ACTIVE',
        motifIndisponibilite: null,
        dateDebutIndispo: null,
        dateFinIndispo: null
      }
    })

    console.log('✅ Salle réactivée :')
    console.log(`   ${salleReactivee.nom} - Statut: ${salleReactivee.statut}`)
  }

  // 8. Statistiques globales
  console.log('\n8️⃣ STATISTIQUES GLOBALES')
  console.log('-'.repeat(60))

  const [total, actives, maintenance, horsService] = await Promise.all([
    prisma.salle.count(),
    prisma.salle.count({ where: { statut: 'ACTIVE' } }),
    prisma.salle.count({ where: { statut: 'MAINTENANCE' } }),
    prisma.salle.count({ where: { statut: 'HORS_SERVICE' } })
  ])

  const capaciteTotale = salles.reduce((sum, s) => sum + s.capaciteMax, 0)
  const surfaceTotale = salles.reduce((sum, s) => sum + (s.surfaceM2 || 0), 0)

  console.log(`📊 Total salles: ${total}`)
  console.log(`   ✅ Actives: ${actives}`)
  console.log(`   🔧 En maintenance: ${maintenance}`)
  console.log(`   ❌ Hors service: ${horsService}`)
  console.log(``)
  console.log(`📐 Capacité totale: ${capaciteTotale} personnes`)
  console.log(`📏 Surface totale: ${surfaceTotale}m²`)

  // 9. Salles par formation compatible
  console.log('\n9️⃣ SALLES PAR FORMATION')
  console.log('-'.repeat(60))

  const formationsTest = ['CAP_BJ', 'CAO_DAO', 'GEMMO']

  for (const formation of formationsTest) {
    const sallesFormation = await prisma.salle.findMany({
      where: {
        formationsCompatibles: { has: formation },
        statut: 'ACTIVE'
      }
    })

    if (sallesFormation.length > 0) {
      console.log(`${formation}: ${sallesFormation.length} salle(s)`)
      sallesFormation.forEach(s => {
        console.log(`   • ${s.nom} (${s.capaciteMax} pers)`)
      })
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ TEST TERMINÉ - Système salles fonctionnel')
  console.log('💡 Salles indisponibles restent en base avec statut MAINTENANCE\n')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
