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

  // Expertise & Méthodes
  methodes_pedagogiques: [
    {
      id: 1,
      nom: 'Démonstration pratique',
      description: 'Démonstration du geste technique avec explication détaillée des étapes',
      frequence_utilisation: 95
    },
    {
      id: 2,
      nom: 'Pédagogie du geste',
      description: 'Accompagnement individualisé sur la précision et la maîtrise du geste',
      frequence_utilisation: 90
    },
    {
      id: 3,
      nom: 'Apprentissage par l\'erreur',
      description: 'Analyse des erreurs pour progresser et comprendre les points de vigilance',
      frequence_utilisation: 85
    },
    {
      id: 4,
      nom: 'Projets progressifs',
      description: 'Réalisations allant du simple au complexe pour consolider les acquis',
      frequence_utilisation: 80
    }
  ],

  outils_supports: [
    {
      id: 1,
      categorie: 'Outils de démonstration',
      items: ['Loupe binoculaire', 'Caméra USB pour projection', 'Établi de démonstration']
    },
    {
      id: 2,
      categorie: 'Supports pédagogiques',
      items: ['Fiches techniques illustrées', 'Vidéos de gestes techniques', 'Catalogue de réalisations']
    },
    {
      id: 3,
      categorie: 'Outils d\'évaluation',
      items: ['Grilles d\'évaluation critériées', 'Portfolio de progression', 'Auto-évaluation guidée']
    }
  ],

  competences_techniques: [
    {
      id: 1,
      domaine: 'Sertissage',
      techniques: [
        { nom: 'Serti griffe', niveau: 'Expert', annees_pratique: 18 },
        { nom: 'Serti clos', niveau: 'Expert', annees_pratique: 18 },
        { nom: 'Serti rail', niveau: 'Expert', annees_pratique: 15 },
        { nom: 'Micro-pavage', niveau: 'Expert', annees_pratique: 12 }
      ]
    },
    {
      id: 2,
      domaine: 'Bijouterie',
      techniques: [
        { nom: 'Limage', niveau: 'Expert', annees_pratique: 18 },
        { nom: 'Brasage', niveau: 'Expert', annees_pratique: 18 },
        { nom: 'Polissage', niveau: 'Avancé', annees_pratique: 18 },
        { nom: 'Montage', niveau: 'Expert', annees_pratique: 16 }
      ]
    }
  ],

  approche_pedagogique: "Ma pédagogie repose sur la transmission du geste juste et l'accompagnement bienveillant. Je crois fermement que la bijouterie s'apprend par la répétition et la patience. Chaque apprenant progresse à son rythme, et mon rôle est de détecter les blocages techniques pour les transformer en opportunités d'apprentissage. J'utilise beaucoup la démonstration pratique avec loupe projetée, permettant aux élèves de visualiser les micro-gestes essentiels. L'erreur est valorisée comme levier de progression, et j'encourage l'autonomie par des projets personnels encadrés.",

  // Maintien des compétences
  veille_professionnelle: [
    {
      id: 1,
      type: 'Salons professionnels',
      activites: [
        { nom: 'Salon International de la Haute Joaillerie Paris', date: '2024-01-15', duree_jours: 3 },
        { nom: 'Bijorhca Paris', date: '2024-09-10', duree_jours: 4 }
      ]
    },
    {
      id: 2,
      type: 'Formations continues',
      activites: [
        { nom: 'Nouvelles techniques de micro-pavage', organisme: 'École de Joaillerie Paris', date: '2024-03-20', duree_heures: 14 },
        { nom: 'Perfectionnement sertissage invisible', organisme: 'Institut Français de Gemmologie', date: '2024-06-05', duree_heures: 21 }
      ]
    },
    {
      id: 3,
      type: 'Conférences et webinaires',
      activites: [
        { nom: 'Webinaire : Évolution des tendances en joaillerie 2024', date: '2024-02-12', duree_heures: 2 },
        { nom: 'Conférence : Innovation et tradition en bijouterie', date: '2024-05-18', duree_heures: 3 }
      ]
    }
  ],

  formations_continues: [
    {
      id: 1,
      intitule: 'Perfectionnement techniques de sertissage avancé',
      organisme: 'École Boulle Paris',
      date_debut: '2023-11-10',
      date_fin: '2023-11-24',
      duree_heures: 35,
      domaine: 'Technique métier',
      certificat_url: '/documents/perfectionnement-serti-2023.pdf',
      statut: 'termine'
    },
    {
      id: 2,
      intitule: 'Digitalisation de la formation : outils numériques',
      organisme: 'AFPA',
      date_debut: '2024-01-15',
      date_fin: '2024-01-17',
      duree_heures: 21,
      domaine: 'Pédagogie',
      certificat_url: '/documents/digital-formation-2024.pdf',
      statut: 'termine'
    },
    {
      id: 3,
      intitule: 'Prévention et gestion des RPS en formation',
      organisme: 'Institut de Formation Pédagogique',
      date_debut: '2024-10-05',
      date_fin: '2024-10-06',
      duree_heures: 14,
      domaine: 'Pédagogie',
      certificat_url: '/documents/rps-formation-2024.pdf',
      statut: 'planifie'
    }
  ],

  participation_reseaux: [
    {
      id: 1,
      nom: 'Fédération Française de la Bijouterie Joaillerie Orfèvrerie',
      role: 'Membre actif',
      depuis: '2015'
    },
    {
      id: 2,
      nom: 'Réseau des Formateurs Métiers d\'Art',
      role: 'Intervenant régulier',
      depuis: '2018'
    }
  ],

  objectifs_developpement: [
    {
      id: 1,
      objectif: 'Maîtriser les techniques de CAO/DAO appliquées au sertissage',
      echeance: '2025-06-30',
      progression: 35,
      actions: ['Formation MatrixGold prévue mars 2025', 'Pratique sur projets pilotes']
    },
    {
      id: 2,
      objectif: 'Obtenir la certification Formateur Numérique Responsable',
      echeance: '2025-12-31',
      progression: 60,
      actions: ['Formation digitale terminée', 'Dossier de certification en cours']
    }
  ],

  // Traçabilité pédagogique
  statistiques_enseignement: {
    total_eleves_formes: 142,
    taux_reussite_global: 87,
    annees_anciennete: 12,
    heures_enseignement_annuel: 680,
    sessions_annee_en_cours: 8
  },

  evaluations_eleves: [
    {
      id: 1,
      session: 'CAP Bijouterie - Session Mars 2024',
      nb_eleves: 12,
      note_moyenne_formateur: 4.8,
      commentaires_positifs: [
        'Pédagogie claire et patiente',
        'Excellentes démonstrations pratiques',
        'Très disponible pour répondre aux questions'
      ],
      axes_amelioration: [
        'Prévoir plus de temps pour les exercices libres'
      ],
      date_evaluation: '2024-06-15'
    },
    {
      id: 2,
      session: 'Sertissage Niveau 1 - Session Septembre 2024',
      nb_eleves: 8,
      note_moyenne_formateur: 4.9,
      commentaires_positifs: [
        'Très bon accompagnement individuel',
        'Explications techniques précises',
        'Création d\'une ambiance de travail agréable'
      ],
      axes_amelioration: [],
      date_evaluation: '2024-12-10'
    }
  ],

  taux_reussite_formations: [
    {
      formation: 'CAP Art et techniques de la bijouterie-joaillerie',
      nb_sessions: 18,
      nb_candidats: 156,
      taux_reussite: 89,
      periode: '2018-2024'
    },
    {
      formation: 'Sertissage Niveau 1',
      nb_sessions: 12,
      nb_candidats: 84,
      taux_reussite: 92,
      periode: '2020-2024'
    },
    {
      formation: 'Sertissage Niveau 2 - Perfectionnement',
      nb_sessions: 6,
      nb_candidats: 42,
      taux_reussite: 95,
      periode: '2021-2024'
    }
  ],

  temoignages_eleves: [
    {
      id: 1,
      prenom: 'Sophie',
      formation: 'CAP Bijouterie',
      annee: '2024',
      commentaire: 'Marc m\'a transmis sa passion du sertissage avec une patience exceptionnelle. Ses démonstrations à la loupe m\'ont permis de comprendre les micro-gestes essentiels. Grâce à lui, j\'ai obtenu mon CAP avec mention.',
      note: 5
    },
    {
      id: 2,
      prenom: 'Thomas',
      formation: 'Sertissage Niveau 2',
      annee: '2023',
      commentaire: 'Un formateur hors pair qui sait transmettre son expertise tout en valorisant nos erreurs comme des opportunités d\'apprentissage. Le meilleur enseignant que j\'ai eu dans mon parcours.',
      note: 5
    }
  ],

  // Documents et preuves
  documents_administratifs: [
    {
      id: 1,
      categorie: 'Identité et statut',
      documents: [
        { nom: 'Carte d\'identité', statut: 'valide', date_ajout: '2018-01-15', url: '/documents/cni.pdf' },
        { nom: 'Carte Vitale', statut: 'valide', date_ajout: '2023-06-10', url: '/documents/vitale.pdf' },
        { nom: 'Attestation statut auto-entrepreneur', statut: 'valide', date_ajout: '2024-01-08', url: '/documents/ae-statut.pdf' }
      ]
    },
    {
      id: 2,
      categorie: 'Assurances et responsabilités',
      documents: [
        { nom: 'Assurance Responsabilité Civile Professionnelle', statut: 'valide', date_ajout: '2024-01-01', url: '/documents/rcpro-2024.pdf', expiration: '2025-01-01' },
        { nom: 'Attestation d\'assurance multirisque', statut: 'valide', date_ajout: '2024-01-01', url: '/documents/assurance-multi.pdf', expiration: '2025-01-01' }
      ]
    }
  ],

  documents_qualifications: [
    {
      id: 1,
      categorie: 'Diplômes métier',
      documents: [
        { nom: 'CAP Art et techniques de la bijouterie-joaillerie', statut: 'valide', date_ajout: '2018-01-15', url: '/documents/cap-bijouterie.pdf' },
        { nom: 'BMA Bijouterie-Joaillerie option Sertissage', statut: 'valide', date_ajout: '2018-01-15', url: '/documents/bma-sertissage.pdf' }
      ]
    },
    {
      id: 2,
      categorie: 'Certifications professionnelles',
      documents: [
        { nom: 'Certification Sertisseur Expert', statut: 'valide', date_ajout: '2018-03-20', url: '/documents/cert-sertisseur.pdf' }
      ]
    },
    {
      id: 3,
      categorie: 'Formations pédagogiques',
      documents: [
        { nom: 'Certificat FPA (Formation de Formateurs)', statut: 'valide', date_ajout: '2018-09-25', url: '/documents/fpa-2012.pdf' },
        { nom: 'Attestation Pédagogie active et gestion de groupe', statut: 'valide', date_ajout: '2018-05-28', url: '/documents/pedagogie-active.pdf' },
        { nom: 'Attestation Évaluation des compétences', statut: 'valide', date_ajout: '2020-11-18', url: '/documents/evaluation-competences.pdf' },
        { nom: 'Attestation Digitalisation de la formation', statut: 'valide', date_ajout: '2024-01-20', url: '/documents/digital-formation-2024.pdf' }
      ]
    }
  ],

  documents_veille: [
    {
      id: 1,
      categorie: 'Salons et événements professionnels',
      documents: [
        { nom: 'Badge participant Salon Haute Joaillerie Paris 2024', statut: 'valide', date_ajout: '2024-01-18', url: '/documents/salon-hj-2024.pdf' },
        { nom: 'Attestation participation Bijorhca Paris 2024', statut: 'valide', date_ajout: '2024-09-14', url: '/documents/bijorhca-2024.pdf' }
      ]
    },
    {
      id: 2,
      categorie: 'Formations continues métier',
      documents: [
        { nom: 'Certificat Perfectionnement sertissage avancé (École Boulle)', statut: 'valide', date_ajout: '2023-11-25', url: '/documents/perfectionnement-serti-2023.pdf' },
        { nom: 'Attestation Nouvelles techniques micro-pavage', statut: 'valide', date_ajout: '2024-03-22', url: '/documents/micro-pavage-2024.pdf' }
      ]
    }
  ]
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
                <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed italic">
                  {FORMATEUR_DATA.presentation}
                </p>
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
                  <div className="space-y-3">
                    {FORMATEUR_DATA.diplomes_metier.map((diplome) => (
                      <div
                        key={diplome.id}
                        className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
                              <h5 className="font-semibold text-[rgb(var(--foreground))]">{diplome.nom}</h5>
                            </div>
                            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">{diplome.etablissement}</p>
                            <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                              <Calendar className="w-3 h-3" />
                              {new Date(diplome.date_obtention).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
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
                </div>

                {/* Certifications professionnelles */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Certifications professionnelles</h4>
                  <div className="space-y-3">
                    {FORMATEUR_DATA.certifications_pro.map((cert) => (
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
                              Obtenue le {new Date(cert.date_obtention).toLocaleDateString('fr-FR')}
                              {cert.date_expiration && (
                                <span className="ml-2">• Expire le {new Date(cert.date_expiration).toLocaleDateString('fr-FR')}</span>
                              )}
                              {!cert.date_expiration && (
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
                </div>

                {/* Portfolio réalisations */}
                <div>
                  <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Portfolio de réalisations</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {FORMATEUR_DATA.portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] hover:border-[rgba(var(--accent),0.3)] transition-colors"
                      >
                        <div className="aspect-video bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-lg mb-3 flex items-center justify-center">
                          <FileText className="w-12 h-12 text-[rgb(var(--accent))] opacity-50" />
                        </div>
                        <h5 className="font-semibold text-[rgb(var(--foreground))] mb-1">{item.titre}</h5>
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[rgb(var(--muted-foreground))]">{item.annee}</span>
                          <button className="text-xs text-[rgb(var(--accent))] hover:underline">Voir détails</button>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    {FORMATEUR_DATA.formations_pedagogiques.length} formations validées
                  </div>
                </div>

                <div className="space-y-3">
                  {FORMATEUR_DATA.formations_pedagogiques.map((formation) => (
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
                              {formation.duree_heures}h
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
                <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed italic mb-3">
                  {FORMATEUR_DATA.approche_pedagogique}
                </p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  Cette approche est synthétisée par Marjorie à partir de vos méthodes et retours d'expérience.
                </p>
              </div>

              {/* Méthodes pédagogiques */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Méthodes pédagogiques utilisées
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {FORMATEUR_DATA.methodes_pedagogiques.map((methode) => (
                    <div
                      key={methode.id}
                      className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-semibold text-[rgb(var(--foreground))]">{methode.nom}</h5>
                        <div className="text-xs font-bold text-[rgb(var(--accent))]">{methode.frequence_utilisation}%</div>
                      </div>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-3">{methode.description}</p>
                      <div className="h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-600"
                          style={{ width: `${methode.frequence_utilisation}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compétences techniques détaillées */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Compétences techniques détaillées
                </h3>
                <div className="space-y-6">
                  {FORMATEUR_DATA.competences_techniques.map((domaine) => (
                    <div key={domaine.id}>
                      <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[rgb(var(--accent))]" />
                        {domaine.domaine}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {domaine.techniques.map((technique, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[rgb(var(--foreground))]">{technique.nom}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                technique.niveau === 'Expert'
                                  ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]'
                                  : 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))]'
                              }`}>
                                {technique.niveau}
                              </span>
                            </div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              {technique.annees_pratique} ans de pratique
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outils et supports pédagogiques */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Outils et supports pédagogiques
                </h3>
                <div className="space-y-4">
                  {FORMATEUR_DATA.outils_supports.map((categorie) => (
                    <div key={categorie.id} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]">
                      <h5 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">{categorie.categorie}</h5>
                      <div className="flex flex-wrap gap-2">
                        {categorie.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] rounded-full text-xs font-medium border border-[rgba(var(--accent),0.2)]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

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
                    {FORMATEUR_DATA.formations_continues.filter(f => f.statut === 'termine').length} formations terminées
                  </div>
                </div>

                <div className="space-y-3">
                  {FORMATEUR_DATA.formations_continues.map((formation) => (
                    <div
                      key={formation.id}
                      className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
                            <h5 className="font-semibold text-[rgb(var(--foreground))]">{formation.intitule}</h5>
                          </div>
                          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">{formation.organisme}</p>
                          <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(formation.date_debut).toLocaleDateString('fr-FR')}
                              {formation.date_fin && ` - ${new Date(formation.date_fin).toLocaleDateString('fr-FR')}`}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formation.duree_heures}h
                            </div>
                            <span className={`px-2 py-0.5 rounded-full ${
                              formation.domaine === 'Technique métier'
                                ? 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))]'
                                : 'bg-[rgba(var(--info),0.1)] text-[rgb(var(--info))]'
                            }`}>
                              {formation.domaine}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                            formation.statut === 'termine'
                              ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]'
                              : 'bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))]'
                          }`}>
                            {formation.statut === 'termine' ? (
                              <><CheckCircle className="w-3 h-3" /> Terminée</>
                            ) : (
                              <><Clock className="w-3 h-3" /> Planifiée</>
                            )}
                          </div>
                          {formation.statut === 'termine' && (
                            <button className="p-2 hover:bg-[rgba(var(--accent),0.1)] rounded-lg transition-colors">
                              <Download className="w-4 h-4 text-[rgb(var(--accent))]" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Veille professionnelle */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Veille professionnelle et participation
                </h3>

                <div className="space-y-4">
                  {FORMATEUR_DATA.veille_professionnelle.map((categorie) => (
                    <div key={categorie.id}>
                      <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">{categorie.type}</h4>
                      <div className="space-y-2">
                        {categorie.activites.map((activite, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[rgb(var(--foreground))]">{activite.nom}</p>
                              {activite.organisme && (
                                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{activite.organisme}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(activite.date).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activite.duree_jours ? `${activite.duree_jours}j` : `${activite.duree_heures}h`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Réseaux professionnels */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Réseaux professionnels
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {FORMATEUR_DATA.participation_reseaux.map((reseau) => (
                    <div
                      key={reseau.id}
                      className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                    >
                      <h5 className="font-semibold text-[rgb(var(--foreground))] mb-2">{reseau.nom}</h5>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[rgb(var(--muted-foreground))]">{reseau.role}</span>
                        <span className="text-[rgb(var(--accent))] font-medium">Depuis {reseau.depuis}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objectifs de développement */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Objectifs de développement professionnel
                </h3>
                <div className="space-y-4">
                  {FORMATEUR_DATA.objectifs_developpement.map((obj) => (
                    <div
                      key={obj.id}
                      className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-[rgb(var(--foreground))] mb-1">{obj.objectif}</h5>
                          <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                            <Calendar className="w-3 h-3" />
                            Échéance : {new Date(obj.echeance).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[rgb(var(--accent))]">{obj.progression}%</div>
                          <div className="text-xs text-[rgb(var(--muted-foreground))]">progression</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-600"
                            style={{ width: `${obj.progression}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        {obj.actions.map((action, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                            <CheckCircle className="w-3 h-3 mt-0.5 text-[rgb(var(--accent))] flex-shrink-0" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                      {FORMATEUR_DATA.statistiques_enseignement.total_eleves_formes}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                      depuis {FORMATEUR_DATA.statistiques_enseignement.annees_anciennete} ans
                    </p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Taux de réussite</p>
                    <p className="text-3xl font-bold text-[rgb(var(--success))]">
                      {FORMATEUR_DATA.statistiques_enseignement.taux_reussite_global}%
                    </p>
                    <div className="mt-2 h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                        style={{ width: `${FORMATEUR_DATA.statistiques_enseignement.taux_reussite_global}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Heures/an</p>
                    <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                      {FORMATEUR_DATA.statistiques_enseignement.heures_enseignement_annuel}h
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">moyenne annuelle</p>
                  </div>
                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Sessions 2024</p>
                    <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                      {FORMATEUR_DATA.statistiques_enseignement.sessions_annee_en_cours}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">en cours ou terminées</p>
                  </div>
                </div>
              </div>

              {/* Taux de réussite par formation */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Taux de réussite par formation
                </h3>
                <div className="space-y-4">
                  {FORMATEUR_DATA.taux_reussite_formations.map((formation, idx) => (
                    <div key={idx} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-[rgb(var(--foreground))] mb-1">{formation.formation}</h5>
                          <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                            <span>{formation.nb_sessions} sessions</span>
                            <span>{formation.nb_candidats} candidats</span>
                            <span>{formation.periode}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[rgb(var(--success))]">{formation.taux_reussite}%</div>
                          <div className="text-xs text-[rgb(var(--muted-foreground))]">réussite</div>
                        </div>
                      </div>
                      <div className="h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                          style={{ width: `${formation.taux_reussite}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Évaluations par les élèves */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Évaluations par les élèves
                </h3>
                <div className="space-y-4">
                  {FORMATEUR_DATA.evaluations_eleves.map((eval_session) => (
                    <div key={eval_session.id} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-[rgb(var(--foreground))] mb-1">{eval_session.session}</h5>
                          <div className="flex items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]">
                            <span>{eval_session.nb_eleves} élèves</span>
                            <span>Évalué le {new Date(eval_session.date_evaluation).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-[rgb(var(--warning))] fill-current" />
                          <span className="text-2xl font-bold text-[rgb(var(--accent))]">{eval_session.note_moyenne_formateur}</span>
                          <span className="text-sm text-[rgb(var(--muted-foreground))]">/5</span>
                        </div>
                      </div>

                      {/* Points positifs */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-[rgb(var(--foreground))] mb-2">Points forts</p>
                        <div className="space-y-1">
                          {eval_session.commentaires_positifs.map((commentaire, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                              <CheckCircle className="w-3 h-3 mt-0.5 text-[rgb(var(--success))] flex-shrink-0" />
                              <span>{commentaire}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Axes d'amélioration */}
                      {eval_session.axes_amelioration.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[rgb(var(--foreground))] mb-2">Axes d'amélioration</p>
                          <div className="space-y-1">
                            {eval_session.axes_amelioration.map((axe, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-[rgb(var(--muted-foreground))]">
                                <TrendingDown className="w-3 h-3 mt-0.5 text-[rgb(var(--warning))] flex-shrink-0" />
                                <span>{axe}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Témoignages élèves */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Témoignages d'anciens élèves
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {FORMATEUR_DATA.temoignages_eleves.map((temoignage) => (
                    <div key={temoignage.id} className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold">
                          {temoignage.prenom.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[rgb(var(--foreground))]">{temoignage.prenom}</p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">{temoignage.formation} - {temoignage.annee}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(temoignage.note)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-[rgb(var(--warning))] fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[rgb(var(--foreground))] italic leading-relaxed">
                        "{temoignage.commentaire}"
                      </p>
                    </div>
                  ))}
                </div>
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
                        {FORMATEUR_DATA.documents_administratifs.reduce((acc, cat) => acc + cat.documents.length, 0)}
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
                        {FORMATEUR_DATA.documents_qualifications.reduce((acc, cat) => acc + cat.documents.length, 0)}
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
                        {FORMATEUR_DATA.documents_veille.reduce((acc, cat) => acc + cat.documents.length, 0)}
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
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(var(--accent),0.1)] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[rgb(var(--accent))]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[rgb(var(--foreground))]">CV - {FORMATEUR_DATA.prenom} {FORMATEUR_DATA.nom}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Dernière mise à jour : 15/01/2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-[rgb(var(--accent))] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                    <button className="px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors flex items-center gap-2 text-sm border border-[rgba(var(--border),0.2)]">
                      <Upload className="w-4 h-4" />
                      Mettre à jour
                    </button>
                  </div>
                </div>
              </div>

              {/* Documents administratifs */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Documents administratifs
                </h3>
                <div className="space-y-4">
                  {FORMATEUR_DATA.documents_administratifs.map((categorie) => (
                    <div key={categorie.id}>
                      <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">{categorie.categorie}</h4>
                      <div className="space-y-2">
                        {categorie.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="w-4 h-4 text-[rgb(var(--accent))]" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[rgb(var(--foreground))]">{doc.nom}</p>
                                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                  Ajouté le {new Date(doc.date_ajout).toLocaleDateString('fr-FR')}
                                  {doc.expiration && ` • Expire le ${new Date(doc.expiration).toLocaleDateString('fr-FR')}`}
                                </p>
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
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents qualifications */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Qualifications & Diplômes
                </h3>
                <div className="space-y-4">
                  {FORMATEUR_DATA.documents_qualifications.map((categorie) => (
                    <div key={categorie.id}>
                      <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">{categorie.categorie}</h4>
                      <div className="space-y-2">
                        {categorie.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[rgb(var(--foreground))]">{doc.nom}</p>
                                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                  Ajouté le {new Date(doc.date_ajout).toLocaleDateString('fr-FR')}
                                </p>
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
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents veille professionnelle */}
              <div className="p-6 bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)]">
                <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
                  Veille professionnelle & Formation continue
                </h3>
                <div className="space-y-4">
                  {FORMATEUR_DATA.documents_veille.map((categorie) => (
                    <div key={categorie.id}>
                      <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">{categorie.categorie}</h4>
                      <div className="space-y-2">
                        {categorie.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.2)] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="w-4 h-4 text-[rgb(var(--accent))]" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[rgb(var(--foreground))]">{doc.nom}</p>
                                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                  Ajouté le {new Date(doc.date_ajout).toLocaleDateString('fr-FR')}
                                </p>
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
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
    </DashboardLayout>
  )
}
