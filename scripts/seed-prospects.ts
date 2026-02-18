/**
 * Script de seed : 50 Prospects
 * Objectif : Créer des prospects à transformer en candidats puis élèves
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Générateur de noms français réalistes
const PRENOMS_H = [
  'Alexandre', 'Antoine', 'Baptiste', 'Clément', 'Damien', 'Étienne', 'Florian', 'Gabriel',
  'Hugo', 'Julien', 'Kevin', 'Laurent', 'Maxime', 'Nicolas', 'Olivier', 'Pierre',
  'Quentin', 'Raphaël', 'Sébastien', 'Thomas', 'Vincent', 'Xavier', 'Yann', 'Zacharie'
]

const PRENOMS_F = [
  'Alice', 'Amélie', 'Camille', 'Charlotte', 'Chloé', 'Clara', 'Élise', 'Emma',
  'Inès', 'Julie', 'Léa', 'Lucie', 'Manon', 'Marie', 'Mathilde', 'Nathalie',
  'Pauline', 'Rose', 'Sarah', 'Sophie', 'Valentine', 'Vanessa', 'Zoé', 'Audrey'
]

const NOMS = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand',
  'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David',
  'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Mercier',
  'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier', 'Rousseau',
  'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Morin',
  'Mathieu', 'Clement', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin'
]

const VILLES = [
  { nom: 'Paris', cp: '75001' },
  { nom: 'Lyon', cp: '69001' },
  { nom: 'Marseille', cp: '13001' },
  { nom: 'Toulouse', cp: '31000' },
  { nom: 'Bordeaux', cp: '33000' },
  { nom: 'Nantes', cp: '44000' },
  { nom: 'Lille', cp: '59000' },
  { nom: 'Rennes', cp: '35000' },
  { nom: 'Strasbourg', cp: '67000' },
  { nom: 'Montpellier', cp: '34000' },
  { nom: 'Nice', cp: '06000' },
  { nom: 'Grenoble', cp: '38000' },
]

const FORMATIONS = [
  'CAP_BJ',
  'INIT_BJ',
  'PERF_SERTI',
  'CAO_DAO',
  'GEMMO',
]

const MODES_FINANCEMENT = [
  'CPF',
  'OPCO',
  'POLE_EMPLOI',
  'PERSONNEL',
  'ENTREPRISE',
]

const SOURCES_ORIGINE = [
  'Site web ABJ',
  'Google',
  'Facebook',
  'Instagram',
  'Bouche-à-oreille',
  'Salon professionnel',
  'Pôle Emploi',
  'LinkedIn',
]

const SITUATIONS = [
  'En reconversion professionnelle',
  'Demandeur d\'emploi',
  'Salarié en formation continue',
  'Étudiant',
  'Auto-entrepreneur',
  'Jeune diplômé',
]

const NIVEAUX_ETUDES = [
  'CAP/BEP',
  'Bac',
  'Bac+2',
  'Bac+3',
  'Bac+5',
  'Autre',
]

// Fonction utilitaire pour générer un email
function genererEmail(prenom: string, nom: string, numero: number): string {
  const prenomClean = prenom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const nomClean = nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const domaines = ['gmail.com', 'yahoo.fr', 'hotmail.fr', 'outlook.fr', 'orange.fr', 'free.fr']
  const domaine = domaines[Math.floor(Math.random() * domaines.length)]
  return `${prenomClean}.${nomClean}${numero > 25 ? numero : ''}@${domaine}`
}

// Fonction utilitaire pour générer un téléphone
function genererTelephone(): string {
  const prefixes = ['06', '07']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suite = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
  return `${prefix}${suite}`
}

// Fonction utilitaire pour générer une date aléatoire dans le passé
function genererDatePassee(joursMax: number): Date {
  const maintenant = new Date()
  const joursEnArriere = Math.floor(Math.random() * joursMax)
  const date = new Date(maintenant)
  date.setDate(date.getDate() - joursEnArriere)
  return date
}

// Fonction utilitaire pour sélectionner un élément aléatoire
function random<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

async function main() {
  console.log('🌱 Début du seed : 50 Prospects')

  // Supprimer les prospects existants (optionnel - commenté pour sécurité)
  // await prisma.prospect.deleteMany({})
  // console.log('✓ Prospects existants supprimés')

  const prospects = []

  for (let i = 1; i <= 50; i++) {
    const estHomme = Math.random() > 0.5
    const prenom = estHomme ? random(PRENOMS_H) : random(PRENOMS_F)
    const nom = random(NOMS)
    const ville = random(VILLES)
    const formation = random(FORMATIONS)
    const datePremierContact = genererDatePassee(90) // 0-90 jours
    const nbEchanges = Math.floor(Math.random() * 5) // 0-4 échanges

    // Déterminer le statut selon la progression
    let statutProspect = 'NOUVEAU'
    if (i > 40) {
      // Les 10 derniers sont en attente de dossier
      statutProspect = 'EN_ATTENTE_DOSSIER'
    } else if (i > 30) {
      // 10 prospects sont des anciens candidats
      statutProspect = 'ANCIEN_CANDIDAT'
    }

    const prospect = {
      idProspect: `${nom.substring(0, 3).toUpperCase()}${prenom.substring(0, 3).toUpperCase()}${i.toString().padStart(2, '0')}`,
      emails: [genererEmail(prenom, nom, i)],
      telephones: [genererTelephone()],
      nom,
      prenom,
      dateNaissance: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      adresse: `${Math.floor(Math.random() * 200) + 1} rue ${random(['de la Paix', 'Victor Hugo', 'des Lilas', 'du Commerce', 'de la République'])}`,
      codePostal: ville.cp,
      ville: ville.nom,
      formationsSouhaitees: [formation],
      formationPrincipale: formation,
      modeFinancement: random(MODES_FINANCEMENT),
      organismeFinanceur: null,
      situationActuelle: random(SITUATIONS),
      niveauEtudes: random(NIVEAUX_ETUDES),
      projetProfessionnel: `Devenir artisan bijoutier-joaillier ${estHomme ? '' : 'créatrice'} et ouvrir mon atelier`,
      freinsIdentifies: Math.random() > 0.5 ? ['Financement', 'Disponibilité'] : [],
      motivations: ['Passion pour l\'artisanat', 'Reconversion professionnelle'],
      resumeIa: null,
      statutProspect,
      statutDossier: null,
      statutDevis: null,
      sourceOrigine: random(SOURCES_ORIGINE),
      modeDecouverte: null,
      messageInitial: `Bonjour, je suis intéressé(e) par la formation ${formation}. Pourriez-vous me transmettre des informations ?`,
      derniereIntention: null,
      prochaineAction: statutProspect === 'EN_ATTENTE_DOSSIER' ? 'Attente réception dossier complet' : 'Relance téléphonique',
      derniereAction: null,
      notes: null,
      datePremierContact,
      dateDernierContact: new Date(datePremierContact.getTime() + nbEchanges * 24 * 60 * 60 * 1000),
      dossierEnvoyeLe: statutProspect === 'EN_ATTENTE_DOSSIER' ? genererDatePassee(7) : null,
      dossierRecuLe: null,
      nbEchanges,
      numeroDossier: null,
      lienDossierDrive: null,
      lienFicheCandidat: null,
    }

    prospects.push(prospect)
  }

  // Insertion en base
  let compteur = 0
  for (const prospect of prospects) {
    try {
      await prisma.prospect.create({ data: prospect })
      compteur++
      if (compteur % 10 === 0) {
        console.log(`✓ ${compteur}/50 prospects créés`)
      }
    } catch (error: any) {
      console.error(`❌ Erreur création prospect ${prospect.nom} ${prospect.prenom}:`, error.message)
    }
  }

  console.log('\n✅ Seed terminé !')
  console.log(`📊 Total : ${compteur}/50 prospects créés`)
  console.log('\nRépartition des statuts :')
  console.log('  - NOUVEAU : 30 prospects')
  console.log('  - ANCIEN_CANDIDAT : 10 prospects')
  console.log('  - EN_ATTENTE_DOSSIER : 10 prospects')
}

main()
  .catch((e) => {
    console.error('💥 Erreur fatale:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
