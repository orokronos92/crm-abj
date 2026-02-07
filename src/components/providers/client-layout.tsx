/**
 * Client Layout - Gère le SplashScreen au niveau racine
 * Pattern standard : splash affiché une seule fois au premier chargement du site
 */

'use client'

import { useState, useEffect } from 'react'
import { SplashScreen } from '@/components/ui/splash-screen'

interface ClientLayoutProps {
    children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
    const [showSplash, setShowSplash] = useState(true)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)

        // Vérifier si l'utilisateur a déjà vu le splash screen
        const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')

        if (hasSeenSplash) {
            // L'utilisateur a déjà vu le splash, on ne l'affiche pas
            setShowSplash(false)
        } else {
            // Première visite : afficher le splash puis le masquer après l'animation
            const timer = setTimeout(() => {
                setShowSplash(false)
                sessionStorage.setItem('hasSeenSplash', 'true')
            }, 4000) // Durée totale du splash screen

            return () => clearTimeout(timer)
        }
    }, [])

    // Éviter le flash de contenu au premier rendu
    if (!isClient) {
        return null
    }

    return (
        <>
            {showSplash && <SplashScreen />}
            <div className={showSplash ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
                {children}
            </div>
        </>
    )
}
