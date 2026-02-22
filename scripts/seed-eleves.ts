/**
 * Seed élèves complet
 * - Supprime et recrée tous les élèves
 * - Crée les prospects/candidats associés avec numeroDossier cohérent
 * - Crée les documents candidat liés au numeroDossier
 * - Crée les présences (structure réelle : demiJournee + statutPresence)
 * - Crée les évaluations
 * - Lie les élèves à une session existante
 */

import prisma from '../src/lib/prisma'
import { hash } from 'bcryptjs'

// ============================================
// DONNÉES ÉLÈVES
// ============================================

const ELEVES = [
  { nom: 'Blanc', prenom: 'Léa', email: 'lea.blanc@gmail.com', tel: '0612000001', formation: 'CAP_BJ', session: 'CAP Janvier 2024', dateDebut: '2024-01-15' },
  { nom: 'Guerin', prenom: 'Hugo', email: 'hugo.guerin@yahoo.fr', tel: '0623000002', formation: 'CAP_BJ', session: 'CAP Janvier 2024', dateDebut: '2024-01-15' },
  { nom: 'Faure', prenom: 'Alice', email: 'alice.faure@gmail.com', tel: '0634000003', formation: 'INIT_BJ', session: 'Initiation Février 2024', dateDebut: '2024-02-01' },
  { nom: 'Andre', prenom: 'Louis', email: 'louis.andre@outlook.fr', tel: '0645000004', formation: 'PERF_SERTI', session: 'Perfectionnement Mars 2024', dateDebut: '2024-03-01' },
  { nom: 'Chevalier', prenom: 'Ines', email: 'ines.chevalier@gmail.com', tel: '0656000005', formation: 'CAP_BJ', session: 'CAP Janvier 2024', dateDebut: '2024-01-20' },
  { nom: 'Francois', prenom: 'Tom', email: 'tom.francois@yahoo.fr', tel: '0667000006', formation: 'INIT_BJ', session: 'Initiation Février 2024', dateDebut: '2024-02-05' },
  { nom: 'Lambert', prenom: 'Manon', email: 'manon.lambert@gmail.com', tel: '0678000007', formation: 'CAP_BJ', session: 'CAP Janvier 2024', dateDebut: '2024-03-10' },
  { nom: 'Perrin', prenom: 'Victor', email: 'victor.perrin@hotmail.fr', tel: '0689000008', formation: 'PERF_SERTI', session: 'Perfectionnement Mars 2024', dateDebut: '2024-02-15' },
  { nom: 'Morel', prenom: 'Zoe', email: 'zoe.morel@gmail.com', tel: '0690000009', formation: 'INIT_BJ', session: 'Initiation Février 2024', dateDebut: '2024-03-01' },
  { nom: 'Simon', prenom: 'Mathis', email: 'mathis.simon@outlook.fr', tel: '0601000010', formation: 'CAP_BJ', session: 'CAP Janvier 2024', dateDebut: '2024-01-25' },
]

// Types de documents à créer pour chaque élève
const TYPES_DOCUMENTS = [
  { type: 'CNI_RECTO', statut: 'VALIDE', obligatoire: true },
  { type: 'CV', statut: 'VALIDE', obligatoire: true },
  { type: 'LETTRE_MOTIVATION', statut: 'VALIDE', obligatoire: true },
  { type: 'DIPLOMES', statut: 'VALIDE', obligatoire: false },
  { type: 'CONTRAT_FORMATION', statut: 'SIGNE', obligatoire: true },
  { type: 'ATTESTATION_ASSIDUITE', statut: 'GENERE', obligatoire: false },
]

// Générer une clé prospect cohérente
function makeIdProspect(email: string, nom: string, prenom: string): string {
  const local = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
  return `${local}_${nom.substring(0, 3).toLowerCase()}${prenom.substring(0, 3).toLowerCase()}`
}

