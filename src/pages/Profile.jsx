import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext.jsx'

const activityLevels = [
  { value: 'rendah', label: 'Rendah (jarang bergerak / kerja duduk)' },
  { value: 'sedang', label: 'Sedang (aktif 1-3 hari/minggu)' },
  { value: 'tinggi', label: 'Tinggi (aktif 4-6 hari/minggu)' },
  { value: 'sangat_tinggi', label: 'Sangat tinggi (atlet / kerja fisik berat)' }
]

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    height_cm: '',
    initial_weight: '',
    target_weight: '',
    activity_level: 'sedang',
    daily_water_target_ml: 2000,
    daily_step_target: 8000
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        height_cm: profile.height_cm || '',
        initial_weight: profile.initial_weight || '',
        target_weight: profile.target_weight || '',
        activity_level: profile.activity_level || 'sedang',
        daily_water_target_ml: profile.daily_water_target_ml || 2000,
        daily_step_target: profile.daily_step_target || 8000
      })
    }
  }, [profile])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: form.full_name,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      initial_weight: form.initial_weight ? Number(form.initial_weight) : null,
      target_weight: form.target_weight ? Number(form.target_weight) : null,
      activity_level: form.activity_level,
      daily_water_target_ml: Number(form.daily_water_target_ml) || 2000,
      daily_step_target: Number(form.daily_step_target) || 8000
    })
    setSaving(false)
    if (error) {
      setMessage(`Gagal menyimpan: ${error.message}`)
    } else {
      setMessage('Profil berhasil diperbarui.')
      refreshProfile()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-800">Profil Saya</h1>
        <p className="text-sm text-forest-500">Atur data dasar untuk perhitungan target dietmu.</p>
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
        <div className="sm:col-span-2">
          <label className="label-field">Nama lengkap</label>
          <input type="text" name="full_name" className="input-field" value={form.full_name} onChange={handleChange} />
        </div>
        <div>
          <label className="label-field">Tinggi badan (cm)</label>
          <input type="number" name="height_cm" className="input-field" value={form.height_cm} onChange={handleChange} />
        </div>
        <div>
          <label className="label-field">Tingkat aktivitas</label>
          <select name="activity_level" className="input-field" value={form.activity_level} onChange={handleChange}>
            {activityLevels.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Berat badan awal (kg)</label>
          <input
            type="number"
            step="0.1"
            name="initial_weight"
            className="input-field"
            value={form.initial_weight}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Berat badan target (kg)</label>
          <input
            type="number"
            step="0.1"
            name="target_weight"
            className="input-field"
            value={form.target_weight}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Target minum air harian (ml)</label>
          <input
            type="number"
            name="daily_water_target_ml"
            className="input-field"
            value={form.daily_water_target_ml}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Target langkah harian</label>
          <input
            type="number"
            name="daily_step_target"
            className="input-field"
            value={form.daily_step_target}
            onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </div>
  )
}
