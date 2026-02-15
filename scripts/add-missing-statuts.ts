import prisma from '../src/lib/prisma'

async function addVarieteStatuts() {
  console.log('📝 Ajout de variété aux statuts des candidats...\n')

  try {
    const statutsVaries = [
      { statutDossier: 'RECU', statutFinancement: 'EN_ATTENTE' },
      { statutDossier: 'DOSSIER_EN_COURS', statutFinancement: 'EN_ATTENTE' },
      { statutDossier: 'DOSSIER_COMPLET', statutFinancement: 'EN_COURS' },
      { statutDossier: 'ENTRETIEN_PLANIFIE', statutFinancement: 'EN_COURS' },
      { statutDossier: 'DEVIS_ENVOYE', statutFinancement: 'EN_COURS' },
      { statutDossier: 'DEVIS_ACCEPTE', statutFinancement: 'VALIDE' }
    ]

    // Récupérer les candidats existants
    const candidats = await prisma.candidat.findMany({
      take: 6,
      orderBy: { idCandidat: 'asc' }
    })

    if (candidats.length === 0) {
      console.log('❌ Aucun candidat trouvé en base')
      return
    }

    console.log(`🔄 Mise à jour de ${candidats.length} candidats avec des statuts variés...\n`)

    for (let i = 0; i < candidats.length && i < statutsVaries.length; i++) {
      const candidat = candidats[i]
      const nouveauStatut = statutsVaries[i]

      await prisma.candidat.update({
        where: { idCandidat: candidat.idCandidat },
        data: nouveauStatut
      })

      console.log(`✅ Candidat ID ${candidat.idCandidat} : ${nouveauStatut.statutDossier} / ${nouveauStatut.statutFinancement}`)
    }

    console.log('\n🎉 Variété des statuts ajoutée avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des statuts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addVarieteStatuts()