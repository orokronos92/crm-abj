import prisma from '../src/lib/prisma'

async function addTestData() {
  console.log('🌱 Ajout de données de test...\n')

  try {
    // 1. Création de prospects
    const prospects = [
      { idProspect: 'jean.dupont@gmail.com_dupjea', nom: 'Dupont', prenom: 'Jean', emails: ['jean.dupont@gmail.com'], telephones: ['0612345678'], statutProspect: 'NOUVEAU', formationPrincipale: 'CAP_BJ' },
      { idProspect: 'marie.leroy@yahoo.fr_lermar', nom: 'Leroy', prenom: 'Marie', emails: ['marie.leroy@yahoo.fr'], telephones: ['0623456789'], statutProspect: 'EN_ATTENTE_DOSSIER', formationPrincipale: 'INIT_BJ' },
      { idProspect: 'pierre.boucher@gmail.com_bouche', nom: 'Boucher', prenom: 'Pierre', emails: ['pierre.boucher@gmail.com'], telephones: ['0634567890'], statutProspect: 'CANDIDAT', formationPrincipale: 'PERF_SERTI' },
      { idProspect: 'anne.lafont@outlook.fr_lafann', nom: 'Lafont', prenom: 'Anne', emails: ['anne.lafont@outlook.fr'], telephones: ['0645678901'], statutProspect: 'CANDIDAT', formationPrincipale: 'CAP_BJ' },
      { idProspect: 'louis.richard@gmail.com_richou', nom: 'Richard', prenom: 'Louis', emails: ['louis.richard@gmail.com'], telephones: ['0656789012'], statutProspect: 'CANDIDAT', formationPrincipale: 'CAO_DAO' },
      { idProspect: 'lea.moreau@gmail.com_morlea', nom: 'Moreau', prenom: 'Léa', emails: ['lea.moreau@gmail.com'], telephones: ['0667890123'], statutProspect: 'ELEVE', formationPrincipale: 'CAP_BJ' },
      { idProspect: 'alice.roux@hotmail.fr_rouali', nom: 'Roux', prenom: 'Alice', emails: ['alice.roux@hotmail.fr'], telephones: ['0678901234'], statutProspect: 'ELEVE', formationPrincipale: 'INIT_BJ' },
      { idProspect: 'hugo.simon@gmail.com_simhug', nom: 'Simon', prenom: 'Hugo', emails: ['hugo.simon@gmail.com'], telephones: ['0689012345'], statutProspect: 'ELEVE', formationPrincipale: 'PERF_SERTI' },
      { idProspect: 'maxime.barbier@yahoo.fr_barmax', nom: 'Barbier', prenom: 'Maxime', emails: ['maxime.barbier@yahoo.fr'], telephones: ['0690123456'], statutProspect: 'ANCIEN_CANDIDAT', formationPrincipale: 'CAP_BJ' },
      { idProspect: 'sophie.durand@gmail.com_dursop', nom: 'Durand', prenom: 'Sophie', emails: ['sophie.durand@gmail.com'], telephones: ['0601234567'], statutProspect: 'ANCIEN_ELEVE', formationPrincipale: 'GEMMO' }
    ]

    console.log('📋 Création de prospects...')
    for (const prospect of prospects) {
      await prisma.prospect.upsert({
        where: { idProspect: prospect.idProspect },
        update: {},
        create: {
          ...prospect,
          dateNaissance: new Date('1990-01-15'),
          adresse: '123 rue de la République',
          codePostal: '75001',
          ville: 'Paris',
          modeFinancement: 'CPF',
          nbEchanges: Math.floor(Math.random() * 10) + 1,
          datePremierContact: new Date('2024-01-01'),
          dateDernierContact: new Date('2024-02-10'),
          creeLe: new Date(),
          modifieLe: new Date()
        }
      })
    }
    console.log('✅ Prospects créés')

    // 2. Création de candidats pour certains prospects
    const candidatsData = [
      { idProspect: 'pierre.boucher@gmail.com_bouche', numeroDossier: 'BOPI15011990', statutDossier: 'RECU', statutFinancement: 'EN_ATTENTE', montantTotal: 8500 },
      { idProspect: 'anne.lafont@outlook.fr_lafann', numeroDossier: 'LAAN20021992', statutDossier: 'DOSSIER_EN_COURS', statutFinancement: 'EN_ATTENTE', montantTotal: 8500 },
      { idProspect: 'louis.richard@gmail.com_richou', numeroDossier: 'RILO10031988', statutDossier: 'DOSSIER_COMPLET', statutFinancement: 'EN_COURS', montantTotal: 3500 },
      { idProspect: 'lea.moreau@gmail.com_morlea', numeroDossier: 'MOLE25041995', statutDossier: 'ACCEPTE', statutFinancement: 'VALIDE', montantTotal: 8500 },
      { idProspect: 'alice.roux@hotmail.fr_rouali', numeroDossier: 'ROAL30051993', statutDossier: 'INSCRIT', statutFinancement: 'VALIDE', montantTotal: 750 },
      { idProspect: 'hugo.simon@gmail.com_simhug', numeroDossier: 'SIHU18061991', statutDossier: 'INSCRIT', statutFinancement: 'VALIDE', montantTotal: 2500 }
    ]

    console.log('📋 Création de candidats...')
    for (const candidat of candidatsData) {
      await prisma.candidat.upsert({
        where: { numeroDossier: candidat.numeroDossier },
        update: {},
        create: {
          idProspect: candidat.idProspect,
          numeroDossier: candidat.numeroDossier,
          formationsDemandees: ['CAP_BJ'],
          formationRetenue: 'CAP_BJ',
          modeFinancement: 'CPF',
          organismeFinanceur: 'Mon Compte Formation',
          montantTotalFormation: candidat.montantTotal,
          montantPriseEnCharge: candidat.montantTotal * 0.8,
          resteACharge: candidat.montantTotal * 0.2,
          statutDossier: candidat.statutDossier,
          statutFinancement: candidat.statutFinancement,
          statutInscription: 'EN_COURS',
          score: Math.floor(Math.random() * 40) + 60,
          notesIa: 'Profil intéressant, motivation claire pour le métier.',
          dateCandidature: new Date(),
          creeLe: new Date(),
          modifieLe: new Date()
        }
      })
    }
    console.log('✅ Candidats créés')

    // 3. Création d'élèves pour les inscrits
    const elevesData = [
      { idCandidat: 4, numeroDossier: 'MOLE25041995', formationSuivie: 'CAP_BJ' },
      { idCandidat: 5, numeroDossier: 'ROAL30051993', formationSuivie: 'INIT_BJ' },
      { idCandidat: 6, numeroDossier: 'SIHU18061991', formationSuivie: 'PERF_SERTI' }
    ]

    console.log('📋 Création d\'élèves...')
    for (const eleve of elevesData) {
      const candidat = await prisma.candidat.findUnique({
        where: { numeroDossier: eleve.numeroDossier }
      })

      if (candidat) {
        await prisma.eleve.create({
          data: {
            idCandidat: candidat.idCandidat,
            idUtilisateur: 3, // L'utilisateur élève créé dans le seed
            numeroDossier: eleve.numeroDossier,
            formationSuivie: eleve.formationSuivie,
            dateDebut: new Date('2024-03-01'),
            dateFinPrevue: new Date('2024-09-30'),
            statutFormation: 'EN_COURS',
            notesGenerales: 'Bon démarrage de formation',
            creeLe: new Date(),
            modifieLe: new Date()
          }
        })
      }
    }
    console.log('✅ Élèves créés')

    console.log('\n🎉 Données de test ajoutées avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestData()