# Configuration Webhook n8n pour Marjorie Chat

## Vue d'ensemble

Ce webhook permet au CRM de communiquer avec l'agent Marjorie via le chat.

## Endpoint

**URL** : `/webhook/marjorie-chat`
**Méthode** : `POST`

## Payload Envoyé par le CRM

```json
{
  "userId": 1,
  "userName": "Sophie Durand",
  "userRole": "admin",
  "message": "Peux-tu me faire un résumé des nouveaux prospects de cette semaine ?",
  "conversationHistory": [
    {
      "id": 1,
      "role": "assistant",
      "content": "Bonjour ! Comment puis-je vous aider ?",
      "timestamp": "14:30"
    },
    {
      "id": 2,
      "role": "user",
      "content": "Message précédent...",
      "timestamp": "14:32"
    }
  ],
  "timestamp": "2026-02-19T14:35:00.000Z",
  "source": "crm_chat"
}
```

## Réponse Attendue de n8n

```json
{
  "success": true,
  "reply": "Voici le résumé des nouveaux prospects de cette semaine :\n\n📊 **8 nouveaux prospects** ont été ajoutés...",
  "suggestions": [
    "Générer rapport",
    "Envoyer emails",
    "Voir détails"
  ],
  "metadata": {
    "processedAt": "2026-02-19T14:35:02.000Z",
    "agentVersion": "marjorie-v1.0"
  }
}
```

## Gestion par Rôle

### Admin
- Accès complet à toutes les données
- Peut générer devis, créer prospects, envoyer emails
- Voit tous les candidats et élèves

### Professeur (formateur)
- Accès uniquement à SES élèves et SES sessions
- Peut saisir notes et présences
- Peut consulter le planning

### Élève
- Accès uniquement à SES propres données
- Peut consulter ses notes, planning, documents
- Ne peut PAS modifier les données

## Workflow n8n Proposé

```
┌─────────────────────────┐
│  Webhook Trigger        │
│  POST /marjorie-chat    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Extraire userRole      │
│  et contexte            │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Switch par userRole    │
├─────────────────────────┤
│  • admin                │
│  • professeur           │
│  • eleve                │
└──────────┬──────────────┘
           │
           ├─→ Branch Admin
           │   ↓
           │   Agent IA (accès complet BDD)
           │   ↓
           │   Outils SQL + Génération docs
           │
           ├─→ Branch Professeur
           │   ↓
           │   Agent IA (filtré par formateurId)
           │   ↓
           │   Outils SQL (WHERE formateur_id = userId)
           │
           └─→ Branch Élève
               ↓
               Agent IA (filtré par eleveId)
               ↓
               Outils SQL (WHERE eleve_id = userId)
               ↓
           ┌───────────────┐
           │  Formater     │
           │  réponse JSON │
           └───────┬───────┘
                   │
                   ▼
           ┌───────────────┐
           │  Retour au    │
           │  CRM          │
           └───────────────┘
```

## Exemples de Questions par Rôle

### Admin
- "Liste les nouveaux prospects de cette semaine"
- "Génère un devis pour Juliette Rimbo"
- "Combien de candidats en attente de dossier ?"
- "Envoie un email de relance à tous les prospects inactifs"

### Professeur
- "Quels sont mes élèves pour la session du 20 février ?"
- "Quel est le taux d'assiduité de ma classe ?"
- "J'ajoute 3 jours de disponibilité semaine 35"
- "Liste les élèves en difficulté dans mes sessions"

### Élève
- "Quand est-ce que j'ai cours la semaine prochaine ?"
- "Quelle est ma moyenne générale ?"
- "Je veux télécharger mon attestation"
- "Combien d'absences j'ai cette session ?"

## Variables d'Environnement

Ajouter dans `.env.local` :

```bash
# Webhook n8n pour chat Marjorie
N8N_MARJORIE_CHAT_WEBHOOK_URL=http://localhost:5678/webhook/marjorie-chat

# Ou en production
N8N_MARJORIE_CHAT_WEBHOOK_URL=https://n8n.abj.fr/webhook/marjorie-chat
```

## Sécurité

1. **Authentification CRM** : NextAuth vérifie l'utilisateur avant l'appel
2. **Filtrage par rôle** : L'agent IA limite les données selon le rôle
3. **Historique limité** : Seulement les 10 derniers messages envoyés
4. **Rate limiting** : Limiter à 10 messages/minute par utilisateur (à implémenter)

## Tests

### Test manuel avec curl

```bash
# Test en tant qu'admin
curl -X POST http://localhost:5678/webhook/marjorie-chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "userName": "Admin Test",
    "userRole": "admin",
    "message": "Liste les prospects de cette semaine",
    "conversationHistory": [],
    "timestamp": "2026-02-19T14:35:00.000Z",
    "source": "crm_chat"
  }'
```

## Prochaines Améliorations

1. **Streaming** : Réponses caractère par caractère en temps réel
2. **Actions contextuelles** : Boutons d'action directement dans le chat
3. **Pièces jointes** : Upload de fichiers dans le chat
4. **Historique persistant** : Sauvegarder les conversations en BDD
5. **Multi-sessions** : Plusieurs conversations parallèles

---

**Version** : 1.0
**Date** : 19 février 2026
**Auteur** : Claude Code
