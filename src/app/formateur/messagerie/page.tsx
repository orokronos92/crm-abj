/**
 * Page Messagerie Formateur
 * Interface de communication avec les élèves
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  MessageSquare,
  Send,
  Search,
  Users,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Image,
  File,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Filter,
  ChevronRight,
  Circle,
  CheckCheck,
} from 'lucide-react'

// Données mockées
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    nom: 'Sophie Martin',
    formation: 'CAP Bijouterie',
    dernierMessage: 'Merci pour votre réponse concernant le projet.',
    timestamp: 'Il y a 10 min',
    nonLus: 2,
    statut: 'online',
    avatar: 'SM',
  },
  {
    id: 2,
    nom: 'Groupe CAP 2024',
    type: 'groupe',
    membres: 12,
    dernierMessage: 'Jean: Les documents sont disponibles ?',
    timestamp: 'Il y a 1h',
    nonLus: 0,
    avatar: 'CAP',
  },
  {
    id: 3,
    nom: 'Alice Bernard',
    formation: 'CAP Bijouterie',
    dernierMessage: 'J\'ai une question sur l\'exercice de soudure',
    timestamp: 'Il y a 2h',
    nonLus: 1,
    statut: 'offline',
    avatar: 'AB',
  },
  {
    id: 4,
    nom: 'Pierre Dumont',
    formation: 'Initiation',
    dernierMessage: 'D\'accord, je serai présent demain',
    timestamp: 'Hier',
    nonLus: 0,
    statut: 'offline',
    avatar: 'PD',
  },
]

const MOCK_MESSAGES = [
  {
    id: 1,
    expediteur: 'Sophie Martin',
    contenu: 'Bonjour Monsieur, j\'ai une question concernant le projet de fin de module.',
    timestamp: '09:30',
    lu: true,
    type: 'recu',
  },
  {
    id: 2,
    expediteur: 'Moi',
    contenu: 'Bonjour Sophie, bien sûr, quelle est votre question ?',
    timestamp: '09:35',
    lu: true,
    type: 'envoye',
  },
  {
    id: 3,
    expediteur: 'Sophie Martin',
    contenu: 'Je voulais savoir si nous pouvions utiliser de l\'argent au lieu du cuivre pour le prototype ?',
    timestamp: '09:38',
    lu: true,
    type: 'recu',
  },
  {
    id: 4,
    expediteur: 'Moi',
    contenu: 'C\'est une excellente idée ! L\'argent sera effectivement plus approprié pour ce type de projet. N\'hésitez pas à l\'utiliser.',
    timestamp: '09:42',
    lu: true,
    type: 'envoye',
  },
  {
    id: 5,
    expediteur: 'Sophie Martin',
    contenu: 'Merci pour votre réponse concernant le projet.',
    timestamp: '09:45',
    lu: false,
    type: 'recu',
  },
]

export default function FormateurMessagerie() {
  const [selectedConversation, setSelectedConversation] = useState(MOCK_CONVERSATIONS[0])
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-6rem)] flex gap-4">
        {/* Liste des conversations */}
        <div className="w-80 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl flex flex-col">
          <div className="p-4 border-b border-[rgba(var(--border),0.3)]">
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))] mb-4">
              Messagerie
            </h2>

            {/* Barre de recherche */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[rgb(var(--secondary))] rounded-lg text-sm text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent),0.3)]"
              />
            </div>

            {/* Filtres rapides */}
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 px-3 bg-[rgba(var(--accent),0.1)] border border-[rgba(var(--accent),0.2)] rounded-lg text-xs text-[rgb(var(--accent))] font-medium hover:bg-[rgba(var(--accent),0.2)] transition-colors">
                Tous
              </button>
              <button className="flex-1 py-1.5 px-3 bg-[rgb(var(--secondary))] rounded-lg text-xs text-[rgb(var(--muted-foreground))] hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                Non lus
              </button>
              <button className="flex-1 py-1.5 px-3 bg-[rgb(var(--secondary))] rounded-lg text-xs text-[rgb(var(--muted-foreground))] hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                Groupes
              </button>
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 hover:bg-[rgba(var(--accent),0.05)] transition-colors border-b border-[rgba(var(--border),0.2)] ${
                  selectedConversation.id === conv.id ? 'bg-[rgba(var(--accent),0.05)]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                      conv.type === 'groupe'
                        ? 'bg-gradient-to-br from-[rgb(var(--info))] to-[rgb(var(--info-dark))] text-[rgb(var(--primary))]'
                        : 'bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))]'
                    }`}>
                      {conv.avatar}
                    </div>
                    {conv.statut === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[rgb(var(--success))] rounded-full border-2 border-[rgb(var(--card))]" />
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm text-[rgb(var(--foreground))]">
                        {conv.nom}
                      </h3>
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">
                        {conv.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[rgb(var(--muted-foreground))] truncate pr-2">
                        {conv.type === 'groupe' && (
                          <span className="text-[rgb(var(--accent))]">{conv.membres} membres • </span>
                        )}
                        {conv.formation && (
                          <span>{conv.formation} • </span>
                        )}
                        {conv.dernierMessage}
                      </p>
                      {conv.nonLus > 0 && (
                        <span className="px-1.5 py-0.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] text-xs rounded-full font-bold min-w-[20px] text-center">
                          {conv.nonLus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl flex flex-col">
          {/* Header de la conversation */}
          <div className="p-4 border-b border-[rgba(var(--border),0.3)] bg-gradient-to-r from-[rgb(var(--card))] to-[rgba(var(--accent),0.03)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedConversation.type === 'groupe'
                    ? 'bg-gradient-to-br from-[rgb(var(--info))] to-[rgb(var(--info-dark))] text-[rgb(var(--primary))]'
                    : 'bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))]'
                }`}>
                  {selectedConversation.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-[rgb(var(--foreground))]">
                    {selectedConversation.nom}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                    {selectedConversation.type === 'groupe' ? (
                      <>
                        <Users className="w-3 h-3" />
                        <span>{selectedConversation.membres} membres</span>
                      </>
                    ) : (
                      <>
                        <div className={`w-2 h-2 rounded-full ${
                          selectedConversation.statut === 'online'
                            ? 'bg-[rgb(var(--success))]'
                            : 'bg-[rgb(var(--muted-foreground))]'
                        }`} />
                        <span>{selectedConversation.statut === 'online' ? 'En ligne' : 'Hors ligne'}</span>
                        {selectedConversation.formation && (
                          <>
                            <span>•</span>
                            <span>{selectedConversation.formation}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Search className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <MoreVertical className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Date separator */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[rgba(var(--border),0.3)]" />
              <span className="text-xs text-[rgb(var(--muted-foreground))] px-2">Aujourd'hui</span>
              <div className="flex-1 h-px bg-[rgba(var(--border),0.3)]" />
            </div>

            {MOCK_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.type === 'envoye' ? 'justify-end' : ''} animate-fadeIn`}
              >
                {msg.type === 'recu' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] text-xs font-bold flex-shrink-0">
                    {selectedConversation.avatar}
                  </div>
                )}

                <div className={`max-w-lg ${msg.type === 'envoye' ? 'order-first' : ''}`}>
                  <div
                    className={`p-3 rounded-xl ${
                      msg.type === 'envoye'
                        ? 'bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))]'
                        : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))]'
                    }`}
                  >
                    <p className="text-sm">{msg.contenu}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">
                      {msg.timestamp}
                    </span>
                    {msg.type === 'envoye' && (
                      msg.lu ? (
                        <CheckCheck className="w-3 h-3 text-[rgb(var(--info))]" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Zone de saisie */}
          <div className="p-4 border-t border-[rgba(var(--border),0.3)]">
            <div className="flex gap-3">
              <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                <Paperclip className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              </button>
              <button className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                <Image className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && message.trim()) {
                    setMessage('')
                  }
                }}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent),0.2)]"
              />

              <button
                disabled={!message.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] text-[rgb(var(--primary))] rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}