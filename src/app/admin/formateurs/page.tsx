/**
 * Page Formateurs
 * Liste des formateurs avec fiche détaillée conforme Qualiopi
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Award,
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  FileText,
  Download,
  Edit,
  Trash2,
  X,
  Briefcase,
  GraduationCap,
  Clock,
  Euro,
  MapPin,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
} from 'lucide-react'

// Mock data formateurs avec infos Qualiopi
const MOCK_FORMATEURS = [
  {
    id: 1,
    nom: 'Laurent',
    prenom: 'Michel',
    email: 'michel.laurent@abj-formation.fr',
    telephone: '06 12 34 56 78',
    photo_url: null, // À implémenter

    // Identité pro
    statut: 'Freelance',
    specialites: ['Sertissage', 'Joaillerie'],
    experience_annees: 25,

    // Compétences métier (Qualiopi indicateur 21)
    diplomes: [
      { nom: 'CAP Art du Bijou et du Joyau', annee: 1998, organisme: 'CFA Paris' },
      { nom: 'BMA Bijou option Joaillerie', annee: 2000, organisme: 'Lycée Boulle' },
    ],
    certifications_pedagogiques: [
      { nom: 'Formateur Professionnel d\'Adultes', annee: 2015, organisme: 'AFPA' },
    ],
    experience_terrain: 'Joaillier chez Cartier (2000-2015), Formateur indépendant depuis 2015',

    // Portfolio / réalisations
    portfolio_url: 'https://drive.google.com/...',
    cv_url: 'https://drive.google.com/...',

    // Développement compétences (Qualiopi indicateur 22)
    formations_suivies: [
      { nom: 'Pédagogie active et numérique', date: '03/2023', organisme: 'FFFOD' },
      { nom: 'Évaluation des compétences', date: '09/2023', organisme: 'AFPA' },
    ],
    derniere_evaluation: '15/01/2024',
    prochaine_evaluation: '15/07/2024',

    // Activité
    eleves_actifs: 13,
    sessions_actives: 2,
    heures_semaine: 28,
    tarif_journalier: 450,

    // Stats
    moyenne_satisfaction: 4.8,
    nb_total_eleves: 89,
    taux_reussite: 94,

    bio: 'Formateur expert en sertissage et joaillerie avec plus de 25 ans d\'expérience. Ancien joaillier chez Cartier, passionné par la transmission des savoir-faire d\'excellence.',

    notes_internes: 'Excellent formateur, très pédagogue. Très apprécié des élèves.',
  },
  {
    id: 2,
    nom: 'Petit',
    prenom: 'Sophie',
    email: 'sophie.petit@abj-formation.fr',
    telephone: '06 23 45 67 89',
    photo_url: null,

    statut: 'Salarié',
    specialites: ['CAO/DAO', 'Modélisation 3D'],
    experience_annees: 12,

    diplomes: [
      { nom: 'DMA Art du Bijou', annee: 2010, organisme: 'ESAA Boulle' },
      { nom: 'Licence Design Produit', annee: 2012, organisme: 'Paris 8' },
    ],
    certifications_pedagogiques: [
      { nom: 'Certification MatrixGold Trainer', annee: 2018, organisme: 'Gemvision' },
    ],
    experience_terrain: 'Designer bijoux freelance (2012-2018), Formatrice CAO/DAO depuis 2018',

    portfolio_url: 'https://drive.google.com/...',
    cv_url: 'https://drive.google.com/...',

    formations_suivies: [
      { nom: 'Rhino 7 avancé', date: '06/2023', organisme: 'McNeel Europe' },
      { nom: 'Pédagogie inversée', date: '11/2023', organisme: 'FFFOD' },
    ],
    derniere_evaluation: '10/02/2024',
    prochaine_evaluation: '10/08/2024',

    eleves_actifs: 8,
    sessions_actives: 1,
    heures_semaine: 21,
    tarif_journalier: 380,

    moyenne_satisfaction: 4.9,
    nb_total_eleves: 45,
    taux_reussite: 98,

    bio: 'Experte en conception assistée par ordinateur appliquée à la bijouterie. Spécialiste MatrixGold et Rhino 3D.',

    notes_internes: 'Très compétente sur les outils numériques. Excellente pédagogue.',
  },
  {
    id: 3,
    nom: 'Dubois',
    prenom: 'Antoine',
    email: 'antoine.dubois@abj-formation.fr',
    telephone: '06 34 56 78 90',
    photo_url: null,

    statut: 'Freelance',
    specialites: ['Polissage', 'Finition'],
    experience_annees: 18,

    diplomes: [
      { nom: 'CAP Polisseur Finisseur', annee: 2005, organisme: 'CFA Louhans' },
    ],
    certifications_pedagogiques: [],
    experience_terrain: 'Polisseur en atelier joaillerie (2005-2020), Formateur depuis 2020',

    portfolio_url: null,
    cv_url: 'https://drive.google.com/...',

    formations_suivies: [
      { nom: 'Techniques de polissage avancées', date: '04/2023', organisme: 'BJOP' },
    ],
    derniere_evaluation: '20/12/2023',
    prochaine_evaluation: '20/06/2024',

    eleves_actifs: 5,
    sessions_actives: 1,
    heures_semaine: 14,
    tarif_journalier: 320,

    moyenne_satisfaction: 4.6,
    nb_total_eleves: 34,
    taux_reussite: 91,

    bio: 'Spécialiste du polissage et de la finition en bijouterie-joaillerie. Expert reconnu dans son domaine.',

    notes_internes: 'Très bon technicien. Manque parfois de pédagogie mais en progression.',
  },
]

const STATUT_COLORS: Record<string, string> = {
  'Salarié': 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] border border-[rgba(var(--success),0.3)]',
  'Freelance': 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.3)]',
}

export default function FormateursPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFormateur, setSelectedFormateur] = useState<typeof MOCK_FORMATEURS[0] | null>(null)
  const [activeTab, setActiveTab] = useState('synthese')

  const filteredFormateurs = MOCK_FORMATEURS.filter(formateur =>
    `${formateur.prenom} ${formateur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formateur.specialites.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getSatisfactionColor = (note: number) => {
    if (note >= 4.5) return 'text-[rgb(var(--success))]'
    if (note >= 4.0) return 'text-[rgb(var(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Formateurs</h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">
            Gestion de l'équipe pédagogique et suivi Qualiopi
          </p>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Total formateurs</p>
                <p className="text-3xl font-bold text-[rgb(var(--foreground))] mt-1">
                  {MOCK_FORMATEURS.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center">
                <Award className="w-6 h-6 text-[rgb(var(--primary))]" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Élèves suivis</p>
                <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">
                  {MOCK_FORMATEURS.reduce((sum, f) => sum + f.eleves_actifs, 0)}
                </p>
              </div>
              <Users className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Sessions actives</p>
                <p className="text-3xl font-bold text-[rgb(var(--accent))] mt-1">
                  {MOCK_FORMATEURS.reduce((sum, f) => sum + f.sessions_actives, 0)}
                </p>
              </div>
              <BookOpen className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Satisfaction moyenne</p>
                <p className="text-3xl font-bold text-[rgb(var(--success))] mt-1">
                  {(MOCK_FORMATEURS.reduce((sum, f) => sum + f.moyenne_satisfaction, 0) / MOCK_FORMATEURS.length).toFixed(1)}
                </p>
              </div>
              <Star className="w-6 h-6 text-[rgb(var(--success))]" />
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Rechercher un formateur ou une spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
              />
            </div>
            <button className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--primary))] transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>

        {/* Table formateurs */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
                <th className="text-left p-4 text-sm font-semibold text-[rgb(var(--muted-foreground))]">Formateur</th>
                <th className="text-left p-4 text-sm font-semibold text-[rgb(var(--muted-foreground))]">Spécialités</th>
                <th className="text-left p-4 text-sm font-semibold text-[rgb(var(--muted-foreground))]">Statut</th>
                <th className="text-left p-4 text-sm font-semibold text-[rgb(var(--muted-foreground))]">Élèves actifs</th>
                <th className="text-left p-4 text-sm font-semibold text-[rgb(var(--muted-foreground))]">Satisfaction</th>
                <th className="text-left p-4 text-sm font-semibold text-[rgb(var(--muted-foreground))]">Expérience</th>
                <th className="text-left p-4 text-sm font-semibold text-[rgb(var(--muted-foreground))]">Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormateurs.map((formateur) => (
                <tr
                  key={formateur.id}
                  onClick={() => setSelectedFormateur(formateur)}
                  className="border-b border-[rgba(var(--border),0.1)] hover:bg-[rgb(var(--secondary))] cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {formateur.prenom.charAt(0)}{formateur.nom.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[rgb(var(--foreground))]">
                          {formateur.prenom} {formateur.nom}
                        </p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">
                          {formateur.heures_semaine}h/semaine
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {formateur.specialites.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs rounded-md bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.2)]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${STATUT_COLORS[formateur.statut]}`}>
                      {formateur.statut}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                      <span className="font-medium text-[rgb(var(--foreground))]">
                        {formateur.eleves_actifs}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${getSatisfactionColor(formateur.moyenne_satisfaction)}`} />
                      <span className={`font-bold ${getSatisfactionColor(formateur.moyenne_satisfaction)}`}>
                        {formateur.moyenne_satisfaction.toFixed(1)}
                      </span>
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">/5</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-[rgb(var(--foreground))]">
                      {formateur.experience_annees} ans
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs text-[rgb(var(--muted-foreground))]">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {formateur.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {formateur.telephone}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal fiche formateur détaillée */}
      {selectedFormateur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-[rgb(var(--card))] rounded-2xl shadow-2xl">
            {/* Header avec photo */}
            <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
              <div className="flex items-start gap-6">
                {/* Photo formateur */}
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
                  {selectedFormateur.prenom.charAt(0)}{selectedFormateur.nom.charAt(0)}
                </div>

                {/* Infos principales */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
                        {selectedFormateur.prenom} {selectedFormateur.nom}
                      </h2>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 text-sm rounded-full ${STATUT_COLORS[selectedFormateur.statut]}`}>
                          {selectedFormateur.statut}
                        </span>
                        <span className="px-3 py-1 text-sm rounded-full bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.3)]">
                          {selectedFormateur.experience_annees} ans d'expérience
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedFormateur.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedFormateur.telephone}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFormateur(null)}
                      className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                    </button>
                  </div>

                  {/* Spécialités */}
                  <div className="mt-4">
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Spécialités</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFormateur.specialites.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 text-sm rounded-lg bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] border border-[rgba(var(--accent),0.2)] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats principales */}
              <div className="grid grid-cols-5 gap-4 mt-6">
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                  <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                    {selectedFormateur.eleves_actifs}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Élèves actifs</p>
                </div>
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                  <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                    {selectedFormateur.sessions_actives}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Sessions</p>
                </div>
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                  <p className={`text-3xl font-bold ${getSatisfactionColor(selectedFormateur.moyenne_satisfaction)}`}>
                    {selectedFormateur.moyenne_satisfaction.toFixed(1)}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Satisfaction /5</p>
                </div>
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                  <p className="text-3xl font-bold text-[rgb(var(--success))]">
                    {selectedFormateur.taux_reussite}%
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Taux réussite</p>
                </div>
                <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                  <p className="text-3xl font-bold text-[rgb(var(--foreground))]">
                    {selectedFormateur.nb_total_eleves}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Élèves formés</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[rgba(var(--border),0.3)]">
              {['synthese', 'competences', 'activite', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'text-[rgb(var(--accent))] border-b-2 border-[rgb(var(--accent))]'
                      : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {tab === 'synthese' && 'Synthèse'}
                  {tab === 'competences' && 'Compétences Qualiopi'}
                  {tab === 'activite' && 'Activité'}
                  {tab === 'documents' && 'Documents'}
                </button>
              ))}
            </div>

            {/* Contenu tabs */}
            <div className="p-6">
              {/* Tab Synthèse */}
              {activeTab === 'synthese' && (
                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-3">Biographie</h3>
                    <p className="text-[rgb(var(--muted-foreground))] leading-relaxed">
                      {selectedFormateur.bio}
                    </p>
                  </div>

                  {/* Parcours professionnel */}
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-3">Parcours professionnel</h3>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <p className="text-sm text-[rgb(var(--foreground))]">
                        {selectedFormateur.experience_terrain}
                      </p>
                    </div>
                  </div>

                  {/* Informations pratiques */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Tarif journalier</p>
                      <p className="text-2xl font-bold text-[rgb(var(--accent))]">
                        {selectedFormateur.tarif_journalier}€
                      </p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Heures par semaine</p>
                      <p className="text-2xl font-bold text-[rgb(var(--accent))]">
                        {selectedFormateur.heures_semaine}h
                      </p>
                    </div>
                  </div>

                  {/* Notes internes */}
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-3">Notes internes</h3>
                    <div className="p-4 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
                      <p className="text-sm text-[rgb(var(--foreground))]">
                        {selectedFormateur.notes_internes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Compétences Qualiopi */}
              {activeTab === 'competences' && (
                <div className="space-y-6">
                  {/* Indicateur 21 : Compétences formateurs */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-[rgb(var(--success))]" />
                      <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                        Indicateur 21 : Compétences définies et prouvées
                      </h3>
                    </div>

                    {/* Diplômes métier */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Diplômes métier</h4>
                      <div className="space-y-2">
                        {selectedFormateur.diplomes.map((diplome, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-[rgb(var(--secondary))] rounded-lg flex items-start justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))] mt-0.5" />
                              <div>
                                <p className="font-medium text-[rgb(var(--foreground))]">{diplome.nom}</p>
                                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                                  {diplome.organisme} • {diplome.annee}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications pédagogiques */}
                    <div>
                      <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Certifications pédagogiques</h4>
                      {selectedFormateur.certifications_pedagogiques.length > 0 ? (
                        <div className="space-y-2">
                          {selectedFormateur.certifications_pedagogiques.map((cert, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-[rgb(var(--secondary))] rounded-lg flex items-start justify-between"
                            >
                              <div className="flex items-start gap-3">
                                <Award className="w-5 h-5 text-[rgb(var(--accent))] mt-0.5" />
                                <div>
                                  <p className="font-medium text-[rgb(var(--foreground))]">{cert.nom}</p>
                                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                                    {cert.organisme} • {cert.annee}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg">
                          <p className="text-sm text-[rgb(var(--warning))]">
                            Aucune certification pédagogique enregistrée
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Indicateur 22 : Développement des compétences */}
                  <div className="pt-6 border-t border-[rgba(var(--border),0.3)]">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-[rgb(var(--success))]" />
                      <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                        Indicateur 22 : Développement continu des compétences
                      </h3>
                    </div>

                    {/* Formations suivies */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Formations suivies</h4>
                      <div className="space-y-2">
                        {selectedFormateur.formations_suivies.map((formation, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-[rgb(var(--secondary))] rounded-lg flex items-start justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <BookOpen className="w-5 h-5 text-[rgb(var(--accent))] mt-0.5" />
                              <div>
                                <p className="font-medium text-[rgb(var(--foreground))]">{formation.nom}</p>
                                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                                  {formation.organisme} • {formation.date}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Évaluations régulières */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Dernière évaluation</p>
                        </div>
                        <p className="text-lg font-bold text-[rgb(var(--foreground))]">
                          {selectedFormateur.derniere_evaluation}
                        </p>
                      </div>
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[rgb(var(--accent))]" />
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Prochaine évaluation</p>
                        </div>
                        <p className="text-lg font-bold text-[rgb(var(--accent))]">
                          {selectedFormateur.prochaine_evaluation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Activité */}
              {activeTab === 'activite' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 bg-[rgb(var(--secondary))] rounded-xl text-center">
                      <Users className="w-8 h-8 text-[rgb(var(--accent))] mx-auto mb-2" />
                      <p className="text-3xl font-bold text-[rgb(var(--foreground))]">
                        {selectedFormateur.nb_total_eleves}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Élèves formés (total)</p>
                    </div>
                    <div className="p-6 bg-[rgb(var(--secondary))] rounded-xl text-center">
                      <TrendingUp className="w-8 h-8 text-[rgb(var(--success))] mx-auto mb-2" />
                      <p className="text-3xl font-bold text-[rgb(var(--success))]">
                        {selectedFormateur.taux_reussite}%
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Taux de réussite</p>
                    </div>
                    <div className="p-6 bg-[rgb(var(--secondary))] rounded-xl text-center">
                      <Star className="w-8 h-8 text-[rgb(var(--warning))] mx-auto mb-2" />
                      <p className="text-3xl font-bold text-[rgb(var(--warning))]">
                        {selectedFormateur.moyenne_satisfaction.toFixed(1)}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Satisfaction moyenne</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-3">Sessions en cours</h3>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center text-[rgb(var(--muted-foreground))]">
                      <p className="text-sm">Liste des sessions à venir...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Documents */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {/* CV */}
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg flex items-center justify-between hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <div>
                          <p className="font-medium text-[rgb(var(--foreground))]">CV Formateur</p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">
                            Curriculum Vitae détaillé
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>

                    {/* Portfolio */}
                    {selectedFormateur.portfolio_url && (
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg flex items-center justify-between hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="font-medium text-[rgb(var(--foreground))]">Portfolio</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              Réalisations et projets
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Voir
                        </button>
                      </div>
                    )}

                    {/* Diplômes (copies) */}
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg flex items-center justify-between hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <div>
                          <p className="font-medium text-[rgb(var(--foreground))]">Copies diplômes</p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">
                            {selectedFormateur.diplomes.length} diplôme(s) scanné(s)
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger tout
                      </button>
                    </div>

                    {/* Certifications */}
                    {selectedFormateur.certifications_pedagogiques.length > 0 && (
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg flex items-center justify-between hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
                          <div>
                            <p className="font-medium text-[rgb(var(--foreground))]">Certifications pédagogiques</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              {selectedFormateur.certifications_pedagogiques.length} certification(s)
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Télécharger tout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
              <div className="flex items-center justify-between">
                <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-all flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contacter
                </button>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgb(var(--accent))] hover:text-[rgb(var(--primary))] transition-all flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--error),0.5)] rounded-lg text-[rgb(var(--error))] hover:bg-[rgb(var(--error))] hover:text-white transition-all flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
