/**
 * Page de connexion
 * Design noir & doré ABJ
 */

'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock } from 'lucide-react'
import { DiamondLogo } from '@/components/ui/diamond-logo'

export default function ConnexionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Identifiants incorrects')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background avec effet de particules */}
      <div className="absolute inset-0 bg-[rgb(var(--background))]">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary))] via-[rgb(var(--secondary))] to-[rgb(var(--primary))]" />
        {/* Particules dorées animées */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-[rgb(var(--accent))] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Partie gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 text-center animate-fadeIn">
          {/* Logo Diamant */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <DiamondLogo size={96} className="animate-pulse-gold" />
              <div className="absolute inset-0 blur-2xl bg-[rgb(var(--accent))] opacity-10 animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient-gold">CRM ABJ</span>
          </h1>
          <p className="text-xl text-[rgb(var(--muted-foreground))] mb-2">
            Académie de Bijouterie Joaillerie
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[rgb(var(--accent))] to-transparent mx-auto mt-8" />

          {/* Citation */}
          <blockquote className="mt-12 text-[rgb(var(--muted-foreground))] italic">
            "L'excellence dans l'art de la bijouterie"
          </blockquote>
        </div>

        {/* Effet de brillance en arrière-plan */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[rgb(var(--accent))] rounded-full opacity-5 blur-3xl animate-pulse" />
      </div>

      {/* Partie droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md animate-slideInRight">
          {/* Carte de connexion */}
          <div className="glass-dark rounded-2xl p-8 border border-[rgba(var(--accent),0.1)] shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden mb-6 flex justify-center">
                <DiamondLogo size={64} />
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">
                Connexion
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2">
                Accédez à votre espace
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--accent))]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.2)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)] transition-all"
                    placeholder="votre.email@abj.fr"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(var(--foreground))]">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--accent))]" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.2)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.2)] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="p-3 rounded-lg bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.2)] text-[rgb(var(--error))] text-sm animate-fadeIn">
                  {error}
                </div>
              )}

              {/* Bouton connexion */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold py-3 px-4 rounded-lg font-semibold text-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>

              {/* Options supplémentaires */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[rgb(var(--border))] bg-[rgb(var(--secondary))] text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] focus:ring-offset-0"
                  />
                  Se souvenir
                </label>
                <a
                  href="#"
                  className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-light))] transition-colors"
                >
                  Mot de passe oublié ?
                </a>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[rgba(var(--border),0.3)]">
              <p className="text-xs text-center text-[rgb(var(--muted-foreground))]">
                © 2024 Académie de Bijouterie Joaillerie
              </p>
            </div>
          </div>

          {/* Info mode démo */}
          <div className="mt-6 p-4 glass rounded-lg border border-[rgba(var(--accent),0.1)]">
            <p className="text-xs text-[rgb(var(--muted-foreground))] text-center">
              <span className="text-[rgb(var(--accent))]">Mode démo</span> •
              Utilisez <span className="font-mono">demo</span> comme mot de passe
            </p>
          </div>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}