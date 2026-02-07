/**
 * Page Documents Élève
 * Accès aux documents de formation et supports de cours
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Folder,
  File,
  Video,
  Image,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Grid,
  List,
  ChevronRight,
  Star,
  Calendar,
} from 'lucide-react'

// Données mockées
const MOCK_CATEGORIES = [
  {
    id: 1,
    nom: 'Supports de cours',
    icon: BookOpen,
    count: 24,
    color: 'accent',
  },
  {
    id: 2,
    nom: 'Exercices',
    icon: FileText,
    count: 18,
    color: 'info',
  },
  {
    id: 3,
    nom: 'Vidéos tutoriels',
    icon: Video,
    count: 12,
    color: 'success',
  },
  {
    id: 4,
    nom: 'Documents administratifs',
    icon: Award,
    count: 6,
    color: 'warning',
  },
]

const MOCK_DOCUMENTS_RECENTS = [
  {
    id: 1,
    nom: 'Support_Soudure_Module1.pdf',
    type: 'PDF',
    categorie: 'Supports de cours',
    taille: '15 MB',
    dateAjout: '2024-02-05',
    formateur: 'Pierre Durand',
    nouveau: true,
    important: true,
  },
  {
    id: 2,
    nom: 'Exercices_Dessin_Technique.pdf',
    type: 'PDF',
    categorie: 'Exercices',
    taille: '8 MB',
    dateAjout: '2024-02-03',
    formateur: 'Marie Lambert',
    nouveau: true,
    aRendre: '2024-02-15',
  },
  {
    id: 3,
    nom: 'Video_Technique_Sertissage.mp4',
    type: 'VIDEO',
    categorie: 'Vidéos tutoriels',
    taille: '250 MB',
    dateAjout: '2024-02-01',
    formateur: 'Pierre Durand',
    duree: '45 min',
  },
  {
    id: 4,
    nom: 'Attestation_Presence_Janvier.pdf',
    type: 'CERTIFICAT',
    categorie: 'Documents administratifs',
    taille: '2 MB',
    dateAjout: '2024-01-31',
    signe: true,
  },
]

const MOCK_DOSSIERS = [
  {
    id: 1,
    nom: 'Module 1 - Bases',
    nbFichiers: 12,
    progression: 75,
  },
  {
    id: 2,
    nom: 'Module 2 - Soudure',
    nbFichiers: 8,
    progression: 60,
  },
  {
    id: 3,
    nom: 'Module 3 - Sertissage',
    nbFichiers: 10,
    progression: 30,
  },
]

const MOCK_DEVOIRS = [
  {
    id: 1,
    titre: 'Projet bague argent',
    dateRendu: '2024-02-28',
    statut: 'EN_COURS',
    progression: 40,
  },
  {
    id: 2,
    titre: 'Exercices dessin technique',
    dateRendu: '2024-02-15',
    statut: 'A_FAIRE',
    progression: 0,
  },
]

export default function EleveDocuments() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5" />
      case 'VIDEO':
        return <Video className="w-5 h-5" />
      case 'IMAGE':
        return <Image className="w-5 h-5" />
      case 'CERTIFICAT':
        return <Award className="w-5 h-5" />
      default:
        return <File className="w-5 h-5" />
    }
  }

  const getFileColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'text-[rgb(var(--error))]'
      case 'VIDEO':
        return 'text-[rgb(var(--info))]'
      case 'CERTIFICAT':
        return 'text-[rgb(var(--accent))]'
      default:
        return 'text-[rgb(var(--muted-foreground))]'
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
          Mes Documents
        </h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          Accédez à tous vos supports de cours et documents
        </p>
      </div>

      {/* Actions et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Rechercher un document..."
            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent),0.2)]"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <span className="text-[rgb(var(--foreground))]">Filtrer</span>
          </button>
          <div className="flex bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                  : 'hover:bg-[rgba(var(--accent),0.05)] text-[rgb(var(--muted-foreground))]'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                  : 'hover:bg-[rgba(var(--accent),0.05)] text-[rgb(var(--muted-foreground))]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Catégories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {MOCK_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.nom)}
              className={`p-4 rounded-xl transition-all hover:scale-105 ${
                selectedCategory === cat.nom
                  ? `bg-gradient-to-br from-[rgb(var(--${cat.color}))] to-[rgba(var(--${cat.color}),0.8)] text-[rgb(var(--primary))]`
                  : 'bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] hover:border-[rgba(var(--accent),0.3)]'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${
                selectedCategory === cat.nom ? 'text-[rgb(var(--primary))]' : `text-[rgb(var(--${cat.color}))]`
              }`} />
              <p className={`font-medium ${
                selectedCategory === cat.nom ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--foreground))]'
              }`}>
                {cat.nom}
              </p>
              <p className={`text-sm mt-1 ${
                selectedCategory === cat.nom ? 'text-[rgba(var(--primary),0.9)]' : 'text-[rgb(var(--muted-foreground))]'
              }`}>
                {cat.count} fichiers
              </p>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents principaux */}
        <div className="lg:col-span-2">
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
            <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  Documents récents
                </h2>
                <span className="text-sm text-[rgb(var(--muted-foreground))]">
                  {MOCK_DOCUMENTS_RECENTS.length} documents
                </span>
              </div>
            </div>

            <div className="p-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_DOCUMENTS_RECENTS.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-all hover:shadow-lg cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 bg-[rgb(var(--card))] rounded-lg ${getFileColor(doc.type)}`}>
                          {getFileIcon(doc.type)}
                        </div>
                        <div className="flex gap-1">
                          {doc.nouveau && (
                            <span className="px-2 py-0.5 bg-[rgb(var(--success))] text-[rgb(var(--primary))] text-xs rounded-full">
                              NEW
                            </span>
                          )}
                          {doc.important && (
                            <Star className="w-4 h-4 text-[rgb(var(--warning))] fill-current" />
                          )}
                        </div>
                      </div>

                      <h3 className="font-medium text-sm text-[rgb(var(--foreground))] mb-1 truncate">
                        {doc.nom}
                      </h3>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">
                        {doc.categorie}
                      </p>
                      {doc.formateur && (
                        <p className="text-xs text-[rgb(var(--accent))] mb-1">
                          Par {doc.formateur}
                        </p>
                      )}
                      {doc.aRendre && (
                        <p className="text-xs text-[rgb(var(--warning))] mb-2">
                          À rendre le {doc.aRendre}
                        </p>
                      )}
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {doc.taille} • {doc.dateAjout}
                      </p>

                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 py-1 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded text-xs hover:bg-[rgba(var(--accent),0.2)] transition-colors">
                          <Eye className="w-3 h-3 inline mr-1" />
                          Voir
                        </button>
                        <button className="flex-1 py-1 bg-[rgba(var(--info),0.1)] text-[rgb(var(--info))] rounded text-xs hover:bg-[rgba(var(--info),0.2)] transition-colors">
                          <Download className="w-3 h-3 inline mr-1" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {MOCK_DOCUMENTS_RECENTS.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 bg-[rgb(var(--card))] rounded-lg ${getFileColor(doc.type)}`}>
                          {getFileIcon(doc.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-[rgb(var(--foreground))]">
                              {doc.nom}
                            </h3>
                            {doc.nouveau && (
                              <span className="px-2 py-0.5 bg-[rgb(var(--success))] text-[rgb(var(--primary))] text-xs rounded-full">
                                NEW
                              </span>
                            )}
                            {doc.important && (
                              <Star className="w-3 h-3 text-[rgb(var(--warning))] fill-current" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                            <span>{doc.categorie}</span>
                            {doc.formateur && <span>Par {doc.formateur}</span>}
                            <span>{doc.taille}</span>
                            <span>{doc.dateAjout}</span>
                            {doc.aRendre && (
                              <span className="text-[rgb(var(--warning))]">
                                À rendre le {doc.aRendre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                          <Eye className="w-4 h-4 text-[rgb(var(--accent))]" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[rgba(var(--info),0.1)] transition-colors">
                          <Download className="w-4 h-4 text-[rgb(var(--info))]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Modules de formation */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl p-4">
            <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">
              Modules de formation
            </h3>
            <div className="space-y-3">
              {MOCK_DOSSIERS.map((dossier) => (
                <div key={dossier.id} className="p-3 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-[rgb(var(--accent))]" />
                      <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                        {dossier.nom}
                      </span>
                    </div>
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">
                      {dossier.nbFichiers} fichiers
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))]"
                      style={{ width: `${dossier.progression}%` }}
                    />
                  </div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    {dossier.progression}% complété
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Devoirs à rendre */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl p-4">
            <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">
              Devoirs à rendre
            </h3>
            <div className="space-y-3">
              {MOCK_DEVOIRS.map((devoir) => (
                <div key={devoir.id} className="p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <h4 className="text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                    {devoir.titre}
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">
                      Date limite : {devoir.dateRendu}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      devoir.statut === 'EN_COURS' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {devoir.statut === 'EN_COURS' ? 'En cours' : 'À faire'}
                    </span>
                  </div>
                  {devoir.progression > 0 && (
                    <>
                      <div className="w-full h-1.5 bg-[rgba(var(--secondary),0.5)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[rgb(var(--warning))] to-[rgb(var(--warning-light))]"
                          style={{ width: `${devoir.progression}%` }}
                        />
                      </div>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                        {devoir.progression}% complété
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents signes */}
          <div className="p-4 bg-gradient-to-br from-[rgba(var(--success),0.1)] to-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-[rgb(var(--success))]" />
              <h3 className="font-medium text-[rgb(var(--foreground))]">
                Documents signés
              </h3>
            </div>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
              3 documents disponibles
            </p>
            <button className="w-full py-2 bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.2)] text-[rgb(var(--success))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--success),0.2)] transition-colors">
              Voir tous les certificats
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}