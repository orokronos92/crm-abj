/**
 * API Route: POST /api/documents/[id]/upload
 * Upload d'un fichier vers MinIO pour un document candidat existant
 * Utilise formData manuel (App Router — pas de bodyParser)
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { minioClient, MINIO_BUCKET, genererCleMinioDocument } from '@/lib/minio'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const docId = parseInt(id, 10)

    if (isNaN(docId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Récupérer le document en BDD pour valider et obtenir le contexte
    const doc = await prisma.documentCandidat.findUnique({
      where: { idDocument: docId },
      select: {
        idDocument: true,
        typeDocument: true,
        numeroDossier: true,
        statut: true,
      },
    })

    if (!doc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    if (!doc.numeroDossier) {
      return NextResponse.json({ error: 'Numéro de dossier manquant' }, { status: 400 })
    }

    // Parser le formData manuellement (App Router)
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validation taille (10 MB max)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 MB)' }, { status: 400 })
    }

    // Validation type MIME
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé (PDF, images, Word uniquement)' },
        { status: 400 }
      )
    }

    // Calculer l'extension depuis le nom de fichier ou le type MIME
    const originalName = file.name
    const dotIdx = originalName.lastIndexOf('.')
    const extension = dotIdx !== -1 ? originalName.slice(dotIdx) : getExtFromMime(file.type)

    // Générer la clé MinIO normalisée
    const minioKey = genererCleMinioDocument(
      doc.numeroDossier,
      doc.typeDocument,
      extension
    )

    // Convertir le File en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload vers MinIO
    await minioClient.putObject(
      MINIO_BUCKET,
      minioKey,
      buffer,
      buffer.length,
      { 'Content-Type': file.type }
    )

    // Mettre à jour le document en BDD
    const updated = await prisma.documentCandidat.update({
      where: { idDocument: docId },
      data: {
        nomFichier: originalName,
        minioKey,
        minioBucket: MINIO_BUCKET,
        mimeType: file.type,
        tailleOctets: file.size,
        statut: 'RECU',
        dateReception: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: updated.idDocument,
        nomFichier: updated.nomFichier,
        statut: updated.statut,
        minioKey: updated.minioKey,
        taille: updated.tailleOctets,
      },
    })
  } catch (error) {
    console.error('Erreur upload document:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    )
  }
}

function getExtFromMime(mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  }
  return map[mime] || '.bin'
}
