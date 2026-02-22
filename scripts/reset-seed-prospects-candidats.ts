/**
 * Reset + Seed — Prospects, Candidats, Élèves
 *
 * Supprime toutes les données prospects/candidats/élèves existantes
 * et recrée un dataset réaliste :
 *   - 30 prospects (6 par statut : NOUVEAU, EN_ATTENTE_DOSSIER, ANCIEN_CANDIDAT, ANCIEN_ELEVE + liés aux candidats/élèves)
 *   - 10 candidats (pipeline actif : 3 DOSSIER_EN_COURS, 2 DOSSIER_COMPLET, 2 ENTRETIEN_PLANIFIE, 2 DEVIS_ENVOYE, 1 ACCEPTE)
 *   - 10 élèves (7 EN_COURS, 2 TERMINE, 1 ABANDONNE) avec évaluations et présences
 *
 * Formateurs et sessions existants conservés (IDs stables).
 */

import prisma from '../src/lib/prisma'

// ─── IDs stables (existants en base) ─────────────────────────────────────────
const ID_FORMATION_CAP = 4          // CAP_BJ
const ID_FORMATION_BIJ_N1 = 8      // BIJ_CR_N1
const ID_FORMATION_BIJ_N2 = 9      // BIJ_CR_N2
const ID_FORMATION_JOAILL_N1 = 14  // JOAILL_N1
const ID_FORMATION_JOAILL_N2 = 15  // JOAILL_N2
const ID_FORMATION_SERTI_N1 = 17   // SERTI_N1
const ID_FORMATION_SERTI_N2 = 18   // SERTI_N2
const ID_FORMATION_CISEL_N1 = 20   // CISEL_N1
const ID_FORMATION_GEMMO_N1 = 27   // GEMMO_N1
const ID_FORMATION_EMAIL_N1 = 23   // EMAIL_N1

const ID_FORMATEUR_PHILIPPE = 2    // Philippe Dubois
const ID_FORMATEUR_CATHERINE = 3   // Catherine Martin
const ID_FORMATEUR_JEAN_PIERRE = 4 // Jean-Pierre Bernard
const ID_FORMATEUR_SOPHIE = 5      // Sophie Petit
const ID_FORMATEUR_FRANCOIS = 6    // François Moreau
const ID_FORMATEUR_ISABELLE = 7    // Isabelle Laurent
const ID_FORMATEUR_MICHEL = 8      // Michel Leroy

const ID_SESSION_CAP = 2           // CAP Janvier 2024
const ID_SESSION_INIT = 3          // Initiation Février 2024
const ID_SESSION_PERF = 4          // Perfectionnement Mars 2024

// ─── Utilisateurs élèves existants (IDs 12-21 + 23) ─────────────────────────
// On les réutilise pour les élèves à créer
const IDS_UTILISATEURS_ELEVES = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function date(annee: number, mois: number, jour: number): Date {
  return new Date(annee, mois - 1, jour)
}

function genIdProspect(email: string, nom: string, prenom: string): string {
  return `${email.split('@')[0].slice(0, 8)}-${nom.slice(0, 3).toLowerCase()}-${prenom.slice(0, 3).toLowerCase()}`
}

// ─── 1. PROSPECTS PURS (sans candidature) ────────────────────────────────────
// 6 NOUVEAU + 6 EN_ATTENTE_DOSSIER + 6 ANCIEN_CANDIDAT + 6 ANCIEN_ELEVE = 24
// + 6 liés aux candidats/élèves créés ensuite (CANDIDAT × 2, ELEVE × 4) = 30 total

const PROSPECTS_NOUVEAU = [
  {
    idProspect: 'mvergne-nou-jul',
    nom: 'Vergne', prenom: 'Julie',
    emails: ['julie.vergne@gmail.com'], telephones: ['06 12 34 56 78'],
    ville: 'Paris', codePostal: '75011',
    formationPrincipale: 'BIJ_CR_N1', formationsSouhaitees: ['BIJ_CR_N1'],
    modeFinancement: 'Personnel',
    situationActuelle: 'Salariée dans la mode, cherche reconversion',
    projetProfessionnel: 'Créer sa propre ligne de bijoux artisanaux',
    statutProspect: 'NOUVEAU',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'Bonjour, je suis passionnée par la bijouterie depuis longtemps et je souhaite me former pour en faire mon métier.',
    resumeIa: 'Profil de reconversion motivé. Travaille dans la mode, sensibilité esthétique forte. Pas d\'expérience technique mais motivation solide. Formation BIJ N1 recommandée en premier lieu.',
    nbEchanges: 1,
    datePremierContact: date(2026, 2, 10),
    dateDernierContact: date(2026, 2, 10),
  },
  {
    idProspect: 'tchambon-nou-mar',
    nom: 'Chambon', prenom: 'Martin',
    emails: ['martin.chambon@outlook.fr'], telephones: ['06 23 45 67 89'],
    ville: 'Lyon', codePostal: '69003',
    formationPrincipale: 'SERTI_N1', formationsSouhaitees: ['SERTI_N1', 'SERTI_N2'],
    modeFinancement: 'CPF',
    situationActuelle: 'Bijoutier autodidacte depuis 3 ans, vend sur les marchés',
    projetProfessionnel: 'Maîtriser le sertissage pour proposer des pièces plus élaborées',
    statutProspect: 'NOUVEAU',
    sourceOrigine: 'demande_directe',
    messageInitial: 'Je pratique la bijouterie en amateur depuis quelques années. Je vends sur les marchés artisanaux. Je veux maintenant apprendre le sertissage professionnel.',
    resumeIa: 'Profil atypique — autodidacte avec pratique concrète. Vend déjà ses créations. Niveau probablement supérieur au N1 mais formation conseillée pour valider les bases. Fort potentiel.',
    nbEchanges: 2,
    datePremierContact: date(2026, 2, 8),
    dateDernierContact: date(2026, 2, 12),
  },
  {
    idProspect: 'nfontaine-nou-cla',
    nom: 'Fontaine', prenom: 'Clara',
    emails: ['clara.fontaine@yahoo.fr'], telephones: ['06 34 56 78 90'],
    ville: 'Bordeaux', codePostal: '33000',
    formationPrincipale: 'CAP_BJ', formationsSouhaitees: ['CAP_BJ'],
    modeFinancement: 'France Travail',
    situationActuelle: 'Demandeuse d\'emploi, ex-vendeuse bijouterie',
    projetProfessionnel: 'Devenir créatrice joaillière et ouvrir son atelier',
    statutProspect: 'NOUVEAU',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'J\'ai travaillé 5 ans comme vendeuse dans une bijouterie. Je veux maintenant passer de l\'autre côté et créer moi-même les bijoux.',
    resumeIa: 'Connaissance du secteur via la vente, comprend les attentes clients. Motivée pour la création. Le CAP est adapté à son projet. Financement France Travail à consolider.',
    nbEchanges: 1,
    datePremierContact: date(2026, 2, 15),
    dateDernierContact: date(2026, 2, 15),
  },
  {
    idProspect: 'abriand-nou-tom',
    nom: 'Briand', prenom: 'Thomas',
    emails: ['thomas.briand@gmail.com'], telephones: ['06 45 67 89 01'],
    ville: 'Toulouse', codePostal: '31000',
    formationPrincipale: 'JOAILL_N1', formationsSouhaitees: ['JOAILL_N1'],
    modeFinancement: 'OPCO',
    situationActuelle: 'Salarié chez un horloger bijoutier',
    projetProfessionnel: 'Élargir ses compétences vers la joaillerie fine',
    statutProspect: 'NOUVEAU',
    sourceOrigine: 'demande_directe',
    messageInitial: 'Je travaille chez un bijoutier horloger depuis 2 ans. Mon employeur m\'encourage à me former en joaillerie. On peut envisager une prise en charge OPCO ?',
    resumeIa: 'Salarié du secteur avec soutien employeur. Demande de prise en charge OPCO à traiter. Profil sérieux, formation JOAILL N1 directement pertinente.',
    nbEchanges: 3,
    datePremierContact: date(2026, 2, 5),
    dateDernierContact: date(2026, 2, 18),
  },
  {
    idProspect: 'smarchand-nou-eli',
    nom: 'Marchand', prenom: 'Élise',
    emails: ['elise.marchand@hotmail.fr'], telephones: ['06 56 78 90 12'],
    ville: 'Nantes', codePostal: '44000',
    formationPrincipale: 'EMAIL_N1', formationsSouhaitees: ['EMAIL_N1'],
    modeFinancement: 'Personnel',
    situationActuelle: 'Artiste plasticienne, céramiste',
    projetProfessionnel: 'Combiner la céramique et l\'émail bijouterie pour des créations uniques',
    statutProspect: 'NOUVEAU',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'Je suis céramiste et je travaille l\'émail sur faïence. J\'aimerais apprendre l\'émail grand feu sur métal pour diversifier mon travail.',
    resumeIa: 'Profil artistique avec compétences en émail connexes. La transition vers l\'émail bijouterie est naturelle. Formation EMAIL N1 idéale. Pas de financement externe prévu.',
    nbEchanges: 1,
    datePremierContact: date(2026, 2, 19),
    dateDernierContact: date(2026, 2, 19),
  },
  {
    idProspect: 'rdumont-nou-luc',
    nom: 'Dumont', prenom: 'Lucas',
    emails: ['lucas.dumont@gmail.com'], telephones: ['06 67 89 01 23'],
    ville: 'Strasbourg', codePostal: '67000',
    formationPrincipale: 'GEMMO_N1', formationsSouhaitees: ['GEMMO_N1'],
    modeFinancement: 'CPF',
    situationActuelle: 'Gemologue amateur, collectionneur de minéraux',
    projetProfessionnel: 'Devenir expert gemmologue et conseiller en pierres précieuses',
    statutProspect: 'NOUVEAU',
    sourceOrigine: 'demande_directe',
    messageInitial: 'Passionné de minéralogie depuis l\'enfance, j\'ai une belle collection. Je veux me professionnaliser en gemmologie.',
    resumeIa: 'Passion et culture minérale solide. Formation GEMMO N1 parfaitement alignée. CPF plausible selon solde. Pas de projet entrepreneurial précis mais motivation réelle.',
    nbEchanges: 2,
    datePremierContact: date(2026, 1, 28),
    dateDernierContact: date(2026, 2, 3),
  },
]

