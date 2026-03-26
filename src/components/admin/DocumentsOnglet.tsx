/**
 * DocumentsOnglet
 * Affiche tous les placeholders de documents d'un candidat, groupés par catégorie.
 * Filtre les documents de financement selon le mode de financement choisi.
 */

'use client'

import { useState, useEffect } from 'react'
import { Eye, Upload, CheckCircle, XCircle, Clock, FileText, AlertCircle, Trash2 } from 'lucide-react'
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
  idProspect: string
  modeFinancement: string
  onDocumentsUpdated: () => void
}

// Ordre et libellés des types de documents à l'étape candidature
const CANDIDATURE_TYPES = ['CV', 'LETTRE_MOTIVATION', 'DIPLOMES', 'BULLETINS_SCOLAIRES', 'JUSTIF_DOMICILE', 'PORTFOLIO_REALISATIONS', 'CNI_RECTO', 'CNI_VERSO']

// Documents financement affichés selon le mode choisi
const FINANCEMENT_PAR_MODE: Record<string, string[]> = {
  OPCO:          ['DEVIS_SIGNE', 'ACCORD_OPCO', 'CONVENTION_FORMATION'],
  CPF:           ['DEVIS_SIGNE', 'ACCORD_CPF'],
  FRANCE_TRAVAIL:['DEVIS_SIGNE', 'ACCORD_FRANCE_TRAVAIL'],
  PERSONNEL:     ['DEVIS_SIGNE'],
  ENTREPRISE:    ['DEVIS_SIGNE', 'CONVENTION_FORMATION'],
  AUTRE:         ['DEVIS_SIGNE'],
}
const FINANCEMENT_DEFAUT = ['DEVIS_SIGNE', 'ACCORD_OPCO', 'ACCORD_CPF', 'ACCORD_FRANCE_TRAVAIL', 'CONVENTION_FORMATION']

const TYPES_LABELS: Record<string, string> = {
  CV:                    'Curriculum Vitae',
  LETTRE_MOTIVATION:     'Lettre de motivation',
  DIPLOMES:              'Diplômes et attestations',
  BULLETINS_SCOLAIRES:   'Bulletins scolaires',
  JUSTIF_DOMICILE:       'Justificatif de domicile',
  PORTFOLIO_REALISATIONS:'Portfolio de réalisations',
  CNI_RECTO:             'CNI (recto)',
  CNI_VERSO:             'CNI (verso)',
  DEVIS_SIGNE:           'Devis signé',
  ACCORD_OPCO:           'Accord OPCO',
  ACCORD_CPF:            'Accord CPF',
  ACCORD_FRANCE_TRAVAIL: 'Accord France Travail',
  CONVENTION_FORMATION:  'Convention de formation',
}

const OBLIGATOIRES = new Set(['CV', 'CNI_RECTO', 'CNI_VERSO', 'DEVIS_SIGNE'])

const STATUT_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  ATTENDU:   { label: 'Attendu',   className: 'badge-warning', icon: <Clock className="w-3 h-3" /> },
  RECU:      { label: 'Reçu',      className: 'badge-info',    icon: <FileText className="w-3 h-3" /> },
  A_VALIDER: { label: 'À valider', className: 'badge-warning', icon: <AlertCircle className="w-3 h-3" /> },
  VALIDE:    { label: 'Validé',    className: 'badge-success', icon: <CheckCircle className="w-3 h-3" /> },
  REFUSE:    { label: 'Refusé',    className: 'badge-error',   icon: <XCircle className="w-3 h-3" /> },
  EXPIRE:    { label: 'Expiré',    className: 'badge-error',   icon: <XCircle className="w-3 h-3" /> },
  EXEMPTE:   { label: 'Exempté',   className: 'badge-info',    icon: <CheckCircle className="w-3 h-3" /> },
}

// Crée un placeholder virtuel pour un type manquant (id=0 = pas encore en base)
function makePlaceholder(type: string): Document {
  return {
    id: 0,
    type,
    statut: 'ATTENDU',
    nom_fichier: null,
    obligatoire: OBLIGATOIRES.has(type),
    minio_key: null,
    url_minio: null,
    chemin_minio: null,
    mime_type: null,
  }
}

