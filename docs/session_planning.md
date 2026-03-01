# Brique Maîtresse : Sessions & Planning — Document d'Architecture

**Date** : 25 février 2026
**Statut** : Réflexion validée — Prêt à implémenter

---

## Vue d'ensemble

La brique Sessions/Planning est le cœur opérationnel du CRM ABJ. Elle orchestre :
- La **création de sessions** (formation courte ou longue/CAP)
- L'**occupation des salles** en temps réel dans le planning
- L'**attribution des candidats/élèves** à une session (avec liste d'attente)
- La **visibilité planning** à tous les niveaux (annuel → mois → jour/heure)
- La **communication automatisée** via un webhook n8n dédié

---

## 1. État des Lieux (Ce qui existe)

### Base de données
- `Salle` : 9 salles seedées (Atelier A/B/C, Salle info, Théorie, Polissage, Taille, Réunion, Tous ateliers)
  - Champs : `nom`, `code`, `capaciteMax`, `equipements[]`, `formationsCompatibles[]`, `disponibleWeekend`, `disponibleSoir`, `statut`
  - Relation : `sessions Session[] @relation("SessionsSalle")`
- `Session` : modèle complet avec `sallePrincipale`, `capaciteMax`, `nbInscrits`, `statutSession`, `statutValidation`, `notes` (JSON metadata)
- `InscriptionSession` : lien élève ↔ session (statuts : INSCRIT / EN_ATTENTE / CONFIRME / ANNULE)
- `DisponibiliteFormateur` : calendrier disponibilités formateurs

### UI existante
- `SessionFormModal` avec `FormationCAPForm` et `FormationCourteForm` (formulaires de création)
- Page planning `/admin/planning` : timeline annuelle 12 mois, connectée à l'API (pas de mocks)
  - Code couleur : Vert (0% libre) → Jaune (<50%) → Orange (50-79%) → Rouge (≥80%)
  - Calcul basé sur jours réels (Set de jours occupés / jours du mois)
- `MonthDetailModal` : drill-down mensuel (placeholder)
- Page sessions `/admin/sessions` avec données réelles

### API existante
- `GET /api/sessions` — retourne sessions réelles avec formation, formateur, inscriptions
- `GET /api/salles` — retourne les 9 salles
- `POST /api/sessions` — création (à compléter)

---

## 2. Flux Complet

### 2A. Création de Session

```
Admin clique "Créer session"
    ↓
Choix du type : Formation courte OU Formation longue (CAP)
    ↓
Formulaire adapté (FormationCourteForm / FormationCAPForm)
    ↓
POST /api/sessions
    ├── INSERT sessions (avec sallePrincipale, dates, capacité, notes JSON)
    ├── INSERT reservation_salle (créneau bloqué en base)
    └── POST webhook n8n sessions → notif formateur assigné
    ↓
Planning page : salle apparaît occupée automatiquement (données réelles)
```

### 2B. Attribution Candidat/Élève → Session (Liste d'attente)

```
Conversion prospect → candidat (ConvertirCandidatModal)
    ↓
Dropdown "Session souhaitée" (optionnel)
    ├── Filtré par formation choisie (ex: serti → sessions serti uniquement)
    ├── Si session sélectionnée → INSERT inscription_session (statut: EN_ATTENTE)
    └── Si pas de session → candidat continue son parcours sans session (OK)

    ↓ (plus tard)
Fiche session : admin ajoute candidat ou élève depuis la liste d'attente
    ├── Si place dispo et statut ELEVE → inscription_session statut: INSCRIT
    ├── Si place dispo et statut CANDIDAT → inscription_session statut: EN_ATTENTE (priorité basse)
    └── Si session pleine → inscription_session statut: EN_ATTENTE (file)
```

### 2C. Promotion Liste d'Attente

```
Désistement d'un inscrit (annulation)
    ↓
UPDATE inscription_session → statut: ANNULE
UPDATE session.nb_inscrits - 1
    ↓
Agent n8n : cherche premier EN_ATTENTE par ordre de priorité
    ├── Priorité 1 : statut ELEVE (parcours validé + paiement)
    └── Priorité 2 : statut CANDIDAT (en cours de parcours)
    ↓
Si candidat/élève trouvé :
    ├── UPDATE inscription_session → statut: INSCRIT
    ├── UPDATE session.nb_inscrits + 1
    ├── Email notification au candidat/élève : "Place confirmée"
    └── Notification admin : "Promotion liste d'attente — [nom]"
```

### 2D. Affichage Planning

```
Page planning (/admin/planning)
    ↓
GET /api/sessions (toutes sessions de l'année)
GET /api/salles (9 salles)
    ↓
Timeline annuelle : pour chaque salle × chaque mois
    → Calcul jours occupés (Set<number> des jours réels des sessions)
    → Pourcentage occupation = joursOccupes.size / nbJoursDuMois * 100
    → Code couleur : vert/jaune/orange/rouge
    ↓
Click sur une case (mois) → MonthDetailModal
    GET /api/planning/salles/[salle]?mois=&annee=
    → Sessions de cette salle ce mois
    → Créneaux heure par heure (ou blocs matin/après-midi/soir)
```

---

## 3. Règles Métier Clés

### Liste d'attente
- Un candidat OU un élève peut être en liste d'attente d'une session
- **Priorité** : ELEVE > CANDIDAT (les élèves dont le parcours est validé passent devant)
- Un élève peut être en liste d'attente de plusieurs sessions (si incertain sur les dates)
- La liste d'attente résout le problème de "trop d'élèves par rapport aux sessions programmées"
- Un élève en liste d'attente peut voir les prochaines sessions disponibles depuis son interface (futur)