const PROSPECTS_EN_ATTENTE = [
  {
    idProspect: 'pgarnier-att-sop',
    nom: 'Garnier', prenom: 'Sophie',
    emails: ['sophie.garnier@gmail.com'], telephones: ['06 11 22 33 44'],
    ville: 'Paris', codePostal: '75018',
    formationPrincipale: 'CAP_BJ', formationsSouhaitees: ['CAP_BJ'],
    modeFinancement: 'France Travail',
    situationActuelle: 'Demandeur d\'emploi longue durée, ex-assistante comptable',
    projetProfessionnel: 'Reconversion totale vers la création bijoutière',
    statutProspect: 'EN_ATTENTE_DOSSIER',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'Je cherche une reconversion complète. La bijouterie m\'a toujours attirée. Je suis disponible pour une formation longue.',
    resumeIa: 'Reconversion totale. Profil administratif, pas d\'expérience manuelle déclarée. Entretien recommandé pour valider aptitudes. France Travail à confirmer avec conseiller.',
    nbEchanges: 4,
    datePremierContact: date(2026, 1, 15),
    dateDernierContact: date(2026, 2, 16),
    dossierEnvoyeLe: date(2026, 2, 16),
    statutDossier: 'FORMULAIRE_ENVOYE',
  },
  {
    idProspect: 'jleconte-att-aur',
    nom: 'Leconte', prenom: 'Aurélien',
    emails: ['aurelien.leconte@yahoo.fr'], telephones: ['06 22 33 44 55'],
    ville: 'Marseille', codePostal: '13005',
    formationPrincipale: 'SERTI_N2', formationsSouhaitees: ['SERTI_N2'],
    modeFinancement: 'OPCO',
    situationActuelle: 'Bijoutier salarié avec 4 ans d\'expérience',
    projetProfessionnel: 'Monter en compétence sur le sertissage haute joaillerie',
    statutProspect: 'EN_ATTENTE_DOSSIER',
    sourceOrigine: 'demande_directe',
    messageInitial: 'Je travaille en bijouterie depuis 4 ans. Je maîtrise les bases du sertissage et veux progresser vers des techniques plus avancées.',
    resumeIa: 'Profil expérimenté. Le N2 est adapté. L\'OPCO devrait valider facilement vu l\'ancienneté en entreprise. Dossier simple à constituer.',
    nbEchanges: 3,
    datePremierContact: date(2026, 2, 1),
    dateDernierContact: date(2026, 2, 14),
    dossierEnvoyeLe: date(2026, 2, 14),
    statutDossier: 'FORMULAIRE_ENVOYE',
  },
  {
    idProspect: 'vbaudin-att-cam',
    nom: 'Baudin', prenom: 'Camille',
    emails: ['camille.baudin@outlook.com'], telephones: ['06 33 44 55 66'],
    ville: 'Lille', codePostal: '59000',
    formationPrincipale: 'BIJ_CR_N1', formationsSouhaitees: ['BIJ_CR_N1', 'BIJ_CR_N2'],
    modeFinancement: 'CPF',
    situationActuelle: 'Enseignante arts plastiques en collège',
    projetProfessionnel: 'Développer une activité bijouterie en parallèle de l\'enseignement',
    statutProspect: 'EN_ATTENTE_DOSSIER',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'Enseignante en arts plastiques, je veux apprendre la bijouterie pour enrichir mes cours et développer une activité secondaire.',
    resumeIa: 'Double projet : pédagogique + création. Sensibilité artistique affirmée. CPF disponible. Formation BIJ N1 puis N2 sur deux sessions conseillée.',
    nbEchanges: 5,
    datePremierContact: date(2026, 1, 20),
    dateDernierContact: date(2026, 2, 17),
    dossierEnvoyeLe: date(2026, 2, 15),
    statutDossier: 'FORMULAIRE_ENVOYE',
  },
  {
    idProspect: 'kpavard-att-nic',
    nom: 'Pavard', prenom: 'Nicolas',
    emails: ['nicolas.pavard@gmail.com'], telephones: ['06 44 55 66 77'],
    ville: 'Rennes', codePostal: '35000',
    formationPrincipale: 'CISEL_N1', formationsSouhaitees: ['CISEL_N1'],
    modeFinancement: 'Personnel',
    situationActuelle: 'Sculpteur, travaille principalement le bois et la pierre',
    projetProfessionnel: 'Intégrer la ciselure métal dans ses œuvres sculpturales',
    statutProspect: 'EN_ATTENTE_DOSSIER',
    sourceOrigine: 'demande_directe',
    messageInitial: 'Sculpteur professionnel, je cherche à explorer la ciselure sur métal pour enrichir mon vocabulaire plastique.',
    resumeIa: 'Artiste avec mains formées à la sculpture. La ciselure est une extension naturelle. Formation CISEL N1 directement pertinente. Financement personnel, pas de blocage.',
    nbEchanges: 2,
    datePremierContact: date(2026, 2, 12),
    dateDernierContact: date(2026, 2, 20),
    dossierEnvoyeLe: date(2026, 2, 20),
    statutDossier: 'FORMULAIRE_ENVOYE',
  },
  {
    idProspect: 'amasson-att-lea',
    nom: 'Masson', prenom: 'Léa',
    emails: ['lea.masson@hotmail.fr'], telephones: ['06 55 66 77 88'],
    ville: 'Nice', codePostal: '06000',
    formationPrincipale: 'JOAILL_N2', formationsSouhaitees: ['JOAILL_N2'],
    modeFinancement: 'OPCO',
    situationActuelle: 'Joaillière en atelier artisanal, 6 ans d\'expérience',
    projetProfessionnel: 'Perfectionner les techniques pour accéder à la haute joaillerie',
    statutProspect: 'EN_ATTENTE_DOSSIER',
    sourceOrigine: 'demande_directe',
    messageInitial: 'Je travaille en joaillerie depuis 6 ans dans un petit atelier. Je veux monter en gamme et travailler sur des pièces de haute joaillerie.',
    resumeIa: 'Profil expert. Le N2 est parfaitement adapté. Très bon dossier potentiel — OPCO facilement validable. À prioriser, candidature très sérieuse.',
    nbEchanges: 6,
    datePremierContact: date(2026, 1, 10),
    dateDernierContact: date(2026, 2, 18),
    dossierEnvoyeLe: date(2026, 2, 12),
    statutDossier: 'FORMULAIRE_ENVOYE',
  },
  {
    idProspect: 'gperrin-att-fab',
    nom: 'Perrin', prenom: 'Fabien',
    emails: ['fabien.perrin@gmail.com'], telephones: ['06 66 77 88 99'],
    ville: 'Grenoble', codePostal: '38000',
    formationPrincipale: 'BIJ_CR_N2', formationsSouhaitees: ['BIJ_CR_N1', 'BIJ_CR_N2'],
    modeFinancement: 'Personnel',
    situationActuelle: 'Ingénieur en retraite anticipée à 55 ans',
    projetProfessionnel: 'Bijouterie comme seconde vie professionnelle et passion',
    statutProspect: 'EN_ATTENTE_DOSSIER',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'Je prends ma retraite anticipée et je veux enfin concrétiser ma passion pour la bijouterie. J\'ai du temps et de la motivation.',
    resumeIa: 'Profil retraite actif. Rigueur d\'ingénieur applicable à la bijouterie. Motivation sincère. Financement personnel sans contrainte. N1 puis N2 sur deux sessions.',
    nbEchanges: 3,
    datePremierContact: date(2026, 2, 7),
    dateDernierContact: date(2026, 2, 19),
    dossierEnvoyeLe: date(2026, 2, 19),
    statutDossier: 'FORMULAIRE_ENVOYE',
  },
]

