import prisma from './src/lib/prisma'

async function main() {
  console.log('🔄 Ajout des statuts manquants pour candidats...\n')

  // Mettre à jour quelques candidats avec des statuts variés
  const candidats = await prisma.candidat.findMany({
    take: 10,
    orderBy: { idCandidat: 'asc' }
  })

  // Répartition des statuts pour avoir de la variété
  const statutsVaries = [
    { statutDossier: 'RECU', statutFinancement: 'EN_ATTENTE' },           // Candidat 1
    { statutDossier: 'DOSSIER_EN_COURS', statutFinancement: 'EN_ATTENTE' }, // Candidat 2
    { statutDossier: 'DOSSIER_COMPLET', statutFinancement: 'EN_ATTENTE' },  // Candidat 3
    { statutDossier: 'ENTRETIEN_PLANIFIE', statutFinancement: 'EN_COURS' }, // Candidat 4
    { statutDossier: 'DEVIS_ENVOYE', statutFinancement: 'EN_COURS' },       // Candidat 5
    { statutDossier: 'DEVIS_ACCEPTE', statutFinancement: 'EN_COURS' },      // Candidat 6
    { statutDossier: 'FINANCEMENT_VALIDE', statutFinancement: 'VALIDE' },   // Candidat 7
    { statutDossier: 'ACCEPTE', statutFinancement: 'VALIDE' },              // Candidat 8
    { statutDossier: 'REFUSE', statutFinancement: 'REFUSE' },               // Candidat 9
    { statutDossier: 'INSCRIT', statutFinancement: 'VALIDE' },              // Candidat 10
  ]

  for (let i = 0; i < candidats.length && i < statutsVaries.length; i++) {
    const candidat = candidats[i]
    const newStatuts = statutsVaries[i]

    await prisma.candidat.update({
      where: { idCandidat: candidat.idCandidat },
      data: {
        statutDossier: newStatuts.statutDossier,
        statutFinancement: newStatuts.statutFinancement
      }
    })

    console.log(`✅ ${candidat.numeroDossier}: ${newStatuts.statutDossier} / ${newStatuts.statutFinancement}`)
  }

  // Vérifier les statuts distincts après mise à jour
  console.log('\n📊 Vérification des statuts après mise à jour:\n')

  const statutsDossier = await prisma.$queryRaw<Array<{ statut_dossier: string, count: string }>>`
    SELECT statut_dossier, COUNT(*)::text as count
    FROM candidats
    WHERE statut_dossier IS NOT NULL
    GROUP BY statut_dossier
    ORDER BY statut_dossier
  `
  console.log('🗂️  STATUTS DOSSIER:')
  statutsDossier.forEach(s => console.log(`  ${s.statut_dossier.padEnd(25)} → ${s.count} candidat(s)`))

  const statutsFinancement = await prisma.$queryRaw<Array<{ statut_financement: string, count: string }>>`
    SELECT statut_financement, COUNT(*)::text as count
    FROM candidats
    WHERE statut_financement IS NOT NULL
    GROUP BY statut_financement
    ORDER BY statut_financement
  `
  console.log('\n💰 STATUTS FINANCEMENT:')
  statutsFinancement.forEach(s => console.log(`  ${s.statut_financement.padEnd(15)} → ${s.count} candidat(s)`))

  console.log('\n✅ Mise à jour terminée !')

  await prisma.$disconnect()
}

main().catch(console.error)
