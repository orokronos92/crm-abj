import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config.demo'
import prisma from '@/lib/prisma'

/**
 * GET /api/formateur/profil
 * Récupère le profil complet du formateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authConfig)
    if (!session || !session.user || session.user.role !== 'professeur') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer le formateur via l'ID utilisateur
    const formateur = await prisma.formateur.findUnique({
      where: { idUtilisateur: session.user.id },
      include: {
        diplomes: {
          orderBy: { dateObtention: 'desc' }
        },
        certificationsPro: {
          orderBy: { dateObtention: 'desc' }
        },
        formationsPedagogiques: {
          orderBy: { dateFormation: 'desc' }
        },
        portfolioRealisations: {
          orderBy: { annee: 'desc' }
        },
        competencesTech: {
          orderBy: { domaine: 'asc' }
        },
        formationsCont: {
          orderBy: { dateDebut: 'desc' }
        },
        veillePro: {
          orderBy: { dateActivite: 'desc' }
        }
      }
    })

    if (!formateur) {
      return NextResponse.json(
        { error: 'Formateur non trouvé' },
        { status: 404 }
      )
    }

    // Formater les données selon les types ProfilFormateur
    const profilFormate = {
      // Informations de base du formateur
      id: formateur.idFormateur,
      nom: formateur.nom || '',
      prenom: formateur.prenom || '',
      email: formateur.email || '',
      telephone: formateur.telephone || '',
      cvUrl: formateur.cvUrl || '',

      // Expérience (correspond aux champs du type ProfilFormateur)
      anneesExperienceMetier: formateur.anneesExperience || 0,
      anneesExperienceEnseignement: formateur.anneesEnseignement || 0,
      tarifHoraire: formateur.tarifJournalier ? Number(formateur.tarifJournalier) / 7 : 0, // Convertir jour → heure
      bio: formateur.bio || '',

      // Diplômes (format type Diplome)
      diplomes: formateur.diplomes.map(d => ({
        id: d.idDiplome.toString(),
        titre: d.nomDiplome,
        etablissement: d.etablissement,
        dateObtention: d.dateObtention.toISOString().split('T')[0],
        niveau: d.typeFormation,
        specialite: d.specialite || undefined
      })),

      // Certifications (format type Certification)
      certifications: formateur.certificationsPro.map(c => ({
        id: c.idCertification.toString(),
        nom: c.nomCertification,
        organisme: c.organisme,
        dateObtention: c.dateObtention.toISOString().split('T')[0],
        dateExpiration: c.dateExpiration ? c.dateExpiration.toISOString().split('T')[0] : undefined,
        numero: undefined
      })),

      // Formations pédagogiques (format type FormationPedagogique)
      formationsPedagogiques: formateur.formationsPedagogiques.map(f => ({
        id: f.idFormation.toString(),
        intitule: f.intitule,
        organisme: f.organisme,
        duree: f.dureeHeures ? `${f.dureeHeures}h` : '',
        date: f.dateFormation.toISOString().split('T')[0],
        competencesAcquises: undefined
      })),

      // Portfolio (format type PortfolioItem)
      portfolio: formateur.portfolioRealisations.map(p => ({
        id: p.idPortfolio.toString(),
        titre: p.titre,
        description: p.description || '',
        type: 'realisation' as 'realisation' | 'projet' | 'publication',
        date: `${p.annee}`,
        lienUrl: undefined,
        imageUrl: p.imageUrl || undefined
      })),

      // Compétences (format type Competence - à partir de competencesTech)
      competences: formateur.competencesTech.map(c => ({
        id: c.idCompetence.toString(),
        nom: c.technique,
        niveau: getNiveauCompetence(c.niveau),
        anneesExperience: c.anneesPratique,
        certifie: false // TODO: ajouter ce champ en BDD si nécessaire
      })),

      // Méthodes pédagogiques
      methodesPedagogiques: formateur.methodesPedagogiques || '',
      approchePedagogique: formateur.approchePedagogique || '',
      outilsSupports: formateur.outilsSupports || [],

      // Formations continues (format type FormationContinue)
      formationsContinues: formateur.formationsCont.map(f => ({
        id: f.idFormation.toString(),
        titre: f.intitule,
        organisme: f.organisme,
        date: f.dateDebut.toISOString().split('T')[0],
        dureeHeures: f.dureeHeures || 0,
        type: 'presentiel' as 'presentiel' | 'distanciel' | 'mixte', // TODO: ajouter ce champ en BDD
        competencesAcquises: undefined
      })),

      // Veille professionnelle (format type VeilleProfessionnelle)
      veilleProfessionnelle: formateur.veillePro.map(v => ({
        id: v.idVeille.toString(),
        type: mapTypeActiviteToVeille(v.type),
        titre: v.nomActivite,
        description: '',
        date: v.dateActivite.toISOString().split('T')[0],
        source: v.organisme || undefined
      }))
    }

    return NextResponse.json(profilFormate)
  } catch (error) {
    console.error('Erreur GET /api/formateur/profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/formateur/profil
 * Sauvegarde le profil complet du formateur
 */
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authConfig)
    if (!session || !session.user || session.user.role !== 'professeur') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const profil = await request.json()

    // Récupérer le formateur via l'ID utilisateur
    const formateurExistant = await prisma.formateur.findUnique({
      where: { idUtilisateur: session.user.id }
    })

    if (!formateurExistant) {
      return NextResponse.json(
        { error: 'Formateur non trouvé' },
        { status: 404 }
      )
    }

    const idFormateur = formateurExistant.idFormateur

    // Transaction pour tout sauvegarder en une fois
    await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le formateur principal
      await tx.formateur.update({
        where: { idFormateur },
        data: {
          anneesExperience: profil.anneesExperienceMetier || null,
          anneesEnseignement: profil.anneesExperienceEnseignement || null,
          tarifJournalier: profil.tarifHoraire ? profil.tarifHoraire * 7 : null, // Convertir heure → jour
          bio: profil.bio || null,
          methodesPedagogiques: profil.methodesPedagogiques || null,
          approchePedagogique: profil.approchePedagogique || null,
          outilsSupports: profil.outilsSupports || []
        }
      })

      // 2. Sauvegarder les diplômes
      if (profil.diplomes && profil.diplomes.length > 0) {
        await tx.formateurDiplome.deleteMany({
          where: { idFormateur }
        })

        await tx.formateurDiplome.createMany({
          data: profil.diplomes.map((d: any) => ({
            idFormateur,
            nomDiplome: d.titre,
            typeFormation: d.niveau || 'Autre',
            specialite: d.specialite || null,
            etablissement: d.etablissement,
            ville: null,
            dateObtention: new Date(d.dateObtention),
            documentUrl: null,
            statut: 'EN_ATTENTE'
          }))
        })
      }

      // 3. Sauvegarder les certifications
      if (profil.certifications && profil.certifications.length > 0) {
        await tx.formateurCertification.deleteMany({
          where: { idFormateur }
        })

        await tx.formateurCertification.createMany({
          data: profil.certifications.map((c: any) => ({
            idFormateur,
            nomCertification: c.nom,
            organisme: c.organisme,
            dateObtention: new Date(c.dateObtention),
            dateExpiration: c.dateExpiration ? new Date(c.dateExpiration) : null,
            documentUrl: null,
            statut: 'VALIDE'
          }))
        })
      }

      // 4. Sauvegarder les formations pédagogiques
      if (profil.formationsPedagogiques && profil.formationsPedagogiques.length > 0) {
        await tx.formateurFormationPedagogique.deleteMany({
          where: { idFormateur }
        })

        await tx.formateurFormationPedagogique.createMany({
          data: profil.formationsPedagogiques.map((f: any) => ({
            idFormateur,
            nomFormation: f.intitule,
            organisme: f.organisme,
            dateObtention: new Date(f.date),
            dureeHeures: f.duree ? parseInt(f.duree.replace('h', '')) : null,
            documentUrl: null
          }))
        })
      }

      // 5. Sauvegarder le portfolio
      if (profil.portfolio && profil.portfolio.length > 0) {
        await tx.formateurPortfolio.deleteMany({
          where: { idFormateur }
        })

        await tx.formateurPortfolio.createMany({
          data: profil.portfolio.map((p: any) => ({
            idFormateur,
            titre: p.titre,
            description: p.description || null,
            annee: parseInt(p.date) || new Date().getFullYear(),
            typeRealisation: p.type === 'publication' ? 'Publication' :
                            p.type === 'projet' ? 'Projet' : 'Réalisation',
            imageUrl: p.imageUrl || null,
            lienExterne: p.lienUrl || null
          }))
        })
      }

      // 6. Sauvegarder les compétences
      if (profil.competences && profil.competences.length > 0) {
        await tx.formateurCompetenceTechnique.deleteMany({
          where: { idFormateur }
        })

        await tx.formateurCompetenceTechnique.createMany({
          data: profil.competences.map((c: any) => ({
            idFormateur,
            domaine: 'Général', // TODO: ajouter domaine dans le type Competence
            technique: c.nom,
            niveau: getNiveauTexte(c.niveau),
            anneesPratique: c.anneesExperience || 0
          }))
        })
      }

      // 7. Sauvegarder les formations continues
      if (profil.formationsContinues && profil.formationsContinues.length > 0) {
        await tx.formateurFormationContinue.deleteMany({
          where: { idFormateur }
        })

        await tx.formateurFormationContinue.createMany({
          data: profil.formationsContinues.map((f: any) => ({
            idFormateur,
            nomFormation: f.titre,
            organisme: f.organisme,
            dateDebut: new Date(f.date),
            dateFin: null,
            dureeHeures: f.dureeHeures || null,
            domaine: 'Formation continue', // TODO: extraire du titre ou ajouter au type
            documentUrl: null
          }))
        })
      }

      // 8. Sauvegarder la veille professionnelle
      if (profil.veilleProfessionnelle && profil.veilleProfessionnelle.length > 0) {
        await tx.formateurVeilleProfessionnelle.deleteMany({
          where: { idFormateur }
        })

        await tx.formateurVeilleProfessionnelle.createMany({
          data: profil.veilleProfessionnelle.map((v: any) => ({
            idFormateur,
            typeActivite: mapVeilleToTypeActivite(v.type),
            nom: v.titre,
            organisateur: v.source || null,
            lieu: null,
            dateActivite: new Date(v.date),
            apportsCompetences: v.description || null,
            documentUrl: null
          }))
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profil sauvegardé avec succès'
    })
  } catch (error) {
    console.error('Erreur PUT /api/formateur/profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la sauvegarde du profil' },
      { status: 500 }
    )
  }
}

