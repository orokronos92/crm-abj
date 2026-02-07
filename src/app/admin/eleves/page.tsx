/**
 * Page Élèves
 * Gestion des élèves en formation avec fiche détaillée complète
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Search,
  Users,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
  Award,
  FileText,
  Euro,
  X,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Eye,
  MessageSquare,
  Sparkles,
  BarChart3,
  Target,
  Book,
  Clipboard,
  Send,
  Plus,
  FolderOpen,
  History,
} from 'lucide-react'

// Données mockées élèves
const MOCK_ELEVES = [
  {
    id: 1,
    nom: 'Fontaine',
    prenom: 'Chloé',
    email: 'chloe.fontaine@email.fr',
    telephone: '06 12 34 56 78',
    numero_dossier: 'FONT15092000',
    formation: 'CAP Bijouterie-Joaillerie',
    session: 'Promotion Mars 2024',
    formateur_principal: 'M. Laurent',
    salle: 'Atelier B',
    statut: 'EN_FORMATION',
    progression: 68,
    date_debut: '01/03/2024',
    date_fin: '20/12/2024',
    heures_effectuees: 340,
    heures_totales: 500,
    prochaine_eval: '15/02/2024 - Serti griffe (pratique)',
    notes_moyennes: 16.1,
    absences: 2,
    absences_justifiees: 1,
    absences_non_justifiees: 1,
    retards: 1,
    financement: 'CPF + OPCO',
    montant_total: 8500,
    montant_paye: 6500,
    reste_a_payer: 2000,
    paiement_statut: 'A_JOUR',
    adresse: '15 rue de la Paix',
    code_postal: '75002',
    ville: 'Paris',
    // Évaluations détaillées
    evaluations: [
      {
        id: 1,
        date: '10/01/2024',
        type: 'Pratique',
        matiere: 'Serti griffe',
        note: 17,
        coeff: 3,
        sur: 20,
        commentaire: 'Excellent travail, précision remarquable. Continue comme ça !',
        formateur: 'M. Laurent',
        competences_validees: ['Précision', 'Minutie', 'Finition'],
        competences_a_travailler: [],
      },
      {
        id: 2,
        date: '15/01/2024',
        type: 'Théorique',
        matiere: 'Histoire de la bijouterie',
        note: 15,
        coeff: 1,
        sur: 20,
        commentaire: 'Bonne maîtrise des concepts historiques',
        formateur: 'Mme. Petit',
        competences_validees: ['Culture générale', 'Analyse'],
        competences_a_travailler: ['Approfondissement XIXe siècle'],
      },
      {
        id: 3,
        date: '20/01/2024',
        type: 'Pratique',
        matiere: 'Polissage',
        note: 16,
        coeff: 2,
        sur: 20,
        commentaire: 'Très bon rendu final, attention aux dernières finitions',
        formateur: 'M. Laurent',
        competences_validees: ['Polissage miroir', 'Satiné'],
        competences_a_travailler: ['Polissage angles'],
      },
      {
        id: 4,
        date: '25/01/2024',
        type: 'Pratique',
        matiere: 'Soudure',
        note: 18,
        coeff: 3,
        sur: 20,
        commentaire: 'Excellente maîtrise technique. Points de soudure invisibles.',
        formateur: 'M. Laurent',
        competences_validees: ['Soudure fil', 'Soudure plaque', 'Finition'],
        competences_a_travailler: [],
      },
    ],
    // Présences détaillées
    presences: [
      { date: '01/03/2024', matin: 'PRESENT', apres_midi: 'PRESENT' },
      { date: '02/03/2024', matin: 'PRESENT', apres_midi: 'PRESENT' },
      { date: '03/03/2024', matin: 'ABSENT_JUSTIFIE', apres_midi: 'PRESENT', motif: 'Rendez-vous médical' },
      { date: '04/03/2024', matin: 'PRESENT', apres_midi: 'RETARD', motif: 'Transport' },
      { date: '05/03/2024', matin: 'ABSENT', apres_midi: 'PRESENT', motif: 'Non justifié' },
    ],
    // Documents
    documents: [
      { type: 'Contrat de formation', statut: 'SIGNE', date: '15/02/2024' },
      { type: 'Règlement intérieur', statut: 'SIGNE', date: '15/02/2024' },
      { type: 'Bulletin 1', statut: 'GENERE', date: '30/03/2024' },
      { type: 'Attestation assiduité', statut: 'GENERE', date: '15/01/2024' },
      { type: 'Certificat réalisation', statut: 'EN_ATTENTE', date: null },
    ],
    // Historique chronologique
    historique: [
      { date: '01/03/2024', type: 'info', message: 'Inscription validée et début de formation' },
      { date: '05/03/2024', type: 'success', message: 'Première évaluation pratique serti (17/20)' },
      { date: '10/03/2024', type: 'warning', message: 'Absence non justifiée (05/03)' },
      { date: '15/01/2024', type: 'success', message: 'Évaluation théorique histoire (15/20)' },
      { date: '20/01/2024', type: 'success', message: 'Évaluation pratique polissage (16/20)' },
      { date: '25/01/2024', type: 'success', message: 'Évaluation pratique soudure (18/20) - Excellent' },
    ],
  },
  {
    id: 2,
    nom: 'Barbier',
    prenom: 'Maxime',
    email: 'maxime.barbier@email.fr',
    telephone: '06 98 76 54 32',
    numero_dossier: 'BARB20041998',
    formation: 'Sertissage Niveau 2',
    session: 'Promotion Avril 2024',
    formateur_principal: 'Mme. Petit',
    salle: 'Atelier C',
    statut: 'EN_FORMATION',
    progression: 45,
    date_debut: '01/04/2024',
    date_fin: '30/09/2024',
    heures_effectuees: 180,
    heures_totales: 400,
    prochaine_eval: '20/02/2024 - Serti rail (pratique)',
    notes_moyennes: 12.5,
    absences: 5,
    absences_justifiees: 2,
    absences_non_justifiees: 3,
    retards: 6,
    financement: 'Personnel',
    montant_total: 4500,
    montant_paye: 3000,
    reste_a_payer: 1500,
    paiement_statut: 'RETARD',
    adresse: '42 avenue Montaigne',
    code_postal: '75008',
    ville: 'Paris',
    evaluations: [
      {
        id: 1,
        date: '05/04/2024',
        type: 'Pratique',
        matiere: 'Serti rail',
        note: 12,
        coeff: 3,
        sur: 20,
        commentaire: 'Travail correct, mais manque de régularité. Besoin de plus de pratique.',
        formateur: 'Mme. Petit',
        competences_validees: ['Base serti rail'],
        competences_a_travailler: ['Régularité', 'Précision', 'Rapidité'],
      },
      {
        id: 2,
        date: '12/04/2024',
        type: 'Théorique',
        matiere: 'Gemmologie',
        note: 13,
        coeff: 1,
        sur: 20,
        commentaire: 'Connaissances basiques acquises',
        formateur: 'Mme. Petit',
        competences_validees: ['Identification pierres courantes'],
        competences_a_travailler: ['Pierres fines', 'Traitements'],
      },
    ],
    presences: [
      { date: '01/04/2024', matin: 'PRESENT', apres_midi: 'PRESENT' },
      { date: '02/04/2024', matin: 'ABSENT', apres_midi: 'ABSENT', motif: 'Non justifié' },
      { date: '03/04/2024', matin: 'RETARD', apres_midi: 'PRESENT', motif: 'Transport' },
      { date: '04/04/2024', matin: 'RETARD', apres_midi: 'RETARD', motif: 'Problème personnel' },
    ],
    documents: [
      { type: 'Contrat de formation', statut: 'SIGNE', date: '20/03/2024' },
      { type: 'Règlement intérieur', statut: 'SIGNE', date: '20/03/2024' },
      { type: 'Bulletin 1', statut: 'EN_ATTENTE', date: null },
    ],
    historique: [
      { date: '01/04/2024', type: 'info', message: 'Début de formation' },
      { date: '02/04/2024', type: 'error', message: 'Absence non justifiée (journée complète)' },
      { date: '05/04/2024', type: 'warning', message: 'Évaluation pratique serti rail (12/20) - En difficulté' },
      { date: '10/04/2024', type: 'error', message: 'Paiement en retard (1500€ restants)' },
    ],
  },
  {
    id: 3,
    nom: 'Durand',
    prenom: 'Sophie',
    email: 'sophie.durand@email.fr',
    telephone: '06 45 78 90 12',
    numero_dossier: 'DURA12111995',
    formation: 'Joaillerie Création',
    session: 'Promotion Janvier 2024',
    formateur_principal: 'M. Laurent',
    salle: 'Atelier A',
    statut: 'EN_FORMATION',
    progression: 82,
    date_debut: '15/01/2024',
    date_fin: '30/11/2024',
    heures_effectuees: 410,
    heures_totales: 500,
    prochaine_eval: '18/02/2024 - Design création (pratique)',
    notes_moyennes: 18.2,
    absences: 0,
    absences_justifiees: 0,
    absences_non_justifiees: 0,
    retards: 0,
    financement: 'France Travail',
    montant_total: 9500,
    montant_paye: 9500,
    reste_a_payer: 0,
    paiement_statut: 'A_JOUR',
    adresse: '8 boulevard Haussmann',
    code_postal: '75009',
    ville: 'Paris',
    evaluations: [
      {
        id: 1,
        date: '08/01/2024',
        type: 'Pratique',
        matiere: 'Création design',
        note: 19,
        coeff: 4,
        sur: 20,
        commentaire: 'Créativité exceptionnelle ! Design innovant et parfaitement maîtrisé.',
        formateur: 'M. Laurent',
        competences_validees: ['Créativité', 'Design', 'Innovation', 'Technique'],
        competences_a_travailler: [],
      },
      {
        id: 2,
        date: '14/01/2024',
        type: 'Pratique',
        matiere: 'Maquette cire',
        note: 18,
        coeff: 3,
        sur: 20,
        commentaire: 'Excellent travail de précision. Finitions impeccables.',
        formateur: 'M. Laurent',
        competences_validees: ['Modelage cire', 'Précision', 'Finition'],
        competences_a_travailler: [],
      },
      {
        id: 3,
        date: '21/01/2024',
        type: 'Théorique',
        matiere: 'CAO/DAO',
        note: 17,
        coeff: 2,
        sur: 20,
        commentaire: 'Très bonne maîtrise du logiciel. Rendus 3D de qualité professionnelle.',
        formateur: 'M. Dubois',
        competences_validees: ['Rhino 3D', 'MatrixGold', 'Rendu photoréaliste'],
        competences_a_travailler: ['Animation 3D'],
      },
    ],
    presences: [
      { date: '15/01/2024', matin: 'PRESENT', apres_midi: 'PRESENT' },
      { date: '16/01/2024', matin: 'PRESENT', apres_midi: 'PRESENT' },
      { date: '17/01/2024', matin: 'PRESENT', apres_midi: 'PRESENT' },
    ],
    documents: [
      { type: 'Contrat de formation', statut: 'SIGNE', date: '05/01/2024' },
      { type: 'Règlement intérieur', statut: 'SIGNE', date: '05/01/2024' },
      { type: 'Bulletin 1', statut: 'GENERE', date: '30/03/2024' },
      { type: 'Bulletin 2', statut: 'GENERE', date: '30/06/2024' },
      { type: 'Attestation assiduité', statut: 'GENERE', date: '15/01/2024' },
    ],
    historique: [
      { date: '15/01/2024', type: 'info', message: 'Début de formation' },
      { date: '08/01/2024', type: 'success', message: 'Évaluation création design (19/20) - Exceptionnel !' },
      { date: '14/01/2024', type: 'success', message: 'Évaluation maquette cire (18/20)' },
      { date: '21/01/2024', type: 'success', message: 'Évaluation CAO/DAO (17/20)' },
      { date: '30/01/2024', type: 'success', message: 'Profil recommandé pour concours national' },
    ],
  },
]

const STATUT_COLORS = {
  EN_FORMATION: 'badge-success',
  TERMINE: 'badge-info',
  ABANDONNE: 'badge-error',
  SUSPENDU: 'badge-warning',
}

const PAIEMENT_COLORS = {
  A_JOUR: 'badge-success',
  RETARD: 'badge-error',
}

const STATUT_DOCUMENT_COLORS = {
  SIGNE: 'text-[rgb(var(--success))]',
  GENERE: 'text-[rgb(var(--info))]',
  EN_ATTENTE: 'text-[rgb(var(--warning))]',
}

const PRESENCE_COLORS = {
  PRESENT: 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]',
  ABSENT: 'bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))]',
  ABSENT_JUSTIFIE: 'bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]',
  RETARD: 'bg-[rgba(var(--info),0.2)] text-[rgb(var(--info))]',
}

export default function ElevesPage() {
  const [selectedEleve, setSelectedEleve] = useState<typeof MOCK_ELEVES[0] | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFormation, setFilterFormation] = useState('TOUS')

  const getProgressionColor = (progression: number) => {
    if (progression >= 80) return 'text-[rgb(var(--success))]'
    if (progression >= 50) return 'text-[rgb(var(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  const getMoyenneColor = (moyenne: number) => {
    if (moyenne >= 16) return 'text-[rgb(var(--success))]'
    if (moyenne >= 12) return 'text-[rgb(var(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  const hasAlert = (eleve: typeof MOCK_ELEVES[0]) => {
    return eleve.absences >= 3 || eleve.retards >= 4 || eleve.paiement_statut === 'RETARD' || eleve.notes_moyennes < 12
  }

  // Filtrage
  const filteredEleves = MOCK_ELEVES.filter((eleve) => {
    const matchSearch =
      searchTerm === '' ||
      eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.numero_dossier.toLowerCase().includes(searchTerm.toLowerCase())

    const matchFormation =
      filterFormation === 'TOUS' || eleve.formation === filterFormation

    return matchSearch && matchFormation
  })

  const formations = Array.from(new Set(MOCK_ELEVES.map((e) => e.formation)))

  // Calcul moyenne pondérée
  const calculateMoyennePonderee = (evaluations: typeof MOCK_ELEVES[0]['evaluations']) => {
    const totalPoints = evaluations.reduce((sum, e) => sum + (e.note * e.coeff), 0)
    const totalCoeffs = evaluations.reduce((sum, e) => sum + e.coeff, 0)
    return totalCoeffs > 0 ? (totalPoints / totalCoeffs).toFixed(2) : '0.00'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Élèves</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Gestion des élèves en formation active
            </p>
          </div>
        </div>

        {/* Total élèves */}
        <div className="p-4 bg-gradient-to-br from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[rgb(var(--accent))] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[rgb(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--muted-foreground))] font-medium">Total élèves en formation</p>
              <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{MOCK_ELEVES.length}</p>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
            />
          </div>

          <select
            value={filterFormation}
            onChange={(e) => setFilterFormation(e.target.value)}
            className="px-4 py-2.5 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)]"
          >
            <option value="TOUS">Toutes les formations</option>
            {formations.map((formation) => (
              <option key={formation} value={formation}>{formation}</option>
            ))}
          </select>
        </div>

        {/* Tableau élèves */}
        <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                    Moyenne
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                    Heures
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                    Absences
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider">
                    Alertes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--border),0.3)]">
                {filteredEleves.map((eleve) => (
                  <tr
                    key={eleve.id}
                    onClick={() => setSelectedEleve(eleve)}
                    className="hover:bg-[rgb(var(--secondary))] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                          {eleve.prenom.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[rgb(var(--foreground))]">
                            {eleve.prenom} {eleve.nom}
                          </p>
                          <p className="text-sm text-[rgb(var(--muted-foreground))]">{eleve.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[rgb(var(--foreground))]">{eleve.formation}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{eleve.session}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden w-24">
                          <div
                            className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] transition-all"
                            style={{ width: `${eleve.progression}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${getProgressionColor(eleve.progression)}`}>
                          {eleve.progression}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${getMoyenneColor(eleve.notes_moyennes)}`}>
                        {eleve.notes_moyennes.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[rgb(var(--foreground))]">
                        {eleve.heures_effectuees}/{eleve.heures_totales}h
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${eleve.absences >= 3 ? 'text-[rgb(var(--error))] font-bold' : 'text-[rgb(var(--foreground))]'}`}>
                        {eleve.absences}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasAlert(eleve) && (
                        <AlertTriangle className="w-5 h-5 text-[rgb(var(--error))]" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal fiche détaillée élève */}
      {selectedEleve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl overflow-hidden flex flex-col max-w-6xl w-full max-h-[90vh]">
            {/* Onglets en forme de dossier */}
            <div className="relative flex gap-1 px-4 pt-4 bg-[rgb(var(--background))]">
              {[
                { id: 'general', label: 'Général', icon: User },
                { id: 'synthese', label: 'Synthèse', icon: BarChart3 },
                { id: 'evaluations', label: 'Évaluations', icon: Award },
                { id: 'presences', label: 'Présences', icon: Calendar },
                { id: 'documents', label: 'Documents', icon: FolderOpen },
                { id: 'historique', label: 'Historique', icon: History },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative px-6 py-3 rounded-t-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-[rgb(var(--card))] text-[rgb(var(--accent))] border-t-2 border-x-2 border-[rgba(var(--accent),0.5)] -mb-[2px]'
                        : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] hover:bg-[rgba(var(--accent),0.05)] hover:text-[rgb(var(--foreground))]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[rgb(var(--accent))]' : ''}`} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    {/* Effet coin de dossier */}
                    {activeTab === tab.id && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-[rgb(var(--accent))] opacity-20 rounded-bl-lg" />
                    )}
                  </button>
                )
              })}
              {/* Bouton fermer en position absolue */}
              <button
                onClick={() => setSelectedEleve(null)}
                className="absolute top-2 right-4 p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors z-10"
              >
                <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              </button>
            </div>

            {/* Contenu des onglets */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tab Général */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Photo + Identité */}
                  <div className="flex items-start gap-6 p-6 bg-[rgb(var(--secondary))] rounded-xl">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                      {selectedEleve.prenom.charAt(0)}{selectedEleve.nom.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
                        {selectedEleve.prenom} {selectedEleve.nom}
                      </h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-[rgb(var(--accent))]" />
                          <span className="text-base text-[rgb(var(--foreground))]">{selectedEleve.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-[rgb(var(--accent))]" />
                          <span className="text-base text-[rgb(var(--foreground))]">{selectedEleve.telephone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
                          <span className="text-sm text-[rgb(var(--muted-foreground))]">N° Dossier:</span>
                          <span className="text-xl font-bold text-[rgb(var(--accent))]">{selectedEleve.numero_dossier}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="42"
                          stroke="rgb(var(--secondary))"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="42"
                          stroke="rgb(var(--accent))"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - selectedEleve.progression / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className={`text-2xl font-bold ${getProgressionColor(selectedEleve.progression)}`}>
                          {selectedEleve.progression}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats principales - 5 cartes */}
                  <div className="grid grid-cols-5 gap-4">
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className={`text-3xl font-bold ${getMoyenneColor(selectedEleve.notes_moyennes)}`}>
                        {selectedEleve.notes_moyennes.toFixed(1)}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Moyenne générale</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                        {selectedEleve.heures_effectuees}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Heures / {selectedEleve.heures_totales}h</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className={`text-3xl font-bold ${selectedEleve.absences >= 3 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--foreground))]'}`}>
                        {selectedEleve.absences}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Absences ({selectedEleve.absences_non_justifiees} non just.)</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className={`text-3xl font-bold ${selectedEleve.retards >= 4 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--foreground))]'}`}>
                        {selectedEleve.retards}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Retards</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
                      <p className="text-3xl font-bold text-[rgb(var(--accent))]">
                        {Math.ceil((new Date(selectedEleve.date_fin.split('/').reverse().join('-')).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Jours restants</p>
                    </div>
                  </div>

                  {/* Formation & Session */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Formation</p>
                      <p className="text-lg font-bold text-[rgb(var(--foreground))]">{selectedEleve.formation}</p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Session</p>
                      <p className="text-lg font-bold text-[rgb(var(--foreground))]">{selectedEleve.session}</p>
                    </div>
                  </div>

                  {/* Prochaine évaluation */}
                  <div className="p-4 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[rgb(var(--accent))]" />
                      <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                        Prochaine évaluation : {selectedEleve.prochaine_eval}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Synthèse */}
              {activeTab === 'synthese' && (
                <div className="space-y-6">
                  {/* Formation & encadrement */}
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
                      Formation & encadrement
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formation</p>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">{selectedEleve.formation}</p>
                      </div>
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Session</p>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">{selectedEleve.session}</p>
                      </div>
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formateur principal</p>
                        <p className="text-sm font-medium text-[rgb(var(--accent))]">{selectedEleve.formateur_principal}</p>
                      </div>
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Salle</p>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">{selectedEleve.salle}</p>
                      </div>
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Période</p>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">{selectedEleve.date_debut} → {selectedEleve.date_fin}</p>
                      </div>
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">N° Dossier</p>
                        <p className="text-sm font-medium font-mono text-[rgb(var(--accent))]">{selectedEleve.numero_dossier}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financement */}
                  <div>
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                      <Euro className="w-5 h-5 text-[rgb(var(--accent))]" />
                      Financement
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Mode de financement</p>
                        <p className="text-sm font-medium text-[rgb(var(--accent))]">{selectedEleve.financement}</p>
                      </div>
                      <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Montant total</p>
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">{selectedEleve.montant_total.toLocaleString('fr-FR')} €</p>
                      </div>
                      <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
                        <p className="text-xs text-[rgb(var(--success))] mb-1">Montant payé</p>
                        <p className="text-sm font-medium text-[rgb(var(--success))]">{selectedEleve.montant_paye.toLocaleString('fr-FR')} €</p>
                      </div>
                      <div className={`p-4 rounded-lg ${selectedEleve.reste_a_payer > 0 ? 'bg-[rgba(var(--error),0.05)] border border-[rgba(var(--error),0.2)]' : 'bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)]'}`}>
                        <p className={`text-xs mb-1 ${selectedEleve.reste_a_payer > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'}`}>Reste à payer</p>
                        <p className={`text-sm font-medium ${selectedEleve.reste_a_payer > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'}`}>
                          {selectedEleve.reste_a_payer.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                    </div>
                    {selectedEleve.reste_a_payer > 0 && (
                      <button className="w-full mt-4 px-4 py-2.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Envoyer rappel de paiement
                      </button>
                    )}
                  </div>

                  {/* Alertes si nécessaire */}
                  {hasAlert(selectedEleve) && (
                    <div className="p-4 bg-[rgba(var(--error),0.05)] border border-[rgba(var(--error),0.2)] rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[rgb(var(--error))] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[rgb(var(--error))] mb-2">Alertes détectées :</p>
                          <ul className="text-sm text-[rgb(var(--foreground))] space-y-1">
                            {selectedEleve.absences >= 3 && (
                              <li>• {selectedEleve.absences} absences ({selectedEleve.absences_non_justifiees} non justifiées)</li>
                            )}
                            {selectedEleve.retards >= 4 && (
                              <li>• {selectedEleve.retards} retards enregistrés</li>
                            )}
                            {selectedEleve.paiement_statut === 'RETARD' && (
                              <li>• Paiement en retard ({selectedEleve.reste_a_payer.toLocaleString('fr-FR')}€ restants)</li>
                            )}
                            {selectedEleve.notes_moyennes < 12 && (
                              <li>• Moyenne générale insuffisante ({selectedEleve.notes_moyennes.toFixed(1)}/20)</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Évaluations */}
              {activeTab === 'evaluations' && (
                <div className="space-y-6">
                  {/* Tuile stats évaluations */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-[rgb(var(--secondary))] rounded-xl border border-[rgba(var(--border),0.3)]">
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Nombre d'évaluations</p>
                      <p className="text-4xl font-bold text-[rgb(var(--accent))]">
                        {selectedEleve.evaluations.length}
                      </p>
                    </div>
                    <div className="p-6 bg-[rgb(var(--secondary))] rounded-xl border border-[rgba(var(--border),0.3)]">
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Moyenne pondérée</p>
                      <p className={`text-4xl font-bold ${getMoyenneColor(parseFloat(calculateMoyennePonderee(selectedEleve.evaluations)))}`}>
                        {calculateMoyennePonderee(selectedEleve.evaluations)}<span className="text-2xl">/20</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedEleve.evaluations.map((evaluation) => (
                      <div
                        key={evaluation.id}
                        className="p-5 bg-[rgb(var(--secondary))] rounded-xl border border-[rgba(var(--border),0.3)] hover:border-[rgba(var(--accent),0.3)] transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`text-center p-3 rounded-lg ${
                              evaluation.note >= 16 ? 'bg-[rgba(var(--success),0.1)]' :
                              evaluation.note >= 12 ? 'bg-[rgba(var(--warning),0.1)]' :
                              'bg-[rgba(var(--error),0.1)]'
                            }`}>
                              <p className={`text-3xl font-bold ${getMoyenneColor(evaluation.note)}`}>
                                {evaluation.note}
                              </p>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">/{evaluation.sur}</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-[rgb(var(--foreground))]">{evaluation.matiere}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-[rgb(var(--muted-foreground))]">
                                  {evaluation.date}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  evaluation.type === 'Pratique' ? 'badge-success' : 'badge-info'
                                }`}>
                                  {evaluation.type}
                                </span>
                                <span className="text-sm text-[rgb(var(--muted-foreground))]">
                                  Coeff. {evaluation.coeff}
                                </span>
                                <span className="text-sm text-[rgb(var(--accent))]">
                                  {evaluation.formateur}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pl-4 border-l-2 border-[rgba(var(--accent),0.3)] mb-3">
                          <p className="text-sm text-[rgb(var(--foreground))] italic">
                            "{evaluation.commentaire}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {evaluation.competences_validees.length > 0 && (
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-[rgb(var(--success))]" />
                                Compétences validées
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {evaluation.competences_validees.map((comp, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] rounded-full"
                                  >
                                    {comp}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {evaluation.competences_a_travailler.length > 0 && (
                            <div>
                              <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-1">
                                <Target className="w-3 h-3 text-[rgb(var(--warning))]" />
                                À travailler
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {evaluation.competences_a_travailler.map((comp, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))] rounded-full"
                                  >
                                    {comp}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Présences */}
              {activeTab === 'presences' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                      Registre de présences
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[rgb(var(--success))]" />
                        <span className="text-[rgb(var(--muted-foreground))]">Présent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[rgb(var(--warning))]" />
                        <span className="text-[rgb(var(--muted-foreground))]">Absent justifié</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[rgb(var(--error))]" />
                        <span className="text-[rgb(var(--muted-foreground))]">Absent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[rgb(var(--info))]" />
                        <span className="text-[rgb(var(--muted-foreground))]">Retard</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedEleve.presences.map((presence, index) => (
                      <div
                        key={index}
                        className="p-4 bg-[rgb(var(--secondary))] rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-[rgb(var(--foreground))]">{presence.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-center">
                                <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Matin</p>
                                <span className={`px-3 py-1 text-xs rounded-full ${PRESENCE_COLORS[presence.matin as keyof typeof PRESENCE_COLORS]}`}>
                                  {presence.matin.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Après-midi</p>
                                <span className={`px-3 py-1 text-xs rounded-full ${PRESENCE_COLORS[presence.apres_midi as keyof typeof PRESENCE_COLORS]}`}>
                                  {presence.apres_midi.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            {presence.motif && (
                              <div className="ml-4 pl-4 border-l border-[rgba(var(--border),0.3)]">
                                <p className="text-xs text-[rgb(var(--muted-foreground))]">Motif :</p>
                                <p className="text-sm text-[rgb(var(--foreground))]">{presence.motif}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{selectedEleve.absences}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Total absences</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[rgb(var(--error))]">{selectedEleve.absences_non_justifiees}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Non justifiées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[rgb(var(--info))]">{selectedEleve.retards}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Retards</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Documents */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                      Documents de l'élève
                    </h3>
                    <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Ajouter un document
                    </button>
                  </div>

                  {selectedEleve.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[rgb(var(--secondary))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${STATUT_DOCUMENT_COLORS[doc.statut as keyof typeof STATUT_DOCUMENT_COLORS]}`} />
                        <div>
                          <p className="font-medium text-[rgb(var(--foreground))]">{doc.type}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${STATUT_DOCUMENT_COLORS[doc.statut as keyof typeof STATUT_DOCUMENT_COLORS]}`}>
                              {doc.statut}
                            </span>
                            {doc.date && (
                              <span className="text-xs text-[rgb(var(--muted-foreground))]">
                                • {doc.date}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc.statut !== 'EN_ATTENTE' ? (
                          <>
                            <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                              <Eye className="w-4 h-4 text-[rgb(var(--accent))]" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                              <Download className="w-4 h-4 text-[rgb(var(--accent))]" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                              <Send className="w-4 h-4 text-[rgb(var(--accent))]" />
                            </button>
                          </>
                        ) : (
                          <button className="px-3 py-1.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--accent-light))] transition-colors">
                            Générer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Historique */}
              {activeTab === 'historique' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                    Historique chronologique
                  </h3>
                  <div className="space-y-3">
                    {selectedEleve.historique.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-[rgb(var(--secondary))] rounded-lg"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          event.type === 'success' ? 'bg-[rgb(var(--success))]' :
                          event.type === 'warning' ? 'bg-[rgb(var(--warning))]' :
                          event.type === 'error' ? 'bg-[rgb(var(--error))]' :
                          'bg-[rgb(var(--accent))]'
                        }`} />
                        <div className="flex-1">
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">{event.date}</p>
                          <p className="text-sm text-[rgb(var(--foreground))] mt-1">{event.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions footer */}
            <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
              <div className="flex items-center justify-between">
                <button className="px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] border border-[rgba(var(--border),0.5)] rounded-lg font-medium hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contacter l'élève
                </button>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] border border-[rgba(var(--border),0.5)] rounded-lg font-medium hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Télécharger dossier complet
                  </button>
                  <button className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Demander analyse Marjorie
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
