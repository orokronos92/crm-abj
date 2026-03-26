/**
 * API Route: PATCH /api/documents/[id]/statut
 * Valider ou refuser un document candidat
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { minioClient, MINIO_BUCKET } from '@/lib/minio'

type RouteParams = {
  params: Promise<{ id: string }>
}

const STATUTS_VALIDES = ['ATTENDU', 'RECU', 'A_VALIDER', 'VALIDE', 'REFUSE', 'EXPIRE'] as const

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const docId = parseInt(id, 10)

    if (isNaN(docId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const body = await request.json()
    const { statut, commentaire, supprimerFichier } = body

    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      statut,
    }

    // Si validation ou refus, enregistrer la date
    if (statut === 'VALIDE' || statut === 'REFUSE') {
      updateData.dateValidation = new Date()
    }

    if (commentaire !== undefined) {
      updateData.commentaire = commentaire || null
    }

    // Suppression physique du fichier MinIO + vidage BDD
    if (supprimerFichier) {
      // Récupérer le chemin MinIO actuel avant de le vider
      const docActuel = await prisma.documentCandidat.findUnique({
        where: { idDocument: docId },
        select: { minioKey: true, cheminMinio: true },
      })
      const cleASupprimer = docActuel?.cheminMinio || docActuel?.minioKey || null

      if (cleASupprimer) {
        try {
          await minioClient.removeObject(MINIO_BUCKET, cleASupprimer)
        } catch (minioErr) {
          // Log mais on continue — la BDD doit être nettoyée même si MinIO échoue
          console.error('Avertissement suppression MinIO:', minioErr)
        }
      }

      updateData.minioKey = null
      updateData.urlMinio = null
      updateData.cheminMinio = null
      updateData.nomFichier = null
      updateData.mimeType = null
      updateData.tailleOctets = null
    }

    const updated = await prisma.documentCandidat.update({
      where: { idDocument: docId },
      data: updateData,
      select: {
        idDocument: true,
        typeDocument: true,
        statut: true,
        commentaire: true,
        dateValidation: true,
      },
    })

    return NextResponse.json({ success: true, document: updated })
  } catch (error) {
    console.error('Erreur mise à jour statut document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    )
  }
}
