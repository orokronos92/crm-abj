/**
 * API Route: GET /api/documents/[id]/view
 * Streame le fichier depuis MinIO directement au navigateur
 * (Pas d'URL présignée exposée — host.docker.internal inaccessible depuis le navigateur)
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { minioClient, MINIO_BUCKET } from '@/lib/minio'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const docId = parseInt(id, 10)

    if (isNaN(docId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Récupérer le document en BDD
    const doc = await prisma.documentCandidat.findUnique({
      where: { idDocument: docId },
      select: {
        idDocument: true,
        typeDocument: true,
        nomFichier: true,
        minioKey: true,
        minioBucket: true,
        mimeType: true,
        statut: true,
      },
    })

    if (!doc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    if (!doc.minioKey) {
      return NextResponse.json({ error: 'Fichier non disponible (pas de clé MinIO)' }, { status: 404 })
    }

    const bucket = doc.minioBucket || MINIO_BUCKET

    // Récupérer le stream depuis MinIO
    const stream = await minioClient.getObject(bucket, doc.minioKey)

    // Déterminer le Content-Type
    const contentType = doc.mimeType || detectMimeFromKey(doc.minioKey)

    // Streamer directement au navigateur
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk))
        })
        stream.on('end', () => {
          controller.close()
        })
        stream.on('error', (err: Error) => {
          controller.error(err)
        })
      },
    })

    const filename = doc.nomFichier || doc.minioKey.split('/').pop() || 'document'
    const disposition = contentType.startsWith('image/') || contentType === 'application/pdf'
      ? `inline; filename="${filename}"`
      : `attachment; filename="${filename}"`

    return new Response(webStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error) {
    console.error('Erreur streaming document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du fichier' },
      { status: 500 }
    )
  }
}

function detectMimeFromKey(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase()
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
  return mimeMap[ext || ''] || 'application/octet-stream'
}