### Attribution session
- **Optionnelle à la conversion** : un candidat peut ne pas avoir de session → continue son parcours normalement
- **Filtrage intelligent** : le dropdown session est filtré par la formation choisie (serti → sessions serti uniquement)
- Si la formation change → rechargement des sessions disponibles pour la nouvelle formation
- **Depuis la fiche session** : l'admin peut ajouter manuellement des candidats/élèves

### Sessions et salles
- Une session a une `sallePrincipale` (STRING, référence nom de la salle)
- Pour les CAP multi-matières : plusieurs salles dans les métadonnées JSON
- La réservation de salle est automatique à la création de session
- Pas de double réservation : vérification des créneaux avant création

### Formations courtes vs longues
- **Formation courte** : bloc de jours consécutifs, salle bloquée sur ces jours précis
- **Formation longue (CAP)** : ~800h sur ~8 mois, comme une classe scolaire normale
  - Répartie sur le planning des salles comme n'importe quelle session
  - Une même salle peut accueillir plusieurs sessions sur des créneaux différents dans la journée
    → Ex : Atelier B — CAP 08h-12h (matin) + Initiation Sertissage 14h-18h (après-midi)
  - Le payload complet est envoyé à l'agent IA qui résout les contraintes (formateurs × salles × créneaux)
  - Planning prévu sur 2 ans max

---

## 4. Architecture Webhook n8n Dédié Sessions

### Nouveau webhook : `/webhook/session-action`

Séparé des 2 webhooks existants (email + crm-action).

```
CRM → POST {N8N_WEBHOOK_URL}/session-action
    {
      action: string,        // Voir liste ci-dessous
      sessionId: number,
      correlationId: string,
      data: { ... }
    }
```

### Actions gérées

| Action | Déclencheur | Workflow n8n |
|--------|-------------|--------------|
| `SESSION_CREATED` | Nouvelle session créée | Email formateur assigné + notif admin |
| `ELEVE_INSCRIT` | Élève confirmé dans session | Email convocation élève + notif admin |
| `PLACE_LIBEREE` | Désistement inscrit | Vérifier liste attente + promouvoir si possible |
| `PROMOTION_ATTENTE` | Place offerte à liste attente | Email au promu + notif admin |
| `SESSION_CONFIRMEE` | Session validée par admin | Email tous inscrits + formateur |
| `SESSION_ANNULEE` | Session annulée | Email tous inscrits + mise en attente |
| `RAPPEL_SESSION` | J-7 avant session | Email rappel formateur + élèves inscrits |
| `ELEVE_CONVERTI` | Candidat → Élève (parcours complet) | Email login/mot de passe + accès interface élève |

### Webhook retour (n8n → CRM)
```
POST /api/webhook/callback
    {
      type: "session_action_done",
      correlationId: "...",
      action: "PROMOTION_ATTENTE",
      response: "promotion_done",
      data: { elevId, sessionId, ... }
    }
```

---

## 5. Modifications à Prévoir

### 5A. Schéma Prisma — Changements requis

**Constat actuel** :
- `ReservationSalle` : `dateDebut`/`dateFin` en `Timestamp` (heure précise) ✅ parfait pour créneaux
- `Session` : `idSalle` FK optionnelle + `sallePrincipale` texte (dual approach) ✅
- `InscriptionSession` : lie uniquement `idEleve` → **problème** : un candidat (pas encore élève) doit pouvoir être en liste d'attente
- `InscriptionSession` : pas de champ `priorite` pour trier élèves > candidats

**Migration nécessaire sur `InscriptionSession`** :
```prisma
model InscriptionSession {
  // Champs existants conservés :
  idInscription       Int       @id @default(autoincrement())
  idEleve             Int?      @map("id_eleve")     // Nullable (candidat pas encore élève)
  idCandidat          Int?      @map("id_candidat")  // NOUVEAU — si pas encore élève
  idSession           Int       @map("id_session")
  dateInscription     DateTime? @db.Date
  statutInscription   String?   // INSCRIT | EN_ATTENTE | CONFIRME | ANNULE
  dateConfirmation    DateTime? @db.Date
  motifAnnulation     String?

  // NOUVEAUX champs :
  priorite            Int       @default(2) // 1=ELEVE (prioritaire), 2=CANDIDAT
  positionAttente     Int?      @map("position_attente") // Rang dans la file
  notifiePar          String?   @map("notifie_par") // "admin" | "auto"

  // Contrainte : au moins un des deux (eleve OU candidat)
  // CHECK (id_eleve IS NOT NULL OR id_candidat IS NOT NULL)
}
```

**Pas de modification sur `Session` ni `ReservationSalle`** — déjà bien structurés.

### 5B. Nouveaux endpoints API

```
POST /api/sessions                      — Création session (+ réservation salle auto)
POST /api/sessions/[id]/inscrire        — Inscrire candidat/élève (place ou attente)
POST /api/sessions/[id]/desister        — Désistement (déclenche promotion)
GET  /api/sessions?formation=SERTI_N1   — Sessions filtrées par formation (dropdown)
GET  /api/planning/salles/[salle]       — Créneaux d'une salle (MonthDetailModal)
GET  /api/planning/formateurs/[id]      — Planning d'un formateur
POST /api/webhook/session-action        — Réception callbacks n8n sessions
```

### 5C. Modifications UI

