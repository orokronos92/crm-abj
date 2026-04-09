/**
 * EditCandidatModal
 * Modal d'édition rapide des infos contact d'un candidat (stockées sur le prospect)
 */

'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, MapPin, CheckCircle, Loader2 } from 'lucide-react'

interface EditCandidatModalProps {
  candidat: {
    id_prospect: string
    nom: string
    prenom: string
    email: string
    telephone: string
    adresse: string | null
    code_postal: string | null
    ville: string | null
  }
  onClose: () => void
  onSuccess: (updated: { nom: string; prenom: string; email: string; telephone: string; adresse: string | null; code_postal: string | null; ville: string | null }) => void
}

export function EditCandidatModal({ candidat, onClose, onSuccess }: EditCandidatModalProps) {
  const [formData, setFormData] = useState({
    nom: candidat.nom || '',
    prenom: candidat.prenom || '',
    email: candidat.email || '',
    telephone: candidat.telephone || '',
    adresse: candidat.adresse || '',
    codePostal: candidat.code_postal || '',
    ville: candidat.ville || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setError('Le nom et le prénom sont obligatoires')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        adresse: formData.adresse.trim() || null,
        codePostal: formData.codePostal.trim() || null,
        ville: formData.ville.trim() || null,
      }
      if (formData.email.trim()) payload.emails = [formData.email.trim()]
      if (formData.telephone.trim()) payload.telephones = [formData.telephone.trim()]

      const res = await fetch(`/api/prospects/${candidat.id_prospect}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      setSaved(true)
      setTimeout(() => {
        onSuccess({
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          email: formData.email.trim(),
          telephone: formData.telephone.trim(),
          adresse: formData.adresse.trim() || null,
          code_postal: formData.codePostal.trim() || null,
          ville: formData.ville.trim() || null,
        })
        onClose()
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <User className="w-5 h-5 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Modifier le candidat</h2>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">{candidat.id_prospect}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Succès */}
        {saved && (
          <div className="flex flex-col items-center justify-center gap-3 p-8 flex-1">
            <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">Fiche mise à jour avec succès</p>
          </div>
        )}

        {/* Formulaire */}
        {!saved && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="p-3 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg text-sm text-[rgb(var(--error))]">
                {error}
              </div>
            )}

            {/* Identité */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))] mb-3">Identité</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">
                    Nom <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleChange('nom', e.target.value)}
                      placeholder="Dupont"
                      className="w-full pl-9 pr-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">
                    Prénom <span className="text-[rgb(var(--error))]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleChange('prenom', e.target.value)}
                      placeholder="Marie"
                      className="w-full pl-9 pr-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))] mb-3">Contact</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="marie@exemple.fr"
                      className="w-full pl-9 pr-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => handleChange('telephone', e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full pl-9 pr-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--muted-foreground))] mb-3">Adresse</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => handleChange('adresse', e.target.value)}
                      placeholder="12 rue des Orfèvres"
                      className="w-full pl-9 pr-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">Code postal</label>
                    <input
                      type="text"
                      value={formData.codePostal}
                      onChange={(e) => handleChange('codePostal', e.target.value)}
                      placeholder="75001"
                      className="w-full px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1">Ville</label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => handleChange('ville', e.target.value)}
                      placeholder="Paris"
                      className="w-full px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        {!saved && (
          <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
