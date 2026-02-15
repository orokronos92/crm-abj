'use client'

import { useState } from 'react'
import { Award, Plus, X, Calendar, FileCheck } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

export function StepCertifications() {
  const { profil, updateProfil } = useProfilFormateur()
  const [modeAjout, setModeAjout] = useState(false)
  const [nouvelleCertification, setNouvelleCertification] = useState({
    nom: '',
    organisme: '',
    dateObtention: '',
    dateExpiration: '',
    numero: ''
  })

  const ajouterCertification = () => {
    if (nouvelleCertification.nom && nouvelleCertification.organisme && nouvelleCertification.dateObtention) {
      const certification = {
        id: Date.now().toString(),
        ...nouvelleCertification
      }
      updateProfil('certifications', [...(profil.certifications || []), certification])
      setNouvelleCertification({
        nom: '',
        organisme: '',
        dateObtention: '',
        dateExpiration: '',
        numero: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerCertification = (id: string) => {
    updateProfil('certifications', profil.certifications?.filter(c => c.id !== id) || [])
  }

  return (
    <div className="space-y-6">
      {/* Description Qualiopi */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <Award className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Certifications professionnelles
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 13 : Certifications reconnues dans le secteur. Incluez vos certifications
            Qualiopi, certifications métier, habilitations spécifiques.
          </p>
        </div>
      </div>

      {/* Liste des certifications */}
      {profil.certifications && profil.certifications.length > 0 && (
        <div className="space-y-3">
          {profil.certifications.map((certification) => (
            <div
              key={certification.id}
              className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[rgb(var(--accent))]" />
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {certification.nom}
                    </h4>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {certification.organisme}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Obtenue le {certification.dateObtention}
                    </span>
                    {certification.dateExpiration && (
                      <span className="flex items-center gap-1 text-[rgb(var(--warning))]">
                        <Calendar className="w-3 h-3" />
                        Expire le {certification.dateExpiration}
                      </span>
                    )}
                  </div>
                  {certification.numero && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      N° : {certification.numero}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => supprimerCertification(certification.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors"
                  aria-label="Supprimer cette certification"
                >
                  <X className="w-4 h-4 text-[rgb(var(--error))]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {modeAjout ? (
        <div className="p-4 bg-[rgba(var(--secondary),0.3)] border border-[rgba(var(--border),0.5)] rounded-lg space-y-4">
          <h4 className="font-medium text-[rgb(var(--foreground))]">
            Ajouter une certification
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de la certification *</label>
              <input
                type="text"
                value={nouvelleCertification.nom}
                onChange={(e) => setNouvelleCertification({...nouvelleCertification, nom: e.target.value})}
                placeholder="Ex: Certification Qualiopi"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organisme certificateur *</label>
              <input
                type="text"
                value={nouvelleCertification.organisme}
                onChange={(e) => setNouvelleCertification({...nouvelleCertification, organisme: e.target.value})}
                placeholder="Ex: AFNOR Certification"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date d'obtention *</label>
              <input
                type="date"
                value={nouvelleCertification.dateObtention}
                onChange={(e) => setNouvelleCertification({...nouvelleCertification, dateObtention: e.target.value})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date d'expiration</label>
              <input
                type="date"
                value={nouvelleCertification.dateExpiration}
                onChange={(e) => setNouvelleCertification({...nouvelleCertification, dateExpiration: e.target.value})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Numéro de certification</label>
            <input
              type="text"
              value={nouvelleCertification.numero}
              onChange={(e) => setNouvelleCertification({...nouvelleCertification, numero: e.target.value})}
              placeholder="Ex: QUAL-2024-12345"
              className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setModeAjout(false)}
              className="px-4 py-2 bg-[rgb(var(--secondary))] rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={ajouterCertification}
              className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg"
            >
              Ajouter
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--accent),0.3)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 text-[rgb(var(--accent))]" />
          <span className="text-[rgb(var(--accent))]\">Ajouter une certification</span>
        </button>
      )}
    </div>
  )
}