/**
 * Seed : Tables de référence documents + documents_requis par formation
 *
 * Ce script :
 * 1. Ajoute les statuts manquants (EXEMPTE, EXPIRE, REJETE)
 * 2. Ajoute les types de documents manquants (ASSURANCE_CIVILE, PORTFOLIO_REALISATIONS)
 * 3. Peuple documents_requis selon 3 niveaux :
 *    - CAP_BJ (diplômant, dossier complet ~10 docs)
 *    - Formations courtes N1/N2/N3 (dossier léger ~4 docs)
 *    - Ultra-courtes (Douane 4h, ateliers découverte ~2 docs)
 */

import prisma from '../src/lib/prisma'

// ─── 1. STATUTS DOCUMENTS ────────────────────────────────────────────────────

const STATUTS = [
  // Statuts existants (upsert sans écraser)
  {
    code: 'ATTENDU',
    libelle: 'Attendu',
    description: 'Document demandé, pas encore reçu',
    couleur: '#6B7280',
    ordre: 1,
    actionRequise: 'RELANCER_CANDIDAT',
  },
  {
    code: 'RECU',
    libelle: 'Reçu',
    description: 'Document reçu, en attente de validation',
    couleur: '#3B82F6',
    ordre: 2,
    actionRequise: 'VALIDER_DOCUMENT',
  },
  {
    code: 'VALIDE',
    libelle: 'Validé',
    description: 'Document validé par l\'équipe ABJ',
    couleur: '#10B981',
    ordre: 3,
    actionRequise: null,
  },
  {
    code: 'REFUSE',
    libelle: 'Refusé',
    description: 'Document refusé (illisible, non conforme, expiré)',
    couleur: '#EF4444',
    ordre: 4,
    actionRequise: 'DEMANDER_NOUVEAU_DOCUMENT',
  },
  // ── Nouveaux statuts ──
  {
    code: 'EXEMPTE',
    libelle: 'Exempté',
    description: 'Document exempté manuellement par un administrateur. Compte comme VALIDE et débloque le dossier. Toute exemption doit être justifiée.',
    couleur: '#8B5CF6', // Violet — statut exceptionnel, visible
    ordre: 5,
    actionRequise: null, // Ne bloque pas le dossier
  },
  {
    code: 'EXPIRE',
    libelle: 'Expiré',
    description: 'Document valide mais dont la date de validité est dépassée (ex : CNI, assurance)',
    couleur: '#F97316', // Orange
    ordre: 6,
    actionRequise: 'DEMANDER_RENOUVELLEMENT',
  },
  {
    code: 'REJETE',
    libelle: 'Rejeté',
    description: 'Document définitivement rejeté après plusieurs tentatives. Nécessite une action manuelle.',
    couleur: '#DC2626', // Rouge foncé
    ordre: 7,
    actionRequise: 'CONTACTER_CANDIDAT',
  },
]

// ─── 2. TYPES DE DOCUMENTS (candidats) ───────────────────────────────────────

