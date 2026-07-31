import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExerciseForm from './pages/ExerciseForm.jsx'
import WeightForm from './pages/WeightForm.jsx'
import HabitTracker from './pages/HabitTracker.jsx'
import FoodJournal from './pages/FoodJournal.jsx'
import WeeklyReport from './pages/WeeklyReport.jsx'
import Profile from './pages/Profile.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function withLayout(children) {
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/masuk" element={<Login />} />
      <Route path="/daftar" element={<Register />} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute>{withLayout(<Dashboard />)}</ProtectedRoute>}
      />
      <Route
        path="/olahraga"
        element={<ProtectedRoute>{withLayout(<ExerciseForm />)}</ProtectedRoute>}
      />
      <Route
        path="/berat-badan"
        element={<ProtectedRoute>{withLayout(<WeightForm />)}</ProtectedRoute>}
      />
      <Route
        path="/kebiasaan"
        element={<ProtectedRoute>{withLayout(<HabitTracker />)}</ProtectedRoute>}
      />
      <Route
        path="/jurnal-makan"
        element={<ProtectedRoute>{withLayout(<FoodJournal />)}</ProtectedRoute>}
      />
      <Route
        path="/laporan-mingguan"
        element={<ProtectedRoute>{withLayout(<WeeklyReport />)}</ProtectedRoute>}
      />
      <Route
        path="/profil"
        element={<ProtectedRoute>{withLayout(<Profile />)}</ProtectedRoute>}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>{withLayout(<AdminDashboard />)}</ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