const PROSPECTS_ANCIEN_CANDIDAT = [
  {
    idProspect: 'dlouis-anc-pau',
    nom: 'Louis', prenom: 'Pauline',
    emails: ['pauline.louis@gmail.com'], telephones: ['06 10 20 30 40'],
    ville: 'Lyon', codePostal: '69007',
    formationPrincipale: 'CAP_BJ', formationsSouhaitees: ['CAP_BJ'],
    modeFinancement: 'France Travail',
    situationActuelle: 'Salariée à nouveau après refus du CAP',
    projetProfessionnel: 'Retenter le CAP l\'an prochain après avoir économisé',
    statutProspect: 'ANCIEN_CANDIDAT',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'J\'avais candidaté l\'an dernier pour le CAP. J\'avais été refusée car mon niveau n\'était pas suffisant. Je m\'y suis remise depuis et je veux retenter.',
    resumeIa: 'Ancienne candidate refusée en admission. A travaillé pour progresser. Profil à réévaluer — l\'évolution depuis le refus est positive. Retentative justifiée.',
    nbEchanges: 8,
    datePremierContact: date(2025, 3, 5),
    dateDernierContact: date(2025, 9, 12),
    notes: 'Refus admission CAP — niveau technique insuffisant lors du jury mars 2025. Candidate à recontacter pour session septembre 2026.',
  },
  {
    idProspect: 'bchatel-anc-rem',
    nom: 'Chatel', prenom: 'Remi',
    emails: ['remi.chatel@yahoo.fr'], telephones: ['06 20 30 40 50'],
    ville: 'Paris', codePostal: '75020',
    formationPrincipale: 'JOAILL_N1', formationsSouhaitees: ['JOAILL_N1'],
    modeFinancement: 'CPF',
    situationActuelle: 'A reporté suite à problèmes familiaux',
    projetProfessionnel: 'Formation joaillerie dès que la situation se stabilise',
    statutProspect: 'ANCIEN_CANDIDAT',
    sourceOrigine: 'demande_directe',
    messageInitial: 'Je devais commencer la formation en octobre mais j\'ai dû annuler pour raisons familiales. Je veux repartir sur une session 2026.',
    resumeIa: 'Abandon volontaire pour raisons personnelles, pas de refus. Candidat sérieux à recontacter pour session 2026. Motivation intacte.',
    nbEchanges: 5,
    datePremierContact: date(2025, 7, 20),
    dateDernierContact: date(2025, 10, 3),
    notes: 'Désistement volontaire octobre 2025 — décès familial. À recontacter dès février 2026 pour session printemps.',
  },
  {
    idProspect: 'frousseau-anc-isa',
    nom: 'Rousseau', prenom: 'Isabelle',
    emails: ['isabelle.rousseau@outlook.com'], telephones: ['06 30 40 50 60'],
    ville: 'Bordeaux', codePostal: '33800',
    formationPrincipale: 'SERTI_N1', formationsSouhaitees: ['SERTI_N1'],
    modeFinancement: 'Personnel',
    situationActuelle: 'A suivi une autre formation ailleurs, déçue du résultat',
    projetProfessionnel: 'Essayer l\'ABJ qu\'on lui a recommandée',
    statutProspect: 'ANCIEN_CANDIDAT',
    sourceOrigine: 'demande_directe',
    messageInitial: 'J\'avais candidaté chez vous en 2024 puis j\'ai suivi une formation ailleurs. Franchement déçue. Une amie m\'a dit que votre pédagogie est bien meilleure.',
    resumeIa: 'Candidate déçue d\'une autre école. Recommandation positive d\'une ancienne élève ABJ. Très bonne opportunité de conversion. À traiter en priorité.',
    nbEchanges: 4,
    datePremierContact: date(2025, 11, 8),
    dateDernierContact: date(2026, 1, 15),
    notes: 'A suivi une formation concurrente en 2025, insatisfaite. Retour vers ABJ sur recommandation. Fort potentiel de conversion.',
  },
  {
    idProspect: 'cmorin-anc-ale',
    nom: 'Morin', prenom: 'Alexandre',
    emails: ['alexandre.morin@gmail.com'], telephones: ['06 40 50 60 70'],
    ville: 'Toulouse', codePostal: '31500',
    formationPrincipale: 'BIJ_CR_N1', formationsSouhaitees: ['BIJ_CR_N1'],
    modeFinancement: 'CPF',
    situationActuelle: 'Attendait la validation CPF qui a finalement été refusée',
    projetProfessionnel: 'Trouver un autre mode de financement et se former',
    statutProspect: 'ANCIEN_CANDIDAT',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'Mon dossier CPF a été refusé à la dernière minute. Je suis très déçu mais je cherche une autre solution de financement.',
    resumeIa: 'Dossier solide, refus sur financement uniquement (CPF refusé). À accompagner vers d\'autres options : auto-financement fractionné ou OPCO si salarié. Ne pas perdre ce candidat.',
    nbEchanges: 7,
    datePremierContact: date(2025, 10, 12),
    dateDernierContact: date(2026, 1, 20),
    notes: 'Refus CPF en novembre 2025. Cherche financement alternatif. À rappeler pour proposer facilités de paiement.',
  },
  {
    idProspect: 'nsimon-anc-val',
    nom: 'Simon', prenom: 'Valentine',
    emails: ['valentine.simon@hotmail.fr'], telephones: ['06 50 60 70 80'],
    ville: 'Nantes', codePostal: '44300',
    formationPrincipale: 'GEMMO_N1', formationsSouhaitees: ['GEMMO_N1'],
    modeFinancement: 'Personnel',
    situationActuelle: 'A dû déménager, formation reportée',
    projetProfessionnel: 'Reprendre la formation maintenant qu\'elle est installée',
    statutProspect: 'ANCIEN_CANDIDAT',
    sourceOrigine: 'demande_directe',
    messageInitial: 'J\'avais un dossier l\'an dernier mais j\'ai déménagé de Paris à Nantes. Je voudrais reprendre ma candidature maintenant que je suis installée.',
    resumeIa: 'Report logistique — déménagement. Motivation intacte. La formation est possible depuis Nantes (trajet 2h Paris). À recontacter pour session disponible.',
    nbEchanges: 3,
    datePremierContact: date(2025, 9, 5),
    dateDernierContact: date(2026, 2, 1),
    notes: 'Déménagement Paris → Nantes retardé. Intéressée malgré la distance. À contacter pour la prochaine session GEMMO.',
  },
  {
    idProspect: 'pdecombe-anc-oli',
    nom: 'Decombe', prenom: 'Olivier',
    emails: ['olivier.decombe@gmail.com'], telephones: ['06 60 70 80 90'],
    ville: 'Strasbourg', codePostal: '67100',
    formationPrincipale: 'CISEL_N1', formationsSouhaitees: ['CISEL_N1'],
    modeFinancement: 'OPCO',
    situationActuelle: 'Son entreprise n\'a pas validé la prise en charge OPCO',
    projetProfessionnel: 'Autofinancer la formation si l\'OPCO refuse à nouveau',
    statutProspect: 'ANCIEN_CANDIDAT',
    sourceOrigine: 'formulaire_contact',
    messageInitial: 'Mon dossier OPCO a été refusé car ma formation ne correspondait pas exactement au code formation de mon OPCO. Je cherche une solution.',
    resumeIa: 'Refus OPCO sur critère administratif (code formation). Le souci est résolvable — certains OPCO reconnaissent CISEL sous d\'autres codes. À orienter vers autofinancement ou chercher un autre OPCO.',
    nbEchanges: 6,
    datePremierContact: date(2025, 12, 1),
    dateDernierContact: date(2026, 1, 28),
    notes: 'OPCO Adesatt refus — code formation non reconnu. Possibilité d\'aller vers CONSTRUCTYS. À rappeler pour solution.',
  },
]

const PROSPECTS_ANCIEN_ELEVE = [
  {
    idProspect: 'mbonnet-ele-ana',
    nom: 'Bonnet', prenom: 'Anaïs',
    emails: ['anais.bonnet@gmail.com'], telephones: ['06 15 25 35 45'],
    ville: 'Paris', codePostal: '75014',
    formationPrincipale: 'BIJ_CR_N2', formationsSouhaitees: ['BIJ_CR_N2', 'JOAILL_N1'],
    modeFinancement: 'CPF',
    situationActuelle: 'Bijoutière indépendante depuis 1 an, après formation BIJ N1',
    projetProfessionnel: 'Suivre la N2 puis se former en joaillerie pour proposer des pièces haut de gamme',
    statutProspect: 'ANCIEN_ELEVE',
    sourceOrigine: 'ancien_eleve',
    messageInitial: 'J\'ai suivi le BIJ N1 chez vous en 2024 et j\'ai adoré. Je suis maintenant installée à mon compte. Je veux revenir faire le N2.',
    resumeIa: 'Ancienne élève satisfaite, retour pour progresser. Très bon profil — a concrétisé son projet post-formation. Fidélité à valoriser. Formation N2 directement accessible.',
    nbEchanges: 2,
    datePremierContact: date(2026, 1, 22),
    dateDernierContact: date(2026, 2, 8),
    notes: 'Ancienne élève BIJ N1 — session mars 2024. Installée à son compte depuis septembre 2024. Veut revenir pour N2. Contact prioritaire.',
  },
  {
    idProspect: 'jmichaud-ele-pie',
    nom: 'Michaud', prenom: 'Pierre',
    emails: ['pierre.michaud@yahoo.fr'], telephones: ['06 25 35 45 55'],
    ville: 'Lyon', codePostal: '69002',
    formationPrincipale: 'SERTI_N2', formationsSouhaitees: ['SERTI_N2'],
    modeFinancement: 'OPCO',
    situationActuelle: 'Sertisseur dans un atelier de luxe après formation SERTI N1',
    projetProfessionnel: 'Maîtriser le sertissage haute joaillerie après 1 an de pratique en atelier',
    statutProspect: 'ANCIEN_ELEVE',
    sourceOrigine: 'ancien_eleve',
    messageInitial: 'Après votre formation SERTI N1, j\'ai été embauché dans un atelier de luxe à Lyon. Après un an de pratique, je veux faire le N2.',
    resumeIa: 'Parcours idéal : formation → emploi → perfectionnement. Employeur actuel peut prendre en charge OPCO. Profil exemplaire, à traiter avec priorité.',
    nbEchanges: 4,
    datePremierContact: date(2026, 2, 3),
    dateDernierContact: date(2026, 2, 15),
    notes: 'Ancien élève SERTI N1 — session juin 2024. Embauché chez Joaillerie Arnaud (Lyon). Employeur favorable à OPCO. Contact très chaud.',
  },
  {
    idProspect: 'cdavid-ele-sop',
    nom: 'David', prenom: 'Sophie',
    emails: ['sophie.david@outlook.fr'], telephones: ['06 35 45 55 65'],
    ville: 'Marseille', codePostal: '13001',
    formationPrincipale: 'EMAIL_N1', formationsSouhaitees: ['EMAIL_N1', 'EMAIL_N2_CLOIS'],
    modeFinancement: 'Personnel',
    situationActuelle: 'Émailleurs bijoutière installée après formation, cherche à spécialiser',
    projetProfessionnel: 'Maîtriser l\'émail cloisonné après avoir pratiqué l\'initiation',
    statutProspect: 'ANCIEN_ELEVE',
    sourceOrigine: 'ancien_eleve',
    messageInitial: 'La formation email N1 était fantastique. Je travaille maintenant sur des pièces émaillées. Je veux apprendre le cloisonné.',
    resumeIa: 'Parcours cohérent et progressif. Ancienne élève satisfaite qui revient pour se spécialiser. EMAIL N2 CLOIS directement dans la continuité. Financement personnel, pas de contrainte.',
    nbEchanges: 2,
    datePremierContact: date(2026, 2, 10),
    dateDernierContact: date(2026, 2, 20),
    notes: 'Ancienne élève EMAIL N1 — session septembre 2024. Travaille à son compte. Veut N2 cloisonné.',
  },
  {
    idProspect: 'fgirard-ele-mat',
    nom: 'Girard', prenom: 'Mathieu',
    emails: ['mathieu.girard@gmail.com'], telephones: ['06 45 55 65 75'],
    ville: 'Bordeaux', codePostal: '33300',
    formationPrincipale: 'JOAILL_N2', formationsSouhaitees: ['JOAILL_N2'],
    modeFinancement: 'OPCO',
    situationActuelle: 'Joaillier employé, formé en N1 chez ABJ il y a 18 mois',
    projetProfessionnel: 'Progresser vers la haute joaillerie, spécialisation en solitaires et rivières',
    statutProspect: 'ANCIEN_ELEVE',
    sourceOrigine: 'ancien_eleve',
    messageInitial: 'J\'ai fait le JOAILL N1 il y a 18 mois. Mon employeur veut m\'envoyer en perfectionnement N2 cette année. Est-ce que vous avez des sessions disponibles ?',
    resumeIa: 'Demande initiée par l\'employeur — OPCO très probable. Profil expérimenté depuis la N1 + 18 mois pratique. N2 directement adapté. Traiter rapidement pour confirmer session.',
    nbEchanges: 3,
    datePremierContact: date(2026, 1, 30),
    dateDernierContact: date(2026, 2, 14),
    notes: 'Ancien élève JOAILL N1 — session mai 2024. Employé chez Maison Dupuy (Bordeaux). Employeur veut financer N2 via OPCO. Très bonne opportunité.',
  },
  {
    idProspect: 'ahervé-ele-cla',
    nom: 'Hervé', prenom: 'Claire',
    emails: ['claire.herve@hotmail.fr'], telephones: ['06 55 65 75 85'],
    ville: 'Nantes', codePostal: '44200',
    formationPrincipale: 'BIJ_CR_N3', formationsSouhaitees: ['BIJ_CR_N3'],
    modeFinancement: 'CPF',
    situationActuelle: 'Bijoutière à son compte, a fait N1 et N2 chez ABJ',
    projetProfessionnel: 'Compléter le cursus avec le N3 pour maîtriser les techniques avancées',
    statutProspect: 'ANCIEN_ELEVE',
    sourceOrigine: 'ancien_eleve',
    messageInitial: 'J\'ai fait les niveaux 1 et 2 chez vous et j\'ai adoré la pédagogie. Je veux boucler le cursus avec le N3.',
    resumeIa: 'Fidélité totale au parcours ABJ — N1 + N2 validés. Le N3 est la suite naturelle. Excellent ambassadrice de la formation. CPF pour financer. À traiter avec soin.',
    nbEchanges: 2,
    datePremierContact: date(2026, 2, 17),
    dateDernierContact: date(2026, 2, 20),
    notes: 'Ancienne élève N1 (mars 2024) + N2 (septembre 2024). Parcours complet ABJ. Veut N3. Ambassadrice satisfaction.',
  },
  {
    idProspect: 'nlefevre-ele-ant',
    nom: 'Lefèvre', prenom: 'Antoine',
    emails: ['antoine.lefevre@gmail.com'], telephones: ['06 65 75 85 95'],
    ville: 'Nice', codePostal: '06100',
    formationPrincipale: 'CISEL_N2', formationsSouhaitees: ['CISEL_N2'],
    modeFinancement: 'Personnel',
    situationActuelle: 'Ciselier sculpteur, a fait CISEL N1 il y a 6 mois',
    projetProfessionnel: 'Maîtriser les repoussages et techniques avancées de ciselure',
    statutProspect: 'ANCIEN_ELEVE',
    sourceOrigine: 'ancien_eleve',
    messageInitial: 'Six mois après le N1 de ciselure, je pratique régulièrement dans mon atelier. Je veux maintenant le N2 pour les techniques de repoussage.',
    resumeIa: 'Pratique régulière post-formation — bonne assimilation du N1. CISEL N2 directement approprié. Financement personnel disponible. Dossier simple.',
    nbEchanges: 1,
    datePremierContact: date(2026, 2, 18),
    dateDernierContact: date(2026, 2, 18),
    notes: 'Ancien élève CISEL N1 — session septembre 2025. Pratique active dans son atelier. Veut N2 dès session disponible.',
  },
]

