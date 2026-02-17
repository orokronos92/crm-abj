'use client'

import { useState } from 'react'
import { Award, Plus, X, FileText } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

export function StepCertifications() {
  const { profil, updateProfil } = useProfilFormateur()
  const [nouvelleCertif, setNouvelleCertif] = useState({
    nomCertification: '',
    organisme: '',
    dateObtention: '',
    dateExpiration: '',
    documentUrl: ''
  })
  const [modeAjout, setModeAjout] = useState(false)

  const ajouterCertification = () => {
    if (nouvelleCertif.nomCertification && nouvelleCertif.organisme && nouvelleCertif.dateObtention) {
      updateProfil('certifications', [...(profil.certifications || []), {
        ...nouvelleCertif,
        id: Date.now().toString(),
        nom: nouvelleCertif.nomCertification
      }])
      setNouvelleCertif({
        nomCertification: '',
        organisme: '',
        dateObtention: '',
        dateExpiration: '',
        documentUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerCertification = (id: string) => {
    updateProfil('certifications', (profil.certifications || []).filter(c => c.id !== id))
  }

  const calculerStatut = (dateExpiration: string) => {
    if (!dateExpiration) return 'VALIDE'
    const expiration = new Date(dateExpiration)
    const maintenant = new Date()

    if (expiration < maintenant) return 'EXPIRE'

    // Alerte si expire dans moins de 3 mois
    const dans3Mois = new Date()
    dans3Mois.setMonth(dans3Mois.getMonth() + 3)
    if (expiration < dans3Mois) return 'A_RENOUVELER'

    return 'VALIDE'
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Award className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Certifications professionnelles obligatoires Qualiopi
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 21 : Les formateurs doivent justifier de certifications professionnelles à jour.
            Ajoutez toutes vos certifications métier et pédagogiques.
          </p>
        </div>
      </div>

      {/* Liste des certifications existantes */}
      {profil.certifications && profil.certifications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes certifications ({profil.certifications.length})
          </h3>
          {profil.certifications.map((certif: any) => {
            const statut = calculerStatut(certif.dateExpiration)
            return (
              <div
                key={certif.id}
                className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[rgb(var(--foreground))]">
                        {certif.nomCertification}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        statut === 'VALIDE' ? 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]' :
                        statut === 'A_RENOUVELER' ? 'bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]' :
                        'bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))]'
                      }`}>
                        {statut === 'VALIDE' ? 'Valide' :
                         statut === 'A_RENOUVELER' ? 'À renouveler' :
                         'Expiré'}
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      {certif.organisme}
                    </p>
                  </div>
                  <button
                    onClick={() => supprimerCertification(certif.id)}
                    className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[rgb(var(--muted-foreground))]">Obtenue le : </span>
                    <span className="text-[rgb(var(--foreground))]">
                      {new Date(certif.dateObtention).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {certif.dateExpiration && (
                    <div>
                      <span className="text-[rgb(var(--muted-foreground))]">Expire le : </span>
                      <span className="text-[rgb(var(--foreground))]">
                        {new Date(certif.dateExpiration).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter une certification</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouvelle certification professionnelle
          </h3>

          {/* Nom de la certification */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Nom de la certification *
            </label>
            <input
              type="text"
              value={nouvelleCertif.nomCertification}
              onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, nomCertification: e.target.value })}
              placeholder="Ex: CAP Art du Bijou et du Joyau"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Organisme */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Organisme certificateur *
            </label>
            <input
              type="text"
              value={nouvelleCertif.organisme}
              onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, organisme: e.target.value })}
              placeholder="Ex: Éducation Nationale, CMA, etc."
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Date d'obtention *
              </label>
              <input
                type="date"
                value={nouvelleCertif.dateObtention}
                onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, dateObtention: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Date d'expiration (optionnel)
              </label>
              <input
                type="date"
                value={nouvelleCertif.dateExpiration}
                onChange={(e) => setNouvelleCertif({ ...nouvelleCertif, dateExpiration: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              />
            </div>
          </div>

          {/* Justificatif */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Justificatif (PDF, JPG, PNG - max 5 Mo)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Le fichier ne doit pas dépasser 5 Mo')
                      e.target.value = ''
                      return
                    }
                    // TODO: Upload vers S3 et récupérer l'URL
                    // Pour l'instant on stocke juste le nom du fichier localement
                    setNouvelleCertif({ ...nouvelleCertif, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouvelleCertif.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouvelleCertif.documentUrl}</span>
                  <button
                    onClick={() => setNouvelleCertif({ ...nouvelleCertif, documentUrl: '' })}
                    className="p-1 hover:bg-[rgba(var(--error),0.1)] rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[rgba(var(--border),0.5)]">
            <button
              onClick={() => {
                setModeAjout(false)
                setNouvelleCertif({
                  nomCertification: '',
                  organisme: '',
                  dateObtention: '',
                  dateExpiration: '',
                  documentUrl: ''
                })
              }}
              className="px-6 py-2.5 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--secondary),0.8)] rounded-lg transition-colors text-[rgb(var(--foreground))]"
            >
              Annuler
            </button>
            <button
              onClick={ajouterCertification}
              disabled={!nouvelleCertif.nomCertification || !nouvelleCertif.organisme || !nouvelleCertif.dateObtention}
              className="px-6 py-2.5 bg-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.9)] text-[rgb(var(--primary))] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter la certification
            </button>
          </div>
        </div>
      )}

      {/* Message si aucune certification */}
      {(!profil.certifications || profil.certifications.length === 0) && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune certification enregistrée</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter une certification" pour commencer</p>
        </div>
      )}
    </div>
  )
}