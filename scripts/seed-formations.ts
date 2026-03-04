/**
 * Seed formations ABJ
 * Source : Catalogue ABJ 2025-26 + site academiedebijouteriejoaillerie.fr
 * Données mises à jour le 14/01/2026
 */

import prisma from '../src/lib/prisma'

const formations = [
  // ============================================================
  // CAP ATBJ
  // ============================================================
  {
    codeFormation: 'CAP_BJ',
    nom: 'CAP Art et Techniques de la Bijouterie-Joaillerie — Option Bijouterie-Joaillerie',
    categorie: 'CAP',
    dureeHeures: 800,
    dureeJours: 200, // ~5j/semaine sur 8-9 mois
    niveauRequis: 'Baccalauréat recommandé',
    diplomeDelivre: 'CAP ATBJ option Bijouterie-Joaillerie (RNCP 36336)',
    tarifStandard: 15000.00,
    description: 'Formation diplômante d\'1 an préparant au CAP Art et Techniques de la Bijouterie-Joaillerie option bijouterie-joaillerie. Formation continue en présentiel, 5 jours par semaine, 800h environ. Inclut réalisations techniques en atelier (métal, sertissage, polissage, volume), enseignement théorique, histoire de l\'art et du bijou, dessin technique et gouaché. 4 semaines de stage en entreprise. Financement tout public (CPF code 240304, France Travail, OPCO...).',
    prerequis: [
      'Bonne dextérité manuelle',
      'Patience et persévérance',
      'Passion pour la bijouterie-joaillerie',
      'CV + lettre de motivation',
      'Portfolio recommandé',
      'Entretien individuel',
      'Test d\'atelier de 3h',
    ],
    objectifs: [
      'Acquérir une première qualification professionnelle (Niveau 3)',
      'Maîtriser les techniques de fabrication en bijouterie-joaillerie',
      'Travailler les métaux précieux (or, argent, platine)',
      'Réaliser volumes, sertissage et polissage',
      'Comprendre l\'histoire de l\'art et du bijou',
      'Maîtriser le dessin technique et gouaché',
      'Préparer à une insertion professionnelle ou création d\'entreprise',
    ],
    programme: `RÉALISATIONS TECHNIQUES EN ATELIER :
- Volume technique : lecture et interprétation des volumes, réalisation en Plastiline, cire et zinc
- Métal : sciage, limage, équerrage, perçage, traçage, découpage, ajustage, mises en forme (pince, laminage, embouti), brasage
- Sertissage : confection des outils, serti clos taille ronde/ovale/princesse
- Polissage : finition en polissage

ENSEIGNEMENT THÉORIQUE :
- Technologie appliquée au métier du bijoutier
- Connaissances des étapes de fabrication et procédés
- Outillage et techniques en bijouterie-joaillerie
- Sécurité en atelier

HISTOIRE DE L'ART & DU BIJOU :
- De la Préhistoire à nos jours, évolution stylistique et technique

DESSIN TECHNIQUE & ART :
- Codifications du dessin technique, plans orthogonaux, perspectives
- Dessin gouaché : représentation fidèle des matériaux (métaux, pierres, perles)`,
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder', 'laminoir', 'machine_polissage', 'outils_sertissage'],
    actif: true,
  },

  // ============================================================
  // BIJOUTERIE DE CRÉATEUR SUR MÉTAL
  // ============================================================
  {
    codeFormation: 'BIJ_CR_N1',
    nom: 'Bijouterie de Créateur sur Métal — Niveau 1 Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage d\'initiation aux techniques de base en bijouterie créateur sur métal. Groupe de 3 à 6 personnes maximum. Pédagogie individuelle adaptée aux adultes.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Découvrir les postures et gestuelles en bijouterie',
      'Apprendre les techniques de base sur métal',
      'Réaliser ses premières créations',
    ],
    programme: 'Initiation aux techniques de base : postures, gestuelles, outils, travail du métal (découpage, limage, assemblage). Réalisation d\'un bijou simple.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder'],
    actif: true,
  },
  {
    codeFormation: 'BIJ_CR_N2',
    nom: 'Bijouterie de Créateur sur Métal — Niveau 2 Perfectionnement',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage de perfectionnement en bijouterie créateur sur métal. Approfondissement des techniques avancées.',
    prerequis: ['Avoir suivi le niveau 1 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Approfondir les techniques de mise en forme',
      'Maîtriser l\'assemblage et le brasage',
      'Réaliser des pièces plus complexes',
    ],
    programme: 'Perfectionnement : mises en forme avancées, brasage, finitions. Réalisation d\'une pièce de bijouterie créateur.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder'],
    actif: true,
  },
  {
    codeFormation: 'BIJ_CR_N3',
    nom: 'Bijouterie de Créateur sur Métal — Niveau 3 Avancé',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 2 ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage avancé en bijouterie créateur sur métal. Techniques complexes et projets personnalisés.',
    prerequis: ['Avoir suivi le niveau 2 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser les techniques complexes en bijouterie créateur',
      'Concevoir et réaliser un projet personnel',
      'Atteindre un niveau professionnel',
    ],
    programme: 'Techniques avancées : constructions complexes, sertissage intégré, finitions professionnelles. Projet créateur personnel.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder'],
    actif: true,
  },

  // ============================================================
  // BIJOUTERIE TECHNIQUE SUR MÉTAL
  // ============================================================
  {
    codeFormation: 'BIJ_TECH_N1',
    nom: 'Bijouterie Technique sur Métal — Niveau 1 Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage d\'initiation aux techniques de base en bijouterie technique sur métal. Apprentissage des fondamentaux du métier.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Maîtriser les outils et gestes de base',
      'Apprendre les techniques de fabrication fondamentales',
      'Réaliser une pièce technique simple',
    ],
    programme: 'Initiation aux techniques de base : sciage, limage, perçage, traçage, découpage. Travail de précision sur métal.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder'],
    actif: true,
  },
  {
    codeFormation: 'BIJ_TECH_N2',
    nom: 'Bijouterie Technique sur Métal — Niveau 2 Perfectionnement',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage de perfectionnement en bijouterie technique. Approfondissement des techniques avancées de fabrication.',
    prerequis: ['Avoir suivi le niveau 1 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Perfectionner les techniques de mise en forme',
      'Maîtriser le brasage et l\'assemblage',
      'Réaliser des pièces techniques complexes',
    ],
    programme: 'Perfectionnement : mises en forme (pince, laminage, embouti), brasage, ajustage de précision.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder', 'laminoir'],
    actif: true,
  },
  {
    codeFormation: 'BIJ_TECH_N3',
    nom: 'Bijouterie Technique sur Métal — Niveau 3 Avancé',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 2 ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage avancé en bijouterie technique. Techniques de haute précision et réalisations professionnelles.',
    prerequis: ['Avoir suivi le niveau 2 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser les techniques de haute précision',
      'Réaliser des pièces de qualité professionnelle',
      'Gérer un projet technique complexe de bout en bout',
    ],
    programme: 'Techniques avancées de fabrication, finitions de haute qualité, réalisation d\'une pièce technique professionnelle.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder', 'laminoir', 'machine_polissage'],
    actif: true,
  },

  // ============================================================
  // JOAILLERIE
  // ============================================================
  {
    codeFormation: 'JOAILL_N1',
    nom: 'Joaillerie — Niveau 1 Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage d\'initiation aux techniques de base en joaillerie. Découverte de l\'art de monter les pierres précieuses.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Découvrir les techniques de base en joaillerie',
      'Apprendre le travail des montures en métal',
      'Comprendre la mise en valeur des pierres',
    ],
    programme: 'Initiation joaillerie : techniques de base pour les montures, initiation à la mise en valeur des pierres, gestes fondamentaux.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder'],
    actif: true,
  },
  {
    codeFormation: 'JOAILL_N2',
    nom: 'Joaillerie — Niveau 2 Perfectionnement',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage de perfectionnement en joaillerie. Techniques avancées de montage et mise en valeur des pierres.',
    prerequis: ['Avoir suivi le niveau 1 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Perfectionner les techniques de montage',
      'Travailler les montures plus complexes',
      'Améliorer la précision des détails',
    ],
    programme: 'Perfectionnement joaillerie : montures complexes, ajustage précis, techniques de mise en valeur des gemmes.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder'],
    actif: true,
  },
  {
    codeFormation: 'JOAILL_N3',
    nom: 'Joaillerie — Niveau 3 Avancé',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 2 ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage avancé en joaillerie. Réalisations de haute joaillerie et projets professionnels.',
    prerequis: ['Avoir suivi le niveau 2 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser les techniques avancées de joaillerie',
      'Réaliser des pièces de haute joaillerie',
      'Concevoir et mener un projet joaillier complet',
    ],
    programme: 'Techniques avancées de joaillerie : montures complexes, précision maximale, réalisation d\'une pièce de haute joaillerie.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder'],
    actif: true,
  },

  // ============================================================
  // SERTISSAGE
  // ============================================================
  {
    codeFormation: 'SERTI_N1',
    nom: 'Sertissage — Niveau 1 Serti Clos',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage d\'initiation au sertissage, technique du serti clos. Apprentissage des outils et gestes fondamentaux du sertisseur.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Confectionner les outils du sertisseur (échoppe, onglet)',
      'Maîtriser le serti clos taille ronde et ovale',
      'Comprendre les principes de base du sertissage',
    ],
    programme: 'Initiation sertissage : confection des outils (échoppe, onglet), serti clos taille ronde, serti clos taille ovale.',
    equipementRequis: ['etabli_sertissage', 'outils_sertissage', 'microscope'],
    actif: true,
  },
  {
    codeFormation: 'SERTI_N2',
    nom: 'Sertissage — Niveau 2 Serti Griffes',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 serti clos ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1230.00,
    description: 'Stage de perfectionnement en sertissage, technique du serti griffes. Mise en valeur des pierres par les griffes.',
    prerequis: ['Avoir suivi le niveau 1 (serti clos) ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser le serti griffes',
      'Travailler différentes formes de pierres',
      'Affiner la précision du sertissage',
    ],
    programme: 'Perfectionnement sertissage : serti griffes, différentes configurations (4 griffes, 6 griffes), travail sur diverses formes de pierres.',
    equipementRequis: ['etabli_sertissage', 'outils_sertissage', 'microscope'],
    actif: true,
  },
  {
    codeFormation: 'SERTI_N3',
    nom: 'Sertissage — Niveau 3 Serti Grains',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 2 serti griffes ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1330.00,
    description: 'Stage avancé en sertissage, technique du sertissage à grains. Technique de haute précision.',
    prerequis: ['Avoir suivi le niveau 2 (serti griffes) ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser le sertissage à grains',
      'Réaliser des pavages et mises en scène complexes',
      'Atteindre un niveau professionnel en sertissage',
    ],
    programme: 'Sertissage avancé : sertissage à grains, pavé, techniques complexes, réalisation d\'une pièce de haute précision.',
    equipementRequis: ['etabli_sertissage', 'outils_sertissage', 'microscope'],
    actif: true,
  },

  // ============================================================
  // CISELURE
  // ============================================================
  {
    codeFormation: 'CISEL_N1',
    nom: 'Ciselure — Niveau 1 Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage d\'initiation à la ciselure. Pose de mat, tracé et repoussé. Découverte des techniques ancestrales de décoration du métal.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Découvrir les outils de la ciselure',
      'Maîtriser la pose de mat et le tracé',
      'Réaliser son premier repoussé',
    ],
    programme: 'Initiation ciselure : outils (matoirs, ciselers), pose de mat, tracé, technique du repoussé. Réalisation d\'une plaque décorée.',
    equipementRequis: ['etabli', 'outils_ciselure', 'masse_ciselure'],
    actif: true,
  },
  {
    codeFormation: 'CISEL_N2',
    nom: 'Ciselure — Niveau 2 Perfectionnement',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage de perfectionnement en ciselure. Tracé, fond descendu et repoussé. Approfondissement des techniques.',
    prerequis: ['Avoir suivi le niveau 1 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser le fond descendu',
      'Perfectionner le repoussé en relief',
      'Réaliser des motifs plus complexes',
    ],
    programme: 'Perfectionnement ciselure : tracé avancé, fond descendu, repoussé en relief. Réalisation d\'une pièce avec motif complexe.',
    equipementRequis: ['etabli', 'outils_ciselure', 'masse_ciselure'],
    actif: true,
  },
  {
    codeFormation: 'CISEL_N3',
    nom: 'Ciselure — Niveau 3 Avancé',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 2 ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage avancé en ciselure. Reprise de fonte en ciselure et lancés. Techniques professionnelles.',
    prerequis: ['Avoir suivi le niveau 2 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser la reprise de fonte en ciselure',
      'Réaliser des lancés',
      'Atteindre un niveau professionnel en ciselure',
    ],
    programme: 'Ciselure avancée : reprise de fonte, lancés, techniques de finition professionnelles. Réalisation d\'une pièce de maître.',
    equipementRequis: ['etabli', 'outils_ciselure', 'masse_ciselure'],
    actif: true,
  },

  // ============================================================
  // ÉMAIL GRAND FEU
  // ============================================================
  {
    codeFormation: 'EMAIL_N1',
    nom: 'Émail Grand Feu — Niveau 1 Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1280.00,
    description: 'Stage d\'initiation à l\'émail grand feu. Apprentissage des principales techniques décoratives au choix : cloisonné, champlevé, plique-à-jour, basse-taille.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Découvrir les matériaux et outils de l\'émaillage',
      'Apprendre les techniques de base au choix',
      'Réaliser une première pièce émaillée',
    ],
    programme: 'Initiation émail grand feu : matériaux (émaux, fours), préparation des supports, techniques décoratives au choix parmi : cloisonné, champlevé, basse-taille. Cuisson et finitions.',
    equipementRequis: ['four_email', 'outils_emaillage'],
    actif: true,
  },
  {
    codeFormation: 'EMAIL_N2_CLOIS',
    nom: 'Émail Grand Feu — Niveau 2 Cloisonné',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 émail grand feu ou compétences équivalentes',
    diplomeDelivre: null,
    tarifStandard: 1380.00,
    description: 'Stage de perfectionnement en émail grand feu, spécialité cloisonné au fil ou au ruban. Maîtrise de cette technique ancestrale.',
    prerequis: [
      'Avoir suivi le niveau 1 émail grand feu ou justifier de compétences équivalentes',
    ],
    objectifs: [
      'Maîtriser la technique du cloisonné au fil ou au ruban',
      'Réaliser des cloisons précises',
      'Créer une composition émaillée cloisonnée',
    ],
    programme: 'Perfectionnement cloisonné : pose des cloisons (au fil ou au ruban), remplissage des émaux, cuisson, ponçage et polissage. Réalisation d\'un bijou cloisonné.',
    equipementRequis: ['four_email', 'outils_emaillage'],
    actif: true,
  },
  {
    codeFormation: 'EMAIL_N2_CHAMP',
    nom: 'Émail Grand Feu — Niveau 2 Champlevé',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 émail grand feu ou compétences équivalentes',
    diplomeDelivre: null,
    tarifStandard: 1380.00,
    description: 'Stage de perfectionnement en émail grand feu, spécialité champlevé. Technique d\'excavation du métal et remplissage d\'émail.',
    prerequis: [
      'Avoir suivi le niveau 1 émail grand feu ou justifier de compétences équivalentes',
    ],
    objectifs: [
      'Maîtriser la technique du champlevé',
      'Réaliser des excavations précises dans le métal',
      'Créer une pièce en émail champlevé',
    ],
    programme: 'Perfectionnement champlevé : taille des alvéoles, remplissage d\'émail, cuissons successives, finitions. Réalisation d\'un bijou champlevé.',
    equipementRequis: ['four_email', 'outils_emaillage', 'etabli'],
    actif: true,
  },
  {
    codeFormation: 'EMAIL_N3',
    nom: 'Émail Grand Feu — Niveau 3 Plique-à-Jour',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 émail grand feu + formation de base en bijouterie',
    diplomeDelivre: null,
    tarifStandard: 1380.00,
    description: 'Stage avancé en émail grand feu, technique du plique-à-jour (émail sans fond, effet vitrail). Technique réservée aux praticiens confirmés.',
    prerequis: [
      'Avoir suivi le niveau 1 émail grand feu ou justifier de compétences équivalentes',
      'Justifier d\'une formation de base en bijouterie',
    ],
    objectifs: [
      'Maîtriser la technique du plique-à-jour',
      'Créer des pièces transparentes effet vitrail',
      'Réaliser une pièce de haute orfèvrerie émaillée',
    ],
    programme: 'Plique-à-jour : construction d\'un réseau de cloisons sans fond, remplissage d\'émail translucide, cuissons multiples, retrait du support, finitions. Réalisation d\'une pièce plique-à-jour.',
    equipementRequis: ['four_email', 'outils_emaillage', 'etabli'],
    actif: true,
  },

  // ============================================================
  // GEMMOLOGIE
  // ============================================================
  {
    codeFormation: 'GEMMO_N1',
    nom: 'Gemmologie Appliquée — Niveau 1 Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1050.00,
    description: 'Stage d\'initiation à la gemmologie appliquée. Identification et caractérisation des pierres précieuses et fines.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Connaître les familles de pierres précieuses et fines',
      'Maîtriser les instruments de base en gemmologie',
      'Identifier les principales gemmes',
    ],
    programme: 'Initiation gemmologie : classification des gemmes, cristallographie de base, instruments (loupe, réfractomètre, polariscope), identification des pierres les plus communes.',
    equipementRequis: ['loupe', 'refractometre', 'polariscope', 'microscope', 'salle_cours'],
    actif: true,
  },
  {
    codeFormation: 'GEMMO_N2',
    nom: 'Gemmologie de Laboratoire — Niveau 2',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 gemmologie ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1250.00,
    description: 'Stage de perfectionnement en gemmologie de laboratoire. Techniques avancées d\'identification et d\'analyse des gemmes.',
    prerequis: ['Avoir suivi le niveau 1 gemmologie ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Utiliser les instruments de laboratoire gemmologique',
      'Identifier des gemmes plus rares ou synthétiques',
      'Détecter les traitements sur les pierres',
    ],
    programme: 'Gemmologie de laboratoire : spectroscope, filtre Chelsea, microscope gemmologique, identification des inclusions, détection des traitements et synthétiques.',
    equipementRequis: ['loupe', 'refractometre', 'polariscope', 'microscope', 'spectroscope', 'salle_cours'],
    actif: true,
  },

  // ============================================================
  // TAILLE LAPIDAIRE
  // ============================================================
  {
    codeFormation: 'LAPID_N1',
    nom: 'Taille Lapidaire — Niveau 1 Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 40,
    dureeJours: 5,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1630.00,
    description: 'Stage d\'initiation à la taille lapidaire traditionnelle. Cabochon, taille émeraude et taille brillant. Découverte de l\'art de tailler les pierres.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Découvrir les outils et machines de lapidairerie',
      'Réaliser un cabochon',
      'Comprendre les principes des tailles émeraude et brillant',
    ],
    programme: 'Initiation taille lapidaire : machines (tours lapidaires, disques diamantés), cabochon (demi-sphère), taille émeraude, initiation taille brillant.',
    equipementRequis: ['tour_lapidaire', 'disques_diamantes'],
    actif: true,
  },
  {
    codeFormation: 'LAPID_N2',
    nom: 'Taille Lapidaire — Niveau 2 Perfectionnement',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 40,
    dureeJours: 5,
    niveauRequis: 'Niveau 1 taille lapidaire ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1630.00,
    description: 'Stage de perfectionnement en taille lapidaire. Tailles ovale et coussin.',
    prerequis: ['Avoir suivi le niveau 1 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser la taille ovale',
      'Réaliser une taille coussin',
      'Améliorer la précision et les proportions',
    ],
    programme: 'Perfectionnement lapidaire : taille ovale (proportions, facettes), taille coussin, calcul des angles de réfraction, polissage des facettes.',
    equipementRequis: ['tour_lapidaire', 'disques_diamantes'],
    actif: true,
  },
  {
    codeFormation: 'LAPID_N3',
    nom: 'Taille Lapidaire — Niveau 3',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 40,
    dureeJours: 5,
    niveauRequis: 'Niveau 2 taille lapidaire ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1630.00,
    description: 'Stage avancé en taille lapidaire. Tailles navette et poire.',
    prerequis: ['Avoir suivi le niveau 2 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser la taille navette (marquise)',
      'Réaliser une taille poire',
      'Gérer les formes asymétriques complexes',
    ],
    programme: 'Lapidaire avancé : taille navette (marquise), taille poire, gestion des formes irrégulières, optimisation du rendement de la pierre brute.',
    equipementRequis: ['tour_lapidaire', 'disques_diamantes'],
    actif: true,
  },
  {
    codeFormation: 'LAPID_N4',
    nom: 'Taille Lapidaire — Niveau 4 Retaille et Ajustage',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 40,
    dureeJours: 5,
    niveauRequis: 'Niveau 3 taille lapidaire ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1630.00,
    description: 'Stage expert en taille lapidaire. Retaille et ajustage sur œuvre existante.',
    prerequis: ['Avoir suivi le niveau 3 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser la retaille de pierres déjà taillées',
      'Ajuster une pierre sur une monture existante',
      'Réaliser des tailles fantaisie personnalisées',
    ],
    programme: 'Expertise lapidaire : analyse d\'une taille existante, retaille pour ajustage, tailles fantaisie sur mesure, polissage final de précision.',
    equipementRequis: ['tour_lapidaire', 'disques_diamantes'],
    actif: true,
  },

  // ============================================================
  // MAQUETTE DE BIJOUX
  // ============================================================
  {
    codeFormation: 'MAQUETTE_N1',
    nom: 'Maquette de Bijoux — Niveau 1 Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage d\'initiation aux techniques de base en maquette en bijouterie-joaillerie. Modélisation en cire et Plastiline.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Découvrir les matériaux de maquette (cire, Plastiline)',
      'Réaliser des volumes simples',
      'Comprendre le lien entre maquette et bijou final',
    ],
    programme: 'Initiation maquette : matériaux (cire dure, cire souple, Plastiline), outils, réalisation de volumes géométriques, initiation à l\'interprétation de volumes.',
    equipementRequis: ['etabli', 'outils_cire'],
    actif: true,
  },
  {
    codeFormation: 'MAQUETTE_N2',
    nom: 'Maquette de Bijoux — Niveau 2 Perfectionnement',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 maquette ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage de perfectionnement en maquette de bijoux. Réalisation de formes complexes et préparation pour la fonte.',
    prerequis: ['Avoir suivi le niveau 1 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Réaliser des volumes organiques complexes',
      'Maîtriser les techniques de jonction et assemblage en cire',
      'Préparer une maquette pour la fonte à cire perdue',
    ],
    programme: 'Perfectionnement maquette : formes organiques, assemblages complexes, préparation des jets de coulée, introduction à la fonte à cire perdue.',
    equipementRequis: ['etabli', 'outils_cire'],
    actif: true,
  },
  {
    codeFormation: 'MAQUETTE_N3',
    nom: 'Maquette de Bijoux — Niveau 3 Avancé',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 2 maquette ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage avancé en maquette de bijoux. Réalisations complexes et projets professionnels en cire.',
    prerequis: ['Avoir suivi le niveau 2 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Réaliser des projets maquette complexes',
      'Maîtriser la sculpture de précision en cire',
      'Créer des prototypes professionnels',
    ],
    programme: 'Maquette avancée : sculpture de précision, projets créateurs complets, réalisation d\'un prototype professionnel en cire prêt à la fonte.',
    equipementRequis: ['etabli', 'outils_cire'],
    actif: true,
  },

  // ============================================================
  // CAO/DAO BIJOUTERIE
  // ============================================================
  {
    codeFormation: 'CAO_DAO',
    nom: 'CAO Appliquée à la Bijouterie — Initiation',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 26,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 910.00,
    description: 'Formation en modélisation 3D appliquée à la bijouterie. Distanciel : séance d\'introduction et d\'installation de 2h + 24h de cours. Logiciels de CAO/DAO spécialisés bijouterie (type MatrixGold, Rhino...).',
    prerequis: [
      'Débutants acceptés',
      'Ordinateur personnel compatible',
      'CV',
      'Questionnaire de positionnement',
    ],
    objectifs: [
      'Maîtriser les outils de modélisation 3D dédiés à la bijouterie',
      'Créer des bijoux en 3D sur ordinateur',
      'Préparer des fichiers pour l\'impression 3D ou la FAO',
    ],
    programme: 'Formation distanciel : installation du logiciel (2h), modélisation 3D (24h) : interface, outils de base, création de volumes, bagues, pendentifs, application des textures et matières, export pour impression 3D.',
    equipementRequis: ['ordinateur', 'logiciel_cao'],
    actif: true,
  },

  // ============================================================
  // HAUTE FANTAISIE
  // ============================================================
  {
    codeFormation: 'HAUTE_FANT_N1',
    nom: 'Haute Fantaisie Technique — Niveau 1',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 950.00,
    description: 'Stage d\'initiation à la haute fantaisie technique : enfilage de perle, tissage, nœuds, etc. Techniques de bijouterie sans métal.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Découvrir les techniques de bijouterie sans métal',
      'Maîtriser l\'enfilage de perles et les nœuds',
      'Réaliser des pièces de haute fantaisie',
    ],
    programme: 'Initiation haute fantaisie : enfilage de perles (colliers, bracelets), techniques de nœuds, tissage de perles, montage sur fil. Réalisation d\'une pièce complète.',
    equipementRequis: ['etabli_fantaisie', 'outils_perles'],
    actif: true,
  },
  {
    codeFormation: 'HAUTE_FANT_N2',
    nom: 'Haute Fantaisie Technique — Niveau 2 Perfectionnement',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 1 haute fantaisie ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 950.00,
    description: 'Stage de perfectionnement en haute fantaisie technique. Techniques avancées d\'enfilage, tissage et nœuds.',
    prerequis: ['Avoir suivi le niveau 1 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Perfectionner les techniques de tissage',
      'Créer des modèles complexes',
      'Réaliser des pièces originales en haute fantaisie',
    ],
    programme: 'Perfectionnement haute fantaisie : tissage peyote et brick stitch, techniques avancées de nœuds, créations composites. Réalisation d\'un projet personnel.',
    equipementRequis: ['etabli_fantaisie', 'outils_perles'],
    actif: true,
  },
  {
    codeFormation: 'HAUTE_FANT_N3',
    nom: 'Haute Fantaisie Technique — Niveau 3 Avancé',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: 'Niveau 2 haute fantaisie ou expérience équivalente',
    diplomeDelivre: null,
    tarifStandard: 950.00,
    description: 'Stage avancé en haute fantaisie technique. Techniques complexes et projets créateurs.',
    prerequis: ['Avoir suivi le niveau 2 ou justifier d\'une expérience équivalente'],
    objectifs: [
      'Maîtriser les techniques avancées de haute fantaisie',
      'Concevoir et réaliser un projet complexe',
      'Développer son style et sa signature créatrice',
    ],
    programme: 'Haute fantaisie avancée : techniques mixtes, projets créateurs personnels, réalisation d\'une collection capsule.',
    equipementRequis: ['etabli_fantaisie', 'outils_perles'],
    actif: true,
  },

  // ============================================================
  // HISTOIRE DE L'ART DU BIJOU
  // ============================================================
  {
    codeFormation: 'HIST_ART',
    nom: 'Histoire de l\'Art du Bijou',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 900.00,
    description: 'Formation en histoire des arts bijoutiers en présentiel. De la Préhistoire à nos jours : évolution stylistique et techniques du bijou & analyse stylistique. Module intégré à la préparation CAP ATBJ.',
    prerequis: ['Tous publics'],
    objectifs: [
      'Connaître les grandes périodes de l\'histoire du bijou',
      'Analyser l\'évolution stylistique et technique',
      'Replacer un bijou dans son contexte historique, culturel et artistique',
      'Savoir analyser et décrire une pièce bijoutière',
    ],
    programme: 'Histoire du bijou : de la Préhistoire à l\'Antiquité (Égypte, Grèce, Rome), Moyen-Âge, Renaissance, XVIIe-XVIIIe siècles, Art Nouveau et Art Déco, époque contemporaine. Analyse stylistique et technique des pièces.',
    equipementRequis: ['salle_cours', 'materiel_dessin'],
    actif: true,
  },

  // ============================================================
  // DESSIN TECHNIQUE ET GOUACHÉ
  // ============================================================
  {
    codeFormation: 'DESSIN_TECH',
    nom: 'Dessin Technique — Pratiques du Dessin',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 900.00,
    description: 'Formation au dessin technique appliqué à la bijouterie-joaillerie. Module intégré à la préparation CAP ATBJ.',
    prerequis: ['Tous publics'],
    objectifs: [
      'Connaître les codifications du dessin technique',
      'Tracer des constructions en plan orthogonal',
      'Maîtriser les vues, perspectives et coupes',
    ],
    programme: 'Dessin technique bijouterie : normes et codifications, plans orthogonaux (vue de face, profil, dessus), perspectives cavalière et isométrique, vues de coupe et de section. Application sur des bijoux.',
    equipementRequis: ['salle_cours', 'materiel_dessin'],
    actif: true,
  },
  {
    codeFormation: 'DESSIN_GOUACHE',
    nom: 'Dessin de Bijoux Gouaché — Pratiques du Dessin',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 900.00,
    description: 'Formation au dessin de bijoux gouaché. Représentation fidèle des matières : métaux, pierres, perles. Module intégré à la préparation CAP ATBJ.',
    prerequis: ['Tous publics'],
    objectifs: [
      'Maîtriser la technique du gouaché appliqué aux bijoux',
      'Représenter fidèlement les métaux, pierres et perles',
      'Créer des rendus professionnels de bijoux',
    ],
    programme: 'Gouaché bijouterie : matériaux et pigments, techniques de rendu des métaux (or, argent, platine), pierres précieuses (diamant, rubis, émeraude), perles et matières organiques. Réalisation de rendus complets.',
    equipementRequis: ['salle_cours', 'materiel_dessin'],
    actif: true,
  },

  // ============================================================
  // DOUANE ET GARANTIE
  // ============================================================
  {
    codeFormation: 'DOUANE_GARANTIE',
    nom: 'Douane & Garantie — Univers de l\'Entreprise',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 4,
    dureeJours: 1,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 180.00,
    description: 'Formation courte sur la législation douanière et le système de garantie en bijouterie-joaillerie. Indispensable pour les entrepreneurs et artisans.',
    prerequis: ['Professionnels ou futurs créateurs d\'entreprise'],
    objectifs: [
      'Comprendre la réglementation douanière en bijouterie',
      'Connaître les poinçons et le système de garantie',
      'Maîtriser les obligations légales pour exercer',
    ],
    programme: 'Douane : réglementation importation/exportation des métaux précieux et pierres. Garantie : poinçons de maître, poinçons de titre, poinçons d\'importation, contrôle du bureau de garantie, obligations légales.',
    equipementRequis: ['salle_cours'],
    actif: true,
  },

  // ============================================================
  // ATELIERS DÉCOUVERTE TRANSVERSAUX
  // ============================================================
  {
    codeFormation: 'DECOUV_BIJ_EMAIL',
    nom: 'Atelier Découverte — Bijouterie & Émail Grand Feu',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage de découverte transversal sur un projet de bijou combinant bijouterie et émail grand feu. Réalisation d\'un bijou incluant de la bijouterie et de l\'émaillage partiel.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Découvrir la complémentarité bijouterie / émail',
      'Réaliser un projet bijou avec émail',
      'Maîtriser les gestes de base dans les deux disciplines',
    ],
    programme: 'Projet bijou transversal : réalisation d\'un élément en bijouterie (support métal), émaillage partiel de cet élément (technique découverte au choix), assemblage et finitions. Réalisation d\'un bijou complet.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder', 'four_email', 'outils_emaillage'],
    actif: true,
  },
  {
    codeFormation: 'DECOUV_BIJ_LAPID',
    nom: 'Atelier Découverte — Bijouterie & Taille Lapidaire',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage de découverte transversal sur un projet de bijou combinant bijouterie et taille lapidaire. Réalisation d\'un cabochon en gemme et mise en valeur de la pierre taillée sur un bijou.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Tailler un cabochon en pierre naturelle',
      'Réaliser une monture adaptée à la pierre taillée',
      'Assembler bijouterie et lapidaire en un bijou complet',
    ],
    programme: 'Projet bijou transversal : taille d\'un cabochon en pierre naturelle (initiation lapidaire), réalisation d\'une monture en métal adaptée, mise en valeur de la pierre, assemblage et finitions.',
    equipementRequis: ['etabli', 'outils_bijouterie', 'lampe_a_souder', 'tour_lapidaire', 'disques_diamantes'],
    actif: true,
  },
  {
    codeFormation: 'DECOUV_CIS_EMAIL',
    nom: 'Atelier Découverte — Ciselure & Émail Grand Feu',
    categorie: 'FORMATION_COURTE',
    dureeHeures: 30,
    dureeJours: 4,
    niveauRequis: null,
    diplomeDelivre: null,
    tarifStandard: 1130.00,
    description: 'Stage de découverte transversal combinant ciselure et émail grand feu. Réalisation d\'une pièce avec texturage en ciselure et émaillage partiel.',
    prerequis: ['Débutants acceptés', 'CV', 'Questionnaire de positionnement'],
    objectifs: [
      'Appliquer un effet de texturage par ciselure',
      'Émailler partiellement une pièce ciselée',
      'Créer une pièce unique mêlant les deux disciplines',
    ],
    programme: 'Projet transversal : ciselure pour obtenir un effet de texturage sur métal, émaillage partiel d\'un élément du projet, finitions. Réalisation d\'une pièce artistique unique.',
    equipementRequis: ['etabli', 'outils_ciselure', 'masse_ciselure', 'four_email', 'outils_emaillage'],
    actif: true,
  },
]

async function main() {
  console.log('🚀 Seed formations ABJ 2025-26...\n')

  let created = 0
  let updated = 0
  let skipped = 0

  for (const formation of formations) {
    try {
      const existing = await prisma.formation.findUnique({
        where: { codeFormation: formation.codeFormation },
      })

      if (existing) {
        await prisma.formation.update({
          where: { codeFormation: formation.codeFormation },
          data: formation,
        })
        console.log(`  ✏️  Mis à jour : ${formation.codeFormation} — ${formation.nom}`)
        updated++
      } else {
        await prisma.formation.create({ data: formation })
        console.log(`  ✅ Créé      : ${formation.codeFormation} — ${formation.nom}`)
        created++
      }
    } catch (err) {
      console.error(`  ❌ Erreur    : ${formation.codeFormation} — ${err}`)
      skipped++
    }
  }

  console.log('\n📊 Résumé :')
  console.log(`  Créées  : ${created}`)
  console.log(`  Mises à jour : ${updated}`)
  console.log(`  Erreurs : ${skipped}`)
  console.log(`  Total   : ${formations.length} formations`)

  // Vérification finale
  const total = await prisma.formation.count()
  console.log(`\n✅ Total formations en base : ${total}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