const TYPES_DOCUMENTS = [
  // ── Candidature ──
  { code: 'CNI_RECTO',          libelle: 'Carte d\'identité (recto)',        categorie: 'candidature',   obligatoire: true,  ordreAffichage: 1,  description: 'Recto de la CNI ou passeport en cours de validité' },
  { code: 'CNI_VERSO',          libelle: 'Carte d\'identité (verso)',        categorie: 'candidature',   obligatoire: true,  ordreAffichage: 2,  description: 'Verso de la CNI' },
  { code: 'PHOTO_IDENTITE',     libelle: 'Photo d\'identité',               categorie: 'candidature',   obligatoire: false, ordreAffichage: 3,  description: 'Photo récente format identité' },
  { code: 'CV',                 libelle: 'Curriculum Vitae',                categorie: 'candidature',   obligatoire: true,  ordreAffichage: 4,  description: 'CV à jour' },
  { code: 'LETTRE_MOTIVATION',  libelle: 'Lettre de motivation',            categorie: 'candidature',   obligatoire: false, ordreAffichage: 5,  description: 'Lettre de motivation manuscrite ou dactylographiée' },
  { code: 'DIPLOMES',           libelle: 'Diplômes et attestations',        categorie: 'candidature',   obligatoire: false, ordreAffichage: 6,  description: 'Copies des diplômes et certifications obtenus' },
  { code: 'BULLETINS_SCOLAIRES',libelle: 'Bulletins scolaires',             categorie: 'candidature',   obligatoire: false, ordreAffichage: 7,  description: 'Bulletins des 2 dernières années de scolarité (pour CAP)' },
  { code: 'JUSTIF_DOMICILE',    libelle: 'Justificatif de domicile',        categorie: 'candidature',   obligatoire: false, ordreAffichage: 8,  description: 'Facture -3 mois ou attestation hébergement' },
  // ── Nouveau : Portfolio ──
  { code: 'PORTFOLIO_REALISATIONS', libelle: 'Portfolio de réalisations',   categorie: 'candidature',   obligatoire: false, ordreAffichage: 9,  description: 'Photos ou documents présentant les réalisations professionnelles (pour candidats avec expérience)' },
  // ── Administratif / Inscription ──
  { code: 'DEVIS_SIGNE',        libelle: 'Devis signé',                     categorie: 'administratif', obligatoire: true,  ordreAffichage: 10, description: 'Devis de formation signé par le candidat (ou l\'entreprise)' },
  // ── Nouveau : Assurance civile ──
  { code: 'ASSURANCE_CIVILE',   libelle: 'Attestation d\'assurance civile', categorie: 'administratif', obligatoire: true,  ordreAffichage: 11, description: 'Attestation d\'assurance responsabilité civile en cours de validité. Obligatoire pour accéder aux ateliers.' },
  // ── Financement ──
  { code: 'ACCORD_OPCO',        libelle: 'Accord de prise en charge OPCO',  categorie: 'financement',   obligatoire: false, ordreAffichage: 20, description: 'Accord de financement de l\'OPCO' },
  { code: 'ACCORD_CPF',         libelle: 'Validation CPF',                  categorie: 'financement',   obligatoire: false, ordreAffichage: 21, description: 'Validation du dossier CPF sur Mon Compte Formation' },
  { code: 'ACCORD_FRANCE_TRAVAIL', libelle: 'Accord France Travail',        categorie: 'financement',   obligatoire: false, ordreAffichage: 22, description: 'Accord de prise en charge France Travail / Pôle Emploi' },
  { code: 'CONVENTION_FORMATION', libelle: 'Convention de formation',       categorie: 'contractuel',   obligatoire: false, ordreAffichage: 30, description: 'Convention de formation signée (entreprise → ABJ)' },
  // ── Contractuel / Élève ──
  { code: 'CONTRAT_FORMATION',  libelle: 'Contrat de formation',            categorie: 'contractuel',   obligatoire: false, ordreAffichage: 31, description: 'Contrat de formation professionnelle signé' },
  { code: 'REGLEMENT_INTERIEUR', libelle: 'Règlement intérieur signé',      categorie: 'contractuel',   obligatoire: false, ordreAffichage: 32, description: 'Règlement intérieur de l\'ABJ signé par le stagiaire' },
  // ── Pédagogique ──
  { code: 'ATTESTATION_FIN',    libelle: 'Attestation de fin de formation', categorie: 'pedagogique',   obligatoire: false, ordreAffichage: 40, description: 'Attestation de fin de formation délivrée par ABJ' },
  { code: 'DIPLOME_OBTENU',     libelle: 'Diplôme obtenu',                  categorie: 'pedagogique',   obligatoire: false, ordreAffichage: 41, description: 'Copie du diplôme officiel obtenu (CAP, etc.)' },
]

// ─── 3. DOCUMENTS REQUIS PAR NIVEAU ─────────────────────────────────────────
//
// Niveau A — CAP_BJ (diplômant, 800h)
//   Candidature : CV, lettre motivation, bulletins scolaires, diplômes, CNI recto/verso
//   Inscription  : devis signé, assurance civile, contrat formation, règlement intérieur
//
// Niveau B — Formations courtes standard (N1, N2, N3 de toutes disciplines)
//   Candidature : CV (+ portfolio pour pros, non obligatoire)
//   Inscription  : devis signé, assurance civile, CNI recto/verso
//
// Niveau C — Ultra-courtes (Douane 4h, ateliers découverte)
//   Inscription uniquement : devis signé, CNI recto/verso

