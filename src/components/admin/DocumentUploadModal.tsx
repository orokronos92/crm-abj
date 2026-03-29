/**
 * DocumentUploadModal
 * Modal guidé pour déposer un document vers un type précis
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'

interface DocumentUploadModalProps {
  documentId: number
  typeDocument: string
  numeroDossier: string
  onClose: () => void
  onSuccess: () => void
}

const TYPES_LABELS: Record<string, string> = {
  CV: 'Curriculum Vitae (CV)',
  LETTRE_MOTIVATION: 'Lettre de motivation',
  PHOTO: 'Photo d\'identité',
  DIPLOMES: 'Diplômes et attestations',
  PORTFOLIO: 'Portfolio',
  PIECE_IDENTITE: 'Pièce d\'identité',
  CNI_RECTO: 'CNI recto',
  CNI_VERSO: 'CNI verso',
  JUSTIF_DOMICILE: 'Justificatif de domicile',
  RIB: 'Relevé d\'identité bancaire (RIB)',
  DEVIS_SIGNE: 'Devis signé',
  CONTRAT_FORMATION: 'Contrat de formation',
  ATTESTATION_ASSIDUITE: 'Attestation d\'assiduité',
  ATTESTATION_FIN_FORMATION: 'Attestation de fin de formation',
  REGLEMENT_INTERIEUR: 'Règlement intérieur signé',
  ACCORD_OPCO: 'Accord de prise en charge OPCO',
  ACCORD_CPF: 'Accord CPF',
  ACCORD_POLE_EMPLOI: 'Accord France Travail',
  CONVENTION_FORMATION: 'Convention de formation',
}

const FORMATS_ACCEPTES = 'PDF, JPG, PNG, WEBP, DOC, DOCX'
const MAX_SIZE_MB = 10

export function DocumentUploadModal({
  documentId,
  typeDocument,
  numeroDossier,
  onClose,
  onSuccess,
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const typeLabel = TYPES_LABELS[typeDocument] || typeDocument.replace(/_/g, ' ')

  const validerFichier = (f: File): string | null => {
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Fichier trop volumineux (max ${MAX_SIZE_MB} MB)`
    }
    const allowedMimes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowedMimes.includes(f.type)) {
      return `Format non accepté. Formats valides : ${FORMATS_ACCEPTES}`
    }
    return null
  }

  const handleFileSelect = (selected: File) => {
    setError(null)
    const validationError = validerFichier(selected)
    if (validationError) {
      setError(validationError)
      return
    }
    setFile(selected)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/documents/${documentId}/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'upload')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch {
      setError('Erreur réseau lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !uploading) onClose() }}
    >
      <div className="bg-[rgb(var(--card))] rounded-xl w-full max-w-full sm:max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(var(--border),0.3)]">
          <div>
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Déposer un document</h3>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
              Dossier {numeroDossier} — {typeLabel}
            </p>
          </div>
          {!uploading && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            </button>
          )}
        </div>

        {/* Corps */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
                <CheckCircle className="w-8 h-8 text-[rgb(var(--success))]" />
              </div>
              <p className="font-medium text-[rgb(var(--foreground))]">Document déposé avec succès</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Statut mis à jour : REÇU</p>
            </div>
          ) : (
            <>
              {/* Zone de drop */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragging
                    ? 'border-[rgb(var(--accent))] bg-[rgba(var(--accent),0.05)]'
                    : file
                    ? 'border-[rgba(var(--success),0.5)] bg-[rgba(var(--success),0.05)]'
                    : 'border-[rgba(var(--border),0.5)] hover:border-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.03)]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                  onChange={(e) => {
                    const selected = e.target.files?.[0]
                    if (selected) handleFileSelect(selected)
                  }}
                />

                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-[rgb(var(--success))]" />
                    <p className="font-medium text-[rgb(var(--foreground))]">{file.name}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {formatSize(file.size)} — {file.type}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                      Cliquer pour changer de fichier
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-10 h-10 text-[rgb(var(--muted-foreground))]" />
                    <div>
                      <p className="font-medium text-[rgb(var(--foreground))]">
                        Glisser-déposer ou cliquer pour sélectionner
                      </p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        {FORMATS_ACCEPTES} — Max {MAX_SIZE_MB} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg">
                  <AlertCircle className="w-4 h-4 text-[rgb(var(--error))] flex-shrink-0" />
                  <p className="text-sm text-[rgb(var(--error))]">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 pb-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--border),0.3)] text-[rgb(var(--foreground))] rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2 px-5 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[rgb(var(--primary))]/30 border-t-[rgb(var(--primary))] rounded-full animate-spin" />
                  Upload en cours…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Déposer le document
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