**ConvertirCandidatModal** :
- Ajout dropdown "Session souhaitée" (optionnel)
- Chargement dynamique selon la formation choisie (`/api/sessions?formation=X`)
- Si session choisie → inscription en liste d'attente (pas INSCRIT direct)

**Fiche session (onglet Élèves)** :
- Liste inscrits confirmés + liste d'attente (séparées)
- Bouton "Ajouter à la session" (candidat ou élève)
- Bouton "Promouvoir" (passer de liste attente → inscrit)
- Indicateur priorité (icône élève > candidat)

**Fiche session (onglet Planning)** :
- Actuellement vide/placeholder
- Afficher créneaux bloqués (jours, horaires, salle)
- Pour CAP : vue calendrier avec les blocs récurrents

**MonthDetailModal** :
- Connecter à l'API réelle (sessions de cette salle ce mois)
- Afficher nom session, formateur, nb inscrits / capacité

---

## 6. Ordre d'Implémentation

### Phase 1 : Migration BDD + Planning réel
1. Migration `InscriptionSession` : ajouter `idCandidat`, `priorite`, `positionAttente`
2. `GET /api/planning/salles` : sessions réelles → occupation par créneau horaire
3. Connecter `MonthDetailModal` : sessions réelles par créneau (08h-12h / 12h-14h / 14h-18h / 18h-21h)
4. `GET /api/sessions?formation=X` : dropdown filtré par formation

### Phase 2 : Attribution et Liste d'Attente
5. Modifier `ConvertirCandidatModal` : dropdown session optionnel (filtré par formation)
6. `POST /api/sessions/[id]/inscrire` : logique liste d'attente + priorité ELEVE > CANDIDAT
7. `POST /api/sessions/[id]/desister` : libération place + promotion automatique
8. Fiche session onglet Élèves : deux listes (Inscrits / En attente) avec indicateurs priorité

### Phase 3 : Webhook n8n Sessions
9. Nouveau webhook n8n `/session-action` (8 actions)
10. CRM déclenche n8n : création session, inscription, désistement, promotion
11. Callbacks retour : promotions confirmées, notifications envoyées
12. Action `ELEVE_CONVERTI` : email login/mot de passe interface élève

### Phase 4 : Planning Granulaire Complet
13. Vue formateurs planning : données réelles (créneaux par formateur)
14. Onglet Planning fiche session : créneaux exacts (jours, horaires, salles)
15. Alertes : J-7 rappels, capacité atteinte, liste attente longue

---

## Note Architecture — Créneaux Horaires

Une salle peut accueillir **plusieurs sessions sur différents créneaux dans la même journée**.

```
Atelier B — Lundi 3 juin 2026
  08h00 → 12h00  CAP Bijou (Sertissage) — Laurent Dupont — 10/10 🔴 Complet
  12h00 → 14h00  [Libre]
  14h00 → 18h00  Initiation Sertissage — Marie Bernard — 6/10 🟡 4 places dispo
  18h00 → 21h00  [Libre]
```

C'est la `ReservationSalle` (avec `dateDebut`/`dateFin` en Timestamp précis) qui modélise chaque créneau.
Le calcul d'occupation planning doit raisonner en **heures disponibles** et non en jours entiers.

**Formule occupation planning** :
```
heures_occupees_mois = Σ (fin - debut) de chaque ReservationSalle du mois
heures_totales_mois = nb_jours × amplitude_horaire (ex: 08h-21h = 13h)
occupation = heures_occupees / heures_totales × 100
```

---

## 7. Questions en Attente (Non Bloquantes)

1. **Formulaire CAP** : Format exact des blocs planning — à préciser lors de l'implémentation
2. **Interface élève sessions** : Vue "prochaines sessions disponibles" — phase UI élève ultérieure
3. **Amplitude horaire standard** : 08h-21h ? (cohérent avec les créneaux disponible_soir)

---

## Annexe — Table salles en base (9 salles)

| Nom | Code | Capacité | Formations compatibles | Équipements principaux |
|-----|------|----------|------------------------|------------------------|
| Atelier A | ATEL_A | 12 | CAP_BJ, INIT_BJ, PERF_BIJOU | Établi, laminoir, four |
| Atelier B | ATEL_B | 10 | PERF_SERTI, INIT_SERTI | Postes serti, loupe binoculaire |
| Atelier C | ATEL_C | 8 | CAP_BJ, PERF_BIJOU, PERF_POLISSAGE | Polissage, tour |
| Salle informatique | INFO | 15 | CAO_DAO, DESIGN_3D | 15 postes Rhino/Matrix, imprimante 3D |
| Salle théorie | THEO | 20 | GEMMO, HISTOIRE_ART | Vidéoprojecteur, tables conférence |
| Atelier polissage | ATEL_POL | 6 | PERF_POLISSAGE, CAP_BJ | Tour à polir, cabine aspiration |
| Atelier taille | ATEL_TAIL | 8 | LAPIDAIRE, TAILLE_PIERRE | Tour de taille, disques diamant |
| Salle réunion | REUNION | 12 | — | Visioconférence, table conférence |
| Tous les ateliers | TOUS_ATEL | 50 | TOUS | — (événements groupés) |

---

**Prochaine étape** : Commencer Phase 1 — Création session → réservation salle → planning connecté.

---

## 8. Ce qui a été livré (25 février 2026)

### Formulaires de création session — connectés à la BDD

