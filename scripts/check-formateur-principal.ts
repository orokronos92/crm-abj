/**
 * Script pour vérifier que le formateur principal est correctement calculé
 */
import prisma from '../src/lib/prisma'

async function checkFormateurPrincipal() {
  console.log('🔍 Vérification du formateur principal de la dernière session créée\n')

  try {
    // Récupérer la dernière session créée
    const session = await prisma.session.findFirst({
      orderBy: { idSession: 'desc' },
      include: {
        formateurPrincipal: {
          select: {
            idFormateur: true,
            nom: true,
            prenom: true,
          }
        }
      }
    })

    if (!session) {
      console.log('❌ Aucune session trouvée')
      return
    }

    console.log('📋 Session:', session.nomSession)
    console.log('   ID Session:', session.idSession)

    if (session.formateurPrincipalId) {
      console.log('\n👨‍🏫 Formateur principal:')
      console.log('   ID:', session.formateurPrincipalId)
      if (session.formateurPrincipal) {
        console.log('   Nom:', `${session.formateurPrincipal.prenom} ${session.formateurPrincipal.nom}`)
      }
    } else {
      console.log('\n⚠️  Aucun formateur principal assigné')
    }

    // Analyser les métadonnées pour voir la logique
    if (session.notes) {
      try {
        const metadonnees = JSON.parse(session.notes)

        if (metadonnees.formateurs && metadonnees.programme) {
          console.log('\n📊 Analyse des heures par formateur:')

          const heuresParFormateur = new Map<number, { nom: string, heures: number, matieres: string[] }>()

          // Initialiser
          metadonnees.formateurs.forEach((f: any) => {
            heuresParFormateur.set(f.id, { nom: f.nom, heures: 0, matieres: [] })
          })

          // Calculer
          metadonnees.programme.forEach((matiere: any) => {
            metadonnees.formateurs.forEach((formateur: any) => {
              if (formateur.matieres.includes(matiere.nom)) {
                const data = heuresParFormateur.get(formateur.id)!
                data.heures += matiere.heures
                data.matieres.push(matiere.nom)
                heuresParFormateur.set(formateur.id, data)
              }
            })
          })

          // Afficher
          heuresParFormateur.forEach((data, id) => {
            const isPrincipal = id === session.formateurPrincipalId
            console.log(`   ${isPrincipal ? '👑' : '  '} ${data.nom}: ${data.heures}h`)
            console.log(`      Matières: ${data.matieres.join(', ')}`)
          })

          // Vérifier la logique
          let maxHeures = 0
          let expectedFormateurId = null
          heuresParFormateur.forEach((data, id) => {
            if (data.heures > maxHeures) {
              maxHeures = data.heures
              expectedFormateurId = id
            }
          })

          console.log(`\n✅ Formateur avec le plus d'heures: ID ${expectedFormateurId} (${maxHeures}h)`)
          if (expectedFormateurId === session.formateurPrincipalId) {
            console.log('✅ Le formateur principal est correctement calculé !')
          } else {
            console.log('❌ ERREUR: Le formateur principal ne correspond pas au calcul')
            console.log(`   Attendu: ${expectedFormateurId}, Obtenu: ${session.formateurPrincipalId}`)
          }
        }
      } catch (e) {
        console.log('⚠️  Erreur parsing métadonnées:', e)
      }
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Erreur:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkFormateurPrincipal()
