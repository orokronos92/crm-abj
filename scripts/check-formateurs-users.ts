import prisma from '../src/lib/prisma.js'

async function main() {
  console.log('=== Vérification des liens Utilisateurs <-> Formateurs ===\n')

  // Récupérer tous les formateurs
  const formateurs = await prisma.formateur.findMany({
    select: {
      idFormateur: true,
      nom: true,
      prenom: true,
      email: true,
      idUtilisateur: true,
    },
    orderBy: { idFormateur: 'asc' }
  })

  console.log(`Total formateurs en base: ${formateurs.length}\n`)

  // Compter combien ont un idUtilisateur
  const avecUser = formateurs.filter(f => f.idUtilisateur !== null)
  const sansUser = formateurs.filter(f => f.idUtilisateur === null)

  console.log(`✅ Formateurs avec utilisateur lié: ${avecUser.length}`)
  console.log(`❌ Formateurs sans utilisateur: ${sansUser.length}\n`)

  if (avecUser.length > 0) {
    console.log('--- Formateurs avec utilisateur ---')
    for (const f of avecUser) {
      console.log(`  ${f.prenom} ${f.nom} (ID: ${f.idFormateur}, User ID: ${f.idUtilisateur})`)
    }
    console.log('')
  }

  if (sansUser.length > 0) {
    console.log('--- Formateurs sans utilisateur (ne peuvent pas se connecter) ---')
    for (const f of sansUser) {
      console.log(`  ${f.prenom} ${f.nom} (ID: ${f.idFormateur}, Email: ${f.email})`)
    }
    console.log('')
  }

  // Vérifier les utilisateurs avec rôle professeur
  const usersProf = await prisma.utilisateur.findMany({
    where: { role: 'professeur' },
    select: {
      idUtilisateur: true,
      email: true,
      nom: true,
      prenom: true,
    }
  })

  console.log(`\n=== Utilisateurs avec rôle "professeur": ${usersProf.length} ===`)
  for (const u of usersProf) {
    const formateur = formateurs.find(f => f.idUtilisateur === u.idUtilisateur)
    if (formateur) {
      console.log(`  ✅ ${u.prenom} ${u.nom} (User ID: ${u.idUtilisateur}) → Formateur ID: ${formateur.idFormateur}`)
    } else {
      console.log(`  ⚠️  ${u.prenom} ${u.nom} (User ID: ${u.idUtilisateur}) → Aucun formateur lié`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
