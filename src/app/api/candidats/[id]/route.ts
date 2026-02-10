/**
 * API Route: GET /api/candidats/[id]
 * Récupère les détails complets d'un candidat
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const candidatId = parseInt(id, 10)

    if (isNaN(candidatId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Récupérer le candidat complet avec relations
    const candidat = await prisma.candidat.findUnique({
      where: { idCandidat: candidatId },
      include: {
        prospect: {
          select: {
            nom: true,
            prenom: true,
            emails: true,
            telephones: true,
            nbEchanges: true,
            dateDernierContact: true
          }
        },
        documentsCandidat: {
          select: {
            idDocument: true,
            typeDocument: true,
            statut: true,
            nomFichier: true,
            obligatoire: true
          }
        }
      }
    })

    if (!candidat) {
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 })
    }

    // Mapper les codes formation vers labels
    const formationLabels: Record<string, string> = {
      'CAP_BJ': 'CAP Bijouterie-Joaillerie',
      'INIT_BJ': 'Initiation Bijouterie',
      'PERF_SERTI': 'Perfectionnement Sertissage',
      'CAO_DAO': 'CAO/DAO Bijouterie',
      'GEMMO': 'Gemmologie'
    }

    // Formater pour le frontend
    const formatted = {
      id: candidat.idCandidat,
      numero_dossier: candidat.numeroDossier,
      nom: candidat.prospect?.nom || '',
      prenom: candidat.prospect?.prenom || '',
      email: candidat.prospect?.emails?.[0] || '',
      telephone: candidat.prospect?.telephones?.[0] || '',
      formation: formationLabels[candidat.formationRetenue || ''] || candidat.formationRetenue || 'Non définie',
      session: candidat.sessionVisee || 'Non définie',
      statut_dossier: candidat.statutDossier || 'RECU',
      statut_financement: candidat.statutFinancement || 'EN_ATTENTE',
      score: candidat.score || 0,
      nb_echanges: candidat.prospect?.nbEchanges || 0,
      date_candidature: candidat.dateCandidature
        ? new Date(candidat.dateCandidature).toLocaleDateString('fr-FR')
        : '',
      dernier_contact: candidat.prospect?.dateDernierContact
        ? new Date(candidat.prospect.dateDernierContact).toLocaleDateString('fr-FR')
        : '',

      // Parcours admission
      entretien_telephonique: candidat.entretienTelephonique || false,
      date_entretien_tel: candidat.dateEntretienTel
        ? new Date(candidat.dateEntretienTel).toLocaleDateString('fr-FR')
        : null,
      rdv_presentiel: candidat.rdvPresentiel || false,
      date_rdv_presentiel: candidat.dateRdvPresentiel
        ? new Date(candidat.dateRdvPresentiel).toLocaleDateString('fr-FR')
        : null,
      test_technique: candidat.testTechnique || false,
      date_test_technique: candidat.dateTestTechnique
        ? new Date(candidat.dateTestTechnique).toLocaleDateString('fr-FR')
        : null,
      validation_pedagogique: candidat.validationPedagogique || false,
      date_validation_pedagogique: candidat.dateValidationPedagogique
        ? new Date(candidat.dateValidationPedagogique).toLocaleDateString('fr-FR')
        : null,

      // Financement
      mode_financement: candidat.modeFinancement || 'Non défini',
      montant_total: Number(candidat.montantTotalFormation || 0),
      montant_pec: Number(candidat.montantPriseEnCharge || 0),
      reste_a_charge: Number(candidat.resteACharge || 0),

      // Documents
      documents: candidat.documentsCandidat?.map(doc => ({
        id: doc.idDocument,
        type: doc.typeDocument,
        statut: doc.statut || 'ATTENDU',
        nom_fichier: doc.nomFichier,
        obligatoire: doc.obligatoire
      })) || [],

      // Notes IA
      notes_ia: candidat.notesIa || ''
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Erreur lors de la récupération du candidat:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du candidat' },
      { status: 500 }
    )
  }
}
