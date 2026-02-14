/**
 * Modal création formateur
 * Permet la saisie rapide d'un nouveau formateur après entretien
 * Les documents seront demandés ensuite par l'IA Marjorie
 */

'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, MapPin, BookOpen, Euro, AlertCircle } from 'lucide-react'

interface FormateurFormData {
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  codePostal: string
  ville: string
  specialites: string[]
  tarifJournalier: string
  siret: string
  anneesExperience: string
  anneesEnseignement: string
  bio: string
  notes: string
}

interface FormateurFormModalProps {
  onClose: () => void
  onSuccess?: () => void
}

const SPECIALITES_OPTIONS = [
  'Bijouterie traditionnelle',
  'Joaillerie création',
  'Sertissage griffe',
  'Sertissage clos',
  'Sertissage rail',
  'CAO/DAO 3D',
  'Polissage',
  'Taille de pierre',
  'Gemmologie',
  'Histoire et culture',
  'Techniques de base'
]

export function FormateurFormModal({ onClose, onSuccess }: FormateurFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormateurFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    specialites: [],
    tarifJournalier: '',
    siret: '',
    anneesExperience: '',
    anneesEnseignement: '',
    bio: '',
    notes: '',
  })

  const handleChange = (field: keyof FormateurFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const handleSpecialiteToggle = (specialite: string) => {
    const newSpecialites = formData.specialites.includes(specialite)
      ? formData.specialites.filter(s => s !== specialite)
      : [...formData.specialites, specialite]
    handleChange('specialites', newSpecialites)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const body = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone || null,
        adresse: formData.adresse || null,
        codePostal: formData.codePostal || null,
        ville: formData.ville || null,
        specialites: formData.specialites,
        tarifJournalier: formData.tarifJournalier ? parseFloat(formData.tarifJournalier) : null,
        siret: formData.siret || null,
        anneesExperience: formData.anneesExperience ? parseInt(formData.anneesExperience) : null,
        anneesEnseignement: formData.anneesEnseignement ? parseInt(formData.anneesEnseignement) : null,
        bio: formData.bio || null,
        notes: formData.notes || null,
      }

      const res = await fetch('/api/formateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        onSuccess?.()
        onClose()
      } else {
        setError(data.error || 'Erreur lors de la création')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <User className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Créer un formateur
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Saisie rapide après entretien - Marjorie demandera les documents ensuite
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
          <div className="space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-[rgba(var(--error),0.1)] border border-[rgb(var(--error))] rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[rgb(var(--error))] flex-shrink-0 mt-0.5" />
                <p className="text-[rgb(var(--error))] text-sm">{error}</p>
              </div>
            )}

            {/* Identité */}
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Identité
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    placeholder="Dupont"
                    className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    placeholder="Laurent"
                    className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="laurent.dupont@exemple.fr"
                    className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => handleChange('adresse', e.target.value)}
                    placeholder="15 rue de la République"
                    className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.codePostal}
                      onChange={(e) => handleChange('codePostal', e.target.value)}
                      placeholder="75001"
                      className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => handleChange('ville', e.target.value)}
                      placeholder="Paris"
                      className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Spécialités */}
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Spécialités
              </h3>
              <div className="flex flex-wrap gap-2">
                {SPECIALITES_OPTIONS.map(specialite => (
                  <button
                    key={specialite}
                    type="button"
                    onClick={() => handleSpecialiteToggle(specialite)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      formData.specialites.includes(specialite)
                        ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                        : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.1)]'
                    }`}
                  >
                    {specialite}
                  </button>
                ))}
              </div>
            </div>

            {/* Tarif et SIRET */}
            <div>
              <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Informations professionnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Tarif journalier (€)
                  </label>
                  <input
                    type="number"
                    value={formData.tarifJournalier}
                    onChange={(e) => handleChange('tarifJournalier', e.target.value)}
                    placeholder="550"
                    min="0"
                    step="50"
                    className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => handleChange('siret', e.target.value)}
                    placeholder="123 456 789 00012"
                    className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Expérience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Années d'expérience
                </label>
                <input
                  type="number"
                  value={formData.anneesExperience}
                  onChange={(e) => handleChange('anneesExperience', e.target.value)}
                  placeholder="15"
                  min="0"
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Années d'enseignement
                </label>
                <input
                  type="number"
                  value={formData.anneesEnseignement}
                  onChange={(e) => handleChange('anneesEnseignement', e.target.value)}
                  placeholder="8"
                  min="0"
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Biographie / Présentation
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Parcours, expertise, réalisations..."
                rows={3}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
              />
            </div>

            {/* Notes internes */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Notes internes (non visibles par le formateur)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notes d'entretien, impressions..."
                rows={2}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              ⚠️ Statut initial : EN_COURS_INTEGRATION • Marjorie demandera les documents par email
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></span>
                    Création...
                  </>
                ) : (
                  'Créer le formateur'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
