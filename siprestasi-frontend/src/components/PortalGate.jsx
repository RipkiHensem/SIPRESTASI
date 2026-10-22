import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { api } from '../api'
import { mapPortal, PortalContext } from '../data/portal'

export default function PortalGate() {
  const location = useLocation()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    api('portal', { signal: controller.signal }).then(response => {
      setResult({ key: location.key, data: mapPortal(response.data) })
      setError(null)
    }).catch(reason => { if (reason.name !== 'AbortError') setError(reason) })
    return () => controller.abort()
  }, [location.key, attempt])
  if (error?.status === 401) return <Navigate to="/login" replace />
  if (error) return <main className="dashboard-container"><p role="alert">{error.message}</p><button onClick={() => { setError(null); setAttempt(n => n + 1) }}>Coba lagi</button></main>
  if (result?.key !== location.key) return <main className="dashboard-container"><p role="status">Memuat data dari server…</p></main>
  const data = result.data
  if ((location.pathname.includes('finalis') || location.pathname.startsWith('/pradita-value')) && !['top3', 'pending_reviewed', 'ranked'].includes(data.submission?.status)) return <Navigate to="/dashboard/ranking" replace />
  return <PortalContext.Provider value={data}><Outlet /></PortalContext.Provider>
}
