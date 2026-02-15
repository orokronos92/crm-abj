'use client'

import { useState } from 'react'
import { TrendingUp, Plus, X, Calendar, Target } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

export function StepFormationsContinues() {
  const { profil, updateProfil } = useProfilFormateur()
  const [modeAjout, setModeAjout] = useState(false)
  const [nouvelleFormation, setNouvelleFormation] = useState({
    titre: '',
    organisme: '',
    date: '',
    duree: '',
    objectifs: '',
    type: 'technique'
  })

  const ajouterFormation = () => {
    if (nouvelleFormation.titre && nouvelleFormation.organisme && nouvelleFormation.date) {
      const formation = {
        id: Date.now().toString(),
        ...nouvelleFormation
      }
      updateProfil('formationsContinues', [...(profil.formationsContinues || []), formation])
      setNouvelleFormation({
        titre: '',
        organisme: '',
        date: '',
        duree: '',
        objectifs: '',
        type: 'technique'
      })
      setModeAjout(false)
    }
  }

  const supprimerFormation = (id: string) => {
    updateProfil('formationsContinues', profil.formationsContinues?.filter(f => f.id !== id) || [])
  }

  // Calculer le total d'heures de formation continue
  const totalHeures = profil.formationsContinues?.reduce((total, formation) => {
    const heures = parseInt(formation.duree) || 0
    return total + heures
  }, 0) || 0

  return (
    <div className="space-y-6">
      {/* Description Qualiopi */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Maintien et développement des compétences
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 21 : Les formateurs maintiennent leurs compétences d'animation et leurs
            expertises. Listez vos formations continues des 3 dernières années.
          </p>
        </div>
      </div>

      {/* Statistiques */}
      {profil.formationsContinues && profil.formationsContinues.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-center">
            <div className="text-2xl font-bold text-[rgb(var(--accent))]">
              {profil.formationsContinues.length}
            </div>
            <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Formations suivies
            </div>
          </div>
          <div className="p-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-center">
            <div className="text-2xl font-bold text-[rgb(var(--accent))]">
              {totalHeures}h
            </div>
            <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Heures totales
            </div>
          </div>
          <div className="p-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-center">
            <div className="text-2xl font-bold text-[rgb(var(--accent))]">
              {profil.formationsContinues.filter(f => f.type === 'technique').length}
            </div>
            <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Formations techniques
            </div>
          </div>
          <div className="p-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-center">
            <div className="text-2xl font-bold text-[rgb(var(--accent))]">
              {profil.formationsContinues.filter(f => f.type === 'pedagogique').length}
            </div>
            <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Formations pédagogiques
            </div>
          </div>
        </div>
      )}

      {/* Liste des formations */}
      {profil.formationsContinues && profil.formationsContinues.length > 0 && (
        <div className="space-y-3">
          {profil.formationsContinues.map((formation) => (
            <div
              key={formation.id}
              className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[rgb(var(--foreground))]">
                      {formation.titre}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      formation.type === 'technique'
                        ? 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))]'
                        : 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]'
                    }`}>
                      {formation.type === 'technique' ? 'Technique' : 'Pédagogique'}
                    </span>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {formation.organisme}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formation.date}
                    </span>
                    {formation.duree && (
                      <span>{formation.duree} heures</span>
                    )}
                  </div>
                  {formation.objectifs && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] flex items-start gap-2">
                      <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{formation.objectifs}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => supprimerFormation(formation.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors"
                  aria-label="Supprimer cette formation"
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
            Ajouter une formation continue
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre de la formation *</label>
              <input
                type="text"
                value={nouvelleFormation.titre}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, titre: e.target.value})}
                placeholder="Ex: Perfectionnement sertissage"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type de formation *</label>
              <select
                value={nouvelleFormation.type}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, type: e.target.value})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              >
                <option value="technique">Formation technique</option>
                <option value="pedagogique">Formation pédagogique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organisme *</label>
              <input
                type="text"
                value={nouvelleFormation.organisme}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, organisme: e.target.value})}
                placeholder="Ex: Institut de Bijouterie"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={nouvelleFormation.date}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, date: e.target.value})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Durée (en heures)</label>
              <input
                type="number"
                value={nouvelleFormation.duree}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, duree: e.target.value})}
                placeholder="Ex: 35"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Objectifs et compétences développées</label>
            <textarea
              value={nouvelleFormation.objectifs}
              onChange={(e) => setNouvelleFormation({...nouvelleFormation, objectifs: e.target.value})}
              placeholder="Décrivez les objectifs de la formation et les compétences acquises..."
              rows={3}
              className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg resize-none"
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
              onClick={ajouterFormation}
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
          <span className="text-[rgb(var(--accent))]\">Ajouter une formation continue</span>
        </button>
      )}

      {/* Message Qualiopi */}
      <div className="p-4 bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg">
        <p className="text-sm text-[rgb(var(--foreground))]">
          💡 <strong>Rappel Qualiopi</strong> : Les formateurs doivent justifier d'au moins
          14 heures de formation continue par an ou participer à des activités de maintien
          des compétences (colloques, conférences, publications).
        </p>
      </div>
    </div>
  )
}