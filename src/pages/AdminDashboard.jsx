import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { StatCard } from '../components/StatCard.jsx'

function startOfWeek() {
  const date = new Date()
  const day = date.getDay() === 0 ? 7 : date.getDay()
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      const weekStart = startOfWeek()

      const [
        usersCount,
        weightCount,
        exerciseCount,
        foodCount,
        weeklyWeight,
        weeklyExercise,
        recent
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('weight_logs').select('*', { count: 'exact', head: true }),
        supabase.from('exercise_logs').select('*', { count: 'exact', head: true }),
        supabase.from('food_journal').select('*', { count: 'exact', head: true }),
        supabase.from('weight_logs').select('*', { count: 'exact', head: true }).gte('date', weekStart),
        supabase.from('exercise_logs').select('*', { count: 'exact', head: true }).gte('date', weekStart),
        supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(10)
      ])

      const firstError = [usersCount, weightCount, exerciseCount, foodCount, weeklyWeight, weeklyExercise, recent].find(
        (r) => r.error
      )
      if (firstError) {
        setError(firstError.error.message)
      } else {
        setStats({
          users: usersCount.count || 0,
          weightLogs: weightCount.count || 0,
          exerciseLogs: exerciseCount.count || 0,
          foodEntries: foodCount.count || 0,
          weeklyWeightLogs: weeklyWeight.count || 0,
          weeklyExerciseLogs: weeklyExercise.count || 0
        })
        setRecentUsers(recent.data || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="py-20 text-center text-forest-500">Memuat data admin...</div>

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-800">Dashboard Admin</h1>
        <p className="text-sm text-forest-500">Ringkasan jumlah pengguna dan aktivitas di seluruh aplikasi.</p>
      </div>

      {error && (
        <div className="card bg-red-50 text-sm text-red-600">
          Gagal memuat sebagian data: {error}. Pastikan kebijakan RLS admin sudah diterapkan sesuai supabase/schema.sql.
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard title="Total pengguna" value={stats.users} />
            <StatCard title="Total laporan berat badan" value={stats.weightLogs} />
            <StatCard title="Total laporan olahraga" value={stats.exerciseLogs} />
            <StatCard title="Total entri jurnal makanan" value={stats.foodEntries} />
            <StatCard title="Laporan berat (minggu ini)" value={stats.weeklyWeightLogs} />
            <StatCard title="Laporan olahraga (minggu ini)" value={stats.weeklyExerciseLogs} />
          </div>

          <div className="card">
            <h2 className="mb-3 font-display text-lg font-semibold text-forest-800">Pengguna Terbaru</h2>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-forest-400">Belum ada pengguna terdaftar.</p>
            ) : (
              <ul className="divide-y divide-forest-100">
                {recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-medium text-ink">{u.full_name || 'Tanpa nama'}</span>
                    <span className="text-forest-500">
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