// Helpers pour conversion
function getNiveauCompetence(niveau: string): 'debutant' | 'intermediaire' | 'avance' | 'expert' {
  const mapping: Record<string, 'debutant' | 'intermediaire' | 'avance' | 'expert'> = {
    'Débutant': 'debutant',
    'Intermédiaire': 'intermediaire',
    'Avancé': 'avance',
    'Expert': 'expert',
    'Maître': 'expert'
  }
  return mapping[niveau] || 'intermediaire'
}

function getNiveauTexte(niveau: 'debutant' | 'intermediaire' | 'avance' | 'expert'): string {
  const mapping: Record<string, string> = {
    'debutant': 'Débutant',
    'intermediaire': 'Intermédiaire',
    'avance': 'Avancé',
    'expert': 'Expert'
  }
  return mapping[niveau] || 'Intermédiaire'
}

function mapTypeActiviteToVeille(type: string): 'conference' | 'salon' | 'webinaire' | 'publication' | 'formation' {
  const lower = type.toLowerCase()
  if (lower.includes('conférence') || lower.includes('conference')) return 'conference'
  if (lower.includes('salon')) return 'salon'
  if (lower.includes('webinaire') || lower.includes('webinar')) return 'webinaire'
  if (lower.includes('publication') || lower.includes('article')) return 'publication'
  if (lower.includes('formation')) return 'formation'
  return 'conference'
}

function mapVeilleToTypeActivite(type: 'conference' | 'salon' | 'webinaire' | 'publication' | 'formation'): string {
  const mapping: Record<string, string> = {
    'conference': 'Conférence',
    'salon': 'Salon professionnel',
    'webinaire': 'Webinaire',
    'publication': 'Publication',
    'formation': 'Formation'
  }
  return mapping[type] || 'Conférence'
}
