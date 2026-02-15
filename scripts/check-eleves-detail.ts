/**
 * Script pour vérifier en détail les données des élèves
 * et identifier pourquoi les formations et formateurs sont vides
 */

import prisma from '../src/lib/prisma'

async function checkElevesDetail() {
  console.log('🔍 Analyse détaillée des données élèves\n')

  try {
    // 1. Vérifier les élèves directement
    console.log('1️⃣ ÉLÈVES dans la table')
    const eleves = await prisma.eleve.findMany({
      take: 5,
      include: {
        candidat: {
          include: {
            prospect: true
          }
        },
        inscriptionsSessions: {
          include: {
            session: {
              include: {
                formation: true,
                formateurPrincipal: true
              }
            }
          }
        }
      }
    })

    console.log(`Nombre d'élèves: ${eleves.length}`)

    eleves.forEach((eleve, index) => {
      console.log(`\n📚 Élève ${index + 1}:`)
      console.log(`  - ID: ${eleve.idEleve}`)
      console.log(`  - Numéro dossier: ${eleve.numeroDossier}`)
      console.log(`  - Formation suivie: ${eleve.formationSuivie || 'VIDE ❌'}`)
      console.log(`  - Statut formation: ${eleve.statutFormation}`)

      if (eleve.candidat) {
        console.log(`  📁 Candidat lié:`)
        console.log(`    - Formation retenue: ${eleve.candidat.formationRetenue || 'VIDE ❌'}`)
        console.log(`    - Session visée: ${eleve.candidat.sessionVisee || 'VIDE'}`)

        if (eleve.candidat.prospect) {
          console.log(`    - Nom: ${eleve.candidat.prospect.prenom} ${eleve.candidat.prospect.nom}`)
        }
      } else {
        console.log(`  ⚠️ PAS DE CANDIDAT LIÉ`)
      }

      if (eleve.inscriptionsSessions && eleve.inscriptionsSessions.length > 0) {
        console.log(`  📅 Sessions inscrites: ${eleve.inscriptionsSessions.length}`)
        eleve.inscriptionsSessions.forEach(inscription => {
          if (inscription.session) {
            console.log(`    - Session ID: ${inscription.session.idSession}`)
            console.log(`      Formation: ${inscription.session.formation?.nom || 'PAS DE FORMATION ❌'}`)
            console.log(`      Formateur: ${inscription.session.formateurPrincipal ?
              `${inscription.session.formateurPrincipal.prenom} ${inscription.session.formateurPrincipal.nom}` :
              'PAS DE FORMATEUR ❌'}`)
          }
        })
      } else {
        console.log(`  ⚠️ AUCUNE SESSION INSCRITE`)
      }
    })

    // 2. Vérifier les sessions disponibles
    console.log('\n\n2️⃣ SESSIONS disponibles')
    const sessions = await prisma.session.findMany({
      include: {
        formation: true,
        formateurPrincipal: true,
        inscriptionsSessions: true
      }
    })

    console.log(`Nombre de sessions: ${sessions.length}`)
    sessions.forEach(session => {
      console.log(`\n📅 Session ${session.idSession}:`)
      console.log(`  - Nom: ${session.nomSession}`)
      console.log(`  - Formation: ${session.formation?.nom || 'PAS DE FORMATION ❌'}`)
      console.log(`  - Formateur: ${session.formateurPrincipal ?
        `${session.formateurPrincipal.prenom} ${session.formateurPrincipal.nom}` :
        'PAS DE FORMATEUR ❌'}`)
      console.log(`  - Inscrits: ${session.inscriptionsSessions.length} élèves`)
      console.log(`  - Statut: ${session.statutSession}`)
    })

    // 3. Vérifier les formations
    console.log('\n\n3️⃣ FORMATIONS disponibles')
    const formations = await prisma.formation.findMany()
    console.log(`Nombre de formations: ${formations.length}`)
    formations.forEach(f => {
      console.log(`  - ${f.codeFormation}: ${f.nom}`)
    })

    // 4. Vérifier les formateurs
    console.log('\n\n4️⃣ FORMATEURS disponibles')
    const formateurs = await prisma.formateur.findMany()
    console.log(`Nombre de formateurs: ${formateurs.length}`)
    formateurs.forEach(f => {
      console.log(`  - ${f.prenom} ${f.nom} (ID: ${f.idFormateur})`)
    })

    // 5. Vérifier les inscriptions
    console.log('\n\n5️⃣ INSCRIPTIONS_SESSIONS')
    const inscriptions = await prisma.inscriptionSession.count()
    console.log(`Nombre total d'inscriptions: ${inscriptions}`)

    // 6. Diagnostic
    console.log('\n\n🔴 DIAGNOSTIC:')

    const eleveSansFormation = eleves.filter(e => !e.formationSuivie).length
    const eleveSansSession = eleves.filter(e => !e.inscriptionsSessions || e.inscriptionsSessions.length === 0).length

    console.log(`  - Élèves sans formation_suivie: ${eleveSansFormation}/${eleves.length}`)
    console.log(`  - Élèves sans session inscrite: ${eleveSansSession}/${eleves.length}`)

    if (eleveSansFormation > 0) {
      console.log('\n  ⚠️ Le champ formation_suivie n\'est pas rempli dans la table eleves')
    }

    if (eleveSansSession > 0) {
      console.log('\n  ⚠️ Les élèves ne sont pas inscrits à des sessions')
      console.log('     → Il faut créer des liens dans inscriptions_sessions')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkElevesDetail()