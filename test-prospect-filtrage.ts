/**
 * Script de test pour vérifier le filtrage des prospects
 */

import prisma from './src/lib/prisma'

async function main() {
  console.log('=== TEST FILTRAGE PROSPECTS ===\n')

  // 1. Total prospects
  const totalProspects = await prisma.prospect.count()
  console.log(`📊 TOTAL PROSPECTS: ${totalProspects}`)

  // 2. Prospects par statut
  const prospectsParStatut = await prisma.$queryRaw<Array<{ statut_prospect: string, count: string }>>`
    SELECT statut_prospect, COUNT(*)::text as count
    FROM prospects
    WHERE statut_prospect IS NOT NULL
    GROUP BY statut_prospect
    ORDER BY statut_prospect
  `

  console.log('\n📋 PROSPECTS PAR STATUT:')
  prospectsParStatut.forEach(s => {
    console.log(`  ${s.statut_prospect.padEnd(25)} → ${s.count}`)
  })

  // 3. Prospects DISPONIBLES (filtrés - logique page Prospects)
  const prospectsDisponibles = await prisma.prospect.findMany({
    where: {
      statutProspect: {
        notIn: ['CANDIDAT', 'ELEVE']
      }
    },
    select: {
      nom: true,
      prenom: true,
      statutProspect: true
    }
  })

  console.log(`\n✅ PROSPECTS DISPONIBLES (hors CANDIDAT et ELEVE): ${prospectsDisponibles.length}`)
  prospectsDisponibles.forEach(p => {
    console.log(`  ${p.prenom} ${p.nom} → ${p.statutProspect}`)
  })

  // 4. Prospects MASQUÉS (CANDIDAT et ELEVE)
  const prospectsMasques = await prisma.prospect.findMany({
    where: {
      statutProspect: {
        in: ['CANDIDAT', 'ELEVE']
      }
    },
    select: {
      nom: true,
      prenom: true,
      statutProspect: true
    }
  })

  console.log(`\n❌ PROSPECTS MASQUÉS (CANDIDAT ou ELEVE): ${prospectsMasques.length}`)
  if (prospectsMasques.length > 0) {
    prospectsMasques.slice(0, 5).forEach(p => {
      console.log(`  ${p.prenom} ${p.nom} → ${p.statutProspect}`)
    })
  } else {
    console.log('  Aucun')
  }

  // 5. Vérification logique métier
  console.log('\n=== VÉRIFICATION LOGIQUE MÉTIER ===')
  console.log('✓ Page Prospects affichera:', prospectsDisponibles.length, 'prospects')
  console.log('✓ Prospects masqués (actifs):', prospectsMasques.length)
  console.log('✓ Ratio affiché:', Math.round((prospectsDisponibles.length / totalProspects) * 100), '%')

  console.log('\n📌 RAPPEL:')
  console.log('  - AFFICHER: NOUVEAU, EN_ATTENTE_DOSSIER, ANCIEN_CANDIDAT, ANCIEN_ELEVE')
  console.log('  - MASQUER: CANDIDAT (admission), ELEVE (formation)')
  console.log('  - Permet ciblage marketing sur prospects disponibles uniquement')

  await prisma.$disconnect()
}

main().catch(console.error)