**`SessionFormModal`** :
- Envoi **direct au webhook n8n** (`NEXT_PUBLIC_N8N_WEBHOOK_URL`) — plus de passage par le système de notifications
- Étapes simplifiées : `type` → `form` → spinner "Envoi à Marjorie..." → `success`
- Payload structuré : `sourceForm`, `type`, `demandePar`, `dateCreation`, `informationsGenerales`, `joursActifs`, `ressources`, `notesComplementaires`

**`FormationCourteForm`** :
- Champ `duréeHeures` ajouté (obligatoire) — ex: 40h de sertissage peut s'étaler sur 5 samedis
- Les trois dropdowns (formations, formateurs, salles) chargés depuis la BDD réelle :
  - `GET /api/formations?actif=true` → filtré hors CAP
  - `GET /api/formateurs?statut=ACTIF`
  - `GET /api/salles`
- Salle et formateur **optionnels** ("Laisser Marjorie choisir")
- Auto-remplissage `duréeHeures` depuis le catalogue formation sélectionné
- Fenêtre souple : dateDebut + dateFin + duréeHeures → n8n/IA planifie les séances

**`FormationCAPForm`** :
- Mêmes corrections : formations/formateurs/salles depuis la BDD réelle (filtré `categorie === 'CAP'`)
- Champ **Date de fin** (date picker) à la place de "Durée en mois" — plus flexible
- Validation : dateFin > dateDebut

**`session-form.types.ts`** :
- `FormationCourteData` : ajout `dureeHeures: number`
- `FormationCAPData` : `dureeMois` → `dateFinGlobale: string`
- `SessionAIPayload` et `SessionProposal` : alignés sur `dateFinGlobale`

### Corrections connexes

| Fichier | Correction |
|---------|-----------|
| `api/formateurs/route.ts` | Ajout endpoint GET (seul POST existait) |
| `middleware.ts` | `/api/formations` ajouté aux routes publiques |
| `notifications/[id]/action/route.ts` | `actionPar: null` — fix violation FK (table `utilisateurs` vide) |
| `api/sessions/validate/route.ts` | Calcul `dateFin = new Date(dateFinGlobale)` au lieu de `setMonth(+dureeMois)` |
| `SessionReviewPanel.tsx` | Affichage `dateFinGlobale` |
| `SessionProposalReview.tsx` | Affichage `dateFinGlobale || dateFin` |

### Principe de planification souple (Formation Courte)

```
Admin renseigne :
  - Formation : Sertissage Niveau 1 (40h catalogue)
  - Date début : 01/03/2026
  - Date fin   : 31/05/2026      ← fenêtre de 3 mois
  - Durée      : 40h             ← total à planifier
  - Jours actifs : [SAMEDI]      ← préférence
  - Formateur  : (optionnel)
  - Salle      : (optionnel)

→ Payload envoyé à n8n
→ Marjorie/IA planifie 5 samedis de 8h dans la fenêtre
→ Écrit en BDD les séances réelles
→ Planning se met à jour automatiquement
```

---

## 9. Ce qui a été livré (25 février 2026 — Phase 2)

### Liste d'attente — Implémentation complète

#### `inscrireEnListeAttente` (webhook callback)

Fonction ajoutée dans `src/app/api/webhook/callback/route.ts`.

Déclenchée automatiquement après `candidat_created` ou `eleve_created` reçu de n8n.

```
Callback n8n reçu (candidat_created / eleve_created)
    ↓
Lookup candidat par numeroDossier
    ↓
Lookup ConversionEnCours de ce candidat (fenêtre 24h, sessionVisee non null)
    ↓
Lookup session par nomSession (depuis ConversionEnCours.sessionVisee)
    ↓
Vérification :
  - Session non ANNULEE / TERMINEE
  - Pas déjà inscrit (hors ANNULE)
    ↓
Calcul statut :
  - isEleve (responseType === 'eleve_created') ET place dispo → INSCRIT
  - Sinon → EN_ATTENTE (avec positionAttente calculée)
    ↓
CREATE InscriptionSession
Si INSCRIT → UPDATE session.nbInscrits + 1
```

**Règle priorité** :
- `priorite = 1` pour élève (parcours validé)
- `priorite = 2` pour candidat (en cours de parcours)

#### `POST /api/sessions/[id]/inscrire`

**Fichier** : `src/app/api/sessions/[id]/inscrire/route.ts`

Permet à l'admin d'ajouter manuellement un candidat ou élève depuis la fiche session.

| Cas | Résultat |
|-----|----------|
| ELEVE + place disponible | INSCRIT direct (priorité 1) |
| CANDIDAT + place disponible | EN_ATTENTE (priorité 2) |
| Session pleine (tous) | EN_ATTENTE avec position dans la file |

Body : `{ idCandidat?: number, idEleve?: number }` — au moins un requis.

#### `POST /api/sessions/[id]/desister`

**Fichier** : `src/app/api/sessions/[id]/desister/route.ts`

Transaction atomique (Prisma `$transaction`) :

```
1. UPDATE inscription → statut: ANNULE
2. Si était INSCRIT :
   a. UPDATE session.nbInscrits - 1
   b. Chercher premier EN_ATTENTE (ORDER BY priorite ASC, positionAttente ASC)
   c. Si trouvé → UPDATE inscription → INSCRIT, dateConfirmation = now()
   d. UPDATE session.nbInscrits + 1
   e. Recompacter positions restantes (positionAttente = 1, 2, 3...)
```

Réponse : `{ success: true, message, promotion: { idInscription, type, nom } | null }`

#### Onglet Élèves — Deux sections distinctes

**Fichier** : `src/app/admin/sessions/page.tsx`

L'onglet "Élèves" est redesigné avec deux sections visuellement séparées :

