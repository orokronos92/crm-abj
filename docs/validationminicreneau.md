# Mémo — Système de Validation Créneaux RDV (Entretien Téléphonique)

## Vue d'ensemble

Quand un admin valide l'étape "Entretien téléphonique" d'un candidat, il peut proposer des créneaux horaires.
Ces créneaux sont envoyés au candidat par email avec un lien unique. Le candidat choisit son créneau sur une page publique.

---

## 1. Côté Admin — Validation de l'étape

**Interface** : Fiche candidat → onglet Parcours → bouton "Valider" sur "Entretien téléphonique"

Le modal `ValiderEtapeModal` s'ouvre avec le composant `ProposedSlotsEditor` :
- Sélection de la salle
- Ajout de créneaux date + heure début + heure fin
- Possibilité d'ajouter plusieurs créneaux

**Endpoint appelé** : `POST /api/candidats/valider-etape`

Payload envoyé :
```json
{
  "idCandidat": 123,
  "etape": "entretienTelephonique",
  "proposedSlots": [
    { "dateDebut": "2026-03-15T09:00:00Z", "dateFin": "2026-03-15T10:00:00Z", "idSalle": 2 },
    { "dateDebut": "2026-03-15T11:00:00Z", "dateFin": "2026-03-15T12:00:00Z", "idSalle": 2 }
  ]
}
```

---

## 2. Côté Serveur — Création des Holds

Pour chaque créneau proposé, l'API crée une `ReservationSalle` avec :

| Champ | Valeur |
|-------|--------|
| `token` | UUID unique par créneau (sert de discriminant : token != null = hold RDV) |
| `idLot` | UUID partagé entre tous les créneaux du même appel (permet d'envoyer un seul lien) |
| `idCandidat` | `null` — pas encore assigné |
| `statut` | `PREVUE` |
| `expiresAt` | Date d'expiration du hold |

Un seul email est envoyé au candidat avec le lien :
```
/admission/rdv/choisir?lot=IDLOT&candidat=IDCANDIDAT
```

---

## 3. Côté Candidat — Choix du Créneau

**Page publique** : `/admission/rdv/choisir` (accessible sans authentification)

Le candidat voit tous les créneaux disponibles pour son lot et en choisit un.

**Confirmation** : `POST /admission/rdv/confirm`
- Le créneau choisi passe à `statut = CONFIRMEE`, `idCandidat` est renseigné
- Les autres créneaux du lot sont annulés (`statut = ANNULE`)

---

## 4. Côté Planning Admin

**API** : `GET /api/planning/salles?annee=2026`

Discriminant clé :
- `token != null` → Hold RDV (affiché dans la section `holds`)
- `token == null` → Réservation session normale (affiché dans `reservations`)

Affichage dans `PlanningWeekView` :
- **PREVUE** (non expiré) : "⏳ En attente" + nom candidat (null avant confirmation)
- **CONFIRMEE** : "✅ Confirmé" + nom complet du candidat
- **Expiré** : "⏰ Expiré"

Le badge mensuel dans la timeline compte les holds PREVUE (non expirés) + CONFIRMEE.

---

## 5. Résumé du Cycle de Vie d'un Hold

```
Admin propose créneaux
        ↓
ReservationSalle créée (token != null, idLot = UUID, idCandidat = null, statut = PREVUE)
        ↓
Email envoyé au candidat avec lien /admission/rdv/choisir?lot=...&candidat=...
        ↓
Candidat choisit un créneau
        ↓
Créneau choisi : statut = CONFIRMEE, idCandidat renseigné
Autres créneaux : statut = ANNULE
        ↓
Planning admin affiche le nom du candidat sur le créneau confirmé
```