// ─── 2. CANDIDATS (liés à de nouveaux prospects CANDIDAT) ────────────────────

const PROSPECTS_CANDIDATS = [
  {
    idProspect: 'mleduc-can-emi',
    nom: 'Leduc', prenom: 'Émilie',
    emails: ['emilie.leduc@gmail.com'], telephones: ['06 71 81 91 01'],
    ville: 'Paris', codePostal: '75015',
    formationPrincipale: 'BIJ_CR_N1',
    formationsSouhaitees: ['BIJ_CR_N1'],
    modeFinancement: 'Personnel',
    situationActuelle: 'Styliste textile en reconversion',
    projetProfessionnel: 'Bijouterie créateur pour compléter ses collections mode',
    statutProspect: 'CANDIDAT',
    sourceOrigine: 'formulaire_contact',
    nbEchanges: 7,
    datePremierContact: date(2026, 1, 5),
    dateDernierContact: date(2026, 2, 10),
    resumeIa: 'Reconversion depuis le textile. Sensibilité mode et design fort. BIJ N1 parfait. Financement personnel confirmé.',
    messageInitial: 'Styliste depuis 8 ans, je veux ajouter la bijouterie à mes créations.',
  },
  {
    idProspect: 'obertrand-can-raf',
    nom: 'Bertrand', prenom: 'Raphaël',
    emails: ['raphael.bertrand@yahoo.fr'], telephones: ['06 82 92 02 12'],
    ville: 'Montpellier', codePostal: '34000',
    formationPrincipale: 'SERTI_N1',
    formationsSouhaitees: ['SERTI_N1'],
    modeFinancement: 'CPF',
    situationActuelle: 'Apprenti bijoutier dans une échoppe artisanale',
    projetProfessionnel: 'Acquérir les bases du sertissage pour monter en compétences',
    statutProspect: 'CANDIDAT',
    sourceOrigine: 'demande_directe',
    nbEchanges: 5,
    datePremierContact: date(2026, 1, 18),
    dateDernierContact: date(2026, 2, 12),
    resumeIa: 'Praticien débutant avec environnement professionnel favorable. CPF disponible. SERTI N1 directement adapté.',
    messageInitial: 'Je travaille en bijouterie artisanale, je veux apprendre le sertissage.',
  },
  {
    idProspect: 'cjoly-can-ing',
    nom: 'Joly', prenom: 'Ingrid',
    emails: ['ingrid.joly@outlook.com'], telephones: ['06 93 03 13 23'],
    ville: 'Strasbourg', codePostal: '67000',
    formationPrincipale: 'JOAILL_N1',
    formationsSouhaitees: ['JOAILL_N1', 'JOAILL_N2'],
    modeFinancement: 'OPCO',
    situationActuelle: 'Créatrice bijoux fantaisie depuis 5 ans, vente en ligne',
    projetProfessionnel: 'Passer aux matières nobles (or, argent, pierres) via joaillerie',
    statutProspect: 'CANDIDAT',
    sourceOrigine: 'formulaire_contact',
    nbEchanges: 9,
    datePremierContact: date(2025, 12, 10),
    dateDernierContact: date(2026, 2, 16),
    resumeIa: 'Expérience solide en bijoux fantaisie. Transition vers matières nobles : très cohérente. OPCO en cours. Dossier avancé.',
    messageInitial: 'Je crée des bijoux fantaisie depuis 5 ans. Je veux monter en gamme vers la joaillerie fine.',
  },
  {
    idProspect: 'pbrun-can-xav',
    nom: 'Brun', prenom: 'Xavier',
    emails: ['xavier.brun@gmail.com'], telephones: ['06 04 14 24 34'],
    ville: 'Bordeaux', codePostal: '33000',
    formationPrincipale: 'CAP_BJ',
    formationsSouhaitees: ['CAP_BJ'],
    modeFinancement: 'France Travail',
    situationActuelle: 'Chômeur depuis 8 mois, cherche formation qualifiante longue',
    projetProfessionnel: 'Obtenir un diplôme reconnu et ouvrir son propre atelier',
    statutProspect: 'CANDIDAT',
    sourceOrigine: 'formulaire_contact',
    nbEchanges: 11,
    datePremierContact: date(2025, 11, 20),
    dateDernierContact: date(2026, 2, 18),
    resumeIa: 'Projet solide pour un demandeur d\'emploi — CAP long terme bien adapté. France Travail suit le dossier. Entretien très positif.',
    messageInitial: 'Au chômage, je cherche une formation complète. J\'ai toujours voulu faire de la bijouterie.',
  },
  {
    idProspect: 'vrobin-can-adr',
    nom: 'Robin', prenom: 'Adrienne',
    emails: ['adrienne.robin@hotmail.fr'], telephones: ['06 15 25 35 45'],
    ville: 'Nantes', codePostal: '44000',
    formationPrincipale: 'GEMMO_N1',
    formationsSouhaitees: ['GEMMO_N1'],
    modeFinancement: 'Personnel',
    situationActuelle: 'Gérante d\'une boutique de minéraux et cristaux',
    projetProfessionnel: 'Ajouter la vente de gemmes certifiées à sa boutique',
    statutProspect: 'CANDIDAT',
    sourceOrigine: 'demande_directe',
    nbEchanges: 6,
    datePremierContact: date(2026, 1, 8),
    dateDernierContact: date(2026, 2, 14),
    resumeIa: 'Profil commercial avec connaissance des minéraux. La gemmologie est un complément naturel à son activité. Projet commercial concret. Financement personnel.',
    messageInitial: 'Je gère une boutique de minéraux. Je veux me certifier en gemmologie pour vendre des pierres précieuses.',
  },
]

// ─── 3. PROSPECTS ELÈVES (liés aux élèves) ───────────────────────────────────

