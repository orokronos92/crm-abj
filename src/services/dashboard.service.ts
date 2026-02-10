/**
 * Dashboard Service
 * Gère la logique métier du tableau de bord
 * Calculs, agrégations, transformations
 */

import { DashboardRepository } from '@/repositories/dashboard.repository'

export interface DashboardStats {
  prospects: {
    total: number
    variation: number
    new: number
  }
  candidats: {
    total: number
    variation: number
    enCours: number
  }
  eleves: {
    total: number
    variation: number
    actifs: number
  }
  formateurs: {
    total: number
    variation: number
    actifs: number
  }
  conversion: {
    taux: number
    variation: number
  }
  finance: {
    caRealise: number
    caPrevisionnel: number
    variation: number
  }
  formations: Array<{
    nom: string
    count: number
    color: string
  }>
}

export class DashboardService {
  private repository: DashboardRepository

  constructor() {
    this.repository = new DashboardRepository()
  }

  /**
   * Récupère toutes les statistiques du dashboard
   */
  async getStats(): Promise<DashboardStats> {
    // Récupération des données en parallèle pour optimiser
    const [
      prospectsTotal,
      prospectsNew,
      candidatsTotal,
      candidatsEnCours,
      elevesTotal,
      elevesActifs,
      formateursTotal,
      formateursActifs,
      candidatsFinanciers,
      formationsStats
    ] = await Promise.all([
      this.repository.countProspects(),
      this.repository.countProspectsThisWeek(),
      this.repository.countCandidats(),
      this.repository.countCandidatsByStatus('EN_COURS'),
      this.repository.countEleves(),
      this.repository.countElevesActifs(),
      this.repository.countFormateurs(),
      this.repository.countFormateursActifs(),
      this.repository.getCandidatsFinanciers(),
      this.repository.getFormationsStats()
    ])

    // Calcul du taux de conversion
    const tauxConversion = prospectsTotal > 0
      ? Math.round((elevesTotal / prospectsTotal) * 100)
      : 0

    // Calcul du CA
    const { caRealise, caPrevisionnel } = this.calculateCA(candidatsFinanciers)

    // TODO: Calculer les vraies variations (nécessite historique)
    // Pour l'instant on utilise des valeurs mockées
    const variations = {
      prospects: 12,
      candidats: 5,
      eleves: 3,
      formateurs: 2,
      conversion: 5,
      finance: 15
    }

    return {
      prospects: {
        total: prospectsTotal,
        variation: variations.prospects,
        new: prospectsNew
      },
      candidats: {
        total: candidatsTotal,
        variation: variations.candidats,
        enCours: candidatsEnCours
      },
      eleves: {
        total: elevesTotal,
        variation: variations.eleves,
        actifs: elevesActifs
      },
      formateurs: {
        total: formateursTotal,
        variation: variations.formateurs,
        actifs: formateursActifs
      },
      conversion: {
        taux: tauxConversion,
        variation: variations.conversion
      },
      finance: {
        caRealise,
        caPrevisionnel,
        variation: variations.finance
      },
      formations: this.formatFormationsStats(formationsStats)
    }
  }

  /**
   * Formate les statistiques de formations pour l'UI
   */
  private formatFormationsStats(stats: any[]) {
    const colors = [
      'rgb(var(--accent))',
      'rgb(var(--info))',
      'rgb(var(--success))',
      'rgb(var(--warning))',
      'rgb(var(--error))'
    ]

    return stats
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((stat, index) => ({
        nom: stat.formation || 'Non définie',
        count: stat.count,
        color: colors[index % colors.length]
      }))
  }

  /**
   * Récupère les derniers prospects
   */
  async getRecentProspects(limit: number = 3) {
    const prospects = await this.repository.getRecentProspects(limit)

    // Transformation des données pour l'UI
    return prospects.map(p => ({
      id: p.idProspect,
      nom: `${p.prenom} ${p.nom}`,
      email: p.emails?.[0] || '',
      formation: p.formationPrincipale || 'Non définie',
      statut: p.statutProspect || 'NOUVEAU',
      date: this.formatDate(p.datePremierContact)
    }))
  }

  /**
   * Récupère les statistiques par formation
   */
  async getFormationsStats() {
    const stats = await this.repository.getFormationsStats()

    // Ajout des couleurs pour le graphique
    const colors = [
      'rgb(var(--accent))',
      'rgb(var(--info))',
      'rgb(var(--success))',
      'rgb(var(--warning))',
      'rgb(var(--error))'
    ]

    return stats.map((stat, index) => ({
      nom: stat.formation || 'Non définie',
      count: stat.count,
      color: colors[index % colors.length]
    }))
  }

  /**
   * Calcule le CA réalisé et prévisionnel
   */
  private calculateCA(candidats: any[]): { caRealise: number, caPrevisionnel: number } {
    let caRealise = 0
    let caPrevisionnel = 0

    for (const candidat of candidats) {
      const montant = Number(candidat.montantTotalFormation || 0)

      // CA réalisé = candidats avec financement validé
      if (candidat.statutFinancement === 'VALIDE') {
        caRealise += montant
      }

      // CA prévisionnel = tous les candidats en cours ou acceptés
      if (['EN_COURS', 'DOSSIER_COMPLET', 'ACCEPTE', 'DEVIS_ACCEPTE'].includes(candidat.statutDossier)) {
        caPrevisionnel += montant
      }
    }

    return {
      caRealise: Math.round(caRealise),
      caPrevisionnel: Math.round(caPrevisionnel)
    }
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(date: Date | null): string {
    if (!date) return ''

    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`

    return date.toLocaleDateString('fr-FR')
  }
}