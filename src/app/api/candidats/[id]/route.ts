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
            idProspect: true,
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
            obligatoire: true,
            minioKey: true,
            urlMinio: true,
            cheminMinio: true,
            mimeType: true
          }
        }
      }
    })

    if (!candidat) {
      return NextResponse.json({ error: 'Candidat non trouvé' }, { status: 404 })
    }

    // Récupérer les infos complètes de la formation depuis la BDD
    const formationBdd = candidat.formationRetenue
      ? await prisma.formation.findFirst({
          where: { codeFormation: candidat.formationRetenue },
          select: { idFormation: true, nom: true, codeFormation: true, tarifStandard: true }
        })
      : null

    // Formater pour le frontend
    const formatted = {
      id: candidat.idCandidat,
      id_prospect: candidat.idProspect || '',
      numero_dossier: candidat.numeroDossier,
      nom: candidat.prospect?.nom || '',
      prenom: candidat.prospect?.prenom || '',
      email: candidat.prospect?.emails?.[0] || '',
      telephone: candidat.prospect?.telephones?.[0] || '',
      formation: formationBdd?.nom || candidat.formationRetenue || 'Non choisie',
      formation_code: formationBdd?.codeFormation || candidat.formationRetenue || '',
      formation_tarif: Number(formationBdd?.tarifStandard || 0),
      id_formation: formationBdd?.idFormation || null,
      id_session: null,
      session: candidat.sessionVisee || null,
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
      valide_par_entretien_tel: candidat.valideParEntretienTel || null,
      observation_entretien_tel: candidat.observationEntretienTel || null,
      exempt_entretien_telephonique: candidat.exemptEntretienTelephonique || false,
      rdv_presentiel: candidat.rdvPresentiel || false,
      date_rdv_presentiel: candidat.dateRdvPresentiel
        ? new Date(candidat.dateRdvPresentiel).toLocaleDateString('fr-FR')
        : null,
      valide_par_rdv_presentiel: candidat.valideParRdvPresentiel || null,
      observation_rdv_presentiel: candidat.observationRdvPresentiel || null,
      exempt_rdv_presentiel: candidat.exemptRdvPresentiel || false,
      test_technique: candidat.testTechnique || false,
      date_test_technique: candidat.dateTestTechnique
        ? new Date(candidat.dateTestTechnique).toLocaleDateString('fr-FR')
        : null,
      valide_par_test_technique: candidat.valideParTestTechnique || null,
      observation_test_technique: candidat.observationTestTechnique || null,
      exempt_test_technique: candidat.exemptTestTechnique || false,
      validation_pedagogique: candidat.validationPedagogique || false,
      date_validation_pedagogique: candidat.dateValidationPedagogique
        ? new Date(candidat.dateValidationPedagogique).toLocaleDateString('fr-FR')
        : null,
      valide_par_validation_pedagogique: candidat.valideParValidationPedagogique || null,
      observation_validation_pedagogique: candidat.observationValidationPedagogique || null,
      exempt_validation_pedagogique: candidat.exemptValidationPedagogique || false,

      // Financement
      mode_financement: candidat.modeFinancement || 'Non défini',
      montant_total: Number(candidat.montantTotalFormation || 0),
      montant_pec: Number(candidat.montantPriseEnCharge || 0),
      reste_a_charge: Number(candidat.resteACharge ?? (Number(candidat.montantTotalFormation || 0) - Number(candidat.montantPriseEnCharge || 0))),

      // Documents
      documents: candidat.documentsCandidat?.map(doc => ({
        id: doc.idDocument,
        type: doc.typeDocument,
        statut: doc.statut || 'ATTENDU',
        nom_fichier: doc.nomFichier,
        obligatoire: doc.obligatoire,
        minio_key: doc.minioKey || null,
        url_minio: doc.urlMinio || null,
        chemin_minio: doc.cheminMinio || null,
        mime_type: doc.mimeType || null
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const candidatId = parseInt(id, 10)

    if (isNaN(candidatId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await request.json()
    const { formationCode, sessionNom, montantTotal } = body

    const updateData: Record<string, unknown> = {}

    if (formationCode !== undefined) {
      updateData.formationRetenue = formationCode || null
    }
    if (sessionNom !== undefined) {
      updateData.sessionVisee = sessionNom || null
    }
    if (montantTotal !== undefined) {
      updateData.montantTotalFormation = montantTotal

      // Recalculer le reste à charge en récupérant la PEC actuelle
      const current = await prisma.candidat.findUnique({
        where: { idCandidat: candidatId },
        select: { montantPriseEnCharge: true }
      })
      const pec = Number(current?.montantPriseEnCharge || 0)
      updateData.resteACharge = Math.max(0, montantTotal - pec)
    }

    await prisma.candidat.update({
      where: { idCandidat: candidatId },
      data: updateData
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du candidat:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du candidat' },
      { status: 500 }
    )
  }
}
