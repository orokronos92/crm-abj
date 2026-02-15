/**
 * Script pour enrichir les formateurs restants (IDs 6-9) avec des données complètes
 */

import prisma from '@/lib/prisma'

async function enrichRemainingFormateurs() {
  console.log('🔄 Enrichissement des formateurs restants...\n')

  try {
    // Données pour les formateurs non enrichis
    const formateursData = [
      {
        id: 6, // François Moreau
        bio: "Maître polisseur avec 22 ans d'expérience, spécialisé dans les finitions haute joaillerie. J'ai travaillé pour les plus grandes maisons parisiennes et je transmets aujourd'hui les techniques de polissage miroir et de finition satinée.",
        anneesExperience: 22,
        anneesEnseignement: 9,
        methodesPedagogiques: "Apprentissage progressif du polissage, de la préparation des pièces aux finitions les plus complexes. Chaque élève apprend à maîtriser les différents grains et techniques.",
        approchePedagogique: "Le polissage est un art qui demande patience et précision. J'enseigne l'importance de chaque étape et comment obtenir des finitions parfaites.",
        outilsSupports: ['Touret de polissage', 'Pâtes diamantées', 'Ultrasons', 'Microscope de contrôle'],
        competencesTechniques: ['Polissage miroir', 'Satiné', 'Brossé', 'Martelé', 'Rhodiage', 'Finition mate'],
        satisfactionMoyenne: 4.6,
        tauxReussite: 89,
        nombreElevesFormes: 98,
        languesParlees: ['Français', 'Portugais'],
        portfolio: {
          specialites: ['Finitions haute joaillerie', 'Restauration pièces anciennes']
        },
        certifications: [
          { nom: 'CAP Bijouterie', organisme: 'Éducation Nationale', dateObtention: '2001-06' }
        ],
        formationsContinues: [
          { titre: 'Nouvelles techniques de finition', organisme: 'École Boulle', date: '2023-05', duree: '2 jours' }
        ]
      },
      {
        id: 7, // Isabelle Laurent
        bio: "Spécialiste en histoire de la joaillerie et culture du bijou. Docteure en histoire de l'art, j'enseigne l'histoire des techniques et des styles depuis 15 ans, permettant aux élèves de comprendre l'évolution du métier.",
        anneesExperience: 15,
        anneesEnseignement: 15,
        methodesPedagogiques: "Cours magistraux enrichis de visites de musées et d'études de pièces historiques. J'utilise des supports visuels variés pour rendre l'histoire vivante.",
        approchePedagogique: "Comprendre l'histoire permet de mieux créer. Je montre comment les techniques anciennes peuvent inspirer la création contemporaine.",
        outilsSupports: ['Présentations visuelles', 'Collections musées', 'Bibliothèque spécialisée', 'Archives historiques'],
        competencesTechniques: ["Histoire de l'art", 'Analyse stylistique', 'Recherche documentaire', 'Conservation préventive'],
        satisfactionMoyenne: 4.7,
        tauxReussite: 95,
        nombreElevesFormes: 245,
        languesParlees: ['Français', 'Anglais', 'Italien'],
        portfolio: {
          publications: ['Histoire de la joaillerie française', 'Les techniques oubliées']
        },
        certifications: [
          { nom: "Doctorat Histoire de l'art", organisme: 'Sorbonne', dateObtention: '2008-12' },
          { nom: 'Agrégation', organisme: 'Éducation Nationale', dateObtention: '2009-07' }
        ],
        formationsContinues: [
          { titre: 'Conservation préventive bijoux', organisme: 'INP', date: '2023-09', duree: '3 jours' }
        ]
      },
      {
        id: 8, // Michel Leroy
        bio: "Expert en techniques de base de la bijouterie avec 18 ans d'expérience. Je forme les débutants aux gestes fondamentaux : sciage, limage, perçage, brasage. Ma pédagogie repose sur la répétition et la maîtrise parfaite des bases.",
        anneesExperience: 18,
        anneesEnseignement: 10,
        methodesPedagogiques: "Exercices progressifs avec difficulté croissante. Chaque technique est décomposée en étapes simples. L'accent est mis sur la posture et l'ergonomie.",
        approchePedagogique: "Les bases solides sont essentielles. Je m'assure que chaque élève maîtrise parfaitement les fondamentaux avant de progresser vers des techniques plus complexes.",
        outilsSupports: ['Établi équipé', 'Outils manuels', "Gabarits d'exercice", 'Fiches techniques'],
        competencesTechniques: ['Sciage', 'Limage', 'Perçage', 'Brasage', 'Recuit', 'Mise en forme', 'Assemblage'],
        satisfactionMoyenne: 4.5,
        tauxReussite: 87,
        nombreElevesFormes: 178,
        languesParlees: ['Français'],
        portfolio: {
          projets: ['Formation initiation ABJ', 'Stages découverte métier']
        },
        certifications: [
          { nom: 'CAP Bijouterie', organisme: 'Éducation Nationale', dateObtention: '2005-06' },
          { nom: 'BP Bijouterie', organisme: 'CMA', dateObtention: '2008-06' }
        ],
        formationsContinues: [
          { titre: 'Pédagogie pour adultes', organisme: 'AFPA', date: '2023-03', duree: '5 jours' }
        ]
      },
      {
        id: 9, // Pierre Durand
        bio: "Spécialiste du travail des métaux précieux alternatifs et du recyclage en bijouterie. Pionnier de la bijouterie écoresponsable, j'enseigne les techniques de récupération et transformation des métaux.",
        anneesExperience: 16,
        anneesEnseignement: 7,
        methodesPedagogiques: "Approche écoresponsable de la bijouterie. J'enseigne comment travailler avec des matériaux recyclés et comment minimiser l'impact environnemental.",
        approchePedagogique: "La bijouterie du futur est durable. Je forme les élèves aux techniques traditionnelles tout en intégrant les préoccupations environnementales actuelles.",
        outilsSupports: ['Four de fusion', 'Laminoir', 'Matériaux recyclés', 'Outils de récupération'],
        competencesTechniques: ['Fusion métaux', 'Alliages', 'Recyclage', 'Affinage', 'Techniques alternatives', 'Upcycling'],
        satisfactionMoyenne: 4.8,
        tauxReussite: 91,
        nombreElevesFormes: 67,
        languesParlees: ['Français', 'Anglais', 'Allemand'],
        portfolio: {
          projets: ['Collection 100% recyclée', 'Formation bijouterie durable']
        },
        certifications: [
          { nom: 'Master Métallurgie', organisme: 'École des Mines', dateObtention: '2007-06' },
          { nom: 'Certification RJC', organisme: 'Responsible Jewellery Council', dateObtention: '2020-03' }
        ],
        formationsContinues: [
          { titre: 'Nouvelles normes recyclage', organisme: 'Francéclat', date: '2023-11', duree: '2 jours' }
        ]
      }
    ]

    // Enrichir chaque formateur
    for (const data of formateursData) {
      const { id, ...updateData } = data

      const updated = await prisma.formateur.update({
        where: { idFormateur: id },
        data: {
          bio: updateData.bio,
          anneesExperience: updateData.anneesExperience,
          anneesEnseignement: updateData.anneesEnseignement,
          methodesPedagogiques: updateData.methodesPedagogiques,
          approchePedagogique: updateData.approchePedagogique,
          outilsSupports: updateData.outilsSupports,
          competencesTechniques: updateData.competencesTechniques,
          satisfactionMoyenne: updateData.satisfactionMoyenne,
          tauxReussite: updateData.tauxReussite,
          nombreElevesFormes: updateData.nombreElevesFormes,
          languesParlees: updateData.languesParlees,
          portfolio: updateData.portfolio,
          certifications: updateData.certifications,
          formationsContinues: updateData.formationsContinues,
          cvUrl: `https://drive.google.com/file/formateur_${id}_cv.pdf`,
          qualificationsResume: `${updateData.certifications.length} certifications, ${updateData.anneesExperience} ans d'expérience`,
          dateValidationQualiopi: new Date('2023-01-15'),
          dossierComplet: true
        }
      })

      console.log(`✅ ${updated.prenom} ${updated.nom} enrichi avec succès`)
    }

    // Vérification finale
    const allFormateurs = await prisma.formateur.findMany({
      select: {
        idFormateur: true,
        nom: true,
        prenom: true,
        bio: true,
        satisfactionMoyenne: true,
        tauxReussite: true
      },
      orderBy: { idFormateur: 'asc' }
    })

    console.log('\n📊 Tous les formateurs sont maintenant enrichis :')
    allFormateurs.forEach(f => {
      if (f.bio) {
        console.log(`  ✅ ${f.prenom} ${f.nom} - ${f.satisfactionMoyenne}/5 - ${f.tauxReussite}% réussite`)
      }
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

enrichRemainingFormateurs()
  .then(() => console.log('\n✨ Enrichissement terminé avec succès!'))
  .catch(console.error)