**Section Inscrits** :
- Badge ✅ + nombre d'inscrits / capacité max
- Avatar gradient (violet/bleu = élève, orange/rouge = candidat)
- Badge type (ÉLÈVE / CANDIDAT)
- Bouton **Désister** (icône ×, rouge au survol, spinner pendant l'action)

**Section Liste d'attente** :
- Badge `#N` pour la position dans la file
- Même style avatar avec distinction élève/candidat
- Bouton **Retirer** (même logique que Désister)

**Label onglet** : `Élèves (N+M)` quand M > 0 (M = en attente), sinon `Élèves (N)`.

**Toast résultat** : Message de confirmation après désistement, avec indication si quelqu'un a été promu depuis la liste d'attente (ex. : *"Désistement enregistré. Emma Petit a été promue depuis la liste d'attente."*). Dismissible par bouton ×.

#### Nouveaux champs `Session` interface (TypeScript)

```typescript
interface EleveSession {
  idInscription: number   // ← nouveau
  id: number
  type: 'eleve' | 'candidat'
  nom: string
  prenom: string
  numeroDossier: string
  statutInscription: string
  priorite: number        // ← nouveau
  positionAttente: number | null  // ← nouveau
  dateInscription: Date | null    // ← nouveau
  moyenne: number
  absences: number
}

// Propriétés ajoutées au state session sélectionnée :
// inscrits: EleveSession[]
// listeAttente: EleveSession[]
```

### État Phase 2

| Élément | Statut |
|---------|--------|
| Migration BDD (`idCandidat`, `priorite`, `positionAttente`, `notifiePar`) | ✅ Fait (session précédente) |
| `GET /api/sessions/[id]` — retourne inscrits + listeAttente séparés | ✅ Fait |
| `POST /api/sessions/[id]/inscrire` | ✅ Fait |
| `POST /api/sessions/[id]/desister` + promotion automatique | ✅ Fait |
| `inscrireEnListeAttente` dans webhook callback | ✅ Fait |
| Onglet Élèves — UI deux sections (inscrits / attente) | ✅ Fait |
| Dropdown "Session souhaitée" dans `ConvertirCandidatModal` | ✅ Fait (session précédente) |
| Notification n8n lors d'une promotion (email au promu) | ⏳ Phase 3 |
| `POST /api/webhook/session-action` dédié sessions | ⏳ Phase 3 |

**Build** : `✓ Compiled successfully` — 0 erreur TypeScript.
**Branche** : `feat/session-forms-bdd` (poussée sur GitHub).

---

## 10. Corrections et améliorations (27 février 2026)

### Bug — Affichage "0/80" au lieu de "0/8" dans la liste des sessions

**Fichier** : `src/app/api/sessions/route.ts`

**Cause** : La variable `nbParticipants` était initialisée avec `session.capaciteMax` (capacité de la salle, ex: 80). La condition pour utiliser `metadata.nbParticipants` (valeur réelle choisie par l'admin, ex: 8) était inversée — elle ne s'exécutait jamais car `capaciteMax` est toujours défini côté BDD.

**Correction** :
- `nbParticipants` initialisé à `null` au lieu de `session.capaciteMax`
- Condition corrigée : `if (metadata.nbParticipants)` (sans `!session.capaciteMax`)
- Retour : `capacite_max: nbParticipants ?? session.capaciteMax ?? 0` (priorité metadata → BDD → 0)

**Règle** : `metadata.nbParticipants` (valeur admin) a toujours la priorité sur `session.capaciteMax` (capacité de la salle).

---

### Ajout champ `heuresParJour` — Formulaire création session courte

**Fichiers modifiés** :
- `src/components/admin/session-form/session-form.types.ts`
- `src/components/admin/session-form/FormationCourteForm.tsx`
- `src/components/admin/SessionFormModal.tsx`

**Problème** : Sans `heuresParJour`, Marjorie ne pouvait pas résoudre l'équation de planification :

```
40h ÷ ? h/jour = ? séances à planifier
```

Une formation de 40h sur 5 lundis consécutifs (8h/jour) n'est pas la même planification que 40h sur 10 lundis (4h/jour).

**Solution** : Ajout d'un 4ème champ `Heures / jour` dans le bloc dates/durée, avec **8h par défaut**.

**Payload n8n enrichi** :
```json
{
  "dureeHeures": 40,
  "heuresParJour": 8,
  "nbSeances": 5
}
```

**Résumé dynamique** dans le formulaire : affiche le calcul en temps réel
```
📅 Fenêtre : 36 jours pour planifier 40h → 5 séances de 8h (1 jour/semaine actif)
```

**Validations ajoutées** :
- `heuresParJour` obligatoire
- `heuresParJour` ne peut pas dépasser `dureeHeures`

**Build** : `✓ Compiled successfully` — 0 erreur TypeScript.
**Branche** : `feat/session-forms-bdd`.

---

## 11. Améliorations identifiées (27 février 2026) — Non encore implémentées

### Bug — Capacité session "0/50" au lieu de "0/5" sur la ligne sessions

**Fichier concerné** : `src/app/api/sessions/route.ts`

**Symptôme** : La ligne de session dans la liste affiche `0/50` (capacité salle) au lieu de `0/5` (capacité choisie par l'admin pour cette session).

**Contexte** :
- La section 10 décrit une première correction (initialisation `nbParticipants = null` + priorité `metadata.nbParticipants` → `session.capaciteMax`)
- Malgré cette correction, le VPS affiche encore `0/50` en production
- La BDD VPS contient bien `capacite_max = 5` pour la session concernée
- Le `MonthDetailModal` (drill-down) affiche le bon nombre (5) car il lit directement les réservations
- Seule la ligne de la page `/admin/sessions` est affectée

**Hypothèse à investiguer** :
- Vérifier si `metadata.nbParticipants` est présent et vaut `50` dans les métadonnées JSON de la session VPS (n8n écrit peut-être encore ce champ avec la valeur salle)
- Si oui : supprimer complètement la lecture `metadata.nbParticipants` et utiliser uniquement `session.capaciteMax`
- Si non : debugger l'API `/api/sessions` en loggant les valeurs brutes retournées

**Correction recommandée (à implémenter)** :
```typescript
// AVANT (comportement ambigu) :
let nbParticipants = null
if (metadata.nbParticipants) { nbParticipants = metadata.nbParticipants }
capacite_max: nbParticipants ?? session.capaciteMax ?? 0

// APRÈS (ignorer complètement metadata.nbParticipants) :
// n8n écrit directement capaciteMax en BDD — pas besoin des métadonnées
capacite_max: session.capaciteMax ?? 0
```

**Note** : Ce changement a été partiellement fait (commit `a8acf5b`) mais le bug persiste en production. À ré-investiguer avec logs.

---

### Amélioration — Granularité planning : 08h-21h par 30 minutes

**Contexte** :
- Actuellement : `MonthDetailModal` affiche des créneaux de 2h (09h-11h, 11h-13h, 13h-15h, 15h-17h, 17h-19h, 19h-21h)
- Objectif cible : créneaux de 30 minutes de 08h00 à 21h00 (26 créneaux par colonne/jour)
- Problème de lisibilité : 26 lignes × 7 jours = matrice dense difficile à lire

**Options d'implémentation analysées** :

#### Option A — Vue Semaine avec Navigation (type Google Calendar)
```
← Semaine précédente   [Mar 2 — Dim 8 mars 2026]   Semaine suivante →
     Lun 2  Mar 3  Mer 4  Jeu 5  Ven 6  Sam 7  Dim 8
08h  │      │      │      │      │      │      │
08h30│      │ CAP  │      │ CAP  │      │      │
09h  │ SERTI│ BIJ  │      │ BIJ  │      │      │
...  │      │      │      │      │      │      │
21h  │      │      │      │      │      │      │
```
- Avantage : Navigation naturelle, densité raisonnable (7 colonnes × 26 lignes)
- Inconvénient : Quitte la logique "click sur mois → drill-down"

#### Option B — Zoom adaptatif (vue mois → vue jour)
```
Click mois → vue semaine → click jour → vue jour (30min)
```
- Avantage : Progressive disclosure, pas de surcharge visuelle
- Inconvénient : 2 niveaux de drill-down supplémentaires

#### Option C — Drill-down Jour (recommandé) ← Approche retenue
```
Vue annuelle (12 mois)
    → Click mois → MonthDetailModal (vue mensuelle, créneaux 2h actuels)
        → Click jour → DayDetailModal (vue journée, créneaux 30min)
```
- Avantage : Granularité progressive, charge cognitive par paliers
- Compatible avec l'architecture existante (s'ajoute sans remplacer)

#### Option D — Granularité 1h (compromis)
```
MonthDetailModal avec créneaux 1h (08h-09h, 09h-10h, ..., 20h-21h)
= 13 créneaux × 7 jours = 91 cellules (acceptable)
```
- Avantage : Simple à implémenter, lisible sans navigation supplémentaire
- Inconvénient : Pas assez précis pour des créneaux de 45min ou 1h30

**Implémentation recommandée (Option C) — DayDetailModal** :

```typescript
// Nouveau composant : src/components/admin/DayDetailModal.tsx
interface DayDetailModalProps {
  salle: string
  date: Date
  onClose: () => void
}

// Créneaux : de 08h00 à 21h00 par pas de 30min
const CRENEAUX_30MIN = Array.from({ length: 26 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30 // 08h00 = 480min
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`
})
// ['08h00', '08h30', '09h00', ..., '20h30']
```

**API nécessaire** :
```
GET /api/planning/salles/[salle]/jour?date=2026-03-02
→ ReservationSalle où dateDebut et dateFin chevauchent ce jour
→ Pour chaque réservation : calcul des créneaux de 30min occupés
```

**Fichiers à créer/modifier** :
- `src/components/admin/DayDetailModal.tsx` (nouveau)
- `src/components/admin/MonthDetailModal.tsx` — ajouter click sur cellule jour
- `src/app/api/planning/salles/[salle]/jour/route.ts` (nouveau endpoint)

---

### Amélioration — Formule occupation basée sur heures (pas jours)

**Contexte** :
- Actuellement : `occupation = joursOccupes.size / nbJoursDuMois * 100`
- Problème : Une salle utilisée uniquement le matin (4h/jour) sur 20 jours affiche 65% d'occupation alors qu'elle n'est utilisée qu'à 33% des heures disponibles
- La table `ReservationSalle` a des timestamps précis (`dateDebut`/`dateFin`)

**Formule cible** :
```typescript
// Heures disponibles dans le mois = nb_jours × amplitude (08h-21h = 13h)
const heuresDispo = nbJoursDuMois * 13

