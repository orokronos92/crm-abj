/**
 * Script pour mettre à jour les données des formateurs avec les nouveaux champs
 */

import prisma from '../src/lib/prisma'

async function updateFormateurData() {
  console.log('🎨 Mise à jour des données formateurs avec les nouveaux champs...\n')

  try {
    // 1. Philippe Dubois
    await prisma.formateur.update({
      where: { idFormateur: 2 },
      data: {
        anneesExperience: 25,
        anneesEnseignement: 15,
        bio: "Maître artisan joaillier-sertisseur avec plus de 25 ans d'expérience. Formé chez Van Cleef & Arpels, spécialisé dans les techniques traditionnelles de sertissage. Passionné par la transmission du savoir-faire artisanal.",
        methodesPedagogiques: "Approche pratique avec démonstrations en direct. Exercices progressifs du simple au complexe. Suivi individualisé de chaque élève.",
        approchePedagogique: "Pédagogie basée sur la répétition et la maîtrise progressive des gestes. Importance accordée à la posture et à l'ergonomie.",
        outilsSupports: ["Loupes binoculaires", "Échoppes fabriquées main", "Supports pédagogiques vidéo", "Fiches techniques illustrées"],
        competencesTechniques: ["Serti grain", "Serti griffe", "Serti clos", "Serti rail", "Serti pavé"],
        satisfactionMoyenne: 4.8,
        tauxReussite: 92,
        nombreElevesFormes: 156,
        portfolio: {
          travaux: [
            { titre: "Bague serti pavé", description: "Réalisation complexe avec 120 pierres", date: "2023" },
            { titre: "Collier haute joaillerie", description: "Pièce unique pour concours MOF", date: "2022" }
          ]
        },
        temoignagesEleves: [
          { nom: "Marie D.", texte: "Formation exceptionnelle, Laurent transmet sa passion avec patience", note: 5, date: "2024-01" },
          { nom: "Paul B.", texte: "Très bon formateur, méthode claire et progressive", note: 4.5, date: "2023-11" }
        ],
        formationsContinues: [
          { titre: "Nouvelles techniques de serti invisible", organisme: "École Boulle", date: "2023", duree: "3 jours" },
          { titre: "Formation formateur", organisme: "CMA", date: "2022", duree: "5 jours" }
        ],
        certifications: [
          { nom: "Maître Artisan", organisme: "Chambre des Métiers", dateObtention: "2015", dateExpiration: null },
          { nom: "Formateur professionnel", organisme: "AFPA", dateObtention: "2020", dateExpiration: "2025" }
        ],
        languesParlees: ["Français", "Anglais", "Italien"]
      }
    })

    // 2. Catherine Martin - Joaillerie création
    await prisma.formateur.update({
      where: { idFormateur: 3 },
      data: {
        anneesExperience: 18,
        anneesEnseignement: 10,
        bio: "Créatrice joaillière indépendante et formatrice passionnée. Diplômée de l'École Boulle, spécialisée dans la création contemporaine et le design joaillier.",
        methodesPedagogiques: "Développement de la créativité par le dessin et la maquette. Approche projet avec suivi personnalisé.",
        approchePedagogique: "Encouragement de l'expression personnelle tout en respectant les contraintes techniques. Développement d'un style propre.",
        outilsSupports: ["Logiciels CAO (Rhino, Matrix)", "Tablettes graphiques", "Matériaux de maquettage", "Bibliothèque d'inspiration"],
        competencesTechniques: ["Dessin technique", "Gouaché de bijoux", "CAO/DAO", "Modelage cire", "Création de collections"],
        satisfactionMoyenne: 4.9,
        tauxReussite: 88,
        nombreElevesFormes: 98,
        portfolio: {
          travaux: [
            { titre: "Collection Géométrie", description: "Ligne de bijoux modulables", date: "2024" },
            { titre: "Parure Océan", description: "Création pour exposition", date: "2023" }
          ]
        },
        languesParlees: ["Français", "Anglais", "Espagnol"]
      }
    })

    // 3. Jean-Pierre Bernard - CAO/DAO 3D
    await prisma.formateur.update({
      where: { idFormateur: 4 },
      data: {
        anneesExperience: 12,
        anneesEnseignement: 7,
        bio: "Expert en modélisation 3D pour la bijouterie-joaillerie. Consultant pour grandes maisons de luxe, spécialisé dans l'optimisation des processus de création numérique.",
        methodesPedagogiques: "Formation sur poste individuel avec exercices pratiques. Projets réels en collaboration avec des entreprises.",
        approchePedagogique: "Learning by doing avec accompagnement personnalisé. Focus sur les workflows professionnels.",
        outilsSupports: ["Rhino 3D", "Matrix Gold", "ZBrush", "KeyShot", "Imprimantes 3D résine"],
        competencesTechniques: ["Modélisation NURBS", "Sculpture digitale", "Rendu photoréaliste", "Préparation fichiers impression 3D", "Optimisation STL"],
        satisfactionMoyenne: 4.7,
        tauxReussite: 95,
        nombreElevesFormes: 67,
        certifications: [
          { nom: "Rhinoceros Level 2", organisme: "McNeel", dateObtention: "2021", dateExpiration: null },
          { nom: "Matrix Gold Certified", organisme: "Stuller", dateObtention: "2022", dateExpiration: "2025" }
        ],
        languesParlees: ["Français", "Anglais"]
      }
    })

    // 4. Sophie Petit - Gemmologie
    await prisma.formateur.update({
      where: { idFormateur: 5 },
      data: {
        anneesExperience: 20,
        anneesEnseignement: 12,
        bio: "Gemmologue diplômée FGA (Fellow of the Gemmological Association). Expertise reconnue dans l'identification et l'évaluation des pierres précieuses.",
        methodesPedagogiques: "Observation pratique avec instruments professionnels. Études de cas réels et exercices d'identification.",
        approchePedagogique: "Développement de l'œil et du jugement critique. Apprentissage des protocoles d'analyse systématique.",
        outilsSupports: ["Loupe 10x", "Microscope binoculaire", "Réfractomètre", "Spectroscope", "Balance de précision"],
        competencesTechniques: ["Identification pierres", "Détection traitements", "Évaluation qualité", "Gradation diamants", "Expertise pierres de couleur"],
        satisfactionMoyenne: 4.9,
        tauxReussite: 91,
        nombreElevesFormes: 134,
        languesParlees: ["Français", "Anglais", "Mandarin"]
      }
    })

    // Statistiques
    const formateurs = await prisma.formateur.count()
    console.log(`✅ ${formateurs} formateurs mis à jour avec les nouveaux champs`)

    const formateurComplet = await prisma.formateur.findFirst({
      where: { idFormateur: 2 },
      select: {
        nom: true,
        prenom: true,
        anneesExperience: true,
        anneesEnseignement: true,
        satisfactionMoyenne: true,
        tauxReussite: true,
        nombreElevesFormes: true,
        competencesTechniques: true
      }
    })

    console.log('\n📊 Exemple de données complètes:')
    console.log(`- ${formateurComplet?.prenom} ${formateurComplet?.nom}`)
    console.log(`  • ${formateurComplet?.anneesExperience} ans d'expérience`)
    console.log(`  • ${formateurComplet?.anneesEnseignement} ans d'enseignement`)
    console.log(`  • Satisfaction: ${formateurComplet?.satisfactionMoyenne}/5`)
    console.log(`  • Taux réussite: ${formateurComplet?.tauxReussite}%`)
    console.log(`  • ${formateurComplet?.nombreElevesFormes} élèves formés`)
    console.log(`  • Compétences: ${formateurComplet?.competencesTechniques?.join(', ')}`)

    console.log('\n✨ Données formateurs enrichies avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécution
updateFormateurData().catch(console.error)