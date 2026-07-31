import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext.jsx'

const mealTypes = [
  { value: 'sarapan', label: 'Sarapan' },
  { value: 'makan_siang', label: 'Makan Siang' },
  { value: 'makan_malam', label: 'Makan Malam' },
  { value: 'camilan', label: 'Camilan' }
]

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  meal_type: 'sarapan',
  food_name: '',
  calories: '',
  notes: ''
}

export default function FoodJournal() {
  const { user } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [entries, setEntries] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadEntries = async () => {
    const { data } = await supabase
      .from('food_journal')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', form.date)
      .order('created_at', { ascending: true })
    setEntries(data || [])
  }

  useEffect(() => {
    if (user) loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, form.date])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('food_journal').insert({
      user_id: user.id,
      date: form.date,
      meal_type: form.meal_type,
      food_name: form.food_name,
      calories: form.calories ? Number(form.calories) : null,
      notes: form.notes || null
    })
    setSaving(false)
    if (error) {
      setMessage(`Gagal menyimpan: ${error.message}`)
    } else {
      setForm({ ...emptyForm, date: form.date })
      loadEntries()
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('food_journal').delete().eq('id', id)
    loadEntries()
  }

  const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-800">Jurnal Makanan Harian</h1>
        <p className="text-sm text-forest-500">Catat apa yang kamu makan agar lebih sadar akan asupanmu.</p>
      </div>

      <form onSubmit={handleSubmit} className="card grid grid-cols-1 gap-4 sm:grid-cols-2">
        {message && <div className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{message}</div>}
        <div>
          <label className="label-field">Tanggal</label>
          <input type="date" name="date" className="input-field" value={form.date} onChange={handleChange} />
        </div>
        <div>
          <label className="label-field">Waktu makan</label>
          <select name="meal_type" className="input-field" value={form.meal_type} onChange={handleChange}>
            {mealTypes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Nama makanan</label>
          <input
            type="text"
            name="food_name"
            required
            className="input-field"
            placeholder="Contoh: Nasi merah + ayam panggang"
            value={form.food_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Estimasi kalori</label>
          <input
            type="number"
            name="calories"
            min="0"
            className="input-field"
            placeholder="kkal"
            value={form.calories}
            onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Catatan</label>
          <textarea
            name="notes"
            rows={2}
            className="input-field"
            placeholder="Porsi, cara masak, dsb."
            value={form.notes}
            onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? 'Menyimpan...' : 'Tambah ke Jurnal'}
          </button>
        </div>
      </form>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-forest-800">
            Jurnal Tanggal {new Date(form.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
          </h2>
          <span className="chip bg-forest-50 text-forest-700">Total {totalCalories} kkal</span>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-forest-400">Belum ada catatan makanan di tanggal ini.</p>
        ) : (
          <ul className="divide-y divide-forest-100">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{entry.food_name}</p>
                  <p className="text-forest-500">
                    {mealTypes.find((m) => m.value === entry.meal_type)?.label} {entry.notes ? `· ${entry.notes}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="stat-number text-forest-700">{entry.calories ?? '—'} kkal</span>
                  <button onClick={() => handleDelete(entry.id)} className="text-xs text-red-500 hover:underline">
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