const PROSPECTS_ELEVES = [
  { idProspect: 'lblanc-elv-lea',  nom: 'Blanc',    prenom: 'Léa',      emails: ['lea.blanc@gmail.com'],      telephones: ['06 12 11 11 11'], ville: 'Paris',       codePostal: '75011', formationPrincipale: 'CAP_BJ',    formationsSouhaitees: ['CAP_BJ'],    modeFinancement: 'France Travail', situationActuelle: 'Élève ABJ — CAP en cours', projetProfessionnel: 'Devenir créatrice joaillière',           statutProspect: 'ELEVE', nbEchanges: 12, datePremierContact: date(2025, 2, 1), dateDernierContact: date(2025, 9, 1), sourceOrigine: 'formulaire_contact', resumeIa: 'Élève active. Très bonne progression. CAP en cours.', messageInitial: 'Je souhaite suivre le CAP bijouterie.' },
  { idProspect: 'hguerin-elv-hug', nom: 'Guérin',   prenom: 'Hugo',     emails: ['hugo.guerin@yahoo.fr'],     telephones: ['06 22 22 22 22'], ville: 'Lyon',        codePostal: '69003', formationPrincipale: 'CAP_BJ',    formationsSouhaitees: ['CAP_BJ'],    modeFinancement: 'CPF',            situationActuelle: 'Élève ABJ — CAP en cours', projetProfessionnel: 'Ouvrir son atelier bijouterie',          statutProspect: 'ELEVE', nbEchanges: 10, datePremierContact: date(2025, 2, 5), dateDernierContact: date(2025, 9, 1), sourceOrigine: 'demande_directe', resumeIa: 'Élève sérieux. Bon niveau technique.', messageInitial: 'Intéressé par le CAP bijouterie.' },
  { idProspect: 'afaure-elv-ali',  nom: 'Faure',    prenom: 'Alice',    emails: ['alice.faure@gmail.com'],    telephones: ['06 33 33 33 33'], ville: 'Bordeaux',    codePostal: '33000', formationPrincipale: 'BIJ_CR_N1', formationsSouhaitees: ['BIJ_CR_N1'], modeFinancement: 'Personnel',      situationActuelle: 'Élève ABJ — BIJ N1 en cours', projetProfessionnel: 'Bijoutière créateur indépendante',       statutProspect: 'ELEVE', nbEchanges: 6,  datePremierContact: date(2025, 8, 1), dateDernierContact: date(2025, 10, 1), sourceOrigine: 'formulaire_contact', resumeIa: 'Élève enthousiaste. Bons retours formateur.', messageInitial: 'Je veux apprendre la bijouterie créateur.' },
  { idProspect: 'landre-elv-lou',  nom: 'André',    prenom: 'Louis',    emails: ['louis.andre@outlook.fr'],   telephones: ['06 44 44 44 44'], ville: 'Toulouse',    codePostal: '31000', formationPrincipale: 'SERTI_N1',  formationsSouhaitees: ['SERTI_N1'],  modeFinancement: 'OPCO',           situationActuelle: 'Élève ABJ — SERTI N1 en cours', projetProfessionnel: 'Sertisseur en atelier de joaillerie',    statutProspect: 'ELEVE', nbEchanges: 8,  datePremierContact: date(2025, 7, 15), dateDernierContact: date(2025, 9, 15), sourceOrigine: 'demande_directe', resumeIa: 'Élève avec expérience pratique préalable. Progression rapide.', messageInitial: 'Je veux maîtriser le sertissage.' },
  { idProspect: 'ichevalier-elv',  nom: 'Chevalier',prenom: 'Inès',     emails: ['ines.chevalier@gmail.com'], telephones: ['06 55 55 55 55'], ville: 'Nice',        codePostal: '06000', formationPrincipale: 'JOAILL_N1', formationsSouhaitees: ['JOAILL_N1'], modeFinancement: 'CPF',            situationActuelle: 'Élève ABJ — JOAILL N1 en cours', projetProfessionnel: 'Joaillière fine, spécialisation pierres', statutProspect: 'ELEVE', nbEchanges: 7,  datePremierContact: date(2025, 8, 20), dateDernierContact: date(2025, 10, 5), sourceOrigine: 'formulaire_contact', resumeIa: 'Profil artiste avec sensibilité joaillerie. Bons résultats.', messageInitial: 'Passionnée de joaillerie, je veux me former.' },
  { idProspect: 'tfrancois-elv',   nom: 'François', prenom: 'Tom',      emails: ['tom.francois@yahoo.fr'],    telephones: ['06 66 66 66 66'], ville: 'Marseille',   codePostal: '13000', formationPrincipale: 'CISEL_N1',  formationsSouhaitees: ['CISEL_N1'],  modeFinancement: 'Personnel',      situationActuelle: 'Élève ABJ — CISEL N1 en cours', projetProfessionnel: 'Artiste ciselier pour pièces d\'art',    statutProspect: 'ELEVE', nbEchanges: 5,  datePremierContact: date(2025, 9, 1), dateDernierContact: date(2025, 10, 10), sourceOrigine: 'demande_directe', resumeIa: 'Artiste avec bonnes aptitudes manuelles.', messageInitial: 'Intéressé par la ciselure bijouterie.' },
  { idProspect: 'mlambert-elv-ma', nom: 'Lambert',  prenom: 'Manon',    emails: ['manon.lambert@gmail.com'],  telephones: ['06 77 77 77 77'], ville: 'Strasbourg',  codePostal: '67000', formationPrincipale: 'EMAIL_N1',  formationsSouhaitees: ['EMAIL_N1'],  modeFinancement: 'OPCO',           situationActuelle: 'Élève ABJ — EMAIL N1 en cours', projetProfessionnel: 'Émailleurs bijoutière, pièces uniques',  statutProspect: 'ELEVE', nbEchanges: 6,  datePremierContact: date(2025, 9, 5), dateDernierContact: date(2025, 10, 15), sourceOrigine: 'formulaire_contact', resumeIa: 'Céramiste de formation, transition naturelle vers émail bijou.', messageInitial: 'Céramiste cherche à apprendre l\'émail sur métal.' },
  { idProspect: 'vperrin-elv-vic', nom: 'Perrin',   prenom: 'Victor',   emails: ['victor.perrin@hotmail.fr'], telephones: ['06 88 88 88 88'], ville: 'Rennes',      codePostal: '35000', formationPrincipale: 'GEMMO_N1',  formationsSouhaitees: ['GEMMO_N1'],  modeFinancement: 'Personnel',      situationActuelle: 'Élève ABJ — GEMMO N1 terminé',  projetProfessionnel: 'Expertise gemmologique indépendante',    statutProspect: 'ANCIEN_ELEVE', nbEchanges: 9, datePremierContact: date(2025, 4, 1), dateDernierContact: date(2025, 7, 30), sourceOrigine: 'demande_directe', resumeIa: 'A terminé GEMMO N1 avec succès. Installé à son compte.', messageInitial: 'Je veux devenir gemmologue expert.' },
  { idProspect: 'zmorel-elv-zoe',  nom: 'Morel',    prenom: 'Zoé',      emails: ['zoe.morel@gmail.com'],      telephones: ['06 99 99 99 99'], ville: 'Grenoble',    codePostal: '38000', formationPrincipale: 'BIJ_CR_N2', formationsSouhaitees: ['BIJ_CR_N2'], modeFinancement: 'CPF',            situationActuelle: 'Élève ABJ — BIJ N2 terminé',    projetProfessionnel: 'Bijoutière créateur confirmée',          statutProspect: 'ANCIEN_ELEVE', nbEchanges: 8, datePremierContact: date(2025, 5, 1), dateDernierContact: date(2025, 8, 31), sourceOrigine: 'formulaire_contact', resumeIa: 'A terminé BIJ N2 avec distinction. Cherche à ouvrir atelier.', messageInitial: 'Je veux perfectionner ma bijouterie créateur.' },
  { idProspect: 'msimon-elv-mat',  nom: 'Simon',    prenom: 'Mathis',   emails: ['mathis.simon@outlook.fr'],  telephones: ['07 11 11 11 11'], ville: 'Lille',       codePostal: '59000', formationPrincipale: 'SERTI_N2',  formationsSouhaitees: ['SERTI_N2'],  modeFinancement: 'OPCO',           situationActuelle: 'Élève ABJ — SERTI N2 abandonné', projetProfessionnel: 'A repris un emploi, formation suspendue', statutProspect: 'ANCIEN_ELEVE', nbEchanges: 6, datePremierContact: date(2025, 6, 1), dateDernierContact: date(2025, 9, 15), sourceOrigine: 'demande_directe', resumeIa: 'A abandonné en cours de formation suite à opportunité professionnelle. Bon niveau acquis. Peut reprendre plus tard.', messageInitial: 'Je veux approfondir le sertissage niveau 2.' },
]

// ─── 4. DONNÉES CANDIDATS ────────────────────────────────────────────────────

interface CandidatData {
  prospectIdx: number // index dans PROSPECTS_CANDIDATS
  numeroDossier: string
  formationRetenue: string
  idFormationRetenue: number
  sessionVisee: string
  modeFinancement: string
  montantTotal: number
  montantPEC: number
  resteACharge: number
  statutDossier: string
  statutFinancement: string
  score: number
  entretienTel: boolean
  dateEntretienTel?: Date
  rdvPresentiel: boolean
  dateRdvPresentiel?: Date
  devisEnvoye: boolean
  dateDevis?: Date
  notesIa: string
  notes: string
  dateCandidature: Date
}

