/**
 * Page Ressources Formateur
 * Gestion des documents et supports pédagogiques
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  FileText,
  Video,
  Image,
  Download,
  Upload,
  Folder,
  FolderOpen,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Share2,
  Link,
  Clock,
  Users,
  Star,
  MoreVertical,
  Plus,
  BookOpen,
  File,
  ChevronRight,
  Cloud,
} from 'lucide-react'

// Données mockées
const MOCK_DOSSIERS = [
  {
    id: 1,
    nom: 'CAP Bijouterie-Joaillerie',
    nbFichiers: 45,
    taille: '2.3 GB',
    modifie: '2024-02-05',
    partage: true,
  },
  {
    id: 2,
    nom: 'Initiation Bijouterie',
    nbFichiers: 23,
    taille: '850 MB',
    modifie: '2024-02-03',
    partage: true,
  },
  {
    id: 3,
    nom: 'Techniques avancées',
    nbFichiers: 18,
    taille: '1.1 GB',
    modifie: '2024-01-28',
    partage: false,
  },
]

const MOCK_FICHIERS_RECENTS = [
  {
    id: 1,
    nom: 'Support_Soudure_Base.pdf',
    type: 'PDF',
    taille: '15 MB',
    modifie: '2024-02-08',
    vues: 45,
    telechargements: 12,
    note: 4.5,
  },
  {
    id: 2,
    nom: 'Video_Technique_Sertissage.mp4',
    type: 'VIDEO',
    taille: '250 MB',
    modifie: '2024-02-07',
    vues: 89,
    telechargements: 23,
    note: 4.8,
  },
  {
    id: 3,
    nom: 'Exercices_Dessin_Technique.docx',
    type: 'DOCUMENT',
    taille: '8 MB',
    modifie: '2024-02-06',
    vues: 34,
    telechargements: 18,
    note: 4.2,
  },
  {
    id: 4,
    nom: 'Modeles_3D_Bagues.zip',
    type: 'ARCHIVE',
    taille: '450 MB',
    modifie: '2024-02-05',
    vues: 67,
    telechargements: 31,
    note: 4.7,
  },
]

const MOCK_CATEGORIES = [
  { nom: 'Supports de cours', count: 156, icon: BookOpen },
  { nom: 'Vidéos tutoriels', count: 42, icon: Video },
  { nom: 'Exercices', count: 89, icon: FileText },
  { nom: 'Modèles 3D', count: 34, icon: Image },
]

export default function FormateurRessources() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState<any>(null)

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5" />
      case 'VIDEO':
        return <Video className="w-5 h-5" />
      case 'DOCUMENT':
        return <File className="w-5 h-5" />
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
      case 'DOCUMENT':
        return 'text-[rgb(var(--success))]'
      default:
        return 'text-[rgb(var(--muted-foreground))]'
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
          Ressources pédagogiques
        </h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          Gérez et partagez vos supports de cours
        </p>
      </div>

      {/* Actions et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Rechercher dans les ressources..."
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
          <button className="px-4 py-2 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))] rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Statistiques d'utilisation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Cloud className="w-6 h-6 text-[rgb(var(--accent))]" />
            <span className="text-xs text-[rgb(var(--success))]">75% utilisé</span>
          </div>
          <p className="text-xl font-bold text-[rgb(var(--foreground))]">4.2 GB</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Espace utilisé</p>
        </div>
        <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-6 h-6 text-[rgb(var(--info))]" />
          </div>
          <p className="text-xl font-bold text-[rgb(var(--foreground))]">321</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Fichiers totaux</p>
        </div>
        <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Download className="w-6 h-6 text-[rgb(var(--success))]" />
          </div>
          <p className="text-xl font-bold text-[rgb(var(--foreground))]">1,245</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Téléchargements</p>
        </div>
        <div className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-6 h-6 text-[rgb(var(--warning))]" />
          </div>
          <p className="text-xl font-bold text-[rgb(var(--foreground))]">4.6/5</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Note moyenne</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar catégories */}
        <div className="space-y-4">
          {/* Catégories */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl p-4">
            <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Catégories</h3>
            <div className="space-y-2">
              {MOCK_CATEGORIES.map((cat, idx) => {
                const Icon = cat.icon
                return (
                  <button
                    key={idx}
                    className="w-full p-3 bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[rgb(var(--accent))]" />
                      <span className="text-sm text-[rgb(var(--foreground))]">{cat.nom}</span>
                    </div>
                    <span className="text-xs text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--accent))]">
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dossiers */}
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl p-4">
            <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Mes dossiers</h3>
            <div className="space-y-2">
              {MOCK_DOSSIERS.map((dossier) => (
                <button
                  key={dossier.id}
                  onClick={() => setSelectedFolder(dossier)}
                  className={`w-full p-3 rounded-lg transition-colors flex items-center justify-between group ${
                    selectedFolder?.id === dossier.id
                      ? 'bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)]'
                      : 'bg-[rgb(var(--secondary))] hover:bg-[rgba(var(--accent),0.05)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedFolder?.id === dossier.id ? (
                      <FolderOpen className="w-4 h-4 text-[rgb(var(--accent))]" />
                    ) : (
                      <Folder className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                        {dossier.nom}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {dossier.nbFichiers} fichiers • {dossier.taille}
                      </p>
                    </div>
                  </div>
                  {dossier.partage && (
                    <Share2 className="w-3 h-3 text-[rgb(var(--success))]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone principale - Fichiers */}
        <div className="lg:col-span-3">
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
            <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                  {selectedFolder ? selectedFolder.nom : 'Fichiers récents'}
                </h2>
                <span className="text-sm text-[rgb(var(--muted-foreground))]">
                  {MOCK_FICHIERS_RECENTS.length} fichiers
                </span>
              </div>
            </div>

            <div className="p-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MOCK_FICHIERS_RECENTS.map((fichier) => (
                    <div
                      key={fichier.id}
                      className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-all hover:shadow-lg cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 bg-[rgb(var(--card))] rounded-lg ${getFileColor(fichier.type)}`}>
                          {getFileIcon(fichier.type)}
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[rgba(var(--accent),0.1)]">
                          <MoreVertical className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                        </button>
                      </div>

                      <h3 className="font-medium text-sm text-[rgb(var(--foreground))] mb-1 truncate">
                        {fichier.nom}
                      </h3>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-3">
                        {fichier.taille} • {fichier.modifie}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {fichier.vues}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {fichier.telechargements}
                        </span>
                        <span className="flex items-center gap-1 text-[rgb(var(--warning))]">
                          <Star className="w-3 h-3 fill-current" />
                          {fichier.note}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 py-1 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded text-xs hover:bg-[rgba(var(--accent),0.2)] transition-colors">
                          Ouvrir
                        </button>
                        <button className="flex-1 py-1 bg-[rgba(var(--info),0.1)] text-[rgb(var(--info))] rounded text-xs hover:bg-[rgba(var(--info),0.2)] transition-colors">
                          Partager
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {MOCK_FICHIERS_RECENTS.map((fichier) => (
                    <div
                      key={fichier.id}
                      className="p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 bg-[rgb(var(--card))] rounded-lg ${getFileColor(fichier.type)}`}>
                          {getFileIcon(fichier.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-[rgb(var(--foreground))]">
                            {fichier.nom}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                            <span>{fichier.taille}</span>
                            <span>Modifié le {fichier.modifie}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {fichier.vues}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {fichier.telechargements}
                            </span>
                            <span className="flex items-center gap-1 text-[rgb(var(--warning))]">
                              <Star className="w-3 h-3 fill-current" />
                              {fichier.note}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                          <Eye className="w-4 h-4 text-[rgb(var(--accent))]" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                          <Share2 className="w-4 h-4 text-[rgb(var(--info))]" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                          <Download className="w-4 h-4 text-[rgb(var(--success))]" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[rgba(var(--error),0.1)] transition-colors">
                          <Trash2 className="w-4 h-4 text-[rgb(var(--error))]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton charger plus */}
              <button className="w-full mt-6 p-3 border border-dashed border-[rgba(var(--accent),0.3)] rounded-lg text-sm text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2">
                Charger plus de fichiers
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}