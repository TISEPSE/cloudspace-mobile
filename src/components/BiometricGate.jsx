import { useEffect, useState, useCallback, useRef } from 'react'
import { isNative } from '../lib/backendUrl'
import { isBiometricEnabled, unlockRefreshToken, disableBiometric } from '../lib/biometric'

/**
 * BiometricGate : si l'utilisateur a activé le déverrouillage biométrique,
 * on l'oblige à valider son empreinte avant d'afficher l'app.
 *
 * UX épurée : juste le logo + titre CloudSpace, le prompt OS s'ouvre
 * automatiquement à l'arrivée sur la page. Si l'utilisateur annule, on
 * réessaie automatiquement (avec un petit délai pour ne pas spammer).
 * Aucun bouton visible — on tape juste sur le scanner d'empreinte du
 * téléphone, ou ailleurs sur l'écran pour relancer la prompt.
 */
export default function BiometricGate({ children }) {
  const [state, setState] = useState(() => {
    if (!isNative() || !isBiometricEnabled()) return 'unlocked'
    return 'locked'
  })
  const inFlight = useRef(false)
  const retryTimerRef = useRef(null)

  const tryUnlock = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    try {
      await unlockRefreshToken()
      setState('unlocked')
    } catch (e) {
      // Annulation utilisateur : on retentera après quelques secondes.
      const msg = (e?.message || '').toLowerCase()
      const cancelled = msg.includes('cancel') || e?.code === 'userCancel'
      if (cancelled) {
        retryTimerRef.current = setTimeout(() => tryUnlock(), 1500)
      }
      // En cas d'autre erreur, on laisse l'utilisateur tapper l'écran pour retry.
    } finally {
      inFlight.current = false
    }
  }, [])

  // Auto-prompt au montage, avec un léger delay pour la WebView.
  useEffect(() => {
    if (state !== 'locked') return
    const t = setTimeout(() => { tryUnlock() }, 300)
    return () => {
      clearTimeout(t)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'unlocked') return children

  return (
    <div
      onClick={tryUnlock}
      className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 select-none cursor-pointer"
    >
      <div className="flex items-center gap-3 text-primary">
        <span className="material-symbols-outlined text-[56px]">cloud_circle</span>
        <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">CloudSpace</span>
      </div>

      {/* Filet de secours minimal en bas pour pouvoir sortir de la biométrie */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (!confirm('Désactiver le déverrouillage biométrique ?')) return
          disableBiometric()
          setState('unlocked')
        }}
        className="absolute bottom-8 text-[11px] text-slate-400 dark:text-slate-500 underline underline-offset-2"
      >
        Utiliser un mot de passe
      </button>
    </div>
  )
}
