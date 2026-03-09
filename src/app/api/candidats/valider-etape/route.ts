import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { sseManager } from '@/lib/sse-manager'
import { candidatWebhooks } from '@/lib/webhook-client'

/**
 * API Endpoint: Valider une étape du parcours candidat
 *
 * Pattern: Synchrone avec notification SSE + webhook n8n
 * - Valide l'étape en BDD (booléen + date)
 * - Si etape=entretienTelephonique + proposedSlots fournis :
 *   crée des holds PREVUE dans reservations_salles avec token+expiration 72h
 * - Envoie notification temps réel via SSE
 * - Notifie n8n avec les créneaux enrichis (token + confirmUrl)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idCandidat, etape, dateValidation, validePar, observation, exempt, proposedSlots } = body

    // Validation
    if (!idCandidat || !etape) {
      return NextResponse.json(
        { success: false, error: 'idCandidat et etape requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'étape est valide (accepte les deux formats)
    const etapesValides = [
      'entretien_telephonique', 'rdv_presentiel', 'test_technique', 'validation_pedagogique',
      'entretienTelephonique', 'rdvPresentiel', 'testTechnique', 'validationPedagogique'
    ]
    if (!etapesValides.includes(etape)) {
      return NextResponse.json(
        { success: false, error: 'Étape invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le candidat existe
    const candidat = await prisma.candidat.findUnique({
      where: { idCandidat },
      select: {
        idCandidat: true,
        numeroDossier: true,
        idProspect: true,
        prospect: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    })

    if (!candidat) {
      return NextResponse.json(
        { success: false, error: 'Candidat introuvable' },
        { status: 404 }
      )
    }

    // Mapper le nom de l'étape vers les champs BDD (supporte camelCase et snake_case)
    type ChampMapping = { booleen: string; date: string; validePar: string; observation: string; exempt: string }
    const champMapping: Record<string, ChampMapping> = {
      entretien_telephonique:  { booleen: 'entretienTelephonique',  date: 'dateEntretienTel',          validePar: 'valideParEntretienTel',             observation: 'observationEntretienTel',             exempt: 'exemptEntretienTelephonique' },
      entretienTelephonique:   { booleen: 'entretienTelephonique',  date: 'dateEntretienTel',          validePar: 'valideParEntretienTel',             observation: 'observationEntretienTel',             exempt: 'exemptEntretienTelephonique' },
      rdv_presentiel:          { booleen: 'rdvPresentiel',          date: 'dateRdvPresentiel',         validePar: 'valideParRdvPresentiel',            observation: 'observationRdvPresentiel',            exempt: 'exemptRdvPresentiel' },
      rdvPresentiel:           { booleen: 'rdvPresentiel',          date: 'dateRdvPresentiel',         validePar: 'valideParRdvPresentiel',            observation: 'observationRdvPresentiel',            exempt: 'exemptRdvPresentiel' },
      test_technique:          { booleen: 'testTechnique',          date: 'dateTestTechnique',         validePar: 'valideParTestTechnique',            observation: 'observationTestTechnique',            exempt: 'exemptTestTechnique' },
      testTechnique:           { booleen: 'testTechnique',          date: 'dateTestTechnique',         validePar: 'valideParTestTechnique',            observation: 'observationTestTechnique',            exempt: 'exemptTestTechnique' },
      validation_pedagogique:  { booleen: 'validationPedagogique',  date: 'dateValidationPedagogique', validePar: 'valideParValidationPedagogique',    observation: 'observationValidationPedagogique',    exempt: 'exemptValidationPedagogique' },
      validationPedagogique:   { booleen: 'validationPedagogique',  date: 'dateValidationPedagogique', validePar: 'valideParValidationPedagogique',    observation: 'observationValidationPedagogique',    exempt: 'exemptValidationPedagogique' },
    }

    const champs = champMapping[etape]
    const dateAEnregistrer = dateValidation ? new Date(dateValidation) : new Date()
    const isExempt = exempt === true

    // Mettre à jour l'étape avec validateur et observation (ou exemption)
    await prisma.candidat.update({
      where: { idCandidat },
      data: {
        [champs.booleen]: true,
        [champs.date]: dateAEnregistrer,
        [champs.exempt]: isExempt,
        ...(validePar ? { [champs.validePar]: validePar } : {}),
        ...(observation ? { [champs.observation]: observation } : {}),
      }
    })

    const actionLabel = isExempt ? 'exemptée' : 'validée'
    console.log(`[API] ✅ Étape "${etape}" ${actionLabel} pour candidat ${candidat.numeroDossier}`)

    // ─── Périodes proposées : mode lot 2 jours ───────────────────────────────
    // Chaque période = 2 journées complètes (09h-17h) : Jour 1 entretien, Jour 2 test technique.
    // Un lotToken UUID est généré par appel. Chaque paire crée 2 ReservationSalle (même idLot).
    // Les candidats reçoivent 1 lien /admission/rdv/choisir?lot=TOKEN&candidat=ID
    // La paire est représentée par le token du Jour 1 (entretien).
    // Pour chaque paire de dates, on upsert les Evenements ENTRETIEN_PRESENTIEL et TEST_TECHNIQUE.
    const isRdvEtape = etape === 'entretienTelephonique' || etape === 'entretien_telephonique'
    const paires = Array.isArray(proposedSlots) && proposedSlots.length > 0 ? proposedSlots : null
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    type PaireSlot = {
      jour1: string    // YYYY-MM-DD
      jour2: string    // YYYY-MM-DD
      idSalle: number
      nomSalle: string
      capacite: number
    }

    let lotToken: string | undefined
    let lotUrl: string | undefined
    let nbPairesCreees = 0

    if (isRdvEtape && paires) {
      const expiration = new Date(Date.now() + 72 * 60 * 60 * 1000) // +72h
      lotToken = randomUUID()
      lotUrl = `${appUrl}/admission/rdv/choisir?lot=${lotToken}&candidat=${candidat.idCandidat}`

      await Promise.all(
        paires.map(async (paire: PaireSlot) => {
          // Jour 1 : entretien présentiel 09h-17h
          const debut1 = new Date(`${paire.jour1}T09:00:00`)
          const fin1   = new Date(`${paire.jour1}T17:00:00`)
          // Jour 2 : test technique 09h-17h
          const debut2 = new Date(`${paire.jour2}T09:00:00`)
          const fin2   = new Date(`${paire.jour2}T17:00:00`)

          // ── Upsert Evenement ENTRETIEN_PRESENTIEL sur Jour 1 ──────────────
          const evtEntretienExistant = await prisma.evenement.findFirst({
            where: {
              type:  'ENTRETIEN_PRESENTIEL',
              date:  debut1,
              salle: paire.nomSalle,
              statut: { not: 'ANNULE' },
            },
            select: { idEvenement: true, nombreParticipants: true },
          })

          if (evtEntretienExistant) {
            // Réutiliser — mettre à jour la capacité si elle a augmenté
            if (paire.capacite > evtEntretienExistant.nombreParticipants) {
              await prisma.evenement.update({
                where: { idEvenement: evtEntretienExistant.idEvenement },
                data: { nombreParticipants: paire.capacite },
              })
            }
            console.log(`[API] ♻️ Evenement ENTRETIEN_PRESENTIEL réutilisé — ${paire.jour1}`)
          } else {
            await prisma.evenement.create({
              data: {
                type:              'ENTRETIEN_PRESENTIEL',
                titre:             `Entretien présentiel — ${new Date(paire.jour1).toLocaleDateString('fr-FR')}`,
                date:              debut1,
                heureDebut:        '09:00',
                heureFin:          '17:00',
                salle:             paire.nomSalle,
                nombreParticipants: paire.capacite,
                statut:            'PLANIFIE',
              }
            })
            console.log(`[API] 🗓️ Evenement ENTRETIEN_PRESENTIEL créé — ${paire.jour1}`)
          }

          // ── Upsert Evenement TEST_TECHNIQUE sur Jour 2 ────────────────────
          const evtTestExistant = await prisma.evenement.findFirst({
            where: {
              type:  'TEST_TECHNIQUE',
              date:  debut2,
              salle: paire.nomSalle,
              statut: { not: 'ANNULE' },
            },
            select: { idEvenement: true, nombreParticipants: true },
          })

          if (evtTestExistant) {
            if (paire.capacite > evtTestExistant.nombreParticipants) {
              await prisma.evenement.update({
                where: { idEvenement: evtTestExistant.idEvenement },
                data: { nombreParticipants: paire.capacite },
              })
            }
            console.log(`[API] ♻️ Evenement TEST_TECHNIQUE réutilisé — ${paire.jour2}`)
          } else {
            await prisma.evenement.create({
              data: {
                type:              'TEST_TECHNIQUE',
                titre:             `Test technique — ${new Date(paire.jour2).toLocaleDateString('fr-FR')}`,
                date:              debut2,
                heureDebut:        '09:00',
                heureFin:          '17:00',
                salle:             paire.nomSalle,
                nombreParticipants: paire.capacite,
                statut:            'PLANIFIE',
              }
            })
            console.log(`[API] 🔧 Evenement TEST_TECHNIQUE créé — ${paire.jour2}`)
          }

          // ── Holds ReservationSalle ────────────────────────────────────────
          // Jour 1 — 1 réservation journée complète (représente la paire entière pour le candidat)
          const holdExistant1 = await prisma.reservationSalle.findFirst({
            where: {
              idSalle:  paire.idSalle,
              dateDebut: debut1,
              dateFin:   fin1,
              statut:    'PREVUE',
              token:     { not: null },
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            select: { idReservation: true },
          })

          if (holdExistant1) {
            await prisma.reservationSalle.update({
              where: { idReservation: holdExistant1.idReservation },
              data: { idLot: lotToken }
            })
            console.log(`[API] ♻️ Hold J1 réutilisé — ${paire.jour1}`)
          } else {
            await prisma.reservationSalle.create({
              data: {
                idSalle:   paire.idSalle,
                dateDebut: debut1,
                dateFin:   fin1,
                statut:    'PREVUE',
                token:     randomUUID(),
                expiresAt: expiration,
                idLot:     lotToken,
              }
            })
            console.log(`[API] 🏷️ Hold J1 créé — ${paire.jour1}`)
          }

          // Jour 2 — 1 réservation journée complète (même lot, pas de token propre visible candidat)
          const holdExistant2 = await prisma.reservationSalle.findFirst({
            where: {
              idSalle:  paire.idSalle,
              dateDebut: debut2,
              dateFin:   fin2,
              statut:    'PREVUE',
              token:     { not: null },
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            select: { idReservation: true },
          })

          if (holdExistant2) {
            await prisma.reservationSalle.update({
              where: { idReservation: holdExistant2.idReservation },
              data: { idLot: lotToken }
            })
            console.log(`[API] ♻️ Hold J2 réutilisé — ${paire.jour2}`)
          } else {
            await prisma.reservationSalle.create({
              data: {
                idSalle:   paire.idSalle,
                dateDebut: debut2,
                dateFin:   fin2,
                statut:    'PREVUE',
                token:     randomUUID(),
                expiresAt: expiration,
                idLot:     lotToken,
              }
            })
            console.log(`[API] 🏷️ Hold J2 créé — ${paire.jour2}`)
          }

          nbPairesCreees++
        })
      )

      console.log(`[API] ✅ ${nbPairesCreees} paire(s) — lot ${lotToken} — ${lotUrl}`)
    }

    // Notification SSE temps réel
    sseManager.broadcast({
      idNotification: Date.now(),
      sourceAgent: 'system',
      categorie: 'CANDIDAT',
      type: 'ETAPE_VALIDEE',
      priorite: 'NORMALE',
      titre: `Étape ${isExempt ? 'exemptée' : 'validée'} - ${candidat.prospect?.prenom} ${candidat.prospect?.nom}`,
      message: `L'étape "${etape.replace(/_/g, ' ')}" a été ${isExempt ? 'exemptée' : 'validée'} pour le candidat ${candidat.numeroDossier}`,
      audience: 'ADMIN',
      lienAction: `/admin/candidats?highlight=${candidat.numeroDossier}`,
      actionRequise: false,
      creeLe: new Date()
    })

    // Webhook n8n — payload avec lotUrl (1 lien unique vers le mini-calendrier)
    candidatWebhooks.validerEtape({
      numeroDossier: candidat.numeroDossier,
      etape,
      idProspect: candidat.idProspect,
      nom: candidat.prospect?.nom ?? null,
      prenom: candidat.prospect?.prenom ?? null,
      dateValidation: dateAEnregistrer.toISOString(),
      validePar: validePar || null,
      observation: observation || null,
      exempt: isExempt,
      ...(lotToken ? {
        lotToken,
        lotUrl,
        nbPeriodes: nbPairesCreees,
        nbCreneaux: nbPairesCreees,
      } : {}),
    }).catch(err => {
      console.error(`[API] ⚠️ Webhook n8n échoué (non bloquant):`, err.message)
    })

    return NextResponse.json({
      success: true,
      message: 'Étape validée avec succès',
      data: {
        etape,
        numeroDossier: candidat.numeroDossier,
        dateValidation: new Date().toISOString(),
        holdsCreated: nbPairesCreees * 2,
        ...(lotToken ? { lotToken, lotUrl } : {}),
      }
    })

  } catch (error) {
    console.error('[API] Erreur validation étape:', error)

    // Log en BDD
    try {
      await prisma.journalErreur.create({
        data: {
          nomWorkflow: 'api-valider-etape-candidat',
          nomNoeud: 'POST-handler',
          messageErreur: error instanceof Error ? error.message : 'Erreur inconnue',
          donneesEntree: {},
          resolu: false
        }
      })
    } catch (logError) {
      console.error('[API] Erreur log journal:', logError)
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne serveur'
      },
      { status: 500 }
    )
  }
}
