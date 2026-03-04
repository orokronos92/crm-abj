import prisma from '../src/lib/prisma'

async function main() {
  console.log('Vidage des tables business...')

  // 1. Tables qui référencent evaluations, presences, inscriptions_sessions
  const r1 = await prisma.evaluation.deleteMany()
  console.log('evaluations:', r1.count)

  const r2 = await prisma.presence.deleteMany()
  console.log('presences:', r2.count)

  const r3 = await prisma.inscriptionSession.deleteMany()
  console.log('inscriptions_sessions:', r3.count)

  // 2. Tables qui référencent sessions
  const r4 = await prisma.interventionFormateur.deleteMany()
  console.log('interventions_formateurs:', r4.count)

  const r5 = await prisma.disponibiliteFormateur.deleteMany()
  console.log('disponibilites_formateurs:', r5.count)

  // 3. Maintenant on peut supprimer les sessions
  const r6 = await prisma.session.deleteMany()
  console.log('sessions:', r6.count)

  // 4. Documents formateurs et tables liées aux formateurs
  const r7 = await prisma.documentFormateur.deleteMany()
  console.log('documents_formateur:', r7.count)

  // Tables formateur supplémentaires Qualiopi
  try {
    const r7b = await prisma.formateurDiplome.deleteMany()
    console.log('formateur_diplomes:', r7b.count)
  } catch (e) { console.log('formateur_diplomes: (skip)') }

  try {
    const r7c = await prisma.formateurCertification.deleteMany()
    console.log('formateur_certifications:', r7c.count)
  } catch (e) { console.log('formateur_certifications: (skip)') }

  try {
    const r7d = await prisma.formateurFormationPedagogique.deleteMany()
    console.log('formateur_formations_pedagogiques:', r7d.count)
  } catch (e) { console.log('formateur_formations_pedagogiques: (skip)') }

  try {
    const r7e = await prisma.formateurPortfolio.deleteMany()
    console.log('formateur_portfolio:', r7e.count)
  } catch (e) { console.log('formateur_portfolio: (skip)') }

  try {
    const r7f = await prisma.formateurCompetenceTechnique.deleteMany()
    console.log('formateur_competences_techniques:', r7f.count)
  } catch (e) { console.log('formateur_competences_techniques: (skip)') }

  try {
    const r7g = await prisma.formateurFormationContinue.deleteMany()
    console.log('formateur_formations_continues:', r7g.count)
  } catch (e) { console.log('formateur_formations_continues: (skip)') }

  try {
    const r7h = await prisma.formateurVeilleProfessionnelle.deleteMany()
    console.log('formateur_veilles_professionnelles:', r7h.count)
  } catch (e) { console.log('formateur_veilles_professionnelles: (skip)') }

  // 5. Historique Marjorie
  const r8 = await prisma.historiqueMarjorieCrm.deleteMany()
  console.log('historique_marjorie_crm:', r8.count)

  // 6. Eleves (après avoir supprimé evaluations et presences)
  const r9 = await prisma.eleve.deleteMany()
  console.log('eleves:', r9.count)

  // 7. Formateurs (après avoir supprimé leurs documents et interventions)
  const r10 = await prisma.formateur.deleteMany()
  console.log('formateurs:', r10.count)

  // 8. Documents candidat (table n8n — mais on vide quand même les données)
  const r11 = await prisma.documentCandidat.deleteMany()
  console.log('documents_candidat:', r11.count)

  // 9. Candidats
  const r12 = await prisma.candidat.deleteMany()
  console.log('candidats:', r12.count)

  // 10. Historique emails (table n8n)
  const r13 = await prisma.historiqueEmail.deleteMany()
  console.log('historique_emails:', r13.count)

  // 11. Prospects en dernier
  const r14 = await prisma.prospect.deleteMany()
  console.log('prospects:', r14.count)

  // 12. ConversionEnCours si elle existe
  try {
    const r15 = await prisma.conversionEnCours.deleteMany()
    console.log('conversions_en_cours:', r15.count)
  } catch (e) { console.log('conversions_en_cours: (skip)') }

  console.log('')
  console.log('Tables business videes avec succes !')
  await prisma.$disconnect()
}

main().catch(e => {
  console.error('Erreur:', e.message)
  process.exit(1)
})