export function DocumentsOnglet({
  documents,
  numeroDossier,
  idProspect,
  modeFinancement,
  onDocumentsUpdated,
}: DocumentsOngletProps) {
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [uploadDoc, setUploadDoc] = useState<Document | null>(null)
  const [changingStatut, setChangingStatut] = useState<number | null>(null)
  const [creatingPlaceholder, setCreatingPlaceholder] = useState<string | null>(null)

  // Types financement à afficher selon mode choisi
  const financementTypes = FINANCEMENT_PAR_MODE[modeFinancement] ?? FINANCEMENT_DEFAUT

  // Tous les types à afficher = candidature + financement filtré
  const allTypes = [...CANDIDATURE_TYPES, ...financementTypes]

  // Merge : pour chaque type attendu, prendre le doc existant ou créer un placeholder
  const docsParType = new Map(documents.map(d => [d.type, d]))
  const mergedDocs = allTypes.map(type => docsParType.get(type) ?? makePlaceholder(type))

  // Groupement
  const docsCandidature = mergedDocs.filter(d => CANDIDATURE_TYPES.includes(d.type))
  const docsFinancement = mergedDocs.filter(d => financementTypes.includes(d.type))

  const hasFile = (doc: Document) => !!(doc.minio_key || doc.chemin_minio || doc.url_minio)

  // Crée le placeholder en base si id=0 puis ouvre l'upload
  const handleUpload = async (doc: Document) => {
    if (doc.id !== 0) {
      setUploadDoc(doc)
      return
    }
    // Créer le placeholder en base
    setCreatingPlaceholder(doc.type)
    try {
      const res = await fetch('/api/documents/placeholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroDossier,
          idProspect,
          typeDocument: doc.type,
          obligatoire: doc.obligatoire,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        // setUploadDoc AVANT onDocumentsUpdated pour éviter le re-render
        // qui démonterait le composant avant l'ouverture du modal
        setUploadDoc({ ...doc, id: created.idDocument })
      }
    } catch (err) {
      console.error('Erreur création placeholder:', err)
    } finally {
      setCreatingPlaceholder(null)
    }
  }

  const handleChangerStatut = async (docId: number, statut: string) => {
    if (docId === 0) return
    setChangingStatut(docId)
    try {
      const res = await fetch(`/api/documents/${docId}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      })
      if (res.ok) onDocumentsUpdated()
    } catch (err) {
      console.error('Erreur changement statut:', err)
    } finally {
      setChangingStatut(null)
    }
  }

  // Supprime le fichier (remet à ATTENDU) pour en uploader un nouveau
  const handleSupprimerFichier = async (docId: number) => {
    if (docId === 0) return
    setChangingStatut(docId)
    try {
      const res = await fetch(`/api/documents/${docId}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'ATTENDU', supprimerFichier: true }),
      })
      if (res.ok) onDocumentsUpdated()
    } catch (err) {
      console.error('Erreur suppression fichier:', err)
    } finally {
      setChangingStatut(null)
    }
  }

  const renderGroupe = (titre: string, docs: Document[]) => (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))] px-1">
        {titre}
      </p>
      {docs.map((doc) => {
        const statut = STATUT_STYLES[doc.statut] ?? STATUT_STYLES['ATTENDU']
        const typeLabel = TYPES_LABELS[doc.type] ?? doc.type.replace(/_/g, ' ')
        const isChanging = changingStatut === doc.id
        const isCreating = creatingPlaceholder === doc.type
        const filePresent = hasFile(doc)
        const isPlaceholder = doc.id === 0

        return (
          <div
            key={doc.type}
            className="flex items-center gap-4 p-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)] rounded-xl"
          >
            {/* Icône */}
            <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-[rgb(var(--card))] border border-[rgba(var(--border),0.3)] flex items-center justify-center">
              <FileText className={`w-4 h-4 ${filePresent ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--muted-foreground))]'}`} />
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-[rgb(var(--foreground))] truncate">
                  {typeLabel}
                </p>
                {doc.obligatoire && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(var(--error),0.1)] text-[rgb(var(--error))] rounded-full flex-shrink-0">
                    requis
                  </span>
                )}
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))] truncate mt-0.5">
                {doc.nom_fichier ?? 'Aucun fichier déposé'}
              </p>
            </div>

            {/* Statut */}
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statut.className}`}>
                {statut.icon}
                {isPlaceholder ? 'Attendu' : statut.label}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Prévisualiser */}
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
                onClick={() => handleUpload(doc)}
                disabled={isCreating}
                className="p-2 hover:bg-[rgb(var(--card))] rounded-lg transition-colors disabled:opacity-50"
                title={filePresent ? 'Remplacer' : 'Déposer'}
              >
                {isCreating
                  ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[rgb(var(--accent))] inline-block" />
                  : <Upload className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                }
              </button>

              {/* Valider */}
              {filePresent && !isPlaceholder && doc.statut !== 'VALIDE' && (
                <button
                  type="button"
                  disabled={isChanging}
                  onClick={() => handleChangerStatut(doc.id, 'VALIDE')}
                  className="p-2 hover:bg-[rgba(var(--success),0.1)] rounded-lg transition-colors disabled:opacity-50"
                  title="Valider"
                >
                  <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                </button>
              )}

              {/* Supprimer fichier (MinIO + BDD) — remet à Attendu pour re-upload */}
              {filePresent && !isPlaceholder && (
                <button
                  type="button"
                  disabled={isChanging}
                  onClick={() => handleSupprimerFichier(doc.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors disabled:opacity-50"
                  title="Supprimer le fichier"
                >
                  <Trash2 className="w-4 h-4 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        {renderGroupe('Dossier de candidature', docsCandidature)}
        {renderGroupe('Financement', docsFinancement)}
      </div>

      {previewDoc && (
        <DocumentPreviewModal
          documentId={previewDoc.id}
          nomFichier={previewDoc.nom_fichier}
          mimeType={previewDoc.mime_type ?? null}
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
