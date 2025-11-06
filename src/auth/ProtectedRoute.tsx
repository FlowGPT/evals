import { Navigate, useLocation } from 'react-router-dom'
import { isAuthed } from './auth'
import { PropsWithChildren } from 'react'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation()
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}


