/**
 * Page Nouveau prospect
 * Formulaire de création manuelle d'un prospect
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home as HomeIcon,
  GraduationCap,
  Euro,
  ArrowLeft,
  Save,
  Sparkles,
} from 'lucide-react'

export default function NouveauProspectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    formation_souhaitee: '',
    financement: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Appel API pour créer le prospect
    // await fetch('/api/prospects', { method: 'POST', body: JSON.stringify(formData) })

    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/admin/prospects')
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--accent))] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux prospects
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center">
              <User className="w-7 h-7 text-[rgb(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                Nouveau prospect
              </h1>
              <p className="text-[rgb(var(--muted-foreground))] mt-1">
                Ajoutez manuellement un nouveau prospect au pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Info Marjorie */}
        <div className="mb-6 p-4 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
              Pipeline automatique avec Marjorie
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Une fois créé, Marjorie prendra en charge le suivi du prospect : collecte des documents,
              qualification, et accompagnement jusqu'à la candidature.
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identité */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[rgb(var(--accent))]" />
              Identité
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                  placeholder="Martin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                  placeholder="Sophie"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[rgb(var(--accent))]" />
              Contact
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                    placeholder="sophie.martin@email.fr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Téléphone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[rgb(var(--accent))]" />
              Adresse
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Rue
                </label>
                <div className="relative">
                  <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                    placeholder="15 rue de la Paix"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                    placeholder="75002"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                    placeholder="Paris"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Projet de formation */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
              Projet de formation
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Formation souhaitée *
                </label>
                <select
                  name="formation_souhaitee"
                  value={formData.formation_souhaitee}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                >
                  <option value="">Sélectionnez une formation</option>
                  <option value="CAP Bijouterie-Joaillerie">CAP Bijouterie-Joaillerie</option>
                  <option value="Sertissage Niveau 1">Sertissage Niveau 1</option>
                  <option value="Sertissage Niveau 2">Sertissage Niveau 2</option>
                  <option value="Joaillerie Création">Joaillerie Création</option>
                  <option value="Taille Lapidaire">Taille Lapidaire</option>
                  <option value="CAO/DAO Bijouterie">CAO/DAO Bijouterie</option>
                  <option value="Gemmologie">Gemmologie</option>
                  <option value="Polissage">Polissage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Financement envisagé
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  <select
                    name="financement"
                    value={formData.financement}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
                  >
                    <option value="">Non renseigné</option>
                    <option value="CPF">CPF</option>
                    <option value="OPCO">OPCO</option>
                    <option value="Pôle Emploi">Pôle Emploi</option>
                    <option value="Personnel">Financement personnel</option>
                    <option value="Entreprise">Entreprise</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-[rgba(var(--border),0.3)]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg border border-[rgba(var(--border),0.5)] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Créer le prospect
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
