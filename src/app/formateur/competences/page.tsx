/**
 * Page Compétences & Conformité Formateur
 * Interface Qualiopi complète - 6 onglets dans le canvas
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import type { ProfilFormateur } from '@/types/formateur/profil.types'
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
  Euro,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Star,
  Target,
  Wrench,
  BookOpen,
  Layers,
  Clock,
  Users,
  Flag,
  MessageSquare,
  TrendingDown,
} from 'lucide-react'

export default function CompetencesPage() {
  const [activeTab, setActiveTab] = useState('profil')
  const router = useRouter()
  const { data: session } = useSession()

  // États pour les données du profil
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les données du profil au montage
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const response = await fetch('/api/formateur/profil')

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
          console.error('Erreur API:', response.status, errorData)
          throw new Error(errorData.error || `Erreur HTTP ${response.status}`)
        }

        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        console.error('Erreur chargement profil:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadProfile()
    }
  }, [session])

  // États de chargement et d'erreur
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[rgb(var(--muted-foreground))]">Chargement du profil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center space-y-4 p-6 bg-[rgba(var(--error),0.1)] rounded-lg border border-[rgba(var(--error),0.3)]">
            <AlertCircle className="w-12 h-12 text-[rgb(var(--error))] mx-auto" />
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Erreur de chargement</h3>
            <p className="text-[rgb(var(--muted-foreground))]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <p className="text-[rgb(var(--muted-foreground))]">Aucune donnée disponible</p>
        </div>
      </DashboardLayout>
    )
  }

  // Calcul des initiales pour l'avatar
  const initiales = profileData.prenom && profileData.nom
    ? `${profileData.prenom.charAt(0)}${profileData.nom.charAt(0)}`.toUpperCase()
    : 'XX'

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header/Cartouche/Onglets - partie fixe (ne scroll jamais) */}
        <div className="flex-shrink-0 space-y-4 pb-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
              Compétences & Conformité Qualiopi
            </h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Gestion de votre profil formateur et justificatifs Qualiopi (Indicateurs 21 & 22)
            </p>
          </div>

          {/* Cartouche Formateur */}
          <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] flex items-center gap-6">
            {/* Photo placeholder rectangulaire avec pointillés */}
            <div className="w-32 h-40 rounded-lg border-2 border-dashed border-[rgba(var(--border),0.5)] flex items-center justify-center bg-[rgba(var(--accent),0.05)] flex-shrink-0">
              <span className="text-4xl font-bold text-[rgb(var(--accent))]">
                {initiales}
              </span>
            </div>

            {/* Informations formateur - Grid 2 colonnes pour remplir tout l'espace */}
            <div className="flex-1 grid grid-cols-2 gap-8 items-center">
              {/* Colonne gauche - Nom */}
              <div>
                <h2 className="text-5xl font-bold text-[rgb(var(--foreground))]">
                  {profileData.prenom} {profileData.nom}
                </h2>
              </div>

              {/* Colonne droite - Contacts */}
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-2xl text-[rgb(var(--foreground))]">
                  <Mail className="w-8 h-8 text-[rgb(var(--accent))]" />
                  <span className="font-medium">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-4 text-2xl text-[rgb(var(--foreground))]">
                  <Phone className="w-8 h-8 text-[rgb(var(--accent))]" />
                  <span className="font-medium">{profileData.telephone}</span>
                </div>
                <div className="flex items-center gap-4 text-2xl text-[rgb(var(--foreground))]">
                  <Euro className="w-8 h-8 text-[rgb(var(--accent))]" />
                  <span className="font-medium">{profileData.tarifHoraire}€/heure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Onglets */}
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

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
          {/* Onglet 1 - Profil Formateur */}
          {activeTab === 'profil' && (
            <div className="space-y-6">
              {/* Expertise métier */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Domaines d'expertise
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {/* Affichage des domaines depuis les compétences techniques */}
                  {profileData.competences && profileData.competences.length > 0 ? (
                    // Extraire les domaines uniques des compétences
                    [...new Set(profileData.competences.map((c: any) => c.domaine || 'Général'))].map((domaine, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded-lg text-sm font-medium border border-[rgba(var(--accent),0.2)]"
                      >
                        {domaine}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      Aucun domaine d'expertise renseigné. Complétez votre profil Qualiopi.
                    </span>
                  )}
                </div>

                {/* Bouton d'accès au formulaire Qualiopi */}
                <div className="mb-6">
                  <button
                    onClick={() => router.push('/formateur/profil')}
                    className="w-full px-6 py-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-light))] text-[rgb(var(--primary))] rounded-lg font-semibold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                  >
                    <FileText className="w-5 h-5" />
                    Renseigner mon profil Qualiopi complet
                  </button>
                </div>

                {/* Stats expérience */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience métier</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-[rgb(var(--accent))]">{profileData.anneesExperienceMetier || 0}</p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">ans</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience enseignement</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-[rgb(var(--accent))]">{profileData.anneesExperienceEnseignement || 0}</p>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">ans</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Présentation synthétique générée par IA */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                    Présentation synthétique
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(var(--accent),0.1)] rounded-full">
                    <Star className="w-3 h-3 text-[rgb(var(--accent))]" />
                    <span className="text-xs font-medium text-[rgb(var(--accent))]">Généré par IA</span>
                  </div>
                </div>
                {profileData.bio ? (
                  <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed italic">
                    {profileData.bio}
                  </p>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucune présentation disponible. Complétez votre profil Qualiopi pour générer une présentation automatique.
                  </p>
                )}
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-3">
                  Cette présentation est automatiquement générée par Marjorie à partir de vos compétences, diplômes et expériences.
                </p>
              </div>
            </div>
          )}

          {/* Onglet 2 - Compétences & Qualifications */}
          {activeTab === 'competences' && (
            <div className="space-y-6">
              {/* Section A - Qualifications métier */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Qualifications métier
                </h3>

                {/* Diplômes métier */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Diplômes professionnels</h4>
                  {profileData.diplomes && profileData.diplomes.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.diplomes.map((diplome: any) => (
                        <div
                          key={diplome.id}
                          className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
                                <h5 className="font-semibold text-[rgb(var(--foreground))]">{diplome.titre}</h5>
                              </div>
                              <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">{diplome.etablissement}</p>
                              <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                                <Calendar className="w-3 h-3" />
                                {new Date(diplome.dateObtention).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="px-2 py-1 bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] rounded text-xs font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Valide
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                      Aucun diplôme renseigné. Complétez votre profil Qualiopi.
                    </p>
                  )}
                </div>

                {/* Certifications professionnelles */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Certifications professionnelles</h4>
                  {profileData.certifications && profileData.certifications.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.certifications.map((cert: any) => (
                      <div
                        key={cert.id}
                        className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-4 h-4 text-[rgb(var(--accent))]" />
                              <h5 className="font-semibold text-[rgb(var(--foreground))]">{cert.nom}</h5>
                            </div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">{cert.organisme}</p>
                            <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                              <Calendar className="w-3 h-3" />
                              Obtenue le {new Date(cert.dateObtention).toLocaleDateString('fr-FR')}
                              {cert.dateExpiration && (
                                <span className="ml-2">• Expire le {new Date(cert.dateExpiration).toLocaleDateString('fr-FR')}</span>
                              )}
                              {!cert.dateExpiration && (
                                <span className="ml-2">• Sans expiration</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] rounded text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Valide
                            </div>
                            <button className="p-2 hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-colors">
                              <Download className="w-4 h-4 text-[rgb(var(--accent))]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                      Aucune certification renseignée. Complétez votre profil Qualiopi.
                    </p>
                  )}
                </div>

                {/* Portfolio réalisations */}
                <div>
                  <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Portfolio de réalisations</h4>
                  {profileData.portfolio && profileData.portfolio.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {profileData.portfolio.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] hover:border-[rgba(var(--accent),0.3)] transition-colors"
                        >
                          <div className="aspect-video bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-lg mb-3 flex items-center justify-center">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.titre} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <FileText className="w-12 h-12 text-[rgb(var(--accent))] opacity-50" />
                            )}
                          </div>
                          <h5 className="font-semibold text-[rgb(var(--foreground))] mb-1">{item.titre}</h5>
                          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[rgb(var(--muted-foreground))]">{item.date}</span>
                            {item.lienUrl && (
                              <a href={item.lienUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[rgb(var(--accent))] hover:underline">
                                Voir détails
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                      Aucune réalisation dans le portfolio. Complétez votre profil Qualiopi.
                    </p>
                  )}
                </div>
              </div>

              {/* Section B - Qualifications pédagogiques */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
                    <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
                    Qualifications pédagogiques
                  </h3>
                  <div className="px-3 py-1 bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] rounded-full text-xs font-medium">
                    {profileData.formationsPedagogiques?.length || 0} formations validées
                  </div>
                </div>

                {profileData.formationsPedagogiques && profileData.formationsPedagogiques.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.formationsPedagogiques.map((formation: any) => (
                      <div
                        key={formation.id}
                        className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
                              <h5 className="font-semibold text-[rgb(var(--foreground))]">{formation.intitule}</h5>
                            </div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">{formation.organisme}</p>
                            <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(formation.date).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {formation.duree}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] rounded text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Valide
                            </div>
                            <button className="p-2 hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-colors">
                              <Download className="w-4 h-4 text-[rgb(var(--accent))]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucune formation pédagogique renseignée. Complétez votre profil Qualiopi.
                  </p>
                )}

                <div className="mt-4 p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">Conformité Qualiopi</h5>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                        Vos qualifications pédagogiques sont conformes aux exigences Qualiopi (Indicateur 21).
                        Les certificats sont à jour et démontrent votre capacité à former des adultes selon les méthodes actives et participatives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet 3 - Expertise & Méthodes */}
          {activeTab === 'expertise' && (
            <div className="space-y-6">
              {/* Approche pédagogique */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[rgb(var(--accent))]" />
                    Approche pédagogique
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(var(--accent),0.1)] rounded-full">
                    <Star className="w-3 h-3 text-[rgb(var(--accent))]" />
                    <span className="text-xs font-medium text-[rgb(var(--accent))]">Générée par IA</span>
                  </div>
                </div>
                {profileData.approchePedagogique ? (
                  <>
                    <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed italic mb-3">
                      {profileData.approchePedagogique}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Cette approche est synthétisée par Marjorie à partir de vos méthodes et retours d'expérience.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucune approche pédagogique renseignée. Complétez votre profil Qualiopi pour une description générée automatiquement.
                  </p>
                )}
              </div>

              {/* Méthodes pédagogiques */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Méthodes pédagogiques utilisées
                </h3>
                {profileData.methodesPedagogiques ? (
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]">
                    <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed whitespace-pre-line">
                      {profileData.methodesPedagogiques}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucune méthode pédagogique renseignée. Complétez votre profil Qualiopi.
                  </p>
                )}
              </div>

              {/* Compétences techniques détaillées */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Compétences techniques détaillées
                </h3>
                {profileData.competences && profileData.competences.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {profileData.competences.map((competence: any) => (
                      <div
                        key={competence.id}
                        className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[rgb(var(--foreground))]">{competence.nom}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            competence.niveau === 'expert'
                              ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]'
                              : 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))]'
                          }`}>
                            {competence.niveau}
                          </span>
                        </div>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">
                          {competence.anneesExperience} ans de pratique
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucune compétence technique renseignée. Complétez votre profil Qualiopi.
                  </p>
                )}
              </div>

              {/* Outils et supports pédagogiques */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Outils et supports pédagogiques
                </h3>
                {profileData.outilsSupports && profileData.outilsSupports.length > 0 ? (
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]">
                    <div className="flex flex-wrap gap-2">
                      {profileData.outilsSupports.map((outil: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded-full text-xs font-medium border border-[rgba(var(--accent),0.2)]"
                        >
                          {outil}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucun outil pédagogique renseigné. Complétez votre profil Qualiopi.
                  </p>
                )}

                <div className="mt-4 p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">Conformité Qualiopi - Indicateur 22</h5>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                        Vos méthodes pédagogiques et outils sont conformes aux exigences Qualiopi.
                        L'approche centrée sur l'apprenant et l'utilisation d'outils adaptés démontrent
                        votre capacité à transmettre efficacement les compétences métier.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet 4 - Maintien des Compétences */}
          {activeTab === 'maintien' && (
            <div className="space-y-6">
              {/* Formations continues */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))]" />
                    Formations continues récentes
                  </h3>
                  <div className="px-3 py-1 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded-full text-xs font-medium">
                    {profileData.formationsContinues?.length || 0} formations continues
                  </div>
                </div>

                {profileData.formationsContinues && profileData.formationsContinues.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.formationsContinues.map((formation: any) => (
                      <div
                        key={formation.id}
                        className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
                              <h5 className="font-semibold text-[rgb(var(--foreground))]">{formation.titre}</h5>
                            </div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">{formation.organisme}</p>
                            <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(formation.date).toLocaleDateString('fr-FR')}
                              </div>
                              {formation.dureeHeures && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formation.dureeHeures}h
                                </div>
                              )}
                              {formation.type && (
                                <span className="px-2 py-0.5 rounded-full bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))]">
                                  {formation.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucune formation continue renseignée. Complétez votre profil Qualiopi.
                  </p>
                )}
              </div>

              {/* Veille professionnelle */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Veille professionnelle et participation
                </h3>

                {profileData.veilleProfessionnelle && profileData.veilleProfessionnelle.length > 0 ? (
                  <div className="space-y-4">
                    {/* Group by type */}
                    {Object.entries(
                      profileData.veilleProfessionnelle.reduce((acc: any, veille: any) => {
                        const type = veille.type || 'Autre'
                        if (!acc[type]) acc[type] = []
                        acc[type].push(veille)
                        return acc
                      }, {})
                    ).map(([type, activites]: [string, any]) => (
                      <div key={type}>
                        <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">{type}</h4>
                        <div className="space-y-2">
                          {activites.map((activite: any) => (
                            <div
                              key={activite.id}
                              className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[rgb(var(--foreground))]">{activite.titre}</p>
                                {activite.source && (
                                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{activite.source}</p>
                                )}
                                {activite.description && (
                                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 italic">{activite.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(activite.date).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucune activité de veille professionnelle renseignée. Complétez votre profil Qualiopi.
                  </p>
                )}
              </div>

              {/* Réseaux professionnels */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Réseaux professionnels
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                  Aucune participation à des réseaux professionnels renseignée. Cette fonctionnalité sera bientôt disponible pour compléter votre profil Qualiopi.
                </p>
              </div>

              {/* Objectifs de développement */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Objectifs de développement professionnel
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                  Aucun objectif de développement renseigné. Cette fonctionnalité sera bientôt disponible pour définir et suivre vos objectifs professionnels.
                </p>
              </div>

              {/* Conformité Qualiopi */}
              <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">Conformité Qualiopi - Indicateur 21</h5>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                      Votre engagement dans le maintien et le développement de vos compétences est conforme aux exigences Qualiopi.
                      Les formations continues récentes, la veille professionnelle active et les objectifs de développement définis
                      démontrent votre implication dans l'actualisation de vos compétences métier et pédagogiques.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet 5 - Traçabilité Pédagogique */}
          {activeTab === 'tracabilite' && (
            <div className="space-y-6">
              {/* Statistiques d'enseignement */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Statistiques d'enseignement
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Élèves formés</p>
                    <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                      {profileData.nombreElevesFormes || 0}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                      depuis {profileData.anneesExperienceEnseignement || 0} ans
                    </p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Taux de réussite</p>
                    <p className="text-3xl font-bold text-[rgb(var(--success))]">
                      {profileData.tauxReussite || 0}%
                    </p>
                    <div className="mt-2 h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                        style={{ width: `${profileData.tauxReussite || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Satisfaction</p>
                    <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                      {profileData.satisfactionMoyenne ? `${profileData.satisfactionMoyenne}/5` : 'N/A'}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">note moyenne</p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience</p>
                    <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                      {profileData.anneesExperienceMetier || 0}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">ans métier</p>
                  </div>
                </div>
              </div>

              {/* Taux de réussite par formation */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Taux de réussite par formation
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                  Aucune donnée détaillée de taux de réussite par formation disponible. Le taux global de réussite est affiché dans les statistiques ci-dessus.
                </p>
              </div>

              {/* Évaluations par les élèves */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Évaluations par les élèves
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                  Aucune évaluation détaillée par session disponible. La note de satisfaction moyenne est affichée dans les statistiques ci-dessus.
                </p>
              </div>

              {/* Témoignages élèves */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Témoignages d'anciens élèves
                </h3>
                {profileData.temoignagesEleves && profileData.temoignagesEleves.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {profileData.temoignagesEleves.map((temoignage: any) => (
                      <div key={temoignage.id} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold">
                            {temoignage.prenom.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[rgb(var(--foreground))]">{temoignage.prenom}</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">{temoignage.formation} - {temoignage.annee}</p>
                          </div>
                          {temoignage.note && (
                            <div className="flex items-center gap-1">
                              {[...Array(temoignage.note)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-[rgb(var(--warning))] fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-[rgb(var(--foreground))] italic leading-relaxed">
                          "{temoignage.commentaire}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucun témoignage d'élève disponible pour le moment.
                  </p>
                )}
              </div>

              {/* Conformité Qualiopi */}
              <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">Traçabilité Qualiopi</h5>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                      Vos résultats pédagogiques et les retours d'évaluation des élèves attestent de la qualité de votre enseignement.
                      Le taux de réussite élevé et les évaluations positives démontrent votre efficacité en tant que formateur
                      et votre contribution à l'amélioration continue des formations ABJ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet 6 - Documents & Preuves */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Résumé documents */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(var(--accent),0.1)] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[rgb(var(--accent))]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
                        -
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Documents administratifs</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(var(--success),0.1)] flex items-center justify-center">
                      <Award className="w-6 h-6 text-[rgb(var(--success))]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
                        {(profileData.diplomes?.length || 0) + (profileData.certifications?.length || 0) + (profileData.formationsPedagogiques?.length || 0)}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Qualifications & diplômes</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(var(--info),0.1)] flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-[rgb(var(--info))]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
                        {profileData.veilleProfessionnelle?.length || 0}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Veille professionnelle</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV du formateur */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Curriculum Vitae
                </h3>
                {profileData.cvUrl ? (
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[rgba(var(--accent),0.1)] flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[rgb(var(--accent))]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[rgb(var(--foreground))]">CV - {profileData.prenom} {profileData.nom}</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">Document disponible</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={profileData.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[rgb(var(--accent))] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </a>
                      <button className="px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors flex items-center gap-2 text-sm border border-[rgba(var(--border),0.2)]">
                        <Upload className="w-4 h-4" />
                        Mettre à jour
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                    Aucun CV téléchargé. Veuillez ajouter votre CV pour compléter votre profil Qualiopi.
                  </p>
                )}
              </div>

              {/* Documents administratifs */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Documents administratifs
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                  La gestion documentaire administrative sera bientôt disponible pour suivre vos documents Qualiopi (CNI, RIB, assurances, etc.).
                </p>
              </div>

              {/* Documents qualifications */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Qualifications & Diplômes
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                  La gestion documentaire des qualifications sera bientôt disponible. Vos diplômes, certifications et formations pédagogiques sont affichés dans l'onglet "Compétences & Qualifications".
                </p>
              </div>

              {/* Documents veille professionnelle */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Veille professionnelle & Formation continue
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
                  La gestion documentaire de la veille professionnelle sera bientôt disponible. Vos activités de veille et formations continues sont affichées dans l'onglet "Maintien des compétences".
                </p>
              </div>

              {/* Conformité Qualiopi */}
              <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[rgb(var(--success))] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-1">Documentation complète Qualiopi</h5>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
                      L'ensemble de vos justificatifs sont à jour et conformes aux exigences Qualiopi.
                      Tous les documents administratifs, qualifications et preuves de veille professionnelle
                      sont centralisés et accessibles pour tout audit de certification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
