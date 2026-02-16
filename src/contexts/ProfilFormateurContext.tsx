'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ProfilFormateur, PROFIL_INITIAL } from '@/types/formateur/profil.types'

// Interface du contexte
interface ProfilFormateurContextType {
  // État
  profil: ProfilFormateur
  etapeActuelle: number
  chargement: boolean
  sauvegarde: boolean

  // Actions sur le profil
  updateProfil: (field: keyof ProfilFormateur, value: any) => void
  resetProfil: () => void

  // Navigation
  allerAEtape: (index: number) => void
  suivant: () => void
  precedent: () => void

  // API
  chargerProfil: () => Promise<void>
  sauvegarderProfil: () => Promise<void>
}

// Création du contexte
const ProfilFormateurContext = createContext<ProfilFormateurContextType | undefined>(undefined)

// Hook pour utiliser le contexte
export function useProfilFormateur() {
  const context = useContext(ProfilFormateurContext)
  if (!context) {
    throw new Error('useProfilFormateur doit être utilisé dans ProfilFormateurProvider')
  }
  return context
}

// Provider props
interface ProfilFormateurProviderProps {
  children: ReactNode
}

// Provider component
export function ProfilFormateurProvider({ children }: ProfilFormateurProviderProps) {
  // États principaux
  const [profil, setProfil] = useState<ProfilFormateur>(PROFIL_INITIAL)
  const [etapeActuelle, setEtapeActuelle] = useState(0)
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  // Mise à jour d'un champ du profil
  const updateProfil = useCallback((field: keyof ProfilFormateur, value: any) => {
    setProfil(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Reset du profil
  const resetProfil = useCallback(() => {
    setProfil(PROFIL_INITIAL)
    setEtapeActuelle(0)
  }, [])

  // Navigation vers une étape spécifique
  const allerAEtape = useCallback((index: number) => {
    if (index >= 0 && index < 9) { // 9 étapes au total
      setEtapeActuelle(index)
    }
  }, [])

  // Étape suivante
  const suivant = useCallback(async () => {
    // Validation de l'étape actuelle avant de passer à la suivante
    // TODO: Ajouter validation spécifique par étape si nécessaire

    if (etapeActuelle < 8) { // 8 est la dernière étape (index 0-8)
      setEtapeActuelle(prev => prev + 1)
    }
  }, [etapeActuelle])

  // Étape précédente
  const precedent = useCallback(() => {
    if (etapeActuelle > 0) {
      setEtapeActuelle(prev => prev - 1)
    }
  }, [etapeActuelle])

  // Charger le profil depuis l'API
  const chargerProfil = useCallback(async () => {
    setChargement(true)
    try {
      const response = await fetch('/api/formateur/profil')
      if (response.ok) {
        const data = await response.json()
        setProfil(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    } finally {
      setChargement(false)
    }
  }, [])

  // Sauvegarder le profil via l'API
  const sauvegarderProfil = useCallback(async () => {
    setSauvegarde(true)
    try {
      const response = await fetch('/api/formateur/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profil)
      })

      if (response.ok) {
        console.log('Profil sauvegardé avec succès')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setSauvegarde(false)
    }
  }, [profil])

  // Valeur du contexte
  const value: ProfilFormateurContextType = {
    profil,
    etapeActuelle,
    chargement,
    sauvegarde,
    updateProfil,
    resetProfil,
    allerAEtape,
    suivant,
    precedent,
    chargerProfil,
    sauvegarderProfil
  }

  return (
    <ProfilFormateurContext.Provider value={value}>
      {children}
    </ProfilFormateurContext.Provider>
  )
}