import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-forest-600">
        Memuat...
      </div>
    )
  }

  if (!user) return <Navigate to="/masuk" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />

  return children
}
