/**
 * Page Planning Élève
 * Calendrier et planning des cours
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Bell,
  Download,
  Filter,
  Grid,
  List,
} from 'lucide-react'

// Données mockées
const MOCK_COURS_SEMAINE = [
  {
    id: 1,
    jour: 'Lundi',
    date: '2024-02-12',
    cours: [
      {
        id: 1,
        nom: 'Techniques de base - Soudure',
        horaire: '09:00 - 12:00',
        formateur: 'Pierre Durand',
        salle: 'Atelier principal',
        statut: 'CONFIRME',
      },
      {
        id: 2,
        nom: 'Dessin technique',
        horaire: '14:00 - 17:00',
        formateur: 'Marie Lambert',
        salle: 'Salle 2',
        statut: 'CONFIRME',
      },
    ],
  },
  {
    id: 2,
    jour: 'Mardi',
    date: '2024-02-13',
    cours: [
      {
        id: 3,
        nom: 'Histoire de la bijouterie',
        horaire: '09:00 - 11:00',
        formateur: 'Sophie Martin',
        salle: 'Salle théorique',
        statut: 'CONFIRME',
      },
    ],
  },
  {
    id: 3,
    jour: 'Mercredi',
    date: '2024-02-14',
    cours: [
      {
        id: 4,
        nom: 'Atelier pratique - Sertissage',
        horaire: '09:00 - 12:00',
        formateur: 'Pierre Durand',
        salle: 'Atelier principal',
        statut: 'MODIFIE',
        ancienHoraire: '14:00 - 17:00',
      },
      {
        id: 5,
        nom: 'Gemmologie',
        horaire: '14:00 - 16:00',
        formateur: 'Jean Bernard',
        salle: 'Laboratoire',
        statut: 'CONFIRME',
      },
    ],
  },
  {
    id: 4,
    jour: 'Jeudi',
    date: '2024-02-15',
    cours: [
      {
        id: 6,
        nom: 'Projet personnel',
        horaire: '09:00 - 17:00',
        formateur: 'Pierre Durand',
        salle: 'Atelier principal',
        statut: 'CONFIRME',
        important: true,
      },
    ],
  },
  {
    id: 5,
    jour: 'Vendredi',
    date: '2024-02-16',
    cours: [
      {
        id: 7,
        nom: 'Évaluation - Soudure',
        horaire: '09:00 - 12:00',
        formateur: 'Pierre Durand',
        salle: 'Atelier principal',
        statut: 'EVALUATION',
      },
    ],
  },
]

const MOCK_EVENEMENTS = [
  {
    id: 1,
    titre: 'Visite atelier Cartier',
    date: '2024-02-20',
    type: 'VISITE',
    description: 'Visite des ateliers de haute joaillerie',
  },
  {
    id: 2,
    titre: 'Remise des diplômes',
    date: '2024-03-15',
    type: 'CEREMONIE',
    description: 'Cérémonie de remise des diplômes promotion 2023',
  },
]

export default function ElevePlanning() {
  const [viewMode, setViewMode] = useState<'semaine' | 'mois'>('semaine')
  const [selectedWeek, setSelectedWeek] = useState(0)

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'CONFIRME':
        return 'badge-success'
      case 'MODIFIE':
        return 'badge-warning'
      case 'ANNULE':
        return 'badge-error'
      case 'EVALUATION':
        return 'badge-accent'
      default:
        return 'badge-default'
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'CONFIRME':
        return 'Confirmé'
      case 'MODIFIE':
        return 'Modifié'
      case 'ANNULE':
        return 'Annulé'
      case 'EVALUATION':
        return 'Évaluation'
      default:
        return statut
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
          Mon Planning
        </h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          Consultez votre emploi du temps et vos cours à venir
        </p>
      </div>

      {/* Contrôles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg">
            <button
              onClick={() => setViewMode('semaine')}
              className={`px-4 py-2 rounded-l-lg transition-colors ${
                viewMode === 'semaine'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                  : 'hover:bg-[rgba(var(--accent),0.05)] text-[rgb(var(--muted-foreground))]'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('mois')}
              className={`px-4 py-2 rounded-r-lg transition-colors ${
                viewMode === 'mois'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                  : 'hover:bg-[rgba(var(--accent),0.05)] text-[rgb(var(--muted-foreground))]'
              }`}
            >
              Mois
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            </button>
            <span className="px-4 py-2 font-medium text-[rgb(var(--foreground))]">
              {selectedWeek === 0 ? 'Cette semaine' : selectedWeek === 1 ? 'Semaine prochaine' : `Dans ${selectedWeek} semaines`}
            </span>
            <button
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            <span className="text-[rgb(var(--foreground))]">Filtrer</span>
          </button>
          <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center gap-2 text-[rgb(var(--accent))]">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Vue semaine */}
      {viewMode === 'semaine' && (
        <div className="space-y-4">
          {MOCK_COURS_SEMAINE.map((jour) => (
            <div
              key={jour.id}
              className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-[rgba(var(--accent),0.05)] to-transparent border-b border-[rgba(var(--border),0.3)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                      {jour.jour}
                    </h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {jour.date}
                    </p>
                  </div>
                  <span className="text-sm text-[rgb(var(--accent))]">
                    {jour.cours.length} cours
                  </span>
                </div>
              </div>

              <div className="p-4">
                {jour.cours.length === 0 ? (
                  <p className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                    Pas de cours ce jour
                  </p>
                ) : (
                  <div className="space-y-3">
                    {jour.cours.map((cours) => (
                      <div
                        key={cours.id}
                        className={`p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors ${
                          'important' in cours && cours.important ? 'border-l-4 border-[rgb(var(--accent))]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-[rgb(var(--foreground))] mb-1">
                              {cours.nom}
                            </h4>
                            {'ancienHoraire' in cours && cours.ancienHoraire && (
                              <p className="text-xs text-[rgb(var(--warning))] mb-1">
                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                Horaire modifié (ancien: {cours.ancienHoraire})
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatutBadge(cours.statut)}`}>
                            {getStatutLabel(cours.statut)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{cours.horaire}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{cours.formateur}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{cours.salle}</span>
                          </div>
                        </div>

                        {cours.statut === 'EVALUATION' && (
                          <div className="mt-3 p-2 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] rounded-lg">
                            <p className="text-sm text-[rgb(var(--accent))] font-medium flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Évaluation notée - Apportez votre matériel
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Événements à venir */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">
          Événements à venir
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_EVENEMENTS.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl hover:bg-[rgba(var(--accent),0.05)] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-[rgb(var(--foreground))]">
                    {event.titre}
                  </h3>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    {event.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  event.type === 'VISITE' ? 'badge-info' : 'badge-accent'
                }`}>
                  {event.type}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-[rgb(var(--accent))]">
                <Calendar className="w-4 h-4" />
                <span>{event.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rappels */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[rgba(var(--warning),0.1)] to-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-xl">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-[rgb(var(--warning))] mt-0.5" />
          <div>
            <h3 className="font-medium text-[rgb(var(--foreground))] mb-1">
              Rappels importants
            </h3>
            <ul className="space-y-1 text-sm text-[rgb(var(--muted-foreground))]">
              <li>• N'oubliez pas votre matériel pour l'évaluation de vendredi</li>
              <li>• Date limite de rendu du projet : 28 février 2024</li>
              <li>• Inscription obligatoire pour la visite Cartier avant le 15 février</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}