// Heures occupées = Σ durées des ReservationSalle
const heuresOccupees = reservations.reduce((sum, r) => {
  const debut = new Date(r.dateDebut)
  const fin = new Date(r.dateFin)
  return sum + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60)
}, 0)

const occupation = Math.round((heuresOccupees / heuresDispo) * 100)
```

**Fichiers à modifier** :
- `src/app/admin/planning/page.tsx` — remplacer le calcul `Set<number> jours`
- `src/app/api/sessions/route.ts` ou `src/app/api/planning/salles/route.ts` — inclure les `ReservationSalle` dans la réponse

**Prérequis** : Requiert que les `ReservationSalle` soient accessibles depuis l'API planning. Actuellement `/api/sessions` retourne `durée` calculée depuis les réservations mais pas les créneaux détaillés.

---

### Amélioration — Durée affichée sur ligne sessions

**Contexte** :
- Commit `4f5cfcb` : durée calculée depuis les vraies `ReservationSalle` (ex: 9h réelles)
- Mais si `session.reservationsSalles` est vide (session sans réservations créées), la durée tombe à `0h`
- Il faudrait un fallback lisible : afficher la durée estimée depuis `metadata.dureeHeures` si pas de réservations

**Correction à prévoir** :
```typescript
// Priorité : réservations réelles → metadata.dureeHeures → durée estimée (dates × 7h)
const dureeReelle = reservationsDuration > 0 ? reservationsDuration : null
const dureeMeta = metadata.dureeHeures || null
const dureeEstimee = daysDiff * 7 // fallback si rien d'autre

