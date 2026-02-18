/**
 * Script de seed : 10 Formateurs
 * Objectif : Créer des formateurs avec profils complets
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Données formateurs réalistes
const FORMATEURS_DATA = [
  {
    nom: 'Dupont',
    prenom: 'Laurent',
    email: 'laurent.dupont@formateur-abj.fr',
    telephone: '+33612345001',
    specialites: ['SERTISSAGE', 'JOAILLERIE'],
    tarifJournalier: 550,
    bio: 'Expert en sertissage traditionnel avec 25 ans d\'expérience. Ancien formateur au CAP Bijouterie-Joaillerie de Paris.',
    anneesExperience: 25,
    anneesEnseignement: 12,
    siret: '12345678900001',
  },
  {
    nom: 'Bernard',
    prenom: 'Marie',
    email: 'marie.bernard@formateur-abj.fr',
    telephone: '+33612345002',
    specialites: ['JOAILLERIE', 'CREATION'],
    tarifJournalier: 600,
    bio: 'Créatrice joaillière primée. Spécialisée dans la création contemporaine et les techniques de fabrication artisanale.',
    anneesExperience: 18,
    anneesEnseignement: 8,
    siret: '12345678900002',
  },
  {
    nom: 'Petit',
    prenom: 'Thomas',
    email: 'thomas.petit@formateur-abj.fr',
    telephone: '+33612345003',
    specialites: ['CAO_DAO', 'MODELISATION_3D'],
    tarifJournalier: 650,
    bio: 'Spécialiste CAO/DAO et modélisation 3D. Expert MatrixGold et Rhinoceros. Formation ingénieur design.',
    anneesExperience: 10,
    anneesEnseignement: 5,
    siret: '12345678900003',
  },
  {
    nom: 'Lefebvre',
    prenom: 'Sophie',
    email: 'sophie.lefebvre@formateur-abj.fr',
    telephone: '+33612345004',
    specialites: ['GEMMOLOGIE', 'EXPERTISE'],
    tarifJournalier: 500,
    bio: 'Gemmologue diplômée, experte en pierres précieuses et semi-précieuses. Certifiée GIA.',
    anneesExperience: 15,
    anneesEnseignement: 7,
    siret: '12345678900004',
  },
  {
    nom: 'Dubois',
    prenom: 'Nicolas',
    email: 'nicolas.dubois@formateur-abj.fr',
    telephone: '+33612345005',
    specialites: ['TECHNIQUES_BASE', 'INITIATION'],
    tarifJournalier: 450,
    bio: 'Formateur pédagogue spécialisé dans l\'initiation aux techniques de base de la bijouterie.',
    anneesExperience: 12,
    anneesEnseignement: 10,
    siret: '12345678900005',
  },
  {
    nom: 'Moreau',
    prenom: 'Catherine',
    email: 'catherine.moreau@formateur-abj.fr',
    telephone: '+33612345006',
    specialites: ['HISTOIRE_ART', 'CULTURE'],
    tarifJournalier: 400,
    bio: 'Historienne de l\'art spécialisée en histoire de la joaillerie. Docteure en histoire de l\'art appliqué.',
    anneesExperience: 20,
    anneesEnseignement: 15,
    siret: '12345678900006',
  },
  {
    nom: 'Rousseau',
    prenom: 'Philippe',
    email: 'philippe.rousseau@formateur-abj.fr',
    telephone: '+33612345007',
    specialites: ['POLISSAGE', 'FINITION'],
    tarifJournalier: 500,
    bio: 'Maître artisan spécialisé en polissage et finition haute joaillerie. Formé chez les plus grandes maisons.',
    anneesExperience: 22,
    anneesEnseignement: 6,
    siret: '12345678900007',
  },
  {
    nom: 'Garnier',
    prenom: 'Isabelle',
    email: 'isabelle.garnier@formateur-abj.fr',
    telephone: '+33612345008',
    specialites: ['TAILLE_LAPIDAIRE', 'PIERRES'],
    tarifJournalier: 550,
    bio: 'Lapidaire experte en taille de pierres précieuses. Formée aux techniques traditionnelles et modernes.',
    anneesExperience: 16,
    anneesEnseignement: 9,
    siret: '12345678900008',
  },
  {
    nom: 'Lambert',
    prenom: 'Alexandre',
    email: 'alexandre.lambert@formateur-abj.fr',
    telephone: '+33612345009',
    specialites: ['FONTE_CIRE_PERDUE', 'MOULAGE'],
    tarifJournalier: 480,
    bio: 'Spécialiste de la fonte à cire perdue et des techniques de moulage. 14 ans d\'expérience en fonderie d\'art.',
    anneesExperience: 14,
    anneesEnseignement: 4,
    siret: '12345678900009',
  },
  {
    nom: 'Fontaine',
    prenom: 'Claire',
    email: 'claire.fontaine@formateur-abj.fr',
    telephone: '+33612345010',
    specialites: ['RESTAURATION', 'REPARATION'],
    tarifJournalier: 520,
    bio: 'Restauratrice de bijoux anciens et experts en réparation haute joaillerie. Collaborations avec musées.',
    anneesExperience: 19,
    anneesEnseignement: 11,
    siret: '12345678900010',
  },
]

async function main() {
  console.log('🌱 Début du seed : 10 Formateurs')

  // Supprimer les formateurs existants (optionnel - commenté pour sécurité)
  // await prisma.formateur.deleteMany({})
  // console.log('✓ Formateurs existants supprimés')

  let compteur = 0

  for (const data of FORMATEURS_DATA) {
    try {
      // 1. Créer le compte utilisateur
      const motDePasseTemp = `formateur${compteur + 1}2026`
      const hashedPassword = await bcrypt.hash(motDePasseTemp, 10)

      const utilisateur = await prisma.utilisateur.create({
        data: {
          email: data.email,
          nom: data.nom,
          prenom: data.prenom,
          role: 'professeur',
          motDePasseHash: hashedPassword,
          statutCompte: 'ACTIF',
        },
      })

      // 2. Créer la fiche formateur
      await prisma.formateur.create({
        data: {
          idUtilisateur: utilisateur.idUtilisateur,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          adresse: `${Math.floor(Math.random() * 100) + 1} rue de la Formation`,
          codePostal: '75001',
          ville: 'Paris',
          specialites: data.specialites,
          tarifJournalier: data.tarifJournalier,
          siret: data.siret,
          anneesExperience: data.anneesExperience,
          anneesEnseignement: data.anneesEnseignement,
          bio: data.bio,
          statut: 'ACTIF',
          dossierComplet: false, // À compléter avec documents Qualiopi
          cvUrl: null,
          qualificationsResume: `${data.anneesExperience} ans d'expérience professionnelle, ${data.anneesEnseignement} ans d'enseignement`,
          dateValidationQualiopi: null,
          methodesPedagogiques: ['Démonstration pratique', 'Exercices guidés', 'Coaching individuel'],
          approchePedagogique: 'Apprentissage par la pratique et accompagnement personnalisé',
          outilsSupports: ['Établis professionnels', 'Outils traditionnels', 'Supports visuels'],
          competencesTechniques: data.specialites,
          portfolio: null,
          publicationsArticles: [],
          satisfactionMoyenne: null,
          tauxReussite: null,
          nombreElevesFormes: null,
          temoignagesEleves: [],
          formationsContinues: [],
          certifications: [],
          languesParlees: ['Français'],
          notes: 'Formateur en attente de complétion du dossier Qualiopi',
        },
      })

      compteur++
      console.log(`✓ ${compteur}/10 - ${data.prenom} ${data.nom} créé (${data.specialites.join(', ')})`)
    } catch (error: any) {
      console.error(`❌ Erreur création formateur ${data.nom} ${data.prenom}:`, error.message)
    }
  }

  console.log('\n✅ Seed terminé !')
  console.log(`📊 Total : ${compteur}/10 formateurs créés`)
  console.log('\n📝 Mots de passe temporaires :')
  for (let i = 1; i <= compteur; i++) {
    console.log(`  - Formateur ${i} : formateur${i}2026`)
  }
  console.log('\n⚠️  Les formateurs devront compléter leur dossier Qualiopi (12 documents)')
}

main()
  .catch((e) => {
    console.error('💥 Erreur fatale:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
