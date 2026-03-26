/**
 * DocumentPreviewModal
 * Affiche un fichier document en prévisualisation (PDF inline, image, ou téléchargement)
 */

'use client'

import { X, Download, AlertCircle } from 'lucide-react'

interface DocumentPreviewModalProps {
  documentId: number
  nomFichier: string | null
  mimeType: string | null
  typeDocument: string
  onClose: () => void
}

export function DocumentPreviewModal({
  documentId,
  nomFichier,
  mimeType,
  typeDocument,
  onClose,
}: DocumentPreviewModalProps) {
  const viewUrl = `/api/documents/${documentId}/view`
  const filename = nomFichier || `${typeDocument}.bin`

  // Détecter le type depuis l'extension du nom de fichier
  // (la BDD stocke souvent application/octet-stream par défaut, notamment via n8n)
  const detectMimeFromFilename = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase()
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    return map[ext || ''] || 'application/octet-stream'
  }

  const detectedMime = detectMimeFromFilename(filename)
  const mime = (mimeType && mimeType !== 'application/octet-stream')
    ? mimeType
    : detectedMime

  const isImage = mime.startsWith('image/')
  const isPdf = mime === 'application/pdf'
  const isViewable = isImage || isPdf

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[rgb(var(--card))] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(var(--border),0.3)]">
          <div>
            <h3 className="font-semibold text-[rgb(var(--foreground))]">
              {typeDocument.replace(/_/g, ' ')}
            </h3>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
              {filename}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={viewUrl}
              download={filename}
              className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.1)] text-[rgb(var(--foreground))] rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-hidden min-h-0">
          {isPdf && (
            <iframe
              src={`${viewUrl}#toolbar=1`}
              className="w-full h-full min-h-[500px]"
              title={filename}
            />
          )}

          {isImage && (
            <div className="flex items-center justify-center h-full p-4 bg-[rgb(var(--secondary))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewUrl}
                alt={filename}
                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {!isViewable && (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
              <div className="p-4 bg-[rgba(var(--warning),0.1)] rounded-full">
                <AlertCircle className="w-10 h-10 text-[rgb(var(--warning))]" />
              </div>
              <div className="text-center">
                <p className="font-medium text-[rgb(var(--foreground))]">
                  Prévisualisation non disponible
                </p>
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                  Ce format de fichier ne peut pas être affiché directement.
                </p>
              </div>
              <a
                href={viewUrl}
                download={filename}
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Télécharger le fichier
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
