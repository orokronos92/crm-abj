/**
 * Page Prospects
 * Liste et gestion des prospects
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import Link from 'next/link'
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  FileText,
  MessageSquare,
  ChevronRight,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Send,
  Clock,
  Euro,
  GraduationCap,
  Sparkles,
  Users,
} from 'lucide-react'

// Données mockées
const MOCK_PROSPECTS = [
  {
    id: 'PROS_001',
    nom: 'Martin',
    prenom: 'Sophie',
    email: 'sophie.martin@email.fr',
    telephone: '06 12 34 56 78',
    formation_souhaitee: 'CAP Bijouterie-Joaillerie',
    statut: 'NOUVEAU',
    source: 'Site web',
    financement: 'CPF',
    nb_echanges: 3,
    dernier_contact: '2024-02-06',
    date_premier_contact: '2024-01-15',
    ville: 'Paris',
    code_postal: '75002',
    resume_ia: 'Reconversion professionnelle, très motivée. Expérience en design. Budget confirmé via CPF.',
  },
  {
    id: 'PROS_002',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.fr',
    telephone: '06 98 76 54 32',
    formation_souhaitee: 'Initiation Bijouterie',
    statut: 'EN_ATTENTE',
    source: 'Salon',
    financement: 'Personnel',
    nb_echanges: 8,
    dernier_contact: '2024-02-05',
    date_premier_contact: '2024-01-10',
    ville: 'Lyon',
    code_postal: '69002',
    resume_ia: 'Passionné, cherche formation courte. Disponible immédiatement.',
  },
  {
    id: 'PROS_003',
    nom: 'Bernard',
    prenom: 'Marie',
    email: 'marie.bernard@email.fr',
    telephone: '06 55 44 33 22',
    formation_souhaitee: 'Perfectionnement Sertissage',
    statut: 'CANDIDAT',
    source: 'Recommandation',
    financement: 'OPCO',
    nb_echanges: 12,
    dernier_contact: '2024-02-04',
    date_premier_contact: '2023-12-20',
    ville: 'Marseille',
    code_postal: '13001',
    resume_ia: 'Bijoutière confirmée, souhaite se perfectionner. Dossier OPCO en cours.',
  },
]

const STATUT_COLORS = {
  NOUVEAU: 'badge-info',
  EN_ATTENTE: 'badge-warning',
  CANDIDAT: 'badge-success',
  REFUSE: 'badge-error',
}

export default function ProspectsPage() {
  const [selectedProspect, setSelectedProspect] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)]">
        {/* Liste principale */}
        <div className={`flex-1 flex flex-col ${selectedProspect ? 'pr-96' : ''}`}>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
                Prospects
              </h1>
              <Link href="/admin/prospects/nouveau">
                <button className="btn-gold px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nouveau prospect
                </button>
              </Link>
            </div>

            {/* Card total prospects */}
            <div className="mb-4 p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[rgb(var(--accent))] flex items-center justify-center">
                  <Users className="w-6 h-6 text-[rgb(var(--primary))]" />
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] font-medium">
                    Total prospects
                  </p>
                  <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
                    {MOCK_PROSPECTS.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent),0.2)]"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-lg border ${
                  showFilters
                    ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] border-[rgb(var(--accent))]'
                    : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] border-[rgba(var(--border),0.5)]'
                } transition-all flex items-center gap-2`}
              >
                <Filter className="w-5 h-5" />
                Filtres
              </button>
              <button className="px-4 py-2.5 rounded-lg bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] text-[rgb(var(--foreground))] hover:border-[rgba(var(--accent),0.3)] transition-all">
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* Filtres détaillés */}
            {showFilters && (
              <div className="mt-4 p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg animate-fadeIn">
                <div className="grid grid-cols-3 gap-4">
                  <select className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))]">
                    <option value="">Tous les statuts</option>
                    <option value="NOUVEAU">Nouveau</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="CANDIDAT">Candidat</option>
                  </select>
                  <select className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))]">
                    <option value="">Toutes les formations</option>
                    <option value="CAP">CAP Bijouterie</option>
                    <option value="INIT">Initiation</option>
                    <option value="PERF">Perfectionnement</option>
                  </select>
                  <select className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))]">
                    <option value="">Tous les financements</option>
                    <option value="CPF">CPF</option>
                    <option value="OPCO">OPCO</option>
                    <option value="Perso">Personnel</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Tableau */}
          <div className="flex-1 overflow-auto">
            <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(var(--border),0.3)]">
                    <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                      Prospect
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                      Échanges
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                      Dernier contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--accent))] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(var(--border),0.2)]">
                  {MOCK_PROSPECTS.map((prospect) => (
                    <tr
                      key={prospect.id}
                      className="hover:bg-[rgba(var(--accent),0.03)] transition-colors cursor-pointer"
                      onClick={() => setSelectedProspect(prospect)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                            {prospect.prenom.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {prospect.prenom} {prospect.nom}
                            </p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              {prospect.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))]">
                        {prospect.formation_souhaitee}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${STATUT_COLORS[prospect.statut as keyof typeof STATUT_COLORS]}`}>
                          {prospect.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[rgb(var(--foreground))]">
                        {prospect.source}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                          <span className="text-sm text-[rgb(var(--foreground))]">
                            {prospect.nb_echanges}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[rgb(var(--muted-foreground))]">
                        {prospect.dernier_contact}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Action voir
                            }}
                            className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                          >
                            <Eye className="w-4 h-4 text-[rgb(var(--accent))]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Action email
                            }}
                            className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                          >
                            <Mail className="w-4 h-4 text-[rgb(var(--accent))]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Action plus
                            }}
                            className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel détail latéral */}
        {selectedProspect && (
          <div className="fixed right-0 top-16 bottom-0 w-96 bg-[rgb(var(--card))] border-l border-[rgba(var(--accent),0.1)] shadow-xl animate-slideInRight overflow-y-auto">
            {/* Header du panel */}
            <div className="sticky top-0 bg-[rgb(var(--card))] border-b border-[rgba(var(--border),0.3)] p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold text-lg">
                    {selectedProspect.prenom.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                      {selectedProspect.prenom} {selectedProspect.nom}
                    </h2>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUT_COLORS[selectedProspect.statut as keyof typeof STATUT_COLORS]}`}>
                      {selectedProspect.statut}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProspect(null)}
                  className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                >
                  <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>

              {/* Actions rapides */}
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[rgb(var(--accent-light))] transition-colors">
                  <Mail className="w-4 h-4" />
                  Envoyer email
                </button>
                <button className="flex-1 px-3 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[rgba(var(--accent),0.1)] transition-colors border border-[rgba(var(--border),0.5)]">
                  <Phone className="w-4 h-4" />
                  Appeler
                </button>
              </div>
            </div>

            {/* Contenu du panel */}
            <div className="p-6 space-y-6">
              {/* Informations de contact */}
              <div>
                <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                  Contact
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--foreground))]">
                      {selectedProspect.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--foreground))]">
                      {selectedProspect.telephone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--foreground))]">
                      {selectedProspect.code_postal} {selectedProspect.ville}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formation souhaitée */}
              <div>
                <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                  Formation
                </h3>
                <div className="p-3 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
                    <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {selectedProspect.formation_souhaitee}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      Financement: {selectedProspect.financement}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                  Historique
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <div className="flex-1">
                      <p className="text-sm text-[rgb(var(--foreground))]">
                        Premier contact
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {selectedProspect.date_premier_contact}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <div className="flex-1">
                      <p className="text-sm text-[rgb(var(--foreground))]">
                        Dernier contact
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {selectedProspect.dernier_contact}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <div className="flex-1">
                      <p className="text-sm text-[rgb(var(--foreground))]">
                        Nombre d'échanges
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {selectedProspect.nb_echanges} messages
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Résumé IA */}
              <div>
                <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Analyse Marjorie
                </h3>
                <div className="p-4 bg-[rgba(var(--accent),0.03)] border border-[rgba(var(--accent),0.1)] rounded-lg">
                  <p className="text-sm text-[rgb(var(--foreground))] italic">
                    "{selectedProspect.resume_ia}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                  Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.1)] transition-colors border border-[rgba(var(--border),0.5)] flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Générer devis
                  </button>
                  <button className="w-full px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.1)] transition-colors border border-[rgba(var(--border),0.5)] flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Envoyer dossier
                  </button>
                  <button className="w-full px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.1)] transition-colors border border-[rgba(var(--border),0.5)] flex items-center justify-center gap-2">
                    <User className="w-4 h-4" />
                    Convertir en candidat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}