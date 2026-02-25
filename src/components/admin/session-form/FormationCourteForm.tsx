'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, MapPin, User, Clock, AlertCircle } from 'lucide-react'
import type { FormationCourteData, JourSemaine } from './session-form.types'

interface FormationCourteFormProps {
  onSubmit: (data: FormationCourteData) => void
  onBack: () => void
}

const JOURS_SEMAINE: { value: JourSemaine; label: string }[] = [
  { value: 'LUNDI', label: 'Lun' },
  { value: 'MARDI', label: 'Mar' },
  { value: 'MERCREDI', label: 'Mer' },
  { value: 'JEUDI', label: 'Jeu' },
  { value: 'VENDREDI', label: 'Ven' },
  { value: 'SAMEDI', label: 'Sam' },
  { value: 'DIMANCHE', label: 'Dim' },
]

interface Formation {
  idFormation: number
  codeFormation: string
  nom: string
  categorie: string
  dureeHeures: number | null
}

interface Formateur {
  idFormateur: number
  nom: string
  prenom: string
  specialites: string[]
}

interface Salle {
  idSalle: number
  nom: string
  capaciteMax: number
}

export function FormationCourteForm({ onSubmit, onBack }: FormationCourteFormProps) {
  const [formData, setFormData] = useState<FormationCourteData>({
    codeFormation: '',
    dateDebut: '',
    dateFin: '',
    dureeHeures: 0,
    joursActifs: ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'],
    nbParticipants: 8,
    description: '',
  })

  const [formations, setFormations] = useState<Formation[]>([])
  const [salles, setSalles] = useState<Salle[]>([])
  const [formateurs, setFormateurs] = useState<Formateur[]>([])
  const [loadingFormations, setLoadingFormations] = useState(true)
  const [loadingRessources, setLoadingRessources] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Fenêtre temporelle en jours (informatif)
  const nbJours = formData.dateDebut && formData.dateFin
    ? Math.ceil((new Date(formData.dateFin).getTime() - new Date(formData.dateDebut).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0

  // Charger le catalogue formations depuis la BDD
  useEffect(() => {
    setLoadingFormations(true)
    fetch('/api/formations?actif=true')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Filtrer uniquement les formations courtes (pas CAP)
          const courtes = (data.formations as Formation[]).filter(
            f => f.categorie !== 'CAP'
          )
          setFormations(courtes)
        }
      })
      .catch(() => setFormations([]))
      .finally(() => setLoadingFormations(false))
  }, [])

  // Pré-remplir la durée quand une formation est sélectionnée
  useEffect(() => {
    if (formData.codeFormation) {
      const formation = formations.find(f => f.codeFormation === formData.codeFormation)
      if (formation?.dureeHeures) {
        setFormData(prev => ({ ...prev, dureeHeures: formation.dureeHeures as number }))
      }
    }
  }, [formData.codeFormation, formations])

  // Charger salles et formateurs depuis la BDD
  useEffect(() => {
    if (!formData.codeFormation || !formData.dateDebut || !formData.dateFin) return

    setLoadingRessources(true)
    Promise.all([
      fetch(`/api/salles?capacite=${formData.nbParticipants}`).then(r => r.json()),
      fetch('/api/formateurs?statut=ACTIF').then(r => r.json()),
    ])
      .then(([sallesData, formateursData]) => {
        if (sallesData.success) setSalles(sallesData.salles)
        if (formateursData.success) setFormateurs(formateursData.formateurs)
      })
      .catch(() => {})
      .finally(() => setLoadingRessources(false))
  }, [formData.codeFormation, formData.dateDebut, formData.dateFin, formData.nbParticipants])

  const handleJourToggle = (jour: JourSemaine) => {
    setFormData(prev => ({
      ...prev,
      joursActifs: prev.joursActifs.includes(jour)
        ? prev.joursActifs.filter(j => j !== jour)
        : [...prev.joursActifs, jour],
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
    if (!formData.dureeHeures || formData.dureeHeures <= 0) newErrors.push('Durée en heures requise')
    if (formData.joursActifs.length === 0) newErrors.push('Au moins un jour actif requis')
    if (formData.nbParticipants <= 0) newErrors.push('Nombre de participants invalide')

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors([])
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-1">
          Formation Courte
        </h2>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Marjorie planifiera les séances dans la fenêtre temporelle selon la durée et les jours actifs
        </p>
      </div>

      {errors.length > 0 && (
        <div className="p-3 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[rgb(var(--error))] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[rgb(var(--foreground))]">
              {errors.map((error, i) => <div key={i}>• {error}</div>)}
            </div>
          </div>
        </div>
      )}

      {/* Formation */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Formation *
        </label>
        {loadingFormations ? (
          <div className="text-sm text-[rgb(var(--muted-foreground))]">Chargement du catalogue...</div>
        ) : (
          <select
            value={formData.codeFormation}
            onChange={(e) => setFormData({ ...formData, codeFormation: e.target.value })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
            required
          >
            <option value="">Sélectionner une formation</option>
            {formations.map(f => (
              <option key={f.codeFormation} value={f.codeFormation}>
                {f.nom} {f.dureeHeures ? `(${f.dureeHeures}h)` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Dates + Durée heures */}
      <div className="grid grid-cols-3 gap-4">
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
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Durée totale (heures) *
          </label>
          <input
            type="number"
            value={formData.dureeHeures || ''}
            onChange={(e) => setFormData({ ...formData, dureeHeures: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
            min="1"
            placeholder="ex: 40"
            required
          />
        </div>
      </div>

      {/* Résumé fenêtre temporelle */}
      {nbJours > 0 && formData.dureeHeures > 0 && (
        <div className="p-3 bg-[rgba(var(--accent),0.08)] border border-[rgba(var(--accent),0.2)] rounded-lg">
          <p className="text-sm text-[rgb(var(--foreground))]">
            📅 Fenêtre : <span className="font-bold">{nbJours} jours</span> pour planifier{' '}
            <span className="font-bold">{formData.dureeHeures}h</span> de formation
            {formData.joursActifs.length > 0 && (
              <span className="text-[rgb(var(--muted-foreground))]">
                {' '}({formData.joursActifs.length} jour{formData.joursActifs.length > 1 ? 's' : ''}/semaine)
              </span>
            )}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Marjorie répartira les séances selon les disponibilités et les jours actifs
          </p>
        </div>
      )}

      {/* Jours actifs */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Jours actifs préférés *
        </label>
        <div className="flex flex-wrap gap-2">
          {JOURS_SEMAINE.map(jour => (
            <button
              key={jour.value}
              type="button"
              onClick={() => handleJourToggle(jour.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                formData.joursActifs.includes(jour.value)
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] border-[rgb(var(--accent))]'
                  : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] border-[rgba(var(--border),0.5)] hover:border-[rgb(var(--accent))]'
              }`}
            >
              {jour.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
          Marjorie peut ajuster selon les disponibilités réelles
        </p>
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

      {/* Salle (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Salle <span className="text-[rgb(var(--muted-foreground))] font-normal">(optionnel — Marjorie peut choisir)</span>
        </label>
        {loadingRessources ? (
          <div className="text-sm text-[rgb(var(--muted-foreground))]">Chargement...</div>
        ) : !formData.codeFormation || !formData.dateDebut ? (
          <div className="p-3 bg-[rgba(var(--secondary),0.5)] border border-[rgba(var(--border),0.3)] rounded-lg text-sm text-[rgb(var(--muted-foreground))]">
            Choisissez d'abord la formation et les dates
          </div>
        ) : (
          <select
            value={formData.salleId || ''}
            onChange={(e) => setFormData({ ...formData, salleId: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
          >
            <option value="">⏳ Laisser Marjorie choisir</option>
            {salles.map(s => (
              <option key={s.idSalle} value={s.idSalle}>
                {s.nom} ({s.capaciteMax} places)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Formateur (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Formateur <span className="text-[rgb(var(--muted-foreground))] font-normal">(optionnel — Marjorie peut choisir)</span>
        </label>
        {loadingRessources ? (
          <div className="text-sm text-[rgb(var(--muted-foreground))]">Chargement...</div>
        ) : !formData.codeFormation || !formData.dateDebut ? (
          <div className="p-3 bg-[rgba(var(--secondary),0.5)] border border-[rgba(var(--border),0.3)] rounded-lg text-sm text-[rgb(var(--muted-foreground))]">
            Choisissez d'abord la formation et les dates
          </div>
        ) : (
          <select
            value={formData.formateurId || ''}
            onChange={(e) => setFormData({
              ...formData,
              formateurId: e.target.value ? parseInt(e.target.value) : undefined,
            })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
          >
            <option value="">⏳ Laisser Marjorie choisir</option>
            {formateurs.map(f => (
              <option key={f.idFormateur} value={f.idFormateur}>
                {f.prenom} {f.nom} — {f.specialites.slice(0, 2).join(', ')}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Notes complémentaires <span className="text-[rgb(var(--muted-foreground))] font-normal">(optionnel)</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
          rows={3}
          placeholder="Ex: cours le samedi après-midi uniquement, groupe débutant adultes loisir..."
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
