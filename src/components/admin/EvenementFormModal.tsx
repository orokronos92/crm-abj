/**
 * Modal création/édition d'événement
 * Limite : 200 lignes max
 */

'use client'

import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Users, PartyPopper, GraduationCap, Briefcase, Award, Phone } from 'lucide-react'

interface Evenement {
  id?: number
  type: string
  titre: string
  date: string
  heureDebut: string
  heureFin: string
  salle: string
  participants: number
  description?: string
}

interface EvenementFormModalProps {
  evenement?: Evenement // Si fourni = mode édition
  onClose: () => void
  onSave: (evenement: Evenement) => void
}

const TYPES_EVENEMENT = [
  { value: 'PORTES_OUVERTES', label: 'Portes ouvertes', icon: PartyPopper },
  { value: 'STAGE_INITIATION', label: 'Stage initiation', icon: GraduationCap },
  { value: 'REUNION', label: 'Réunion', icon: Briefcase },
  { value: 'REMISE_DIPLOME', label: 'Remise diplômes', icon: Award },
  { value: 'ENTRETIEN', label: 'Entretien', icon: Phone },
]

const SALLES_OPTIONS = [
  'Atelier A',
  'Atelier B',
  'Atelier C',
  'Salle informatique',
  'Salle théorie',
  'Atelier polissage',
  'Atelier taille',
  'Salle réunion',
  'Tous les ateliers',
]

export function EvenementFormModal({ evenement, onClose, onSave }: EvenementFormModalProps) {
  const isEditing = !!evenement

  const [formData, setFormData] = useState<Evenement>({
    type: evenement?.type || 'PORTES_OUVERTES',
    titre: evenement?.titre || '',
    date: evenement?.date || new Date().toISOString().split('T')[0],
    heureDebut: evenement?.heureDebut || '09:00',
    heureFin: evenement?.heureFin || '17:00',
    salle: evenement?.salle || 'Atelier A',
    participants: evenement?.participants || 10,
    description: evenement?.description || '',
  })

  const handleChange = (field: keyof Evenement, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const typeConfig = TYPES_EVENEMENT.find(t => t.value === formData.type)
  const TypeIcon = typeConfig?.icon || PartyPopper

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <TypeIcon className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                {isEditing ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {isEditing ? 'Mettre à jour les informations' : 'Créer un événement dans le planning'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Type d'événement */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Type d'événement *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                required
              >
                {TYPES_EVENEMENT.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Titre de l'événement *
              </label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => handleChange('titre', e.target.value)}
                placeholder="Ex: Portes ouvertes printemps 2026"
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                required
              />
            </div>

            {/* Date et horaires */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Début *
                </label>
                <input
                  type="time"
                  value={formData.heureDebut}
                  onChange={(e) => handleChange('heureDebut', e.target.value)}
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Fin *
                </label>
                <input
                  type="time"
                  value={formData.heureFin}
                  onChange={(e) => handleChange('heureFin', e.target.value)}
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Salle et participants */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Salle / Lieu *
                </label>
                <select
                  value={formData.salle}
                  onChange={(e) => handleChange('salle', e.target.value)}
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  required
                >
                  {SALLES_OPTIONS.map(salle => (
                    <option key={salle} value={salle}>
                      {salle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Participants *
                </label>
                <input
                  type="number"
                  value={formData.participants}
                  onChange={(e) => handleChange('participants', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Détails de l'événement, consignes, informations complémentaires..."
                rows={3}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all"
            >
              {isEditing ? 'Enregistrer' : 'Créer l\'événement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