const CANDIDATS_DATA: CandidatData[] = [
  {
    prospectIdx: 0, // Émilie Leduc
    numeroDossier: 'LEDU-EMIL-010126',
    formationRetenue: 'BIJ_CR_N1', idFormationRetenue: ID_FORMATION_BIJ_N1,
    sessionVisee: 'Mars 2026',
    modeFinancement: 'Personnel',
    montantTotal: 1130, montantPEC: 0, resteACharge: 1130,
    statutDossier: 'DOSSIER_EN_COURS', statutFinancement: 'EN_ATTENTE',
    score: 72,
    entretienTel: true, dateEntretienTel: date(2026, 2, 3),
    rdvPresentiel: false,
    devisEnvoye: false,
    notesIa: 'Profil styliste reconversion bijouterie. Sensibilité design confirmée lors de l\'entretien téléphonique. Aptitudes manuelles à évaluer. Motivation très forte. Documents partiellement reçus — manque CNI verso et assurance civile.',
    notes: 'Entretien tel 03/02 — très bon contact. Documents en attente.',
    dateCandidature: date(2026, 1, 15),
  },
  {
    prospectIdx: 1, // Raphaël Bertrand
    numeroDossier: 'BERT-RAPH-180126',
    formationRetenue: 'SERTI_N1', idFormationRetenue: ID_FORMATION_SERTI_N1,
    sessionVisee: 'Avril 2026',
    modeFinancement: 'CPF',
    montantTotal: 1130, montantPEC: 1130, resteACharge: 0,
    statutDossier: 'DOSSIER_EN_COURS', statutFinancement: 'EN_COURS',
    score: 68,
    entretienTel: true, dateEntretienTel: date(2026, 2, 8),
    rdvPresentiel: false,
    devisEnvoye: false,
    notesIa: 'Praticien en contexte professionnel — assimilation rapide attendue. CPF en cours de validation sur Mon Compte Formation. Dossier complet sauf contrat (en attente CPF). Profil prometteur.',
    notes: 'CPF soumis le 10/02, validation attendue sous 15 jours.',
    dateCandidature: date(2026, 1, 20),
  },
  {
    prospectIdx: 2, // Ingrid Joly
    numeroDossier: 'JOLY-INGR-101225',
    formationRetenue: 'JOAILL_N1', idFormationRetenue: ID_FORMATION_JOAILL_N1,
    sessionVisee: 'Mars 2026',
    modeFinancement: 'OPCO',
    montantTotal: 1130, montantPEC: 1130, resteACharge: 0,
    statutDossier: 'DOSSIER_COMPLET', statutFinancement: 'EN_COURS',
    score: 85,
    entretienTel: true, dateEntretienTel: date(2026, 1, 15),
    rdvPresentiel: true, dateRdvPresentiel: date(2026, 2, 5),
    devisEnvoye: false,
    notesIa: 'Excellente candidate. 5 ans de pratique bijoux fantaisie, portfolio convaincant. Entretien présentiel très positif — maîtrise des outils de base, sensibilité forte. Dossier complet. OPCO Adesatt en attente de validation. À prioriser pour la session mars.',
    notes: 'Dossier complet reçu le 15/02. OPCO Adesatt — accord de principe oral, document écrit attendu semaine 8.',
    dateCandidature: date(2025, 12, 12),
  },
  {
    prospectIdx: 3, // Xavier Brun
    numeroDossier: 'BRUN-XAVI-201125',
    formationRetenue: 'CAP_BJ', idFormationRetenue: ID_FORMATION_CAP,
    sessionVisee: 'Septembre 2026',
    modeFinancement: 'France Travail',
    montantTotal: 15000, montantPEC: 12000, resteACharge: 3000,
    statutDossier: 'DOSSIER_COMPLET', statutFinancement: 'EN_COURS',
    score: 78,
    entretienTel: true, dateEntretienTel: date(2025, 12, 10),
    rdvPresentiel: true, dateRdvPresentiel: date(2026, 1, 20),
    devisEnvoye: false,
    notesIa: 'Chômeur avec projet solide et soutenu par France Travail. RDV présentiel très positif — aptitudes manuelles testées (bon résultat test modelage). France Travail a accordé 80% de prise en charge. Les 3000€ restants sont financés sur économies personnelles. Dossier complet. Recommandé pour session sept. 2026.',
    notes: 'Accord France Travail du 28/01 : prise en charge 12000€. Reste 3000€ auto-financé. Dossier bouclé le 05/02.',
    dateCandidature: date(2025, 11, 22),
  },
  {
    prospectIdx: 4, // Adrienne Robin
    numeroDossier: 'ROBI-ADRI-080126',
    formationRetenue: 'GEMMO_N1', idFormationRetenue: ID_FORMATION_GEMMO_N1,
    sessionVisee: 'Avril 2026',
    modeFinancement: 'Personnel',
    montantTotal: 1050, montantPEC: 0, resteACharge: 1050,
    statutDossier: 'ENTRETIEN_PLANIFIE', statutFinancement: 'EN_ATTENTE',
    score: 90,
    entretienTel: true, dateEntretienTel: date(2026, 2, 5),
    rdvPresentiel: false,
    devisEnvoye: false,
    notesIa: 'Projet ultra-cohérent — gemmologie en complément de son activité boutique minéraux. Entretien téléphonique exceptionnel : connaissance des pierres déjà très avancée. RDV présentiel planifié le 25/02. Financement personnel sans contrainte. Forte probabilité d\'acceptation.',
    notes: 'Entretien présentiel planifié : mardi 25/02 à 14h. Dossier complet reçu.',
    dateCandidature: date(2026, 1, 10),
  },
  {
    prospectIdx: 0, // on crée un 6e candidat lié au même type de prospect
    numeroDossier: 'LEDO-THEO-150126',
    formationRetenue: 'BIJ_CR_N2', idFormationRetenue: ID_FORMATION_BIJ_N2,
    sessionVisee: 'Juin 2026',
    modeFinancement: 'OPCO',
    montantTotal: 1130, montantPEC: 1130, resteACharge: 0,
    statutDossier: 'ENTRETIEN_PLANIFIE', statutFinancement: 'EN_COURS',
    score: 82,
    entretienTel: true, dateEntretienTel: date(2026, 2, 12),
    rdvPresentiel: false,
    devisEnvoye: false,
    notesIa: 'Bijoutier salarié avec 3 ans d\'expérience. Entretien téléphonique positif. Niveau N2 validé par le formateur Sophie Petit après test de niveau. OPCO Constructys en cours de traitement.',
    notes: 'Entretien niveau avec Sophie Petit — confirmé N2. OPCO déposé le 18/02.',
    dateCandidature: date(2026, 1, 16),
  },
  {
    prospectIdx: 1,
    numeroDossier: 'DEVA-MATH-050226',
    formationRetenue: 'SERTI_N2', idFormationRetenue: ID_FORMATION_SERTI_N2,
    sessionVisee: 'Mai 2026',
    modeFinancement: 'Personnel',
    montantTotal: 1330, montantPEC: 0, resteACharge: 1330,
    statutDossier: 'DEVIS_ENVOYE', statutFinancement: 'EN_ATTENTE',
    score: 88,
    entretienTel: true, dateEntretienTel: date(2026, 2, 10),
    rdvPresentiel: true, dateRdvPresentiel: date(2026, 2, 17),
    devisEnvoye: true, dateDevis: date(2026, 2, 19),
    notesIa: 'Sertisseur expérimenté avec 4 ans pratique. Très bon résultat au test de niveau N2. Accepté par le jury. Devis envoyé le 19/02. En attente de signature. Financement personnel confirmé.',
    notes: 'Devis 1330€ envoyé par email le 19/02. Relance prévue le 26/02 si pas de retour.',
    dateCandidature: date(2026, 2, 5),
  },
  {
    prospectIdx: 2,
    numeroDossier: 'CHAM-PIER-120126',
    formationRetenue: 'JOAILL_N2', idFormationRetenue: ID_FORMATION_JOAILL_N2,
    sessionVisee: 'Avril 2026',
    modeFinancement: 'OPCO',
    montantTotal: 1130, montantPEC: 1130, resteACharge: 0,
    statutDossier: 'DEVIS_ENVOYE', statutFinancement: 'EN_COURS',
    score: 91,
    entretienTel: true, dateEntretienTel: date(2026, 1, 28),
    rdvPresentiel: true, dateRdvPresentiel: date(2026, 2, 10),
    devisEnvoye: true, dateDevis: date(2026, 2, 14),
    notesIa: 'Joaillière avec 6 ans d\'expérience — profil expert. Test de niveau N2 réussi brillamment. Jury a validé avec enthousiasme. OPCO Agefice accord oral reçu. Devis envoyé. Très haute probabilité de concrétisation.',
    notes: 'Devis envoyé le 14/02. OPCO accord oral le 17/02. Accord écrit attendu cette semaine.',
    dateCandidature: date(2026, 1, 14),
  },
  {
    prospectIdx: 3,
    numeroDossier: 'THOM-ALEX-120126',
    formationRetenue: 'CAP_BJ', idFormationRetenue: ID_FORMATION_CAP,
    sessionVisee: 'Septembre 2026',
    modeFinancement: 'CPF',
    montantTotal: 15000, montantPEC: 15000, resteACharge: 0,
    statutDossier: 'ACCEPTE', statutFinancement: 'VALIDE',
    score: 95,
    entretienTel: true, dateEntretienTel: date(2025, 12, 20),
    rdvPresentiel: true, dateRdvPresentiel: date(2026, 1, 15),
    devisEnvoye: true, dateDevis: date(2026, 1, 25),
    notesIa: 'Profil exceptionnel. Reconversion depuis la médecine — rigueur, précision et motivation exemplaires. Test aptitude manuel excellent. CPF validé intégralement. Devis signé le 02/02. Accepté à l\'unanimité du jury. Inscrit pour sept. 2026.',
    notes: 'ACCEPTÉ — décision jury du 28/01. CPF validé 15000€. Devis signé le 02/02. En attente d\'inscription formelle pour la session septembre.',
    dateCandidature: date(2025, 12, 14),
  },
  {
    prospectIdx: 4,
    numeroDossier: 'PELL-SARA-150126',
    formationRetenue: 'EMAIL_N1', idFormationRetenue: ID_FORMATION_EMAIL_N1,
    sessionVisee: 'Juin 2026',
    modeFinancement: 'Personnel',
    montantTotal: 1280, montantPEC: 0, resteACharge: 1280,
    statutDossier: 'DOSSIER_EN_COURS', statutFinancement: 'EN_ATTENTE',
    score: 74,
    entretienTel: true, dateEntretienTel: date(2026, 2, 18),
    rdvPresentiel: false,
    devisEnvoye: false,
    notesIa: 'Céramiste avec bases en émail. Transition naturelle vers émail bijouterie. Entretien positif. Dossier en cours — manque assurance civile et portfolio.',
    notes: 'Entretien 18/02 positif. Dossier en attente CNI verso + assurance civile.',
    dateCandidature: date(2026, 1, 16),
  },
]

// ─── 5. DONNÉES ÉLÈVES ────────────────────────────────────────────────────────

interface EleveData {
  prospectIdx: number // index dans PROSPECTS_ELEVES
  idUtilisateur: number
  numeroDossier: string
  formationSuivie: string
  idFormation: number
  idSession: number
  idFormateur: number
  dateDebut: Date
  dateFinPrevue: Date
  dateFinReelle?: Date
  statutFormation: 'EN_COURS' | 'TERMINE' | 'ABANDONNE'
  motifAbandon?: string
  notesGenerales: string
  analyseIa: string
}

