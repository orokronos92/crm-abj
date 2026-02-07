/**
 * Page Compétences & Conformité Formateur
 * Interface Qualiopi complète - 6 onglets dans le canvas
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  User,
  Award,
  Lightbulb,
  TrendingUp,
  BarChart3,
  FolderOpen,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Star,
} from 'lucide-react'

// Données fictives formateur ABJ
const FORMATEUR_DATA = {
  id: 1,
  nom: 'Laurent',
  prenom: 'Marc',
  email: 'marc.laurent@abj-formation.fr',
  telephone: '06 12 34 56 78',
  statut: 'Intervenant externe',
  photo_initiales: 'ML',

  // Profil
  domaines_expertise: ['Bijouterie', 'Sertissage', 'Joaillerie fine'],
  annees_experience: 18,
  annees_enseignement: 12,
  cv_url: '/documents/cv-marc-laurent.pdf',
  presentation: "Artisan bijoutier-joaillier depuis 18 ans, spécialisé en sertissage griffe et micro-pavage. Formateur passionné depuis 12 ans, j'accompagne les apprenants dans l'excellence du geste et la précision du travail. Titulaire du CAP Art et techniques de la bijouterie-joaillerie et du BMA (Brevet des Métiers d'Art), j'ai également suivi plusieurs formations pédagogiques pour améliorer mes méthodes d'enseignement.",

  // Compétences métier
  diplomes_metier: [
    {
      id: 1,
      nom: 'CAP Art et techniques de la bijouterie-joaillerie',
      date_obtention: '2006-06-15',
      etablissement: 'CFA de la bijouterie Paris',
      document_url: '/documents/cap-bijouterie.pdf',
      statut: 'valide'
    },
    {
      id: 2,
      nom: 'BMA Bijouterie-Joaillerie option Bijouterie Sertissage',
      date_obtention: '2008-06-20',
      etablissement: 'Lycée Technique Paris',
      document_url: '/documents/bma-sertissage.pdf',
      statut: 'valide'
    }
  ],

  certifications_pro: [
    {
      id: 1,
      nom: 'Certification Sertisseur Expert',
      organisme: 'Institut Français de Gemmologie',
      date_obtention: '2015-03-10',
      date_expiration: null,
      document_url: '/documents/cert-sertisseur.pdf',
      statut: 'valide'
    }
  ],

  portfolio: [
    {
      id: 1,
      titre: 'Alliance pavage diamants',
      description: 'Réalisation micro-pavage 42 diamants 0.8mm',
      image_url: '/portfolio/alliance-pavage.jpg',
      annee: '2023'
    },
    {
      id: 2,
      titre: 'Bague solitaire serti griffe',
      description: 'Sertissage griffe 6 branches diamant 1.5ct',
      image_url: '/portfolio/solitaire-griffe.jpg',
      annee: '2023'
    }
  ],

  // Compétences pédagogiques
  formations_pedagogiques: [
    {
      id: 1,
      intitule: 'Formation de Formateurs Professionnels d\'Adultes (FPA)',
      organisme: 'AFPA',
      date: '2012-09-15',
      duree_heures: 350,
      certificat_url: '/documents/fpa-2012.pdf',
      statut: 'valide'
    },
    {
      id: 2,
      intitule: 'Pédagogie active et gestion de groupe',
      organisme: 'Institut de Formation Pédagogique',
      date: '2018-05-20',
      duree_heures: 21,
      certificat_url: '/documents/pedagogie-active.pdf',
      statut: 'valide'
    },
    {
      id: 3,
      intitule: 'Évaluation des compétences en formation',
      organisme: 'CNAM',
      date: '2020-11-10',
      duree_heures: 28,
      certificat_url: '/documents/evaluation-competences.pdf',
      statut: 'valide'
    }
  ],
}

export default function CompetencesPage() {
  const [activeTab, setActiveTab] = useState('profil')

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header page */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">
            Compétences & Conformité Qualiopi
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Gestion de votre profil formateur et justificatifs Qualiopi (Indicateurs 21 & 22)
          </p>
        </div>

        {/* Onglets horizontaux dans le canvas */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-[rgba(var(--border),0.3)]">
            {[
              { id: 'profil', label: 'Profil', icon: User },
              { id: 'competences', label: 'Compétences & Qualifications', icon: Award },
              { id: 'expertise', label: 'Expertise & Méthodes', icon: Lightbulb },
              { id: 'maintien', label: 'Maintien des Compétences', icon: TrendingUp },
              { id: 'tracabilite', label: 'Traçabilité Pédagogique', icon: BarChart3 },
              { id: 'documents', label: 'Documents & Preuves', icon: FolderOpen },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-[rgb(var(--accent))] text-[rgb(var(--accent))]'
                      : 'border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {/* Onglet 1 - Profil Formateur */}
          {activeTab === 'profil' && (
            <div className="space-y-6">
              {/* Carte identité */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <div className="flex items-start gap-6">
                  {/* Photo */}
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                    {FORMATEUR_DATA.photo_initiales}
                  </div>

                  {/* Infos principales */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
                      {FORMATEUR_DATA.prenom} {FORMATEUR_DATA.nom}
                    </h2>
                    <div className="inline-block px-3 py-1 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded-full text-sm font-medium mb-4">
                      {FORMATEUR_DATA.statut}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
                        <Mail className="w-4 h-4 text-[rgb(var(--accent))]" />
                        {FORMATEUR_DATA.email}
                      </div>
                      <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
                        <Phone className="w-4 h-4 text-[rgb(var(--accent))]" />
                        {FORMATEUR_DATA.telephone}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expertise métier */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Domaines d'expertise
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {FORMATEUR_DATA.domaines_expertise.map((domaine, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded-lg text-sm font-medium border border-[rgba(var(--accent),0.2)]"
                    >
                      {domaine}
                    </span>
                  ))}
                </div>

                {/* Stats expérience */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience métier</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-[rgb(var(--accent))]">{FORMATEUR_DATA.annees_experience}</p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">ans</p>
                    </div>
                    <div className="mt-2 h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-600"
                        style={{ width: `${Math.min((FORMATEUR_DATA.annees_experience / 25) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience enseignement</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-[rgb(var(--accent))]">{FORMATEUR_DATA.annees_enseignement}</p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">ans</p>
                    </div>
                    <div className="mt-2 h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-600"
                        style={{ width: `${Math.min((FORMATEUR_DATA.annees_enseignement / 25) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Formateur */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Curriculum Vitae
                </h3>
                <div className="flex items-center justify-between p-4 bg-[rgb(var(--secondary))] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[rgba(var(--accent),0.1)] rounded-lg">
                      <FileText className="w-6 h-6 text-[rgb(var(--accent))]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">CV_Marc_Laurent_2024.pdf</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Dernière mise à jour : 15/01/2024</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                    <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Mettre à jour
                    </button>
                  </div>
                </div>
              </div>

              {/* Présentation */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">
                  Présentation synthétique
                </h3>
                <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed">
                  {FORMATEUR_DATA.presentation}
                </p>
                <button className="mt-4 px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                  Modifier la présentation
                </button>
              </div>
            </div>
          )}

          {/* Onglet 2 - Compétences (placeholder) */}
          {activeTab === 'competences' && (
            <div className="p-12 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] text-center">
              <Award className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Compétences & Qualifications</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">En cours de développement...</p>
            </div>
          )}

          {/* Onglet 3 - Expertise (placeholder) */}
          {activeTab === 'expertise' && (
            <div className="p-12 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] text-center">
              <Lightbulb className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Expertise & Méthodes</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">En cours de développement...</p>
            </div>
          )}

          {/* Onglet 4 - Maintien (placeholder) */}
          {activeTab === 'maintien' && (
            <div className="p-12 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] text-center">
              <TrendingUp className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Maintien des Compétences</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">En cours de développement...</p>
            </div>
          )}

          {/* Onglet 5 - Traçabilité (placeholder) */}
          {activeTab === 'tracabilite' && (
            <div className="p-12 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] text-center">
              <BarChart3 className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Traçabilité Pédagogique</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">En cours de développement...</p>
            </div>
          )}

          {/* Onglet 6 - Documents (placeholder) */}
          {activeTab === 'documents' && (
            <div className="p-12 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] text-center">
              <FolderOpen className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">Documents & Preuves</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">En cours de développement...</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
