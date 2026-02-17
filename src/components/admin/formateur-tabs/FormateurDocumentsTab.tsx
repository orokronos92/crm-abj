'use client'

import { useState, useRef } from 'react'
import { FileText, Download, Upload, CheckCircle, Clock, AlertCircle, Award, BookOpen, Shield, Send, RefreshCw } from 'lucide-react'

interface FormateurDocumentsTabProps {
  formateur: any
  onDocumentUploaded?: () => void
}

export function FormateurDocumentsTab({ formateur, onDocumentUploaded }: FormateurDocumentsTabProps) {
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, doc: any) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('idFormateur', formateur.id.toString())
    formData.append('codeTypeDocument', doc.codeTypeDocument)
    formData.append('libelle', doc.typeDocument?.libelle || doc.libelle)

    setUploading(doc.codeTypeDocument)

    try {
      const response = await fetch('/api/formateurs/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'upload')
      }

      // Réinitialiser l'input file
      if (fileInputRefs.current[doc.codeTypeDocument]) {
        fileInputRefs.current[doc.codeTypeDocument]!.value = ''
      }

      // Notifier le parent pour refresh
      if (onDocumentUploaded) {
        onDocumentUploaded()
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(null)
    }
  }

  const triggerFileInput = (codeTypeDocument: string) => {
    fileInputRefs.current[codeTypeDocument]?.click()
  }
  // Debug : vérifier les documents reçus
  console.log('Documents reçus:', formateur.documents?.length, 'documents')
  console.log('Premier document:', formateur.documents?.[0])

  // Debug: vérifier si les documents ont codeTypeDocument
  if (formateur.documents && formateur.documents.length > 0) {
    console.log('Clés du premier document:', Object.keys(formateur.documents[0]))
    console.log('codeTypeDocument présent?', 'codeTypeDocument' in formateur.documents[0])
    console.log('Tous les codeTypeDocument:', formateur.documents.map((d: any) => d.codeTypeDocument))
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Valide
          </span>
        )
      case 'EN_ATTENTE':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )
      case 'ATTENDU':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-[rgba(var(--muted-foreground),0.1)] text-[rgb(var(--muted-foreground))] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Attendu
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-[rgba(var(--error),0.1)] text-[rgb(var(--error))] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {statut}
          </span>
        )
    }
  }

  // Séparer les documents par catégorie (incluant les placeholders avec idDocument = 0)
  const documentsAdministratifs = formateur.documents?.filter((doc: any) =>
    ['CV', 'CNI', 'RCP', 'STATUT'].includes(doc.codeTypeDocument)
  ) || []

  const documentsQualifications = formateur.documents?.filter((doc: any) =>
    ['DIPLOME', 'FORMATION_PEDAGOGIQUE', 'CERTIFICAT_QUALIOPI'].includes(doc.codeTypeDocument)
  ) || []

  const documentsVeille = formateur.documents?.filter((doc: any) =>
    ['FORMATIONS_SUIVIES', 'PORTFOLIO', 'EVALUATIONS'].includes(doc.codeTypeDocument)
  ) || []

  const documentsAutres = formateur.documents?.filter((doc: any) =>
    doc.codeTypeDocument === 'AUTRE'
  ) || []

  // Compter seulement les documents obligatoires manquants
  const documentsObligatoiresManquants = formateur.documents?.filter((doc: any) =>
    doc.statut === 'ATTENDU' && doc.typeDocument?.obligatoire === true
  ).length || 0

  const documentsValides = formateur.documents?.filter((d: any) => d.statut === 'VALIDE').length || 0
  const documentsEnAttente = formateur.documents?.filter((d: any) => d.statut === 'EN_ATTENTE').length || 0

  return (
    <div className="space-y-6">
      {/* Résumé avec distinction obligatoire/optionnel */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[rgba(var(--success),0.1)] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[rgb(var(--success))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{documentsValides}</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Documents validés</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[rgba(var(--warning),0.1)] flex items-center justify-center">
              <Clock className="w-6 h-6 text-[rgb(var(--warning))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{documentsEnAttente}</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">En validation</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[rgba(var(--error),0.1)] flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[rgb(var(--error))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{documentsObligatoiresManquants}</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Obligatoires manquants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statut Qualiopi */}
      {documentsObligatoiresManquants === 0 ? (
        <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">
                Conforme aux exigences Qualiopi
              </h5>
              <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                Tous les documents obligatoires sont fournis et validés. Le formateur satisfait aux indicateurs 21 (compétences des intervenants)
                et 22 (maintien des compétences) du référentiel Qualiopi.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[rgba(var(--error),0.05)] border border-[rgba(var(--error),0.2)] rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[rgb(var(--error))] flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">
                Non conforme Qualiopi - Action requise
              </h5>
              <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                {documentsObligatoiresManquants} document(s) obligatoire(s) manquant(s) pour la conformité aux indicateurs 21 et 22.
                Veuillez compléter le dossier pour maintenir la certification Qualiopi de l'organisme.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documents administratifs */}
      <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[rgb(var(--accent))]" />
          Documents administratifs et légaux
        </h3>
        <div className="space-y-2">
          {documentsAdministratifs.length > 0 ? (
            documentsAdministratifs.map((doc: any) => (
              <div
                key={doc.idDocument || doc.codeTypeDocument}
                className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {doc.typeDocument?.libelle || doc.libelle}
                      {doc.typeDocument?.obligatoire && (
                        <span className="ml-1 text-[rgb(var(--error))]">*</span>
                      )}
                    </p>
                    {doc.nomFichier && (
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {doc.nomFichier}
                        {doc.dateExpiration && ` • Expire le ${new Date(doc.dateExpiration).toLocaleDateString('fr-FR')}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatutBadge(doc.statut)}
                  <input
                    ref={(el) => { fileInputRefs.current[doc.codeTypeDocument] = el }}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, doc)}
                    disabled={uploading === doc.codeTypeDocument}
                  />
                  {doc.idDocument === 0 || !doc.urlFichier ? (
                    <button
                      onClick={() => triggerFileInput(doc.codeTypeDocument)}
                      disabled={uploading === doc.codeTypeDocument}
                      className="px-3 py-1.5 text-xs bg-[rgb(var(--accent))] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading === doc.codeTypeDocument ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Envoyer
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerFileInput(doc.codeTypeDocument)}
                      disabled={uploading === doc.codeTypeDocument}
                      className="px-3 py-1.5 text-xs bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading === doc.codeTypeDocument ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Mettre à jour
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[rgb(var(--muted-foreground))] italic">Aucun document administratif</p>
          )}
        </div>
      </div>

      {/* Qualifications et diplômes */}
      <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
          Qualifications et diplômes
        </h3>
        <div className="space-y-2">
          {documentsQualifications.length > 0 ? (
            documentsQualifications.map((doc: any) => (
              <div
                key={doc.idDocument || doc.codeTypeDocument}
                className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Award className="w-4 h-4 text-[rgb(var(--success))]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {doc.typeDocument?.libelle || doc.libelle}
                      {doc.typeDocument?.obligatoire && (
                        <span className="ml-1 text-[rgb(var(--error))]">*</span>
                      )}
                    </p>
                    {doc.nomFichier && (
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {doc.nomFichier}
                        {doc.dateExpiration && ` • Expire le ${new Date(doc.dateExpiration).toLocaleDateString('fr-FR')}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatutBadge(doc.statut)}
                  <input
                    ref={(el) => { fileInputRefs.current[doc.codeTypeDocument] = el }}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, doc)}
                    disabled={uploading === doc.codeTypeDocument}
                  />
                  {doc.idDocument === 0 || !doc.urlFichier ? (
                    <button
                      onClick={() => triggerFileInput(doc.codeTypeDocument)}
                      disabled={uploading === doc.codeTypeDocument}
                      className="px-3 py-1.5 text-xs bg-[rgb(var(--accent))] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading === doc.codeTypeDocument ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Envoyer
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerFileInput(doc.codeTypeDocument)}
                      disabled={uploading === doc.codeTypeDocument}
                      className="px-3 py-1.5 text-xs bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading === doc.codeTypeDocument ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Mettre à jour
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[rgb(var(--muted-foreground))] italic">Aucune qualification documentée</p>
          )}
        </div>
      </div>

      {/* Veille professionnelle (documents optionnels) */}
      <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
          Veille professionnelle et formations continues
          <span className="text-xs text-[rgb(var(--muted-foreground))] ml-2">(optionnel)</span>
        </h3>
        <div className="space-y-2">
          {documentsVeille.length > 0 ? (
            documentsVeille.map((doc: any) => (
              <div
                key={doc.idDocument || doc.codeTypeDocument}
                className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <BookOpen className="w-4 h-4 text-[rgb(var(--info))]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {doc.typeDocument?.libelle || doc.libelle}
                    </p>
                    {doc.nomFichier && (
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {doc.nomFichier}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatutBadge(doc.statut)}
                  <input
                    ref={(el) => { fileInputRefs.current[doc.codeTypeDocument] = el }}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, doc)}
                    disabled={uploading === doc.codeTypeDocument}
                  />
                  {doc.idDocument === 0 || !doc.urlFichier ? (
                    <button
                      onClick={() => triggerFileInput(doc.codeTypeDocument)}
                      disabled={uploading === doc.codeTypeDocument}
                      className="px-3 py-1.5 text-xs bg-[rgb(var(--accent))] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading === doc.codeTypeDocument ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Envoyer
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerFileInput(doc.codeTypeDocument)}
                      disabled={uploading === doc.codeTypeDocument}
                      className="px-3 py-1.5 text-xs bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading === doc.codeTypeDocument ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Mettre à jour
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
              Aucun document de veille professionnelle (facultatif pour la conformité)
            </p>
          )}
        </div>
      </div>

      {/* Autres documents */}
      {documentsAutres.length > 0 && (
        <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
          <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
            Autres documents
          </h3>
          <div className="space-y-2">
            {documentsAutres.map((doc: any) => (
              <div
                key={doc.idDocument || doc.codeTypeDocument}
                className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {doc.typeDocument?.libelle || doc.libelle}
                    </p>
                    {doc.nomFichier && (
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {doc.nomFichier}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatutBadge(doc.statut)}
                  <input
                    ref={(el) => { fileInputRefs.current[doc.codeTypeDocument] = el }}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, doc)}
                    disabled={uploading === doc.codeTypeDocument}
                  />
                  {doc.idDocument === 0 || !doc.urlFichier ? (
                    <button
                      onClick={() => triggerFileInput(doc.codeTypeDocument)}
                      disabled={uploading === doc.codeTypeDocument}
                      className="px-3 py-1.5 text-xs bg-[rgb(var(--accent))] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading === doc.codeTypeDocument ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Envoyer
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerFileInput(doc.codeTypeDocument)}
                      disabled={uploading === doc.codeTypeDocument}
                      className="px-3 py-1.5 text-xs bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading === doc.codeTypeDocument ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Mettre à jour
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-[rgb(var(--muted-foreground))] space-y-1">
        <p className="flex items-center gap-1">
          <span className="text-[rgb(var(--error))]">*</span>
          Documents obligatoires pour la conformité Qualiopi (Indicateurs 21 & 22)
        </p>
        <p>
          Les documents optionnels enrichissent le dossier mais ne sont pas requis pour la certification.
        </p>
      </div>
    </div>
  )
}