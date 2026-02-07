/**
 * Page Paramètres (en développement)
 * Configuration et personnalisation de l'application
 */

'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Settings, Sparkles, ArrowLeft, Palette, Bell, Zap, Download, Lock, Globe, Mail, Calendar, BarChart3, Sliders, Eye, Moon, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  const futureFeatures = [
    {
      categorie: 'Interface & Thèmes',
      icon: Palette,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Thèmes personnalisés (Noir/Blanc, Bleu océan, Vert émeraude, Rose doré)',
        'Mode sombre / clair / automatique',
        'Personnalisation des couleurs d\'accent',
        'Taille de police ajustable (Compact / Normal / Confortable)',
        'Densité d\'affichage des tableaux',
        'Choix de la page d\'accueil par défaut',
      ]
    },
    {
      categorie: 'Notifications & Alertes',
      icon: Bell,
      color: 'from-yellow-500 to-orange-500',
      features: [
        'Paramétrage des notifications par type (Succès, Alertes, Infos, Rappels)',
        'Notifications email pour actions critiques',
        'Fréquence des alertes Marjorie (Temps réel / Groupées / Quotidien)',
        'Sons de notification personnalisables',
        'Notifications push navigateur',
        'Résumé hebdomadaire par email',
      ]
    },
    {
      categorie: 'Automatisations Marjorie',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Niveau d\'autonomie de Marjorie (Validation systématique / Semi-auto / Autonome)',
        'Règles de relance automatique (candidats inactifs après X jours)',
        'Génération automatique de devis (si dossier complet)',
        'Proposition automatique de sessions optimisées',
        'Détection proactive d\'anomalies (absences, retards, notes)',
        'Alertes intelligentes personnalisées',
      ]
    },
    {
      categorie: 'Exports & Rapports',
      icon: Download,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Exports automatiques hebdomadaires/mensuels',
        'Format d\'export par défaut (Excel, PDF, CSV)',
        'Rapports Qualiopi programmés',
        'Templates de documents personnalisables',
        'Signature électronique des exports',
        'Archivage automatique des documents',
      ]
    },
    {
      categorie: 'Sécurité & Accès',
      icon: Lock,
      color: 'from-red-500 to-rose-500',
      features: [
        'Authentification à deux facteurs (2FA)',
        'Gestion fine des permissions par rôle',
        'Historique complet des actions utilisateurs',
        'Délai d\'inactivité avant déconnexion',
        'Liste blanche IP (restriction d\'accès)',
        'Masquage automatique des données sensibles',
      ]
    },
    {
      categorie: 'Intégrations & API',
      icon: Globe,
      color: 'from-indigo-500 to-purple-500',
      features: [
        'Synchronisation Google Calendar / Outlook',
        'Intégration France Travail (API)',
        'Connexion OPCO automatique',
        'Webhooks sortants personnalisés',
        'Import automatique depuis formulaires externes',
        'Intégration comptabilité (QuickBooks, Sage)',
      ]
    },
    {
      categorie: 'Emails & Communication',
      icon: Mail,
      color: 'from-pink-500 to-red-500',
      features: [
        'Templates d\'emails personnalisables',
        'Signature email personnalisée par utilisateur',
        'Programmation d\'envois différés',
        'Réponses automatiques hors horaires',
        'Liste noire emails (spam)',
        'Suivi des ouvertures et clics',
      ]
    },
    {
      categorie: 'Tableaux de bord',
      icon: BarChart3,
      color: 'from-teal-500 to-green-500',
      features: [
        'Widgets personnalisables sur le dashboard',
        'Graphiques favoris épinglés',
        'Objectifs personnalisés (CA, conversion, satisfaction)',
        'Comparaison période N-1',
        'Export graphiques haute résolution',
        'Tableaux de bord par rôle (Admin / Formateur / Élève)',
      ]
    },
    {
      categorie: 'Performance & Affichage',
      icon: Sliders,
      color: 'from-orange-500 to-yellow-500',
      features: [
        'Nombre de résultats par page (10 / 25 / 50 / 100)',
        'Colonnes visibles par défaut dans les tableaux',
        'Tri et filtres mémorisés',
        'Mode navigation clavier (raccourcis)',
        'Aperçu rapide au survol (tooltips riches)',
        'Animations réduites (mode performance)',
      ]
    },
    {
      categorie: 'Langue & Localisation',
      icon: Globe,
      color: 'from-blue-500 to-indigo-500',
      features: [
        'Langue de l\'interface (FR / EN / ES)',
        'Format de date (JJ/MM/AAAA / MM/JJ/AAAA)',
        'Format horaire (24h / 12h AM/PM)',
        'Devise (EUR / USD / GBP)',
        'Fuseau horaire',
        'Traduction automatique des emails (si international)',
      ]
    },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="max-w-5xl mx-auto text-center">
          {/* Icône animée */}
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center animate-pulse">
              <Settings className="w-16 h-16 text-[rgb(var(--primary))]" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-bounce">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
            Paramètres de l'application
          </h1>
          <p className="text-xl text-[rgb(var(--muted-foreground))] mb-2">
            Fonctionnalités de personnalisation en cours de développement
          </p>

          {/* Description */}
          <div className="mt-8 p-6 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-2xl mb-8">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
                  Prochainement : Personnalisez votre expérience CRM
                </p>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  Configurez chaque aspect de l'application selon vos préférences : thèmes, notifications, automatisations, intégrations et bien plus encore.
                </p>
              </div>
            </div>
          </div>

          {/* Grille des futures fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {futureFeatures.map((category, idx) => {
              const IconComponent = category.icon
              return (
                <div
                  key={idx}
                  className="card p-5 hover:border-[rgba(var(--accent),0.5)] transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">
                      {category.categorie}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {category.features.map((feature, featureIdx) => (
                      <li
                        key={featureIdx}
                        className="flex items-start gap-2 text-sm text-[rgb(var(--muted-foreground))]"
                      >
                        <span className="text-[rgb(var(--accent))] mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Action */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card))] transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          </div>

          {/* Note */}
          <p className="mt-8 text-xs text-[rgb(var(--muted-foreground))]">
            💡 <span className="text-[rgb(var(--accent))] font-semibold">Astuce :</span> Ces paramètres seront sauvegardés par utilisateur et synchronisés sur tous vos appareils
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