// Documents de niveau A (CAP — dossier complet)
const DOCS_NIVEAU_A = [
  { codeTypeDocument: 'CV',                  obligatoire: true,  ordreAffichage: 1,  commentaire: 'CV obligatoire pour le dossier CAP' },
  { codeTypeDocument: 'LETTRE_MOTIVATION',   obligatoire: true,  ordreAffichage: 2,  commentaire: 'Lettre de motivation obligatoire pour le jury d\'admission' },
  { codeTypeDocument: 'BULLETINS_SCOLAIRES', obligatoire: true,  ordreAffichage: 3,  commentaire: '2 dernières années de scolarité' },
  { codeTypeDocument: 'DIPLOMES',            obligatoire: true,  ordreAffichage: 4,  commentaire: 'Copie du diplôme le plus élevé obtenu' },
  { codeTypeDocument: 'PORTFOLIO_REALISATIONS', obligatoire: false, ordreAffichage: 5, commentaire: 'Recommandé si le candidat a déjà une expérience en bijouterie' },
  { codeTypeDocument: 'CNI_RECTO',           obligatoire: true,  ordreAffichage: 6,  commentaire: null },
  { codeTypeDocument: 'CNI_VERSO',           obligatoire: true,  ordreAffichage: 7,  commentaire: null },
  { codeTypeDocument: 'DEVIS_SIGNE',         obligatoire: true,  ordreAffichage: 8,  commentaire: 'À fournir à la confirmation d\'inscription' },
  { codeTypeDocument: 'ASSURANCE_CIVILE',    obligatoire: true,  ordreAffichage: 9,  commentaire: 'Attestation en cours de validité obligatoire pour accéder aux ateliers' },
  { codeTypeDocument: 'CONTRAT_FORMATION',   obligatoire: true,  ordreAffichage: 10, commentaire: 'Contrat de formation professionnelle signé avant le 1er jour' },
  { codeTypeDocument: 'REGLEMENT_INTERIEUR', obligatoire: true,  ordreAffichage: 11, commentaire: 'Signé lors de l\'inscription administrative' },
]

// Documents de niveau B (formations courtes standard)
const DOCS_NIVEAU_B = [
  { codeTypeDocument: 'CV',               obligatoire: true,  ordreAffichage: 1, commentaire: 'CV requis pour évaluer le niveau du candidat' },
  { codeTypeDocument: 'PORTFOLIO_REALISATIONS', obligatoire: false, ordreAffichage: 2, commentaire: 'Fortement recommandé pour les candidats avec expérience professionnelle' },
  { codeTypeDocument: 'CNI_RECTO',        obligatoire: true,  ordreAffichage: 3, commentaire: null },
  { codeTypeDocument: 'CNI_VERSO',        obligatoire: true,  ordreAffichage: 4, commentaire: null },
  { codeTypeDocument: 'DEVIS_SIGNE',      obligatoire: true,  ordreAffichage: 5, commentaire: 'À fournir à la réservation' },
  { codeTypeDocument: 'ASSURANCE_CIVILE', obligatoire: true,  ordreAffichage: 6, commentaire: 'Attestation en cours de validité obligatoire pour accéder aux ateliers' },
]

// Documents de niveau C (ultra-courtes : Douane, ateliers découverte)
const DOCS_NIVEAU_C = [
  { codeTypeDocument: 'CNI_RECTO',    obligatoire: true, ordreAffichage: 1, commentaire: 'Pièce d\'identité pour l\'inscription' },
  { codeTypeDocument: 'CNI_VERSO',    obligatoire: true, ordreAffichage: 2, commentaire: null },
  { codeTypeDocument: 'DEVIS_SIGNE',  obligatoire: true, ordreAffichage: 3, commentaire: 'Devis signé requis pour confirmer la réservation' },
]

// ─── Mapping code formation → niveau ────────────────────────────────────────

// Niveau A : CAP diplômant uniquement
const CODES_NIVEAU_A = ['CAP_BJ']

// Niveau C : ultra-courts (douane + ateliers découverte)
// Tous les codes qui commencent par DECOUV_ ou DOUANE_
const CODES_NIVEAU_C_PREFIXES = ['DECOUV_', 'DOUANE_']

// Niveau B : tout le reste (N1, N2, N3, perfectionnements, etc.)