const duree = dureeReelle ?? dureeMeta ?? dureeEstimee
```

---

### Amélioration — MonthDetailModal : affichage nom formateur

**Contexte** :
- Actuellement : les créneaux dans `MonthDetailModal` affichent l'acronyme de formation (ex: "ACE", "SERTI")
- Manque : le nom du formateur assigné à la session ce jour-là

**UI suggérée pour chaque créneau** :
```
╔══════════════════════╗
║  ACE  ←acronyme      ║
║  L. Dupont ←formateur║
║  6/10 ←capacité      ║
╚══════════════════════╝
```

**Données disponibles** : `session.formateur` est déjà dans le payload API `/api/planning/salles`
**Modification** : `MonthDetailModal.tsx` — passer `formateur` dans `getActiviteSalleCreneau()` et l'afficher dans le rendu

---

### Amélioration — Tooltip au survol des cellules planning

**Contexte** :
- Sur la vue annuelle (`/admin/planning`), survoler une cellule de mois affiche le pourcentage uniquement
- Manque : tooltip avec détail (sessions actives ce mois, formateurs, nb inscrits)

**UI suggérée** :
```
[Hover sur "65% - Mars"] →
┌─────────────────────────────┐
│ Atelier B — Mars 2026       │
│ 65% d'occupation            │
│ ─────────────────────────── │
│ • CAP Bijouterie (L. Dupont)│
│   01/03 → 31/03 — 10/10    │
│ • Init. Sertissage (Petit)  │
│   15/03 → 22/03 — 6/10     │
└─────────────────────────────┘
```

**Implémentation** : Composant `Tooltip` custom avec `position: fixed` au survol, données déjà disponibles dans le state.

---

### État récapitulatif des tâches section 11

| Amélioration | Priorité | Complexité | Statut |
|-------------|----------|------------|--------|
| Bug capacité "0/50" | HAUTE | Faible | ⏳ À investiguer |
| DayDetailModal (granularité 30min) | HAUTE | Moyenne | ⏳ À implémenter |
| Formule occupation par heures | MOYENNE | Faible | ⏳ À implémenter |
| Fallback durée session (0h) | MOYENNE | Faible | ⏳ À implémenter |
| Affichage formateur dans MonthDetailModal | BASSE | Faible | ⏳ À implémenter |
| Tooltip survol cellules planning | BASSE | Faible | ⏳ À implémenter |

---

## 12. Refonte PlanningWeekView — Vue Timeline Google Calendar (Session 01/03/2026)

### Contexte

Le composant `MonthDetailModal` affichait une grille de cases 2h × 7 jours pour les salles. L'utilisateur voulait un planning type **Google Calendar vue semaine** avec granularité 30 minutes et blocs positionnés en absolute.

### Composant PlanningWeekView.tsx — Réécriture Complète

**Fichier** : `src/components/admin/PlanningWeekView.tsx` (~323 lignes)

**Constantes** :
```typescript
const SLOT_HEIGHT = 40        // px par créneau de 30 min
const START_HOUR = 8          // 08:00
const END_HOUR = 21           // 21:00
const TOTAL_SLOTS = 26        // (21 - 8) × 2
const GRID_HEIGHT = 1040      // SLOT_HEIGHT × TOTAL_SLOTS
```

**Structure** :
```
┌─ Navigation semaine (mois + "Semaine du X au Y" + ← →)
├─ Header jours (sticky top, nom jour + numéro)
├─ Corps :
│   ├─ Lignes de grille horizontales (rendues une seule fois sur toute la largeur)
│   ├─ Colonne heures (56px fixe, labels :00 en jaune + :30 en gris)
│   └─ 7 colonnes jours (flex-1, position relative)
│       ├─ Blocs événements (position absolute, top/height calculés)
│       └─ "Libre" en bas si aucun bloc
└─ Légende (4 couleurs : CAP, Sertissage/CAO, Événement, Bloqué, Disponible)
```

### Bug CSS Critique : `rgba(var())` invalide en inline styles

**Problème** : Toutes les lignes de grille étaient invisibles (fond noir total).

**Cause racine** : `rgba(var(--border), 0.2)` est **invalide** en CSS inline (`style={{}}`). La fonction `var()` retourne `"r, g, b"` qui ne peut pas être utilisé dans `rgba()` en attributs style JavaScript.

**Solution** : Remplacer TOUTES les références `rgba(var(...))` par des couleurs hex avec canal alpha :
```typescript
const LINE_HOUR_COLOR = '#d4af37'   // Jaune ABJ pour heures pleines
const LINE_HALF_COLOR = '#ffffff30' // Blanc semi-transparent pour demi-heures
const COL_BORDER = '#ffffff10'      // Séparation colonnes jours
```

### Amélioration Visuelle des Lignes de Grille

**Lignes heures pleines** : Jaune ABJ `#d4af37`, épaisseur 2px, opacity 0.45
**Lignes demi-heures** : Blanc `#ffffff30`, épaisseur 1px, opacity 1

