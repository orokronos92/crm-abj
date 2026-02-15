/**
 * Script pour enrichir les données des formateurs avec les nouveaux champs
 * Ajout de bio, méthodes pédagogiques, compétences, certifications, etc.
 */

import prisma from '@/lib/prisma'

async function updateFormateursData() {
  console.log('🔄 Enrichissement des données formateurs...')

  try {
    // Données enrichies pour chaque formateur
    const formateursData = [
      {
        id: 2, // Laurent Dupont
        bio: "Expert en sertissage traditionnel avec plus de 25 ans d'expérience dans les plus grandes maisons de joaillerie parisiennes. Formé chez Van Cleef & Arpels, j'ai développé une expertise unique dans le sertissage de pierres précieuses. Passionné par la transmission, j'enseigne les techniques traditionnelles tout en intégrant les innovations modernes.",
        anneesExperience: 25,
        anneesEnseignement: 12,
        methodesPedagogiques: "Approche progressive basée sur la pratique intensive. Je commence par les bases du sertissage grain, puis j'introduis progressivement les techniques plus complexes comme le serti rail et le serti invisible. Chaque élève travaille sur des pièces réelles dès la deuxième semaine.",
        approchePedagogique: "Ma philosophie d'enseignement repose sur l'apprentissage par l'erreur contrôlée. Les élèves travaillent d'abord sur des métaux moins nobles pour comprendre les gestes, puis progressent vers l'or et les pierres précieuses. J'accorde une importance particulière à la posture et à l'ergonomie du poste de travail.",
        outilsSupports: ['Microscope binoculaire', 'Échoppes sur mesure', 'Supports pédagogiques vidéo', 'Maquettes 3D', 'Pierre d\'exercice synthétiques'],
        competencesTechniques: ['Serti grain', 'Serti rail', 'Serti clos', 'Serti invisible', 'Serti masse', 'Ajustage de pierres', 'Réparation de sertis'],
        satisfactionMoyenne: 4.8,
        tauxReussite: 92,
        nombreElevesFormes: 156,
        languesParlees: ['Français', 'Anglais', 'Italien'],
        portfolio: {
          realisations: [
            { titre: 'Bague haute joaillerie', annee: 2023, description: 'Serti invisible 48 diamants', client: 'Cartier' },
            { titre: 'Parure émeraudes', annee: 2023, description: 'Serti rail et grain', client: 'Mauboussin' }
          ]
        },
        temoignagesEleves: [
          { nom: 'Marie D.', formation: 'CAP ATBJ', annee: 2023, message: 'Formateur exceptionnel, très patient et pédagogue' },
          { nom: 'Lucas B.', formation: 'Sertissage N1', annee: 2023, message: 'J\'ai appris plus en 3 mois qu\'en 2 ans ailleurs' }
        ],
        formationsContinues: [
          { titre: 'Nouvelles techniques de sertissage laser', organisme: 'École Boulle', date: '2023-09', duree: '3 jours' },
          { titre: 'Formation formateur niveau 2', organisme: 'AFPA', date: '2023-03', duree: '5 jours' }
        ],
        certifications: [
          { nom: 'CAP Art du Bijou', organisme: 'Éducation Nationale', dateObtention: '1998-06', dateExpiration: null },
          { nom: 'Meilleur Ouvrier de France', organisme: 'COET-MOF', dateObtention: '2010-11', dateExpiration: null },
          { nom: 'Certificat Qualiopi Formateur', organisme: 'AFNOR', dateObtention: '2023-01', dateExpiration: '2026-01' }
        ]
      },
      {
        id: 3, // Marie Bernard
        bio: "Créatrice joaillière indépendante depuis 15 ans, je partage ma passion pour la création de bijoux uniques. Diplômée de l'École Boulle et lauréate du prix Biennale des Métiers d'Art, je forme les futurs créateurs à développer leur style personnel tout en maîtrisant les techniques fondamentales.",
        anneesExperience: 18,
        anneesEnseignement: 8,
        methodesPedagogiques: "Méthode créative basée sur le développement du style personnel. Alternance entre exercices techniques imposés et projets libres. J'encourage l'expérimentation avec différents matériaux et techniques pour développer une approche unique.",
        approchePedagogique: "Je crois en l'importance de développer à la fois la technique et la créativité. Mes cours intègrent l'histoire de la joaillerie, les tendances actuelles et les aspects commerciaux du métier. Chaque élève termine sa formation avec un portfolio professionnel.",
        outilsSupports: ['Table de dessin', 'Logiciels CAO', 'Bibliothèque de pierres', 'Catalogues tendances', 'Matériaux variés'],
        competencesTechniques: ['Design bijou', 'Gouaché', 'Modelage cire', 'Fonte à cire perdue', 'Assemblage', 'Polissage', 'CAO Rhinoceros'],
        satisfactionMoyenne: 4.9,
        tauxReussite: 88,
        nombreElevesFormes: 89,
        languesParlees: ['Français', 'Anglais', 'Espagnol'],
        portfolio: {
          collections: [
            { nom: 'Géométrie Sacrée', annee: 2023, pieces: 12, exposition: 'Salon Révélations' },
            { nom: 'Nature Urbaine', annee: 2022, pieces: 8, exposition: 'Biennale Émergences' }
          ]
        },
        temoignagesEleves: [
          { nom: 'Sophie R.', formation: 'CAP ATBJ', annee: 2023, message: 'Marie m\'a donné confiance en ma créativité' },
          { nom: 'Antoine M.', formation: 'Joaillerie Création', annee: 2023, message: 'Approche moderne et inspirante' }
        ],
        formationsContinues: [
          { titre: 'Tendances joaillerie 2024', organisme: 'Francéclat', date: '2023-11', duree: '2 jours' },
          { titre: 'Marketing digital pour artisans', organisme: 'CMA', date: '2023-06', duree: '3 jours' }
        ],
        certifications: [
          { nom: 'CAP Art du Bijou', organisme: 'Éducation Nationale', dateObtention: '2005-06', dateExpiration: null },
          { nom: 'DMA Art du Bijou', organisme: 'École Boulle', dateObtention: '2008-06', dateExpiration: null },
          { nom: 'Formation de formateur', organisme: 'AFPA', dateObtention: '2020-09', dateExpiration: '2025-09' }
        ]
      },
      {
        id: 4, // Thomas Petit
        bio: "Spécialiste CAO/DAO avec 15 ans d'expertise dans la modélisation 3D pour la joaillerie. Ancien responsable CAO chez Chaumet, je forme les artisans aux outils numériques modernes tout en préservant l'essence du métier traditionnel.",
        anneesExperience: 15,
        anneesEnseignement: 6,
        methodesPedagogiques: "Formation pratique sur projets réels. Les élèves apprennent Rhinoceros et MatrixGold en créant des bijoux de complexité croissante. J'intègre l'impression 3D et le prototypage rapide dans mes cours.",
        approchePedagogique: "La technologie au service de l'artisanat. Je montre comment les outils numériques peuvent amplifier la créativité sans remplacer le savoir-faire manuel. Chaque élève apprend à optimiser son workflow entre conception numérique et réalisation manuelle.",
        outilsSupports: ['Rhinoceros 7', 'MatrixGold', 'KeyShot', 'Imprimante 3D résine', 'Tablette graphique'],
        competencesTechniques: ['Rhinoceros', 'MatrixGold', 'Grasshopper', 'KeyShot rendering', 'Impression 3D', 'Sculpture numérique', 'Optimisation STL'],
        satisfactionMoyenne: 4.7,
        tauxReussite: 85,
        nombreElevesFormes: 67,
        languesParlees: ['Français', 'Anglais'],
        portfolio: {
          projets: [
            { nom: 'Ligne haute joaillerie Cartier', annee: 2023, logiciel: 'MatrixGold', pieces: 25 },
            { nom: 'Collection capsule Messika', annee: 2023, logiciel: 'Rhinoceros', pieces: 15 }
          ]
        },
        temoignagesEleves: [
          { nom: 'Paul V.', formation: 'CAO/DAO', annee: 2023, message: 'Formation très complète et moderne' },
          { nom: 'Lisa T.', formation: 'CAO/DAO', annee: 2023, message: 'Thomas est patient et très compétent' }
        ],
        formationsContinues: [
          { titre: 'Rhinoceros 8 nouvelles fonctionnalités', organisme: 'McNeel', date: '2023-10', duree: '2 jours' },
          { titre: 'IA et design génératif', organisme: 'École des Mines', date: '2023-05', duree: '3 jours' }
        ],
        certifications: [
          { nom: 'Certification Rhinoceros', organisme: 'McNeel', dateObtention: '2018-03', dateExpiration: null },
          { nom: 'Certification MatrixGold', organisme: 'Gemvision', dateObtention: '2020-06', dateExpiration: null },
          { nom: 'Formateur certifié', organisme: 'CCI', dateObtention: '2021-09', dateExpiration: '2024-09' }
        ]
      },
      {
        id: 5, // Sophie Lefebvre
        bio: "Gemmologue diplômée avec 20 ans d'expérience dans l'expertise de pierres précieuses. Ancienne directrice du laboratoire de gemmologie de Christie's Paris, je transmets ma passion pour les gemmes et leur identification.",
        anneesExperience: 20,
        anneesEnseignement: 10,
        methodesPedagogiques: "Approche scientifique et pratique. Les élèves manipulent de vraies pierres dès le premier jour. J'utilise des instruments professionnels et enseigne les techniques d'identification les plus récentes.",
        approchePedagogique: "La gemmologie est une science qui nécessite rigueur et observation. J'enseigne non seulement l'identification mais aussi l'évaluation commerciale, les traitements et les synthèses. Chaque élève développe son œil expert.",
        outilsSupports: ['Réfractomètre', 'Polariscope', 'Dichroscope', 'Loupe 10x', 'Collection de 500+ échantillons'],
        competencesTechniques: ['Identification gemmes', 'Détection traitements', 'Évaluation qualité', 'Certification', 'Expertise judiciaire', 'Photographie macro'],
        satisfactionMoyenne: 4.9,
        tauxReussite: 94,
        nombreElevesFormes: 134,
        languesParlees: ['Français', 'Anglais', 'Allemand', 'Mandarin'],
        portfolio: {
          expertises: [
            { titre: 'Rubis Birman 15ct', client: 'Sotheby\'s', valeur: '2.5M€', annee: 2023 },
            { titre: 'Émeraude Colombie 8ct', client: 'Christie\'s', valeur: '800k€', annee: 2023 }
          ]
        },
        temoignagesEleves: [
          { nom: 'Caroline B.', formation: 'Gemmologie', annee: 2023, message: 'Formation passionnante et très professionnelle' },
          { nom: 'Marc L.', formation: 'Gemmologie', annee: 2023, message: 'Sophie est une vraie experte qui sait transmettre' }
        ],
        formationsContinues: [
          { titre: 'Nouvelles synthèses 2023', organisme: 'IGA', date: '2023-09', duree: '3 jours' },
          { titre: 'Émeraudes traitées', organisme: 'SSEF', date: '2023-04', duree: '2 jours' }
        ],
        certifications: [
          { nom: 'DU Gemmologie', organisme: 'Université de Nantes', dateObtention: '2003-06', dateExpiration: null },
          { nom: 'FGA', organisme: 'Gem-A London', dateObtention: '2005-12', dateExpiration: null },
          { nom: 'Expert judiciaire', organisme: 'Cour d\'Appel de Paris', dateObtention: '2015-01', dateExpiration: '2025-01' }
        ]
      }
    ]

    // Mise à jour de chaque formateur
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
          temoignagesEleves: updateData.temoignagesEleves,
          formationsContinues: updateData.formationsContinues,
          certifications: updateData.certifications
        }
      })

      console.log(`✅ Formateur ${updated.prenom} ${updated.nom} enrichi avec succès`)
    }

    // Vérification des données
    const formateurs = await prisma.formateur.findMany({
      select: {
        idFormateur: true,
        nom: true,
        prenom: true,
        bio: true,
        anneesExperience: true,
        satisfactionMoyenne: true,
        tauxReussite: true
      }
    })

    console.log('\n📊 Résumé des formateurs enrichis :')
    formateurs.forEach(f => {
      if (f.bio) {
        console.log(`  - ${f.prenom} ${f.nom}: ${f.anneesExperience} ans exp., ${f.satisfactionMoyenne}/5, ${f.tauxReussite}% réussite`)
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'enrichissement des données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateFormateursData()
  .then(() => console.log('✨ Enrichissement terminé'))
  .catch(console.error)