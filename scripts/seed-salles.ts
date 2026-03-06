/**
 * Script de seed pour les 4 vraies salles de l'ABJ
 * - Atelier S  (ATEL_S)  — 4 places
 * - Atelier B2 (ATEL_B2) — 8 places
 * - Atelier B1 (ATEL_B1) — 10 places
 * - Salle C    (SALLE_C) — 10 places
 *
 * Utilise upsert pour être idempotent (safe à ré-exécuter)
 */

import prisma from '../src/lib/prisma'

const SALLES_ABJ = [
  {
    idSalle: 1,
    nom: 'Atelier S',
    code: 'ATEL_S',
    capaciteMax: 4,
    surfaceM2: 25,
    etage: 0,
    equipements: ['ETABLI_BIJOU', 'POSTE_TRAVAIL', 'OUTILS_BASE'],
    formationsCompatibles: ['CAP_BJ', 'INIT_BJ'],
    disponibleWeekend: false,
    disponibleSoir: false,
    statut: 'ACTIVE',
    notes: 'Petit atelier — 4 postes de bijouterie'
  },
  {
    idSalle: 2,
    nom: 'Atelier B2',
    code: 'ATEL_B2',
    capaciteMax: 8,
    surfaceM2: 40,
    etage: 0,
    equipements: ['ETABLI_BIJOU', 'POSTE_SERTI', 'LOUPE_BINOCULAIRE', 'OUTILS_SERTI'],
    formationsCompatibles: ['CAP_BJ', 'PERF_SERTI', 'INIT_SERTI'],
    disponibleWeekend: false,
    disponibleSoir: false,
    statut: 'ACTIVE',
    notes: 'Atelier B2 — 8 postes'
  },
  {
    idSalle: 3,
    nom: 'Atelier B1',
    code: 'ATEL_B1',
    capaciteMax: 10,
    surfaceM2: 50,
    etage: 0,
    equipements: ['ETABLI_BIJOU', 'POSTE_TRAVAIL', 'LAMINOIR', 'FOUR', 'OUTILS_BASE'],
    formationsCompatibles: ['CAP_BJ', 'INIT_BJ', 'PERF_BIJOU'],
    disponibleWeekend: false,
    disponibleSoir: false,
    statut: 'ACTIVE',
    notes: 'Atelier B1 — 10 postes, atelier principal'
  },
  {
    idSalle: 4,
    nom: 'Salle C',
    code: 'SALLE_C',
    capaciteMax: 10,
    surfaceM2: 45,
    etage: 1,
    equipements: ['TABLES_CONFERENCE', 'VIDEOPROJECTEUR', 'TABLEAU'],
    formationsCompatibles: ['GEMMO', 'HISTOIRE_ART', 'CAO_DAO'],
    disponibleWeekend: false,
    disponibleSoir: false,
    statut: 'ACTIVE',
    notes: 'Salle C — cours théoriques et entretiens'
  },
]

async function main() {
  console.log('\n🏢 SEED SALLES ABJ (4 salles réelles)\n')

  for (const salleData of SALLES_ABJ) {
    const { idSalle, ...data } = salleData
    const salle = await prisma.salle.upsert({
      where: { idSalle },
      update: data,
      create: { idSalle, ...data }
    })
    console.log(`✅ ${salle.nom} (${salle.code}) — ${salle.capaciteMax} places`)
  }

  console.log('\n✅ Seed salles terminé\n')
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