// Générer un numéro de dossier au format NOPRE_JJMMAAAA
function makeNumeroDossier(nom: string, prenom: string): string {
  const no = nom.substring(0, 2).toUpperCase()
  const pre = prenom.substring(0, 2).toUpperCase()
  const date = new Date(1995, 5, 15) // date fictive fixe pour cohérence
  const jj = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const aaaa = date.getFullYear()
  return `${no}${pre}${jj}${mm}${aaaa}`
}

// Générer des présences réalistes sur 3 mois
function genererPresences(idEleve: number, idSession: number, dateDebut: Date): Array<{
  idEleve: number
  idSession: number
  dateCours: Date
  demiJournee: string
  statutPresence: string
  justificatifFourni: boolean
  motifAbsence: string | null
}> {
  const presences = []
  const statuts = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'ABSENT_JUSTIFIE', 'RETARD']
  const demiJournees = ['JOURNEE_COMPLETE', 'JOURNEE_COMPLETE', 'MATIN', 'APRES_MIDI']
  const motifs = ['Rendez-vous médical', 'Raisons personnelles', 'Transports en grève']

  const date = new Date(dateDebut)
  for (let i = 0; i < 20; i++) {
    // Avancer au prochain jour ouvrable
    date.setDate(date.getDate() + 1)
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1)
    }

    const statut = statuts[Math.floor(Math.random() * statuts.length)]
    const demiJournee = demiJournees[Math.floor(Math.random() * demiJournees.length)]
    const estAbsent = statut === 'ABSENT' || statut === 'ABSENT_JUSTIFIE'

    presences.push({
      idEleve,
      idSession,
      dateCours: new Date(date),
      demiJournee,
      statutPresence: statut,
      justificatifFourni: statut === 'ABSENT_JUSTIFIE',
      motifAbsence: estAbsent ? motifs[Math.floor(Math.random() * motifs.length)] : null,
    })
  }
  return presences
}

// Générer des évaluations réalistes
function genererEvaluations(idEleve: number, idFormateur: number, idSession: number): Array<{
  idEleve: number
  idFormateur: number
  idSession: number
  typeEvaluation: string
  dateEvaluation: Date
  note: number
  noteSur: number
  appreciation: string
  commentaire: string
}> {
  const types = ['CONTROLE_CONTINU', 'EXAMEN_BLANC', 'CONTROLE_CONTINU', 'CONTROLE_CONTINU']
  const appreciations = ['Très bien', 'Bien', 'Assez bien', 'Passable']

  return types.map((type, i) => {
    const note = Math.round((Math.random() * 8 + 10) * 10) / 10 // 10.0 à 18.0
    const idx = note >= 16 ? 0 : note >= 13 ? 1 : note >= 11 ? 2 : 3
    return {
      idEleve,
      idFormateur,
      idSession,
      typeEvaluation: type,
      dateEvaluation: new Date(2024, i + 1, 10 + i * 15),
      note,
      noteSur: 20,
      appreciation: appreciations[idx],
      commentaire: `Évaluation ${i + 1} — ${appreciations[idx]}. Progression régulière observée.`,
    }
  })
}

// ============================================
// SCRIPT PRINCIPAL
// ============================================

