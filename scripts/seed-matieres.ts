import prisma from '../src/lib/prisma'

const MATIERES = [
  // Pratique
  { nom: 'Sertissage',       code: 'SERTI',      categorie: 'PRATIQUE' },
  { nom: 'Polissage',        code: 'POLISH',     categorie: 'PRATIQUE' },
  { nom: 'Soudure',          code: 'SOUDURE',    categorie: 'PRATIQUE' },
  { nom: 'Email',            code: 'EMAIL',      categorie: 'PRATIQUE' },
  { nom: 'Travail du métal', code: 'METAL',      categorie: 'PRATIQUE' },
  { nom: 'Bijoux',           code: 'BIJOUX',     categorie: 'PRATIQUE' },
  // Théorique
  { nom: 'CAO/DAO',          code: 'CAO_DAO',    categorie: 'THEORIQUE' },
  { nom: 'Histoire de l\'art',code: 'HIST_ART',  categorie: 'THEORIQUE' },
  { nom: 'Histoire',         code: 'HISTOIRE',   categorie: 'THEORIQUE' },
]

async function main() {
  console.log('🌱 Seed table matieres...\n')

  let crees = 0
  let existants = 0

  for (const matiere of MATIERES) {
    const result = await prisma.matiere.upsert({
      where: { nom: matiere.nom },
      update: { code: matiere.code, categorie: matiere.categorie, actif: true },
      create: { ...matiere, actif: true },
    })

    const isNew = result.creeLe.getTime() === result.modifieLe.getTime()
    if (isNew) {
      console.log(`  ✅ Créée   : ${result.nom} (${result.categorie})`)
      crees++
    } else {
      console.log(`  ♻️  Existante : ${result.nom} (${result.categorie})`)
      existants++
    }
  }

  console.log(`\n📊 Résultat : ${crees} créées, ${existants} déjà existantes`)

  // Vérification finale
  const total = await prisma.matiere.count({ where: { actif: true } })
  console.log(`📋 Total matières actives en base : ${total}`)
}

main()
  .catch(e => { console.error('❌ Erreur seed matieres:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
