import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext.jsx'

const habitDefs = [
  { key: 'exercise_done', label: 'Olahraga', icon: '🏃', type: 'boolean' },
  { key: 'water_ml', label: 'Minum air', icon: '💧', type: 'number', unit: 'ml' },
  { key: 'veggies_done', label: 'Makan sayur', icon: '🥦', type: 'boolean' },
  { key: 'sleep_hours', label: 'Tidur cukup', icon: '😴', type: 'number', unit: 'jam' },
  { key: 'no_sugar_drink', label: 'Hindari minuman manis', icon: '🥤', type: 'boolean' }
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getWeekDates() {
  const days = []
  const now = new Date()
  const day = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1)
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function HabitTracker() {
  const { user, profile } = useAuth()
  const [today, setToday] = useState({
    date: todayStr(),
    exercise_done: false,
    water_ml: 0,
    veggies_done: false,
    sleep_hours: 0,
    no_sugar_drink: false
  })
  const [weekLogs, setWeekLogs] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const weekDates = getWeekDates()

  const loadData = async () => {
    const { data: todayData } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr())
      .maybeSingle()
    if (todayData) setToday(todayData)

    const { data: weekData } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .in('date', weekDates)
    const map = {}
    ;(weekData || []).forEach((row) => {
      map[row.date] = row
    })
    setWeekLogs(map)
  }

  useEffect(() => {
    if (user) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const toggleBoolean = (key) => {
    setToday((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const changeNumber = (key, value) => {
    setToday((prev) => ({ ...prev, [key]: Number(value) }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('habit_logs').upsert(
      {
        user_id: user.id,
        date: todayStr(),
        exercise_done: today.exercise_done,
        water_ml: today.water_ml,
        veggies_done: today.veggies_done,
        sleep_hours: today.sleep_hours,
        no_sugar_drink: today.no_sugar_drink
      },
      { onConflict: 'user_id,date' }
    )
    setSaving(false)
    if (error) {
      setMessage(`Gagal menyimpan: ${error.message}`)
    } else {
      setMessage('Kebiasaan hari ini tersimpan.')
      loadData()
    }
  }

  const isDone = (row, key) => {
    if (!row) return false
    if (key === 'water_ml') return (row.water_ml || 0) >= (profile?.daily_water_target_ml || 2000)
    if (key === 'sleep_hours') return (row.sleep_hours || 0) >= 7
    return !!row[key]
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-800">Habit Tracker</h1>
        <p className="text-sm text-forest-500">Bangun kebiasaan sehat sedikit demi sedikit, setiap hari.</p>
      </div>

      <div className="card flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold text-forest-800">Hari ini</h2>
        {message && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              message.startsWith('Gagal') ? 'bg-red-50 text-red-600' : 'bg-forest-50 text-forest-700'
            }`}
          >
            {message}
          </div>
        )}
        {habitDefs.map((habit) => (
          <div key={habit.key} className="flex items-center justify-between gap-3 rounded-lg bg-sand-100 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{habit.icon}</span>
              <span className="text-sm font-medium text-ink">{habit.label}</span>
            </div>
            {habit.type === 'boolean' ? (
              <button
                onClick={() => toggleBoolean(habit.key)}
                className={`h-7 w-12 rounded-full transition ${
                  today[habit.key] ? 'bg-forest-700' : 'bg-forest-100'
                }`}
              >
                <span
                  className={`block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition ${
                    today[habit.key] ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  className="input-field w-24 !py-1.5 text-right"
                  value={today[habit.key]}
                  onChange={(e) => changeNumber(habit.key, e.target.value)}
                />
                <span className="text-xs text-forest-500">{habit.unit}</span>
              </div>
            )}
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} className="btn-primary mt-1">
          {saving ? 'Menyimpan...' : 'Simpan Kebiasaan Hari Ini'}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-3 font-display text-lg font-semibold text-forest-800">Ringkasan Minggu Ini</h2>
        <table className="w-full min-w-[480px] text-center text-sm">
          <thead>
            <tr className="text-forest-500">
              <th className="pb-2 text-left font-medium">Kebiasaan</th>
              {weekDates.map((d) => (
                <th key={d} className="pb-2 font-medium">
                  {new Date(d).toLocaleDateString('id-ID', { weekday: 'short' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habitDefs.map((habit) => (
              <tr key={habit.key} className="border-t border-forest-100">
                <td className="py-2 text-left text-ink">
                  {habit.icon} {habit.label}
                </td>
                {weekDates.map((d) => (
                  <td key={d} className="py-2">
                    {isDone(weekLogs[d], habit.key) ? (
                      <span className="text-forest-600">✔</span>
                    ) : (
                      <span className="text-forest-200">·</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
