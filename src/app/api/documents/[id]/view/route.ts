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
        urlMinio: true,
        cheminMinio: true,
        mimeType: true,
        statut: true,
      },
    })

    if (!doc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    // Résoudre la clé MinIO : minio_key en priorité, sinon extraire depuis url_minio ou chemin_minio
    const resolvedKey = resolveMinioKey(doc.minioKey, doc.urlMinio, doc.cheminMinio)

    if (!resolvedKey) {
      return NextResponse.json({ error: 'Fichier non disponible (aucune clé MinIO trouvée)' }, { status: 404 })
    }

    const bucket = doc.minioBucket || MINIO_BUCKET

    // Récupérer le stream depuis MinIO
    const stream = await minioClient.getObject(bucket, resolvedKey)

    // Déterminer le Content-Type
    const contentType = doc.mimeType || detectMimeFromKey(resolvedKey)

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

    const filename = doc.nomFichier || resolvedKey.split('/').pop() || 'document'
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

/**
 * Résout la clé MinIO depuis les différentes colonnes possibles
 * n8n peut écrire dans minio_key, url_minio ou chemin_minio
 */
function resolveMinioKey(
  minioKey: string | null,
  urlMinio: string | null,
  cheminMinio: string | null
): string | null {
  // 1. Clé directe (upload via CRM)
  if (minioKey) return minioKey

  // 2. chemin_minio (chemin relatif dans le bucket)
  if (cheminMinio) return cheminMinio

  // 3. url_minio — extraire le chemin après le bucket
  // Format typique : http://host:9000/bucket/chemin/vers/fichier.pdf
  if (urlMinio) {
    try {
      const url = new URL(urlMinio)
      // pathname = /bucket/chemin/vers/fichier.pdf → supprimer /bucket/
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts.length > 1) {
        // parts[0] = bucket, le reste = clé
        return parts.slice(1).join('/')
      }
    } catch {
      // Si pas une URL valide, utiliser directement comme chemin
      return urlMinio
    }
  }

  return null
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