const ELEVES_DATA: EleveData[] = [
  {
    prospectIdx: 0, idUtilisateur: 12, // Léa Blanc
    numeroDossier: 'BLAN-LEA-010925',
    formationSuivie: 'CAP_BJ', idFormation: ID_FORMATION_CAP, idSession: ID_SESSION_CAP, idFormateur: ID_FORMATEUR_PHILIPPE,
    dateDebut: date(2025, 9, 1), dateFinPrevue: date(2026, 6, 30),
    statutFormation: 'EN_COURS',
    notesGenerales: 'Très bonne élève. Progression régulière et constante. Excellente participation en atelier.',
    analyseIa: 'Léa démontre une aptitude naturelle pour les techniques bijoutières. Son parcours mode lui confère une sensibilité esthétique remarquable. Points forts : finition et polissage. Point d\'amélioration : précision du tracé. Probabilité de réussite CAP : 88%.',
  },
  {
    prospectIdx: 1, idUtilisateur: 13, // Hugo Guérin
    numeroDossier: 'GUER-HUGO-010925',
    formationSuivie: 'CAP_BJ', idFormation: ID_FORMATION_CAP, idSession: ID_SESSION_CAP, idFormateur: ID_FORMATEUR_PHILIPPE,
    dateDebut: date(2025, 9, 1), dateFinPrevue: date(2026, 6, 30),
    statutFormation: 'EN_COURS',
    notesGenerales: 'Bon élève, régulier. Quelques difficultés initiales en soudure mais bonne progression.',
    analyseIa: 'Hugo montre de la rigueur et de la persévérance. Quelques difficultés techniques initiales en soudure qui se résorbent. Ses connaissances en matériaux (ingénierie) sont un atout. Probabilité de réussite CAP : 82%.',
  },
  {
    prospectIdx: 2, idUtilisateur: 14, // Alice Faure
    numeroDossier: 'FAUR-ALIC-011025',
    formationSuivie: 'BIJ_CR_N1', idFormation: ID_FORMATION_BIJ_N1, idSession: ID_SESSION_INIT, idFormateur: ID_FORMATEUR_SOPHIE,
    dateDebut: date(2025, 10, 6), dateFinPrevue: date(2025, 11, 14),
    statutFormation: 'EN_COURS',
    notesGenerales: 'Élève enthousiaste et créative. S\'investit pleinement dans les exercices.',
    analyseIa: 'Alice apporte une créativité débordante mais doit travailler la précision technique. Ses pièces sont originales, mais les finitions sont à consolider. Forte motivation.',
  },
  {
    prospectIdx: 3, idUtilisateur: 15, // Louis André
    numeroDossier: 'ANDR-LOUI-150925',
    formationSuivie: 'SERTI_N1', idFormation: ID_FORMATION_SERTI_N1, idSession: ID_SESSION_PERF, idFormateur: ID_FORMATEUR_JEAN_PIERRE,
    dateDebut: date(2025, 9, 15), dateFinPrevue: date(2025, 10, 24),
    statutFormation: 'EN_COURS',
    notesGenerales: 'Expérience préalable visible. Progression rapide sur les techniques de serti griffe.',
    analyseIa: 'Louis a déjà manipulé des outils de bijouterie en autodidacte. Sa progression est plus rapide que la moyenne. Recommandation : l\'orienter vers N2 à l\'issue du N1.',
  },
  {
    prospectIdx: 4, idUtilisateur: 16, // Inès Chevalier
    numeroDossier: 'CHEV-INES-200825',
    formationSuivie: 'JOAILL_N1', idFormation: ID_FORMATION_JOAILL_N1, idSession: ID_SESSION_PERF, idFormateur: ID_FORMATEUR_CATHERINE,
    dateDebut: date(2025, 10, 6), dateFinPrevue: date(2025, 11, 7),
    statutFormation: 'EN_COURS',
    notesGenerales: 'Très bonne sensibilité artistique. Travail soigné, très bonne maîtrise de l\'outil.',
    analyseIa: 'Inès a une maîtrise rapide des outils joailliers. Sensibilité aux pierres et aux montures remarquable. Profil à orienter vers la haute joaillerie. Recommandation : JOAILL N2.',
  },
  {
    prospectIdx: 5, idUtilisateur: 17, // Tom François
    numeroDossier: 'FRAN-TOM-010925',
    formationSuivie: 'CISEL_N1', idFormation: ID_FORMATION_CISEL_N1, idSession: ID_SESSION_PERF, idFormateur: ID_FORMATEUR_FRANCOIS,
    dateDebut: date(2025, 10, 13), dateFinPrevue: date(2025, 11, 21),
    statutFormation: 'EN_COURS',
    notesGenerales: 'Mains habiles, bon sens du volume. S\'adapte bien aux contraintes techniques.',
    analyseIa: 'Tom transfère bien ses compétences sculpturales vers la ciselure métal. Bonne compréhension du volume et du relief. Technique encore à affiner.',
  },
  {
    prospectIdx: 6, idUtilisateur: 18, // Manon Lambert
    numeroDossier: 'LAMB-MANO-050925',
    formationSuivie: 'EMAIL_N1', idFormation: ID_FORMATION_EMAIL_N1, idSession: ID_SESSION_PERF, idFormateur: ID_FORMATEUR_ISABELLE,
    dateDebut: date(2025, 10, 20), dateFinPrevue: date(2025, 11, 28),
    statutFormation: 'EN_COURS',
    notesGenerales: 'Connaissance préalable de l\'émail céramique. Transition vers l\'émail bijouterie très bien assimilée.',
    analyseIa: 'Manon maîtrise les fondamentaux de l\'émail grâce à son background céramiste. La manipulation des outils bijoutiers est la principale nouveauté. Progression rapide. Émail cloisonné en perspective.',
  },
  {
    prospectIdx: 7, idUtilisateur: 19, // Victor Perrin
    numeroDossier: 'PERR-VICT-010425',
    formationSuivie: 'GEMMO_N1', idFormation: ID_FORMATION_GEMMO_N1, idSession: ID_SESSION_INIT, idFormateur: ID_FORMATEUR_MICHEL,
    dateDebut: date(2025, 4, 7), dateFinPrevue: date(2025, 5, 9),
    dateFinReelle: date(2025, 5, 9),
    statutFormation: 'TERMINE',
    notesGenerales: 'Excellent élève. A terminé la formation avec la meilleure note de la session.',
    analyseIa: 'Victor a terminé GEMMO N1 avec distinction. Sa culture minéralogique préalable lui a permis d\'exceller. Installé à son compte depuis juillet 2025. Recommandé pour GEMMO N2.',
  },
  {
    prospectIdx: 8, idUtilisateur: 20, // Zoé Morel
    numeroDossier: 'MORE-ZOE-010525',
    formationSuivie: 'BIJ_CR_N2', idFormation: ID_FORMATION_BIJ_N2, idSession: ID_SESSION_INIT, idFormateur: ID_FORMATEUR_SOPHIE,
    dateDebut: date(2025, 5, 5), dateFinPrevue: date(2025, 6, 13),
    dateFinReelle: date(2025, 6, 13),
    statutFormation: 'TERMINE',
    notesGenerales: 'Formation terminée avec succès. Maîtrise des techniques de soudure et assemblage avancés.',
    analyseIa: 'Zoé a terminé BIJ N2 avec d\'excellents résultats. Grande maîtrise technique. Prépare l\'ouverture de son atelier. Candidate naturelle pour N3.',
  },
  {
    prospectIdx: 9, idUtilisateur: 21, // Mathis Simon
    numeroDossier: 'SIMO-MATH-010625',
    formationSuivie: 'SERTI_N2', idFormation: ID_FORMATION_SERTI_N2, idSession: ID_SESSION_PERF, idFormateur: ID_FORMATEUR_JEAN_PIERRE,
    dateDebut: date(2025, 6, 2), dateFinPrevue: date(2025, 7, 11),
    dateFinReelle: date(2025, 6, 27),
    statutFormation: 'ABANDONNE',
    motifAbandon: 'Opportunité d\'emploi en atelier de sertissage à Lille — CDI. A préféré saisir l\'opportunité immédiatement. Accord amiable avec l\'ABJ. Peut reprendre N2 ultérieurement.',
    notesGenerales: 'A suivi 4 semaines sur 6 avant abandon volontaire pour motif professionnel. Bon niveau acquis.',
    analyseIa: 'Abandon non lié à des difficultés académiques — opportunité d\'emploi. Le niveau acquis en 4 semaines était bon (serti griffe et clos maîtrisés). Peut reprendre N2 depuis la semaine 5 si désire compléter.',
  },
]

