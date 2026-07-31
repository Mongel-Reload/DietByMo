import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext.jsx'

function startOfWeek(offsetWeeks = 0) {
  const date = new Date()
  const day = date.getDay() === 0 ? 7 : date.getDay()
  date.setDate(date.getDate() - day + 1 + offsetWeeks * 7)
  date.setHours(0, 0, 0, 0)
  return date
}

function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

function Delta({ value, unit, lowerIsBetter = true }) {
  if (value == null || Number.isNaN(value)) return <span className="text-forest-400">—</span>
  const good = lowerIsBetter ? value <= 0 : value >= 0
  return (
    <span className={`chip ${good ? 'bg-forest-50 text-forest-700' : 'bg-mango-500/10 text-mango-600'}`}>
      {value > 0 ? '+' : ''}
      {value.toFixed(1)} {unit}
    </span>
  )
}

export default function WeeklyReport() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const thisWeekStart = toISODate(startOfWeek(0))
      const lastWeekStart = toISODate(startOfWeek(-1))
      const lastWeekEnd = toISODate(startOfWeek(0))

      const fetchRange = async (table, start, end) => {
        let query = supabase.from(table).select('*').eq('user_id', user.id).gte('date', start)
        if (end) query = query.lt('date', end)
        const { data } = await query
        return data || []
      }

      const [thisExercise, lastExercise, thisWeight, lastWeight, thisHabits, lastHabits] = await Promise.all([
        fetchRange('exercise_logs', thisWeekStart),
        fetchRange('exercise_logs', lastWeekStart, lastWeekEnd),
        fetchRange('weight_logs', thisWeekStart),
        fetchRange('weight_logs', lastWeekStart, lastWeekEnd),
        fetchRange('habit_logs', thisWeekStart),
        fetchRange('habit_logs', lastWeekStart, lastWeekEnd)
      ])

      const sum = (arr, key) => arr.reduce((s, x) => s + (x[key] || 0), 0)
      const avgWeight = (arr) => (arr.length ? arr.reduce((s, x) => s + x.weight_kg, 0) / arr.length : null)
      const habitScore = (arr) => {
        if (!arr.length) return null
        const total = arr.reduce(
          (s, x) => s + (x.exercise_done ? 1 : 0) + (x.veggies_done ? 1 : 0) + (x.no_sugar_drink ? 1 : 0),
          0
        )
        return total / (arr.length * 3)
      }

      setSummary({
        exercise: {
          thisMinutes: sum(thisExercise, 'duration_minutes'),
          lastMinutes: sum(lastExercise, 'duration_minutes'),
          thisCalories: sum(thisExercise, 'calories_burned'),
          lastCalories: sum(lastExercise, 'calories_burned')
        },
        weight: {
          thisAvg: avgWeight(thisWeight),
          lastAvg: avgWeight(lastWeight)
        },
        habits: {
          thisScore: habitScore(thisHabits),
          lastScore: habitScore(lastHabits)
        }
      })
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <div className="py-20 text-center text-forest-500">Menyusun laporan mingguan...</div>
  if (!summary) return null

  const minutesDelta = summary.exercise.thisMinutes - summary.exercise.lastMinutes
  const caloriesDelta = summary.exercise.thisCalories - summary.exercise.lastCalories
  const weightDelta =
    summary.weight.thisAvg != null && summary.weight.lastAvg != null
      ? summary.weight.thisAvg - summary.weight.lastAvg
      : null
  const habitDelta =
    summary.habits.thisScore != null && summary.habits.lastScore != null
      ? (summary.habits.thisScore - summary.habits.lastScore) * 100
      : null

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-800">Laporan Mingguan</h1>
        <p className="text-sm text-forest-500">Perbandingan otomatis antara minggu ini dan minggu lalu.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-xs font-medium text-forest-500">Rata-rata berat badan</p>
          <p className="stat-number text-2xl font-semibold text-ink">
            {summary.weight.thisAvg != null ? `${summary.weight.thisAvg.toFixed(1)} kg` : '—'}
          </p>
          <div className="mt-2">
            <Delta value={weightDelta} unit="kg vs minggu lalu" lowerIsBetter />
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-forest-500">Total durasi olahraga</p>
          <p className="stat-number text-2xl font-semibold text-ink">{summary.exercise.thisMinutes} menit</p>
          <div className="mt-2">
            <Delta value={minutesDelta} unit="menit vs minggu lalu" lowerIsBetter={false} />
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-forest-500">Total kalori terbakar</p>
          <p className="stat-number text-2xl font-semibold text-ink">{summary.exercise.thisCalories} kkal</p>
          <div className="mt-2">
            <Delta value={caloriesDelta} unit="kkal vs minggu lalu" lowerIsBetter={false} />
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-forest-500">Skor kebiasaan sehat</p>
          <p className="stat-number text-2xl font-semibold text-ink">
            {summary.habits.thisScore != null ? `${Math.round(summary.habits.thisScore * 100)}%` : '—'}
          </p>
          <div className="mt-2">
            <Delta value={habitDelta} unit="poin vs minggu lalu" lowerIsBetter={false} />
          </div>
        </div>
      </div>

      <div className="card text-sm text-forest-600">
        <h2 className="mb-2 font-display text-lg font-semibold text-forest-800">Catatan Singkat</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            {weightDelta == null
              ? 'Belum cukup data berat badan untuk dibandingkan minggu ini.'
              : weightDelta <= 0
              ? 'Rata-rata berat badanmu turun dibanding minggu lalu, pertahankan!'
              : 'Rata-rata berat badanmu naik dibanding minggu lalu, evaluasi pola makan dan olahragamu.'}
          </li>
          <li>
            {minutesDelta > 0
              ? 'Durasi olahragamu meningkat dibanding minggu lalu.'
              : minutesDelta < 0
              ? 'Durasi olahragamu menurun dibanding minggu lalu, coba tingkatkan lagi.'
              : 'Durasi olahragamu sama seperti minggu lalu.'}
          </li>
          <li>
            {habitDelta == null
              ? 'Belum cukup data kebiasaan untuk dibandingkan.'
              : habitDelta >= 0
              ? 'Konsistensi kebiasaan sehatmu membaik minggu ini.'
              : 'Konsistensi kebiasaan sehatmu menurun, coba lebih disiplin minggu depan.'}
          </li>
        </ul>
      </div>
    </div>
  )
}
