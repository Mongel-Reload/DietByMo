import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { GrowthRing } from '../components/GrowthRing.jsx'
import { WeightChart } from '../components/WeightChart.jsx'

function startOfWeek(d = new Date()) {
  const date = new Date(d)
  const day = date.getDay() === 0 ? 7 : date.getDay()
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [weightLogs, setWeightLogs] = useState([])
  const [weekExercise, setWeekExercise] = useState({ minutes: 0, calories: 0, steps: 0 })
  const [todayWater, setTodayWater] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const weekStart = startOfWeek().toISOString().slice(0, 10)
      const today = new Date().toISOString().slice(0, 10)

      const [{ data: weights }, { data: exercises }, { data: habitToday }] = await Promise.all([
        supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true }),
        supabase
          .from('exercise_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', weekStart),
        supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle()
      ])

      setWeightLogs(weights || [])
      const totals = (exercises || []).reduce(
        (acc, ex) => ({
          minutes: acc.minutes + (ex.duration_minutes || 0),
          calories: acc.calories + (ex.calories_burned || 0),
          steps: acc.steps + (ex.steps || 0)
        }),
        { minutes: 0, calories: 0, steps: 0 }
      )
      setWeekExercise(totals)
      setTodayWater(habitToday?.water_ml || 0)
      setLoading(false)
    }
    load()
  }, [user])

  const lastWeight = weightLogs[weightLogs.length - 1]?.weight_kg
  const prevWeight = weightLogs[weightLogs.length - 2]?.weight_kg
  const weeklyChange = lastWeight != null && prevWeight != null ? lastWeight - prevWeight : null

  const targetProgress = useMemo(() => {
    if (!profile?.initial_weight || !profile?.target_weight || lastWeight == null) return 0
    const totalToLose = profile.initial_weight - profile.target_weight
    if (totalToLose === 0) return 100
    const lostSoFar = profile.initial_weight - lastWeight
    return (lostSoFar / totalToLose) * 100
  }, [profile, lastWeight])

  const chartData = weightLogs.map((w) => ({
    label: new Date(w.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    weight: w.weight_kg
  }))

  if (loading) {
    return <div className="py-20 text-center text-forest-500">Memuat dashboard...</div>
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-800 sm:text-3xl">
          Halo, {profile?.full_name?.split(' ')[0] || 'Sahabat Sehat'} 👋
        </h1>
        <p className="text-sm text-forest-500">Ini ringkasan progres dietmu hari ini.</p>
      </div>

      <div className="card flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <GrowthRing
            percent={targetProgress}
            label="Menuju target"
            sublabel={profile?.target_weight ? `${profile.target_weight} kg` : ''}
          />
          <div>
            <p className="text-xs font-medium text-forest-500">Berat badan terakhir</p>
            <p className="stat-number text-3xl font-semibold text-ink">
              {lastWeight != null ? `${lastWeight} kg` : '—'}
            </p>
            {weeklyChange != null && (
              <span
                className={`chip mt-1 ${
                  weeklyChange <= 0 ? 'bg-forest-50 text-forest-700' : 'bg-mango-500/10 text-mango-600'
                }`}
              >
                {weeklyChange <= 0 ? '↓' : '↑'} {Math.abs(weeklyChange).toFixed(1)} kg minggu ini
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto">
          <Link to="/berat-badan" className="btn-secondary flex-1 sm:flex-none">
            + Berat badan
          </Link>
          <Link to="/olahraga" className="btn-primary flex-1 sm:flex-none">
            + Olahraga
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          title="Target berat"
          value={profile?.target_weight ?? '—'}
          unit={profile?.target_weight ? 'kg' : ''}
        />
        <StatCard
          title="Olahraga (minggu ini)"
          value={weekExercise.minutes}
          unit="menit"
          trend={{ text: `${weekExercise.calories} kkal terbakar`, direction: 'neutral' }}
        />
        <StatCard
          title="Konsumsi air hari ini"
          value={(todayWater / 1000).toFixed(1)}
          unit="liter"
          trend={
            profile?.daily_water_target_ml
              ? {
                  text: `Target ${(profile.daily_water_target_ml / 1000).toFixed(1)} L`,
                  direction: todayWater >= profile.daily_water_target_ml ? 'down' : 'neutral'
                }
              : null
          }
        />
        <StatCard title="Langkah minggu ini" value={weekExercise.steps.toLocaleString('id-ID')} unit="langkah" />
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-forest-800">Perkembangan Berat Badan</h2>
          <Link to="/berat-badan" className="text-sm font-medium text-forest-600 hover:underline">
            Tambah data
          </Link>
        </div>
        <WeightChart data={chartData} targetWeight={profile?.target_weight} />
      </div>
    </div>
  )
}
