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

