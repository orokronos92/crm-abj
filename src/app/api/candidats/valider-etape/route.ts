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

    // ─── Créneaux proposés : mode lot ────────────────────────────────────────
    // Yasmina saisit des plages horaires → slots générés côté client → envoyés ici.
    // Un lotToken UUID est généré pour ce groupe de créneaux.
    // Chaque hold PREVUE reçoit cet idLot (UUID partagé).
    // Les candidats reçoivent 1 lien /admission/rdv/choisir?lot=TOKEN&candidat=ID
    // qui affiche tous les créneaux disponibles du lot en mini-calendrier.
    const isRdvEtape = etape === 'entretienTelephonique' || etape === 'entretien_telephonique'
    const slots = Array.isArray(proposedSlots) && proposedSlots.length > 0 ? proposedSlots : null
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    type SlotSimple = {
      date: string
      heureDebut: string
      heureFin: string
      idSalle: number
      nomSalle: string
    }

    let lotToken: string | undefined
    let lotUrl: string | undefined
    let enrichedSlots: SlotSimple[] | undefined

    if (isRdvEtape && slots) {
      const expiration = new Date(Date.now() + 72 * 60 * 60 * 1000) // +72h
      lotToken = randomUUID()
      lotUrl = `${appUrl}/admission/rdv/choisir?lot=${lotToken}&candidat=${candidat.idCandidat}`

      const created = await Promise.all(
        slots.map(async (slot: SlotSimple) => {
          const dateDebut = new Date(`${slot.date}T${slot.heureDebut}:00`)
          const dateFin   = new Date(`${slot.date}T${slot.heureFin}:00`)

          // Chercher un hold existant pour ce créneau exact (mode lot partagé)
          const holdExistant = await prisma.reservationSalle.findFirst({
            where: {
              idSalle:   slot.idSalle,
              dateDebut,
              dateFin,
              statut:    'PREVUE',
              token:     { not: null },
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
              ],
            },
            select: { idReservation: true, token: true },
          })

          if (holdExistant?.token) {
            // Hold existant — on le rattache au nouveau lot
            await prisma.reservationSalle.update({
              where: { idReservation: holdExistant.idReservation },
              data: { idLot: lotToken }
            })
            console.log(`[API] ♻️ Hold réutilisé et rattaché au lot ${lotToken!.slice(0, 8)}`)
          } else {
            // Nouveau hold pour ce créneau
            const token = randomUUID()
            await prisma.reservationSalle.create({
              data: {
                idSalle:   slot.idSalle,
                dateDebut,
                dateFin,
                statut:    'PREVUE',
                token,
                expiresAt: expiration,
                idLot:     lotToken,
              }
            })
            console.log(`[API] 🏷️ Hold créé — ${slot.date} ${slot.heureDebut}`)
          }

          return {
            date:       slot.date,
            heureDebut: slot.heureDebut,
            heureFin:   slot.heureFin,
            idSalle:    slot.idSalle,
            nomSalle:   slot.nomSalle,
          }
        })
      )

      enrichedSlots = created
      console.log(`[API] 🗓️ ${created.length} créneaux — lot ${lotToken} — ${lotUrl}`)
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
      ...(lotToken && enrichedSlots ? {
        lotToken,
        lotUrl,
        nbCreneaux: enrichedSlots.length,
        slots: enrichedSlots.map(s => ({
          date:       s.date,
          heureDebut: s.heureDebut,
          heureFin:   s.heureFin,
          nomSalle:   s.nomSalle,
        })),
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
        holdsCreated: enrichedSlots?.length ?? 0,
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
