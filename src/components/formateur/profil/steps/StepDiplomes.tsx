'use client'

import { useState } from 'react'
import { GraduationCap, Plus, X, FileText } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

const NIVEAUX_DIPLOME = [
  'CAP', 'BMA', 'DMA', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'
]

export function StepDiplomes() {
  const { profil, updateProfil } = useProfilFormateur()
  const [modeAjout, setModeAjout] = useState(false)
  const [nouveauDiplome, setNouveauDiplome] = useState({
    nomDiplome: '',
    typeFormation: 'CAP',
    specialite: '',
    etablissement: '',
    dateObtention: '',
    documentUrl: ''
  })

  const ajouterDiplome = () => {
    if (nouveauDiplome.nomDiplome && nouveauDiplome.etablissement && nouveauDiplome.dateObtention) {
      const diplome = {
        id: Date.now().toString(),
        titre: nouveauDiplome.nomDiplome,
        ...nouveauDiplome
      }
      updateProfil('diplomes', [...(profil.diplomes || []), diplome])
      setNouveauDiplome({
        nomDiplome: '',
        typeFormation: 'CAP',
        specialite: '',
        etablissement: '',
        dateObtention: '',
        documentUrl: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerDiplome = (id: string) => {
    updateProfil('diplomes', (profil.diplomes || []).filter(d => d.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Diplômes et qualifications professionnelles
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 22 : Les formateurs doivent justifier de leurs qualifications professionnelles.
            Listez vos diplômes métier (CAP, BMA, DMA, BTS, etc.)
          </p>
        </div>
      </div>

      {/* Liste des diplômes existants */}
      {profil.diplomes && profil.diplomes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
            Mes diplômes ({profil.diplomes.length})
          </h3>
          {profil.diplomes.map((diplome: any) => (
            <div
              key={diplome.id}
              className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {diplome.nomDiplome}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
                      {diplome.typeFormation}
                    </span>
                  </div>
                  {diplome.specialite && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      Spécialité : {diplome.specialite}
                    </p>
                  )}
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    {diplome.etablissement}
                  </p>
                </div>
                <button
                  onClick={() => supprimerDiplome(diplome.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--error))] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm">
                <span className="text-[rgb(var(--muted-foreground))]">Obtenu le : </span>
                <span className="text-[rgb(var(--foreground))]">
                  {new Date(diplome.dateObtention).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton ajouter ou formulaire */}
      {!modeAjout ? (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.5)] hover:bg-[rgba(var(--accent),0.02)] transition-all flex items-center justify-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter un diplôme</span>
        </button>
      ) : (
        <div className="p-6 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.2)] rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-[rgb(var(--foreground))] mb-4">
            Nouveau diplôme professionnel
          </h3>

          {/* Nom du diplôme */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Nom du diplôme *
            </label>
            <input
              type="text"
              value={nouveauDiplome.nomDiplome}
              onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, nomDiplome: e.target.value })}
              placeholder="Ex: CAP Art du Bijou et du Joyau"
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Type de formation et Spécialité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Type de formation *
              </label>
              <select
                value={nouveauDiplome.typeFormation}
                onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, typeFormation: e.target.value })}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
                required
              >
                {NIVEAUX_DIPLOME.map(niveau => (
                  <option key={niveau} value={niveau}>{niveau}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Spécialité (optionnel)
              </label>
              <input
                type="text"
                value={nouveauDiplome.specialite}
                onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, specialite: e.target.value })}
                placeholder="Ex: Bijouterie-Joaillerie"
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              />
            </div>
          </div>

          {/* Établissement */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Établissement délivrant *
            </label>
            <input
              type="text"
              value={nouveauDiplome.etablissement}
              onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, etablissement: e.target.value })}
              placeholder="Ex: Éducation Nationale, CMA, École Boulle..."
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
          </div>

          {/* Date d'obtention */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Date d'obtention *
            </label>
            <input
              type="date"
              value={nouveauDiplome.dateObtention}
              onChange={(e) => setNouveauDiplome({ ...nouveauDiplome, dateObtention: e.target.value })}
              className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgb(var(--accent))]"
              required
            />
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
                    setNouveauDiplome({ ...nouveauDiplome, documentUrl: file.name })
                  }
                }}
                className="w-full px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[rgba(var(--accent),0.1)] file:text-[rgb(var(--accent))] hover:file:bg-[rgba(var(--accent),0.2)] cursor-pointer"
              />
              {nouveauDiplome.documentUrl && (
                <div className="flex items-center gap-2 p-2 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                  <FileText className="w-4 h-4 text-[rgb(var(--success))]" />
                  <span className="text-sm text-[rgb(var(--success))] flex-1">{nouveauDiplome.documentUrl}</span>
                  <button
                    onClick={() => setNouveauDiplome({ ...nouveauDiplome, documentUrl: '' })}
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
                setNouveauDiplome({
                  nomDiplome: '',
                  typeFormation: 'CAP',
                  specialite: '',
                  etablissement: '',
                  dateObtention: '',
                  documentUrl: ''
                })
              }}
              className="px-6 py-2.5 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--secondary),0.8)] rounded-lg transition-colors text-[rgb(var(--foreground))]"
            >
              Annuler
            </button>
            <button
              onClick={ajouterDiplome}
              disabled={!nouveauDiplome.nomDiplome || !nouveauDiplome.etablissement || !nouveauDiplome.dateObtention}
              className="px-6 py-2.5 bg-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.9)] text-[rgb(var(--primary))] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter le diplôme
            </button>
          </div>
        </div>
      )}

      {/* Message si aucun diplôme */}
      {(!profil.diplomes || profil.diplomes.length === 0) && !modeAjout && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucun diplôme enregistré</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter un diplôme" pour commencer</p>
        </div>
      )}
    </div>
  )
}