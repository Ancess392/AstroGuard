import { useEffect, useState } from 'react'

export default function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [status, setStatus] = useState('Preparing offline access…')

  useEffect(() => {
    const updateConnection = () => setOnline(navigator.onLine)
    const ready = () => setStatus('Ready for offline use')
    let mounted = true
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    navigator.serviceWorker?.addEventListener('controllerchange', ready)
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
        .then(() => navigator.serviceWorker.ready)
        .then(() => { if (mounted) ready() })
        .catch(() => { if (mounted) setStatus('Offline setup failed. Reconnect and reload to retry.') })
    }
    return () => {
      mounted = false
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
      navigator.serviceWorker?.removeEventListener('controllerchange', ready)
    }
  }, [])

  return <p className="offline-status" role="status">{online ? 'Online' : 'Offline'} · {status}</p>
}
