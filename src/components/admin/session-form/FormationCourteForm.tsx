'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, MapPin, User, Clock, AlertCircle } from 'lucide-react'
import type { FormationCourteData, JourSemaine } from './session-form.types'

interface FormationCourteFormProps {
  onSubmit: (data: FormationCourteData) => void
  onBack: () => void
}

const JOURS_SEMAINE: { value: JourSemaine; label: string }[] = [
  { value: 'LUNDI', label: 'Lundi' },
  { value: 'MARDI', label: 'Mardi' },
  { value: 'MERCREDI', label: 'Mercredi' },
  { value: 'JEUDI', label: 'Jeudi' },
  { value: 'VENDREDI', label: 'Vendredi' },
  { value: 'SAMEDI', label: 'Samedi' },
  { value: 'DIMANCHE', label: 'Dimanche' }
]

export function FormationCourteForm({ onSubmit, onBack }: FormationCourteFormProps) {
  const [formData, setFormData] = useState<FormationCourteData>({
    codeFormation: '',
    dateDebut: '',
    dateFin: '',
    joursActifs: ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'],
    nbParticipants: 10,
    description: ''
  })

  const [formations, setFormations] = useState<any[]>([])
  const [salles, setSalles] = useState<any[]>([])
  const [formateurs, setFormateurs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Calcul du nombre de jours
  const nbJours = formData.dateDebut && formData.dateFin
    ? Math.ceil((new Date(formData.dateFin).getTime() - new Date(formData.dateDebut).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0

  useEffect(() => {
    // TODO: Charger formations courtes depuis API
    setFormations([
      { code: 'SERTI_N1', nom: 'Sertissage Niveau 1' },
      { code: 'SERTI_N2', nom: 'Sertissage Niveau 2' },
      { code: 'CAO_DAO', nom: 'CAO/DAO Bijouterie' },
      { code: 'GEMMO', nom: 'Gemmologie' },
      { code: 'INIT_BJ', nom: 'Initiation Bijouterie' }
    ])
  }, [])

  useEffect(() => {
    // Charger salles et formateurs disponibles quand dates + formation choisies
    if (formData.codeFormation && formData.dateDebut && formData.dateFin) {
      setLoading(true)
      // TODO: API call
      // fetch(`/api/salles/disponibles?dateDebut=${formData.dateDebut}&dateFin=${formData.dateFin}&capacite=${formData.nbParticipants}`)
      // fetch(`/api/formateurs/disponibles?formation=${formData.codeFormation}&dateDebut=${formData.dateDebut}&dateFin=${formData.dateFin}`)

      // Mock data
      setTimeout(() => {
        setSalles([
          { id: 1, nom: 'Atelier A', capacite: 15 },
          { id: 2, nom: 'Atelier B', capacite: 10 },
          { id: 3, nom: 'Salle informatique', capacite: 12 }
        ])
        setFormateurs([
          { id: 1, nom: 'Laurent Dupont', specialite: 'Sertissage' },
          { id: 2, nom: 'Marie Bernard', specialite: 'CAO/DAO' }
        ])
        setLoading(false)
      }, 500)
    }
  }, [formData.codeFormation, formData.dateDebut, formData.dateFin, formData.nbParticipants])

  const handleJourToggle = (jour: JourSemaine) => {
    setFormData(prev => ({
      ...prev,
      joursActifs: prev.joursActifs.includes(jour)
        ? prev.joursActifs.filter(j => j !== jour)
        : [...prev.joursActifs, jour]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: string[] = []

    if (!formData.codeFormation) newErrors.push('Formation requise')
    if (!formData.dateDebut) newErrors.push('Date de début requise')
    if (!formData.dateFin) newErrors.push('Date de fin requise')
    if (formData.dateDebut && formData.dateFin && new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
      newErrors.push('La date de fin doit être après la date de début')
    }
    if (formData.joursActifs.length === 0) newErrors.push('Au moins un jour actif requis')
    if (formData.nbParticipants <= 0) newErrors.push('Nombre de participants invalide')

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
          Formation Courte
        </h2>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Planification simplifiée pour formations de 5 à 15 jours
        </p>
      </div>

      {errors.length > 0 && (
        <div className="p-3 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[rgb(var(--error))] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[rgb(var(--foreground))]">
              {errors.map((error, i) => (
                <div key={i}>• {error}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formation */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Formation *
        </label>
        <select
          value={formData.codeFormation}
          onChange={(e) => setFormData({ ...formData, codeFormation: e.target.value })}
          className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
          required
        >
          <option value="">Sélectionner une formation</option>
          {formations.map(f => (
            <option key={f.code} value={f.code}>{f.nom}</option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date de début *
          </label>
          <input
            type="date"
            value={formData.dateDebut}
            onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date de fin *
          </label>
          <input
            type="date"
            value={formData.dateFin}
            onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
            required
          />
        </div>
      </div>

      {nbJours > 0 && (
        <div className="p-3 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] rounded-lg">
          <p className="text-sm text-[rgb(var(--foreground))]">
            📅 Durée : <span className="font-bold">{nbJours} jours</span>
          </p>
        </div>
      )}

      {/* Jours actifs */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Jours actifs *
        </label>
        <div className="flex flex-wrap gap-2">
          {JOURS_SEMAINE.map(jour => (
            <button
              key={jour.value}
              type="button"
              onClick={() => handleJourToggle(jour.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                formData.joursActifs.includes(jour.value)
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] border-[rgb(var(--accent))]'
                  : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] border-[rgba(var(--border),0.5)] hover:border-[rgb(var(--accent))]'
              }`}
            >
              {jour.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amplitude horaire (info fixe) */}
      <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
        <div className="flex items-start gap-2">
          <Clock className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
              ⏰ Amplitude fixe : 08h00 - 21h00 (créneaux de 30min)
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Marjorie optimisera l'utilisation des salles sur cette plage horaire
            </p>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Nombre de participants *
        </label>
        <input
          type="number"
          value={formData.nbParticipants}
          onChange={(e) => setFormData({ ...formData, nbParticipants: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
          min="1"
          required
        />
      </div>

      {/* Salle */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Salle
        </label>
        {loading ? (
          <div className="text-sm text-[rgb(var(--muted-foreground))]">Chargement des salles disponibles...</div>
        ) : salles.length === 0 ? (
          <div className="p-3 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg text-sm text-[rgb(var(--foreground))]">
            ⚠️ Aucune salle disponible sur cette période (choisissez d'abord les dates)
          </div>
        ) : (
          <select
            value={formData.salleId || ''}
            onChange={(e) => setFormData({ ...formData, salleId: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
          >
            <option value="">⏳ Planifier sans salle (à assigner plus tard)</option>
            {salles.map(s => (
              <option key={s.id} value={s.id}>
                {s.nom} ({s.capacite} places)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Formateur */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Formateur principal
        </label>
        {loading ? (
          <div className="text-sm text-[rgb(var(--muted-foreground))]">Chargement des formateurs disponibles...</div>
        ) : formateurs.length === 0 ? (
          <div className="p-3 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg text-sm text-[rgb(var(--foreground))]">
            ⚠️ Aucun formateur disponible (peut être planifié sans formateur)
          </div>
        ) : (
          <select
            value={formData.formateurId || ''}
            onChange={(e) => setFormData({
              ...formData,
              formateurId: e.target.value === 'SANS_FORMATEUR' ? 'SANS_FORMATEUR' : e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
          >
            <option value="SANS_FORMATEUR">⏳ Planifier sans formateur (à assigner plus tard)</option>
            {formateurs.map(f => (
              <option key={f.id} value={f.id}>
                {f.nom} - {f.specialite}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Description (optionnel)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
          rows={3}
          placeholder="Informations complémentaires..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgba(var(--border),0.3)]">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
        >
          Retour
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-colors font-medium"
        >
          Continuer →
        </button>
      </div>
    </form>
  )
}
