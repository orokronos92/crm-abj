/**
 * DocumentsOnglet
 * Affiche les documents d'un candidat avec visualisation, upload et changement de statut
 */

'use client'

import { useState } from 'react'
import { Eye, Upload, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { DocumentUploadModal } from './DocumentUploadModal'

interface Document {
  id: number
  type: string
  statut: string
  nom_fichier: string | null
  obligatoire: boolean
  minio_key?: string | null
  url_minio?: string | null
  chemin_minio?: string | null
  mime_type?: string | null
}

interface DocumentsOngletProps {
  documents: Document[]
  numeroDossier: string
  onDocumentsUpdated: () => void
}

const STATUT_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  ATTENDU: {
    label: 'Attendu',
    className: 'badge-warning',
    icon: <Clock className="w-3 h-3" />,
  },
  RECU: {
    label: 'Reçu',
    className: 'badge-info',
    icon: <FileText className="w-3 h-3" />,
  },
  A_VALIDER: {
    label: 'À valider',
    className: 'badge-warning',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  VALIDE: {
    label: 'Validé',
    className: 'badge-success',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  REFUSE: {
    label: 'Refusé',
    className: 'badge-error',
    icon: <XCircle className="w-3 h-3" />,
  },
  EXPIRE: {
    label: 'Expiré',
    className: 'badge-error',
    icon: <XCircle className="w-3 h-3" />,
  },
}

const TYPES_LABELS: Record<string, string> = {
  CV: 'Curriculum Vitae',
  LETTRE_MOTIVATION: 'Lettre de motivation',
  PHOTO: 'Photo d\'identité',
  DIPLOMES: 'Diplômes',
  PORTFOLIO: 'Portfolio',
  PIECE_IDENTITE: 'Pièce d\'identité',
  CNI_RECTO: 'CNI (recto)',
  CNI_VERSO: 'CNI (verso)',
  JUSTIF_DOMICILE: 'Justificatif domicile',
  RIB: 'RIB',
  DEVIS_SIGNE: 'Devis signé',
  CONTRAT_FORMATION: 'Contrat formation',
  ATTESTATION_ASSIDUITE: 'Attestation assiduité',
  ATTESTATION_FIN_FORMATION: 'Attestation fin formation',
  REGLEMENT_INTERIEUR: 'Règlement intérieur',
  ACCORD_OPCO: 'Accord OPCO',
  ACCORD_CPF: 'Accord CPF',
  ACCORD_POLE_EMPLOI: 'Accord France Travail',
  CONVENTION_FORMATION: 'Convention formation',
  BULLETIN_1: 'Bulletin 1er trimestre',
  BULLETIN_2: 'Bulletin 2ème trimestre',
  BULLETIN_3: 'Bulletin 3ème trimestre',
  DIPLOME_OBTENU: 'Diplôme obtenu',
}

export function DocumentsOnglet({
  documents,
  numeroDossier,
  onDocumentsUpdated,
}: DocumentsOngletProps) {
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [uploadDoc, setUploadDoc] = useState<Document | null>(null)
  const [changingStatut, setChangingStatut] = useState<number | null>(null)

  const handleChangerStatut = async (docId: number, statut: string) => {
    setChangingStatut(docId)
    try {
      const res = await fetch(`/api/documents/${docId}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      })

      if (res.ok) {
        onDocumentsUpdated()
      }
    } catch (err) {
      console.error('Erreur changement statut:', err)
    } finally {
      setChangingStatut(null)
    }
  }

  // Un fichier est disponible si minio_key, chemin_minio ou url_minio est renseigné (n8n peut écrire dans l'une ou l'autre)
  const hasFile = (doc: Document) => !!(doc.minio_key || doc.chemin_minio || doc.url_minio)

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-10 h-10 text-[rgb(var(--muted-foreground))] mx-auto mb-3" />
        <p className="text-[rgb(var(--muted-foreground))]">Aucun document requis</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => {
          const statut = STATUT_STYLES[doc.statut] || STATUT_STYLES['ATTENDU']
          const typeLabel = TYPES_LABELS[doc.type] || doc.type.replace(/_/g, ' ')
          const isChanging = changingStatut === doc.id
          const filePresent = hasFile(doc)

          return (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-4 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)] rounded-xl"
            >
              {/* Icône */}
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] flex items-center justify-center">
                <FileText className={`w-5 h-5 ${filePresent ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--muted-foreground))]'}`} />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-[rgb(var(--foreground))] truncate">
                    {typeLabel}
                  </p>
                  {doc.obligatoire && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(var(--error),0.1)] text-[rgb(var(--error))] rounded-full flex-shrink-0">
                      obligatoire
                    </span>
                  )}
                </div>
                {doc.nom_fichier ? (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] truncate mt-0.5">
                    {doc.nom_fichier}
                  </p>
                ) : (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                    Aucun fichier déposé
                  </p>
                )}
              </div>

              {/* Statut */}
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statut.className}`}>
                  {statut.icon}
                  {statut.label}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Voir */}
                {filePresent && (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 hover:bg-[rgb(var(--card))] rounded-lg transition-colors"
                    title="Visualiser"
                  >
                    <Eye className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  </button>
                )}

                {/* Upload */}
                <button
                  type="button"
                  onClick={() => setUploadDoc(doc)}
                  className="p-2 hover:bg-[rgb(var(--card))] rounded-lg transition-colors"
                  title={filePresent ? 'Remplacer le fichier' : 'Déposer le fichier'}
                >
                  <Upload className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                </button>

                {/* Valider / Refuser (uniquement si fichier présent et pas encore validé) */}
                {filePresent && doc.statut !== 'VALIDE' && doc.statut !== 'REFUSE' && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={isChanging}
                      onClick={() => handleChangerStatut(doc.id, 'VALIDE')}
                      className="p-2 hover:bg-[rgba(var(--success),0.1)] rounded-lg transition-colors disabled:opacity-50"
                      title="Valider"
                    >
                      <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                    </button>
                    <button
                      type="button"
                      disabled={isChanging}
                      onClick={() => handleChangerStatut(doc.id, 'REFUSE')}
                      className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors disabled:opacity-50"
                      title="Refuser"
                    >
                      <XCircle className="w-4 h-4 text-[rgb(var(--error))]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {previewDoc && (
        <DocumentPreviewModal
          documentId={previewDoc.id}
          nomFichier={previewDoc.nom_fichier}
          mimeType={previewDoc.mime_type || null}
          typeDocument={previewDoc.type}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {uploadDoc && (
        <DocumentUploadModal
          documentId={uploadDoc.id}
          typeDocument={uploadDoc.type}
          numeroDossier={numeroDossier}
          onClose={() => setUploadDoc(null)}
          onSuccess={() => {
            onDocumentsUpdated()
            setUploadDoc(null)
          }}
        />
      )}
    </>
  )
}