// ─── SCRIPT PRINCIPAL ────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Seed — Référentiels documents + documents_requis')
  console.log('═══════════════════════════════════════════════════════')

  // 1. Statuts documents
  console.log('\n📋 1/3 — Statuts documents...')
  let statutsCreated = 0
  let statutsUpdated = 0
  for (const statut of STATUTS) {
    const existing = await prisma.statutDocument.findUnique({ where: { code: statut.code } })
    if (existing) {
      await prisma.statutDocument.update({ where: { code: statut.code }, data: statut })
      statutsUpdated++
    } else {
      await prisma.statutDocument.create({ data: statut })
      statutsCreated++
    }
  }
  console.log(`   ✅ ${statutsCreated} créés, ${statutsUpdated} mis à jour`)

  const total_statuts = await prisma.statutDocument.count()
  console.log(`   Total en base : ${total_statuts} statuts`)

  // 2. Types documents
  console.log('\n📄 2/3 — Types de documents...')
  let typesCreated = 0
  let typesUpdated = 0
  for (const type of TYPES_DOCUMENTS) {
    const existing = await prisma.typeDocument.findUnique({ where: { code: type.code } })
    if (existing) {
      await prisma.typeDocument.update({ where: { code: type.code }, data: type })
      typesUpdated++
    } else {
      await prisma.typeDocument.create({ data: type })
      typesCreated++
    }
  }
  console.log(`   ✅ ${typesCreated} créés, ${typesUpdated} mis à jour`)

  const total_types = await prisma.typeDocument.count()
  console.log(`   Total en base : ${total_types} types`)

  // 3. Documents requis par formation
  console.log('\n🔗 3/3 — Documents requis par formation...')

  const formations = await prisma.formation.findMany({
    select: { idFormation: true, codeFormation: true, nom: true },
    orderBy: { codeFormation: 'asc' },
  })

  console.log(`   Formations trouvées en base : ${formations.length}`)

  let docsCreated = 0
  let docsUpdated = 0
  let docsSkipped = 0

  for (const formation of formations) {
    const code = formation.codeFormation

    // Déterminer le niveau
    let niveau: 'A' | 'B' | 'C'
    if (CODES_NIVEAU_A.includes(code)) {
      niveau = 'A'
    } else if (CODES_NIVEAU_C_PREFIXES.some(prefix => code.startsWith(prefix))) {
      niveau = 'C'
    } else {
      niveau = 'B'
    }

    const docs = niveau === 'A' ? DOCS_NIVEAU_A : niveau === 'C' ? DOCS_NIVEAU_C : DOCS_NIVEAU_B

    for (const doc of docs) {
      // Vérifier que le type document existe
      const typeExists = await prisma.typeDocument.findUnique({
        where: { code: doc.codeTypeDocument }
      })
      if (!typeExists) {
        console.warn(`   ⚠️  Type document inconnu: ${doc.codeTypeDocument} — ignoré`)
        docsSkipped++
        continue
      }

      const existing = await prisma.documentRequis.findUnique({
        where: {
          idFormation_codeTypeDocument: {
            idFormation: formation.idFormation,
            codeTypeDocument: doc.codeTypeDocument,
          }
        }
      })

      if (existing) {
        await prisma.documentRequis.update({
          where: {
            idFormation_codeTypeDocument: {
              idFormation: formation.idFormation,
              codeTypeDocument: doc.codeTypeDocument,
            }
          },
          data: {
            obligatoire: doc.obligatoire,
            ordreAffichage: doc.ordreAffichage,
            commentaire: doc.commentaire ?? null,
          }
        })
        docsUpdated++
      } else {
        await prisma.documentRequis.create({
          data: {
            idFormation: formation.idFormation,
            codeTypeDocument: doc.codeTypeDocument,
            obligatoire: doc.obligatoire,
            ordreAffichage: doc.ordreAffichage,
            commentaire: doc.commentaire ?? null,
          }
        })
        docsCreated++
      }
    }
  }

  console.log(`   ✅ ${docsCreated} créés, ${docsUpdated} mis à jour, ${docsSkipped} ignorés`)

  const total_requis = await prisma.documentRequis.count()
  console.log(`   Total en base : ${total_requis} documents_requis`)

  // ── Récapitulatif par niveau ──────────────────────────────────────────────
  console.log('\n📊 Récapitulatif par niveau :')

  const niveauA = formations.filter(f => CODES_NIVEAU_A.includes(f.codeFormation))
  const niveauC = formations.filter(f => CODES_NIVEAU_C_PREFIXES.some(p => f.codeFormation.startsWith(p)))
  const niveauB = formations.filter(f => !CODES_NIVEAU_A.includes(f.codeFormation) && !CODES_NIVEAU_C_PREFIXES.some(p => f.codeFormation.startsWith(p)))

  console.log(`   Niveau A — CAP diplômant (${DOCS_NIVEAU_A.length} docs) : ${niveauA.length} formation(s)`)
  niveauA.forEach(f => console.log(`     → ${f.codeFormation} — ${f.nom}`))

  console.log(`   Niveau B — Formations courtes (${DOCS_NIVEAU_B.length} docs) : ${niveauB.length} formation(s)`)

  console.log(`   Niveau C — Ultra-courtes (${DOCS_NIVEAU_C.length} docs) : ${niveauC.length} formation(s)`)
  niveauC.forEach(f => console.log(`     → ${f.codeFormation} — ${f.nom}`))

  // ── Nouveaux statuts confirmés ────────────────────────────────────────────
  console.log('\n✨ Nouveaux statuts ajoutés :')
  console.log('   🟣 EXEMPTE — Exemption manuelle admin (compte comme VALIDE)')
  console.log('   🟠 EXPIRE  — Document dont la date de validité est dépassée')
  console.log('   🔴 REJETE  — Document définitivement rejeté')

  console.log('\n✨ Nouveaux types ajoutés :')
  console.log('   📋 ASSURANCE_CIVILE       — Obligatoire pour accéder aux ateliers')
  console.log('   📁 PORTFOLIO_REALISATIONS — Non obligatoire, recommandé pour pros')

  console.log('\n✅ Seed terminé avec succès !\n')
}

main()
  .catch(e => {
    console.error('❌ Erreur :', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