// ─── SCRIPT PRINCIPAL ─────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Reset + Seed — Prospects / Candidats / Élèves')
  console.log('═══════════════════════════════════════════════════════')

  // ─── RESET ───────────────────────────────────────────────────────────────
  console.log('\n🗑️  Suppression des données existantes...')

  await prisma.presence.deleteMany({})
  await prisma.evaluation.deleteMany({})
  await prisma.inscriptionSession.deleteMany({})
  await prisma.eleve.deleteMany({})
  await prisma.documentCandidat.deleteMany({})
  await prisma.candidat.deleteMany({})
  await prisma.historiqueEmail.deleteMany({})
  await prisma.prospect.deleteMany({})

  console.log('   ✅ Tables vidées : presences, evaluations, inscriptions_sessions, eleves, documents_candidat, candidats, historique_emails, prospects')

  // ─── SEED PROSPECTS PURS ──────────────────────────────────────────────────
  console.log('\n👥 Création des prospects...')

  const allProspectData = [
    ...PROSPECTS_NOUVEAU,
    ...PROSPECTS_EN_ATTENTE,
    ...PROSPECTS_ANCIEN_CANDIDAT,
    ...PROSPECTS_ANCIEN_ELEVE,
    ...PROSPECTS_CANDIDATS,
    ...PROSPECTS_ELEVES,
  ]

  for (const p of allProspectData) {
    await prisma.prospect.create({
      data: {
        idProspect: p.idProspect,
        nom: p.nom,
        prenom: p.prenom,
        emails: p.emails,
        telephones: p.telephones,
        ville: p.ville ?? null,
        codePostal: p.codePostal ?? null,
        formationPrincipale: p.formationPrincipale ?? null,
        formationsSouhaitees: p.formationsSouhaitees ?? [],
        modeFinancement: p.modeFinancement ?? null,
        situationActuelle: (p as any).situationActuelle ?? null,
        projetProfessionnel: (p as any).projetProfessionnel ?? null,
        resumeIa: p.resumeIa ?? null,
        statutProspect: p.statutProspect,
        sourceOrigine: p.sourceOrigine ?? null,
        messageInitial: p.messageInitial ?? null,
        nbEchanges: p.nbEchanges ?? 0,
        datePremierContact: p.datePremierContact ?? null,
        dateDernierContact: p.dateDernierContact ?? null,
        dossierEnvoyeLe: (p as any).dossierEnvoyeLe ?? null,
        statutDossier: (p as any).statutDossier ?? 'AUCUN',
        notes: (p as any).notes ?? null,
      }
    })
  }

  const totalProspects = await prisma.prospect.count()
  console.log(`   ✅ ${totalProspects} prospects créés`)

  // ─── SEED CANDIDATS ───────────────────────────────────────────────────────
  console.log('\n📋 Création des candidats...')

  // Candidats 0-4 liés à PROSPECTS_CANDIDATS (idx 0-4)
  // Candidats 5-9 : on réutilise certains prospects candidats (idx 0-4 réemployés)
  // On crée 10 candidats au total liés aux 5 prospects "CANDIDAT" + des prospects séparés
  // Pour simplifier : les 10 candidats sont tous liés à leurs propres prospects
  // (PROSPECTS_CANDIDATS a 5 entrées, on duplique les 5 derniers candidats avec d'autres prospects)

  const prospectsCandidatIds = PROSPECTS_CANDIDATS.map(p => p.idProspect)
  const candidatIds: number[] = []

  // On assigne : candidats 0-4 → prospects 0-4, candidats 5-9 → prospects 0-4 (réutilisés)
  for (let i = 0; i < CANDIDATS_DATA.length; i++) {
    const c = CANDIDATS_DATA[i]
    const idProspect = prospectsCandidatIds[c.prospectIdx % prospectsCandidatIds.length]

    const created = await prisma.candidat.create({
      data: {
        idProspect,
        numeroDossier: c.numeroDossier,
        formationsDemandees: [c.formationRetenue],
        formationRetenue: c.formationRetenue,
        sessionVisee: c.sessionVisee,
        modeFinancement: c.modeFinancement,
        montantTotalFormation: c.montantTotal,
        montantPriseEnCharge: c.montantPEC,
        resteACharge: c.resteACharge,
        statutDossier: c.statutDossier,
        statutFinancement: c.statutFinancement,
        statutInscription: 'EN_COURS',
        entretienTelephonique: c.entretienTel,
        dateEntretienTel: c.dateEntretienTel ?? null,
        rdvPresentiel: c.rdvPresentiel,
        dateRdvPresentiel: c.dateRdvPresentiel ?? null,
        devisEnvoye: c.devisEnvoye,
        dateDevis: c.dateDevis ?? null,
        score: c.score,
        notesIa: c.notesIa,
        notes: c.notes,
        dateCandidature: c.dateCandidature,
      }
    })
    candidatIds.push(created.idCandidat)

    // Documents requis : créer quelques documents pour chaque candidat
    const docsACreer = [
      { typeDocument: 'CNI_RECTO', statut: 'VALIDE', obligatoire: true },
      { typeDocument: 'CV', statut: 'VALIDE', obligatoire: true },
      // Certains ont des docs manquants
      { typeDocument: 'ASSURANCE_CIVILE', statut: i < 3 ? 'ATTENDU' : 'VALIDE', obligatoire: true },
      { typeDocument: 'DEVIS_SIGNE', statut: c.devisEnvoye ? (i < 7 ? 'ATTENDU' : 'VALIDE') : 'ATTENDU', obligatoire: true },
    ]
    if (c.formationRetenue === 'CAP_BJ') {
      docsACreer.push({ typeDocument: 'LETTRE_MOTIVATION', statut: 'VALIDE', obligatoire: true })
      docsACreer.push({ typeDocument: 'BULLETINS_SCOLAIRES', statut: i === 3 ? 'VALIDE' : 'RECU', obligatoire: true })
    }

    for (const doc of docsACreer) {
      await prisma.documentCandidat.create({
        data: {
          idProspect,
          numeroDossier: c.numeroDossier,
          typeDocument: doc.typeDocument,
          categorie: ['ASSURANCE_CIVILE', 'DEVIS_SIGNE'].includes(doc.typeDocument) ? 'administratif' : 'candidature',
          statut: doc.statut,
          obligatoire: doc.obligatoire,
          dateReception: doc.statut !== 'ATTENDU' ? date(2026, 2, 1) : null,
          dateValidation: doc.statut === 'VALIDE' ? date(2026, 2, 5) : null,
        }
      })
    }
  }

  const totalCandidats = await prisma.candidat.count()
  console.log(`   ✅ ${totalCandidats} candidats créés`)

  // ─── SEED ÉLÈVES ─────────────────────────────────────────────────────────
  console.log('\n🎓 Création des élèves...')

  const eleveIds: number[] = []

  for (let i = 0; i < ELEVES_DATA.length; i++) {
    const e = ELEVES_DATA[i]
    const idProspect = PROSPECTS_ELEVES[e.prospectIdx].idProspect

    // Créer un candidat intermédiaire pour l'élève
    const candidatEleve = await prisma.candidat.create({
      data: {
        idProspect,
        numeroDossier: e.numeroDossier,
        formationsDemandees: [e.formationSuivie],
        formationRetenue: e.formationSuivie,
        modeFinancement: 'Personnel',
        montantTotalFormation: e.formationSuivie === 'CAP_BJ' ? 15000 : 1130,
        montantPriseEnCharge: e.formationSuivie === 'CAP_BJ' ? 12000 : 1130,
        resteACharge: e.formationSuivie === 'CAP_BJ' ? 3000 : 0,
        statutDossier: 'INSCRIT',
        statutFinancement: 'VALIDE',
        statutInscription: 'VALIDEE',
        entretienTelephonique: true,
        rdvPresentiel: true,
        devisEnvoye: true,
        score: 80 + Math.floor(Math.random() * 15),
        dateCandidature: new Date(e.dateDebut.getTime() - 60 * 24 * 60 * 60 * 1000),
      }
    })

    const eleve = await prisma.eleve.create({
      data: {
        idCandidat: candidatEleve.idCandidat,
        idUtilisateur: e.idUtilisateur,
        numeroDossier: e.numeroDossier,
        formationSuivie: e.formationSuivie,
        dateDebut: e.dateDebut,
        dateFinPrevue: e.dateFinPrevue,
        dateFinReelle: e.dateFinReelle ?? null,
        statutFormation: e.statutFormation,
        motifAbandon: e.motifAbandon ?? null,
        notesGenerales: e.notesGenerales,
        analyseIa: e.analyseIa,
      }
    })

    eleveIds.push(eleve.idEleve)

    // Inscription à la session
    await prisma.inscriptionSession.create({
      data: {
        idEleve: eleve.idEleve,
        idSession: e.idSession,
        dateInscription: new Date(e.dateDebut.getTime() - 30 * 24 * 60 * 60 * 1000),
        statutInscription: 'CONFIRME',
        dateConfirmation: new Date(e.dateDebut.getTime() - 15 * 24 * 60 * 60 * 1000),
      }
    })

    // Évaluations (seulement pour élèves EN_COURS et TERMINE)
    if (e.statutFormation !== 'ABANDONNE') {
      const nbEvals = e.statutFormation === 'TERMINE' ? 3 : 2
      for (let j = 0; j < nbEvals; j++) {
        const note = 11 + Math.random() * 8 // Note entre 11 et 19
        await prisma.evaluation.create({
          data: {
            idEleve: eleve.idEleve,
            idSession: e.idSession,
            idFormateur: e.idFormateur,
            typeEvaluation: j === 0 ? 'CONTROLE_CONTINU' : j === 1 ? 'EXAMEN_BLANC' : 'EXAMEN_FINAL',
            dateEvaluation: new Date(e.dateDebut.getTime() + (j + 1) * 14 * 24 * 60 * 60 * 1000),
            note: Math.round(note * 10) / 10,
            noteSur: 20,
            commentaire: j === 0
              ? 'Bonne progression, techniques de base bien assimilées.'
              : j === 1 ? 'Amélioration notable, qualité des finitions à travailler.'
              : 'Résultat final satisfaisant. Objectifs atteints.',
            competencesValidees: ['Utilisation des outils', 'Sécurité atelier'],
            valideParAdmin: e.statutFormation === 'TERMINE',
          }
        })
      }
    }

    // Présences (quelques entrées réalistes)
    const nbPresences = e.statutFormation === 'ABANDONNE' ? 4 : e.statutFormation === 'TERMINE' ? 6 : 4
    for (let j = 0; j < nbPresences; j++) {
      const absenceRandom = Math.random()
      const statut = absenceRandom > 0.88 ? 'ABSENT_JUSTIFIE' : absenceRandom > 0.95 ? 'ABSENT' : 'PRESENT'
      await prisma.presence.create({
        data: {
          idEleve: eleve.idEleve,
          idSession: e.idSession,
          dateCours: new Date(e.dateDebut.getTime() + j * 7 * 24 * 60 * 60 * 1000),
          demiJournee: 'JOURNEE_COMPLETE',
          statutPresence: statut,
          justificatifFourni: statut === 'ABSENT_JUSTIFIE',
          motifAbsence: statut !== 'PRESENT' ? 'Raison personnelle' : null,
          saisiPar: `Formateur ${e.idFormateur}`,
        }
      })
    }
  }

  const totalEleves = await prisma.eleve.count()
  const totalEvals = await prisma.evaluation.count()
  const totalPresences = await prisma.presence.count()
  console.log(`   ✅ ${totalEleves} élèves créés`)
  console.log(`   ✅ ${totalEvals} évaluations créées`)
  console.log(`   ✅ ${totalPresences} présences créées`)

  // ─── RÉSUMÉ ───────────────────────────────────────────────────────────────
  console.log('\n📊 Résumé final :')

  const parStatut = await prisma.prospect.groupBy({ by: ['statutProspect'], _count: true, orderBy: { statutProspect: 'asc' } })
  console.log('\n   Prospects par statut :')
  for (const s of parStatut) {
    console.log(`     ${s.statutProspect?.padEnd(22)} : ${s._count}`)
  }

  const parStatutCandidat = await prisma.candidat.groupBy({ by: ['statutDossier'], _count: true, orderBy: { statutDossier: 'asc' } })
  console.log('\n   Candidats par statut dossier :')
  for (const s of parStatutCandidat) {
    console.log(`     ${s.statutDossier.padEnd(25)} : ${s._count}`)
  }

  const parStatutEleve = await prisma.eleve.groupBy({ by: ['statutFormation'], _count: true, orderBy: { statutFormation: 'asc' } })
  console.log('\n   Élèves par statut formation :')
  for (const s of parStatutEleve) {
    console.log(`     ${(s.statutFormation ?? '').padEnd(15)} : ${s._count}`)
  }

  console.log('\n✅ Seed terminé avec succès !\n')
}

main()
  .catch(e => {
    console.error('❌ Erreur :', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