```typescript
{gridLines.map((line, i) => (
  <div
    className="absolute left-0 right-0"
    style={{
      top: line.isHour ? line.top - 1 : line.top,
      height: line.isHour ? 2 : 1,
      backgroundColor: line.isHour ? LINE_HOUR_COLOR : LINE_HALF_COLOR,
      opacity: line.isHour ? 0.45 : 1,
    }}
  />
))}
```

**Labels horaires** :
- `:00` en jaune ABJ `#d4af37`, `text-[11px] font-medium`
- `:30` en gris `#666`, `text-[9px]`

### Bordures Blocs Formations — 2px sur 4 côtés

Les blocs de formations/événements ont une bordure de 2px pleine sur les 4 côtés pour se détacher visuellement de la grille :

```typescript
style={{
  top,
  height: Math.max(height, SLOT_HEIGHT - 2),
  backgroundColor: c.bg,
  border: `2px solid ${c.border}`,
}}
```

**Palette couleurs blocs** :
| Clé | Formation | Background | Bordure | Texte |
|-----|-----------|------------|---------|-------|
| `cap` | CAP / Formation | `#22c55e20` | `#22c55e` | `#4ade80` |
| `serti` | Sertissage / CAO | `#3b82f620` | `#3b82f6` | `#60a5fa` |
| `event` | Événement | `#eab30825` | `#eab308` | `#facc15` |
| `block` | Bloqué | `#ef444420` | `#ef4444` | `#f87171` |
| `other` | Autre | `#d4af3720` | `#d4af37` | `#fbbf24` |

### Fix Sessions Fragmentées — Confiance aux Réservations

**Problème** : Une session avec jours non consécutifs (ex: lundi et mardi sur 2 semaines) affichait des blocs pour TOUS les jours entre `dateDebut` et `dateFin`.

**Cause** : Le fallback (lignes 151-157) dessinait un bloc 09:00-17:00 pour chaque jour dans la plage `dateDebut → dateFin`, sans vérifier si la session avait des réservations spécifiques en base.

**Solution** : Si la session a des réservations dans `reservations_salles`, on fait confiance aux réservations (jours fragmentés) et on saute le fallback :

```typescript
for (const sess of sessions) {
  if (sessionIds.has(sess.id)) continue
  // Si la session a des réservations en base, on les utilise (pas de fallback)
  const sessionADesReservations = reservations.some(r => r.idSession === sess.id)
  if (sessionADesReservations) continue
  // Fallback uniquement pour sessions SANS aucune réservation
  const sd = new Date(sess.dateDebut); const sf = new Date(sess.dateFin)
  if (jour < sd || jour > sf) continue
  blocks.push({ ... }) // Bloc 09:00-17:00 par défaut
}
```

**Priorité d'affichage des blocs** :
1. **Réservations** (priorité max) : Heures exactes depuis `reservations_salles.dateDebut/dateFin`
2. **Événements** sans réservation : Heures depuis `evenements.heureDebut/heureFin`
3. **Sessions** sans aucune réservation : Fallback 09:00-17:00 tous les jours de la plage

### Navigation Semaine

- État `semaineOffset` (0 = première semaine du mois)
- Découpage du mois en semaines de 7 jours max
- Boutons ← → avec indicateur `1/5` (semaine courante / total)
- Si dernière semaine a moins de 7 jours, colonnes vides ajoutées

### Intégration dans MonthDetailModal

Le composant `MonthDetailModal.tsx` utilise `PlanningWeekView` uniquement pour la vue salle :
```typescript
if (type === 'salle') {
  return (
    <div style={{ height: '90vh' }}>
      <PlanningWeekView
        mois={mois} annee={annee}
        sessions={sessions} evenements={evenements}
        reservations={reservations}
      />
    </div>
  )
}
// Vue formateur : grille créneaux Matin/Après-midi/Soir (inchangée)
```

### Commits

- `fix: PlanningWeekView — réécriture complète timeline 30min (hex colors, grid lines, blocs absolute)`
- `fix: renforcement lignes grille — heures jaune ABJ 2px, demi-heures blanc, labels :30`
- `fix: bordures blocs formation — 2px plein sur 4 côtés pour visibilité`
- `fix: sessions fragmentées — confiance réservations si elles existent, skip fallback dateDebut→dateFin`

### Leçons Apprises

1. **JAMAIS utiliser `rgba(var(...))` en inline styles** — Toujours hex avec alpha (`#rrggbbaa`)
2. **Les lignes de grille doivent être rendues une seule fois** sur toute la largeur (pas par colonne)
3. **Les réservations sont la source de vérité** pour les jours occupés — le fallback `dateDebut → dateFin` n'est qu'un dernier recours
4. **Modifications visuelles minimales** — ne pas réécrire tout le composant quand seule la couleur/épaisseur change
