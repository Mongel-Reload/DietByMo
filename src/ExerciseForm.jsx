import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext.jsx'

const intensities = [
  { value: 'ringan', label: 'Ringan' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'berat', label: 'Berat' }
]

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  exercise_type: '',
  duration_minutes: '',
  intensity: 'sedang',
  calories_burned: '',
  steps: '',
  notes: ''
}

export default function ExerciseForm() {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [logs, setLogs] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadLogs = async () => {
    const { data } = await supabase
      .from('exercise_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10)
    setLogs(data || [])
  }

  useEffect(() => {
    if (user) loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('exercise_logs').insert({
      user_id: user.id,
      date: form.date,
      exercise_type: form.exercise_type,
      duration_minutes: Number(form.duration_minutes) || 0,
      intensity: form.intensity,
      calories_burned: Number(form.calories_burned) || 0,
      steps: Number(form.steps) || 0,
      notes: form.notes || null
    })
    setSaving(false)
    if (error) {
      setMessage(`Gagal menyimpan: ${error.message}`)
    } else {
      setMessage('Laporan olahraga berhasil disimpan.')
      setForm({ ...emptyForm, date: form.date })
      loadLogs()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-800">Laporan Olahraga Harian</h1>
        <p className="text-sm text-forest-500">Catat aktivitas fisikmu setiap hari.</p>
      </div>

      <form onSubmit={handleSubmit} className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
        {message && (
          <div
            className={`sm:col-span-2 rounded-lg px-3 py-2 text-sm ${
              message.startsWith('Gagal') ? 'bg-red-50 text-red-600' : 'bg-forest-50 text-forest-700'
            }`}
          >
            {message}
          </div>
        )}
        <div>
          <label className="label-field">Tanggal</label>
          <input type="date" name="date" required className="input-field" value={form.date} onChange={handleChange} />
        </div>
        <div>
          <label className="label-field">Jenis olahraga</label>
          <input
            type="text"
            name="exercise_type"
            required
            className="input-field"
            placeholder="Contoh: Jalan cepat, Lari, Yoga"
            value={form.exercise_type}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Durasi (menit)</label>
          <input
            type="number"
            name="duration_minutes"
            required
            min="0"
            className="input-field"
            value={form.duration_minutes}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Intensitas</label>
          <select name="intensity" className="input-field" value={form.intensity} onChange={handleChange}>
            {intensities.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Estimasi kalori terbakar</label>
          <input
            type="number"
            name="calories_burned"
            min="0"
            className="input-field"
            placeholder="kkal"
            value={form.calories_burned}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Jumlah langkah</label>
          <input
            type="number"
            name="steps"
            min="0"
            className="input-field"
            value={form.steps}
            onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Catatan</label>
          <textarea
            name="notes"
            rows={3}
            className="input-field"
            placeholder="Bagaimana rasanya hari ini?"
            value={form.notes}
            onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? 'Menyimpan...' : 'Simpan Laporan'}
          </button>
        </div>
      </form>

      <div className="card">
        <h2 className="mb-3 font-display text-lg font-semibold text-forest-800">Riwayat Terbaru</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-forest-400">Belum ada catatan olahraga.</p>
        ) : (
          <ul className="divide-y divide-forest-100">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{log.exercise_type}</p>
                  <p className="text-forest-500">
                    {new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} · {log.intensity}
                  </p>
                </div>
                <div className="text-right stat-number text-forest-700">
                  <p>{log.duration_minutes} mnt</p>
                  <p className="text-xs text-forest-400">{log.calories_burned} kkal</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
