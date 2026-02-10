import prisma from './src/lib/prisma'

async function main() {
  // Récupérer un candidat complet avec toutes les relations
  const candidat = await prisma.candidat.findFirst({
    include: {
      prospect: {
        select: {
          nom: true,
          prenom: true,
          emails: true,
          telephones: true,
          nbEchanges: true,
          dateDernierContact: true
        }
      },
      documentsCandidat: {
        select: {
          typeDocument: true,
          statut: true,
          nomFichier: true
        }
      }
    }
  })

  console.log('=== CANDIDAT COMPLET POUR MODAL ===\n')
  console.log(JSON.stringify(candidat, null, 2))

  console.log('\n=== CHAMPS DISPONIBLES ===')
  console.log('✅ Infos contact:', candidat?.prospect?.nom, candidat?.prospect?.prenom, candidat?.prospect?.emails?.[0])
  console.log('✅ N° Dossier:', candidat?.numeroDossier)
  console.log('✅ Formation:', candidat?.formationRetenue)
  console.log('✅ Session:', candidat?.sessionVisee || 'NULL')
  console.log('✅ Score:', candidat?.score)
  console.log('✅ Nb échanges:', candidat?.prospect?.nbEchanges)
  console.log('✅ Date candidature:', candidat?.dateCandidature)
  console.log('\n✅ Parcours admission:')
  console.log('  - Entretien tel:', candidat?.entretienTelephonique, '(date:', candidat?.dateEntretienTel, ')')
  console.log('  - RDV présentiel:', candidat?.rdvPresentiel, '(date:', candidat?.dateRdvPresentiel, ')')
  console.log('  - Test technique:', candidat?.testTechnique, '(date:', candidat?.dateTestTechnique, ')')
  console.log('  - Validation péda:', candidat?.validationPedagogique, '(date:', candidat?.dateValidationPedagogique, ')')
  console.log('\n✅ Financement:')
  console.log('  - Mode:', candidat?.modeFinancement)
  console.log('  - Montant total:', candidat?.montantTotalFormation)
  console.log('  - Prise en charge:', candidat?.montantPriseEnCharge)
  console.log('  - Reste à charge:', candidat?.resteACharge)
  console.log('\n✅ Documents:', candidat?.documentsCandidat?.length || 0, 'document(s)')
  candidat?.documentsCandidat?.forEach(d => {
    console.log(`  - ${d.typeDocument}: ${d.statut}`)
  })
  console.log('\n✅ Notes IA:', candidat?.notesIa ? 'OUI' : 'NON')

  await prisma.$disconnect()
}

main().catch(console.error)