async function main() {
  console.log('🎓 Seed élèves complet\n')
  console.log('='.repeat(50))

  const passwordHash = await hash('password123', 10)

  // -- Récupérer un formateur existant pour les évaluations
  const formateur = await prisma.formateur.findFirst()
  if (!formateur) {
    console.error('❌ Aucun formateur en base. Lance seed-formateurs.ts d\'abord.')
    return
  }

  // -- Récupérer une session existante (requis pour presences/evaluations)
  let session = await prisma.session.findFirst()

  // Créer une session de référence si aucune n'existe
  if (!session) {
    const formation = await prisma.formation.findFirst()
    if (formation) {
      session = await prisma.session.create({
        data: {
          idFormation: formation.idFormation,
          nomSession: 'Session de référence 2024',
          dateDebut: new Date('2024-01-15'),
          dateFin: new Date('2024-12-15'),
          capaciteMax: 12,
          statutSession: 'EN_COURS',
          formateurPrincipalId: formateur.idFormateur,
        }
      })
      console.log(`  ℹ️  Session de référence créée (id: ${session.idSession})`)
    } else {
      console.error('❌ Aucune formation en base. Lance le seed principal d\'abord.')
      return
    }
  }

  // -- Nettoyage uniquement des tables élèves
  console.log('\n🗑️  Nettoyage tables élèves...')
  await prisma.presence.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.inscriptionSession.deleteMany()

  // Récupérer les IDs élèves existants pour supprimer leurs utilisateurs
  const elevesExistants = await prisma.eleve.findMany({ select: { idUtilisateur: true } })
  const idsUtilisateursEleves = elevesExistants
    .map(e => e.idUtilisateur)
    .filter((id): id is number => id !== null)

  await prisma.eleve.deleteMany()

  // Supprimer les candidats/prospects créés par ce seed (email connu)
  for (const e of ELEVES) {
    await prisma.documentCandidat.deleteMany({
      where: { candidat: { prospect: { emails: { has: e.email } } } }
    })
    await prisma.candidat.deleteMany({
      where: { prospect: { emails: { has: e.email } } }
    })
    await prisma.prospect.deleteMany({
      where: { emails: { has: e.email } }
    })
  }

  // Supprimer les utilisateurs élèves (pas l'admin)
  if (idsUtilisateursEleves.length > 0) {
    await prisma.utilisateur.deleteMany({
      where: { idUtilisateur: { in: idsUtilisateursEleves } }
    })
  }
  // Supprimer aussi les utilisateurs élèves par email connu
  await prisma.utilisateur.deleteMany({
    where: { email: { in: ELEVES.map(e => e.email) } }
  })

  console.log('✅ Tables nettoyées')

  // -- Création des élèves
  console.log('\n🎓 Création des élèves avec toutes leurs données...')

  let count = 0
  for (const eleveData of ELEVES) {
    const idProspect = makeIdProspect(eleveData.email, eleveData.nom, eleveData.prenom)
    const numeroDossier = makeNumeroDossier(eleveData.nom, eleveData.prenom)
    const dateDebut = new Date(eleveData.dateDebut)
    const dateFinPrevue = new Date(dateDebut)
    dateFinPrevue.setMonth(dateFinPrevue.getMonth() + 6)

    // 1. Prospect (statut ELEVE)
    await prisma.prospect.create({
      data: {
        idProspect,
        emails: [eleveData.email],
        telephones: [eleveData.tel],
        nom: eleveData.nom,
        prenom: eleveData.prenom,
        dateNaissance: new Date(1994, 3, 12),
        adresse: `${count + 1} rue du Louvre`,
        codePostal: '75001',
        ville: 'Paris',
        formationPrincipale: eleveData.formation,
        modeFinancement: 'CPF',
        statutProspect: 'ELEVE',
        nbEchanges: 12 + count,
        datePremierContact: new Date(2023, 10, 1),
        dateDernierContact: new Date(2024, 0, 10),
      }
    })

    // 2. Candidat INSCRIT
    const montantTotal = eleveData.formation === 'CAP_BJ' ? 8500 : eleveData.formation === 'INIT_BJ' ? 3500 : 4500
    const candidat = await prisma.candidat.create({
      data: {
        idProspect,
        numeroDossier,
        formationsDemandees: [eleveData.formation],
        formationRetenue: eleveData.formation,
        sessionVisee: eleveData.session,
        modeFinancement: 'CPF',
        montantTotalFormation: montantTotal,
        montantPriseEnCharge: montantTotal * 0.9,
        resteACharge: montantTotal * 0.1,
        statutDossier: 'INSCRIT',
        statutFinancement: 'VALIDE',
        statutInscription: 'VALIDEE',
        entretienTelephonique: true,
        dateEntretienTel: new Date(2023, 10, 15),
        rdvPresentiel: true,
        dateRdvPresentiel: new Date(2023, 10, 25),
        testTechnique: true,
        dateTestTechnique: new Date(2023, 11, 5),
        validationPedagogique: true,
        dateValidationPedagogique: new Date(2023, 11, 15),
        score: 70 + count * 3,
        notesIa: `Excellent profil. ${eleveData.prenom} ${eleveData.nom} a validé toutes les étapes du parcours d'admission. Formation ${eleveData.formation} parfaitement adaptée à son projet professionnel.`,
        dateCandidature: new Date(2023, 11, 1),
      }
    })

    // 3. Documents candidat liés au numeroDossier
    for (const docType of TYPES_DOCUMENTS) {
      await prisma.documentCandidat.create({
        data: {
          idProspect,
          numeroDossier,
          typeDocument: docType.type,
          categorie: docType.type.includes('CONTRAT') || docType.type.includes('ATTESTATION') ? 'eleve' : 'candidature',
          nomFichier: `${docType.type.toLowerCase()}_${numeroDossier}.pdf`,
          statut: docType.statut,
          obligatoire: docType.obligatoire,
          dateReception: new Date(2023, 11, 10),
          dateValidation: docType.statut === 'VALIDE' || docType.statut === 'SIGNE' ? new Date(2023, 11, 20) : null,
          validePar: 'admin@abj.fr',
        }
      })
    }

    // 4. Utilisateur élève
    const userEleve = await prisma.utilisateur.create({
      data: {
        email: eleveData.email,
        motDePasseHash: passwordHash,
        nom: eleveData.nom,
        prenom: eleveData.prenom,
        role: 'eleve',
        statutCompte: 'ACTIF',
      }
    })

    // 5. Élève
    const eleve = await prisma.eleve.create({
      data: {
        idCandidat: candidat.idCandidat,
        idUtilisateur: userEleve.idUtilisateur,
        numeroDossier,
        formationSuivie: eleveData.formation,
        dateDebut,
        dateFinPrevue,
        statutFormation: 'EN_COURS',
        notesGenerales: `${eleveData.prenom} ${eleveData.nom} progresse bien. Assiduité exemplaire et bon esprit d'équipe.`,
      }
    })

    // 6. Inscription à la session (si session en base)
    if (session) {
      await prisma.inscriptionSession.create({
        data: {
          idEleve: eleve.idEleve,
          idSession: session.idSession,
          dateInscription: dateDebut,
          statutInscription: 'CONFIRME',
          dateConfirmation: dateDebut,
        }
      })
    }

    // 7. Présences
    const idSessionPourPresences = session?.idSession ?? 1
    const presences = genererPresences(eleve.idEleve, idSessionPourPresences, dateDebut)
    for (const p of presences) {
      await prisma.presence.create({ data: p })
    }

    // 8. Évaluations
    const evaluations = genererEvaluations(
      eleve.idEleve,
      formateur.idFormateur,
      session?.idSession ?? 1
    )
    for (const ev of evaluations) {
      await prisma.evaluation.create({ data: ev })
    }

    count++
    console.log(`  ✅ ${eleveData.prenom} ${eleveData.nom} — ${numeroDossier} | ${TYPES_DOCUMENTS.length} docs | 20 présences | 4 évals`)
  }

  console.log(`\n✅ ${count} élèves créés avec données complètes`)

  // -- Vérification finale
  console.log('\n📊 Vérification finale :')
  const stats = {
    eleves: await prisma.eleve.count(),
    docs: await prisma.documentCandidat.count({ where: { categorie: { in: ['candidature', 'eleve'] } } }),
    presences: await prisma.presence.count(),
    evaluations: await prisma.evaluation.count(),
  }
  console.log(`  Élèves       : ${stats.eleves}`)
  console.log(`  Documents    : ${stats.docs}`)
  console.log(`  Présences    : ${stats.presences}`)
  console.log(`  Évaluations  : ${stats.evaluations}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
