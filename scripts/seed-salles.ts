/**
 * Script de seed pour créer les 9 salles fixes de l'ABJ
 * À exécuter une seule fois après création de la table Salle
 */

import prisma from '../src/lib/prisma'

const SALLES_ABJ = [
  {
    nom: 'Atelier A',
    code: 'ATEL_A',
    capaciteMax: 12,
    surfaceM2: 60,
    etage: 0,
    equipements: ['ETABLI_BIJOU', 'POSTE_TRAVAIL', 'LAMINOIR', 'FOUR', 'OUTILS_BASE'],
    formationsCompatibles: ['CAP_BJ', 'INIT_BJ', 'PERF_BIJOU'],
    disponibleWeekend: false,
    disponibleSoir: true,
    statut: 'ACTIVE',
    notes: 'Atelier principal - Bijouterie générale'
  },
  {
    nom: 'Atelier B',
    code: 'ATEL_B',
    capaciteMax: 10,
    surfaceM2: 50,
    etage: 0,
    equipements: ['POSTE_SERTI', 'LOUPE_BINOCULAIRE', 'ETABLI_SERTI', 'OUTILS_SERTI'],
    formationsCompatibles: ['PERF_SERTI', 'INIT_SERTI'],
    disponibleWeekend: false,
    disponibleSoir: true,
    statut: 'ACTIVE',
    notes: 'Atelier spécialisé sertissage'
  },
  {
    nom: 'Atelier C',
    code: 'ATEL_C',
    capaciteMax: 8,
    surfaceM2: 40,
    etage: 0,
    equipements: ['ETABLI_BIJOU', 'POSTE_POLISSAGE', 'TOUR_POLIR', 'CABINE_ASPIRATION'],
    formationsCompatibles: ['CAP_BJ', 'PERF_BIJOU', 'PERF_POLISSAGE'],
    disponibleWeekend: false,
    disponibleSoir: false,
    statut: 'ACTIVE',
    notes: 'Atelier finition et polissage'
  },
  {
    nom: 'Salle informatique',
    code: 'INFO',
    capaciteMax: 15,
    surfaceM2: 45,
    etage: 1,
    equipements: ['ORDINATEUR_CAO', 'LOGICIEL_RHINO', 'LOGICIEL_MATRIX', 'ECRAN_DOUBLE', 'IMPRIMANTE_3D'],
    formationsCompatibles: ['CAO_DAO', 'DESIGN_3D'],
    disponibleWeekend: true,
    disponibleSoir: true,
    statut: 'ACTIVE',
    notes: 'Équipée de 15 postes CAO/DAO professionnels'
  },
  {
    nom: 'Salle théorie',
    code: 'THEO',
    capaciteMax: 20,
    surfaceM2: 50,
    etage: 1,
    equipements: ['VIDEOPROJECTEUR', 'TABLEAU', 'TABLES_CONFERENCE'],
    formationsCompatibles: ['GEMMO', 'HISTOIRE_ART', 'GESTION_ATELIER'],
    disponibleWeekend: true,
    disponibleSoir: true,
    statut: 'ACTIVE',
    notes: 'Salle de cours théoriques et gemmologie'
  },
  {
    nom: 'Atelier polissage',
    code: 'ATEL_POL',
    capaciteMax: 6,
    surfaceM2: 30,
    etage: 0,
    equipements: ['TOUR_POLIR', 'CABINE_ASPIRATION', 'PRODUITS_POLISSAGE', 'ETAU'],
    formationsCompatibles: ['PERF_POLISSAGE', 'CAP_BJ'],
    disponibleWeekend: false,
    disponibleSoir: false,
    statut: 'ACTIVE',
    notes: 'Atelier dédié au polissage et finition'
  },
  {
    nom: 'Atelier taille',
    code: 'ATEL_TAIL',
    capaciteMax: 8,
    surfaceM2: 35,
    etage: 0,
    equipements: ['TOUR_TAILLE', 'DISQUE_DIAMANT', 'DOPS', 'LOUPE_TAILLE'],
    formationsCompatibles: ['LAPIDAIRE', 'TAILLE_PIERRE'],
    disponibleWeekend: false,
    disponibleSoir: false,
    statut: 'ACTIVE',
    notes: 'Atelier taille de pierres précieuses'
  },
  {
    nom: 'Salle réunion',
    code: 'REUNION',
    capaciteMax: 12,
    surfaceM2: 30,
    etage: 1,
    equipements: ['TABLE_CONFERENCE', 'VIDEOPROJECTEUR', 'ECRAN', 'VISIOCONFERENCE'],
    formationsCompatibles: [],
    disponibleWeekend: true,
    disponibleSoir: true,
    statut: 'ACTIVE',
    notes: 'Salle de réunion pour équipe pédagogique et entretiens'
  },
  {
    nom: 'Tous les ateliers',
    code: 'TOUS_ATEL',
    capaciteMax: 50,
    surfaceM2: 250,
    etage: 0,
    equipements: ['TOUS_EQUIPEMENTS'],
    formationsCompatibles: ['TOUS'],
    disponibleWeekend: false,
    disponibleSoir: false,
    statut: 'ACTIVE',
    notes: 'Réservation groupée de tous les ateliers pour événements (portes ouvertes, etc.)'
  }
]

async function main() {
  console.log('\n🏢 SEED SALLES ABJ\n')
  console.log('=' .repeat(60))

  // Vérifier si déjà seedé
  const existing = await prisma.salle.count()
  if (existing > 0) {
    console.log(`⚠️  ${existing} salle(s) déjà en base`)
    console.log('Voulez-vous continuer ? Les doublons seront ignorés.\n')
  }

  let created = 0
  let skipped = 0

  for (const salleData of SALLES_ABJ) {
    try {
      const salle = await prisma.salle.create({
        data: salleData
      })
      console.log(`✅ Créée: ${salle.nom} (${salle.code}) - ${salle.capaciteMax} places`)
      created++
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Ignorée: ${salleData.nom} (déjà existe)`)
        skipped++
      } else {
        console.error(`❌ Erreur ${salleData.nom}:`, error.message)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ ${created} salle(s) créée(s)`)
  console.log(`⏭️  ${skipped} salle(s) ignorée(s) (déjà existantes)`)

  // Afficher résumé
  console.log('\n📊 RÉSUMÉ DES SALLES\n')
  console.log('-'.repeat(60))

  const salles = await prisma.salle.findMany({
    orderBy: { nom: 'asc' }
  })

  salles.forEach(salle => {
    const dispo = []
    if (salle.disponibleWeekend) dispo.push('Weekend')
    if (salle.disponibleSoir) dispo.push('Soir')
    const dispoStr = dispo.length > 0 ? ` [${dispo.join(', ')}]` : ''

    console.log(`${salle.nom} (${salle.code})`)
    console.log(`   Capacité: ${salle.capaciteMax} pers | Surface: ${salle.surfaceM2}m² | Étage: ${salle.etage}${dispoStr}`)
    console.log(`   Équipements: ${salle.equipements.slice(0, 3).join(', ')}${salle.equipements.length > 3 ? '...' : ''}`)
    console.log('')
  })

  console.log('=' .repeat(60))
  console.log('✅ SEED SALLES TERMINÉ\n')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
