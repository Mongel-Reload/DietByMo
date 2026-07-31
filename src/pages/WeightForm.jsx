import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext.jsx'
import { WeightChart } from '../components/WeightChart.jsx'

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  weight_kg: '',
  waist_cm: '',
  body_fat_percent: '',
  notes: ''
}

export default function WeightForm() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [photo, setPhoto] = useState(null)
  const [logs, setLogs] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadLogs = async () => {
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    setLogs(data || [])
  }

  useEffect(() => {
    if (user) loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    let photo_url = null
    try {
      if (photo) {
        const ext = photo.name.split('.').pop()
        const path = `${user.id}/${form.date}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('progress-photos')
          .upload(path, photo, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicUrl } = supabase.storage.from('progress-photos').getPublicUrl(path)
        photo_url = publicUrl.publicUrl
      }

      const { error } = await supabase.from('weight_logs').insert({
        user_id: user.id,
        date: form.date,
        weight_kg: Number(form.weight_kg),
        waist_cm: form.waist_cm ? Number(form.waist_cm) : null,
        body_fat_percent: form.body_fat_percent ? Number(form.body_fat_percent) : null,
        notes: form.notes || null,
        photo_url
      })
      if (error) throw error

      setMessage('Laporan berat badan berhasil disimpan.')
      setForm({ ...emptyForm, date: form.date })
      setPhoto(null)
      loadLogs()
    } catch (err) {
      setMessage(`Gagal menyimpan: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const chartData = logs.map((w) => ({
    label: new Date(w.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    weight: w.weight_kg
  }))

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-800">Laporan Berat Badan Mingguan</h1>
        <p className="text-sm text-forest-500">Ukur dan catat progresmu setiap minggu di hari yang sama.</p>
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
          <label className="label-field">Berat badan (kg)</label>
          <input
            type="number"
            step="0.1"
            name="weight_kg"
            required
            className="input-field"
            value={form.weight_kg}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Lingkar perut (cm)</label>
          <input
            type="number"
            step="0.1"
            name="waist_cm"
            className="input-field"
            value={form.waist_cm}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label-field">Persentase lemak tubuh (%)</label>
          <input
            type="number"
            step="0.1"
            name="body_fat_percent"
            className="input-field"
            value={form.body_fat_percent}
            onChange={handleChange}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Foto progres (opsional)</label>
          <input
            type="file"
            accept="image/*"
            className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-forest-700 file:px-3 file:py-1.5 file:text-white"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Catatan</label>
          <textarea
            name="notes"
            rows={3}
            className="input-field"
            placeholder="Apa yang berbeda minggu ini?"
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
        <h2 className="mb-3 font-display text-lg font-semibold text-forest-800">Grafik Perkembangan</h2>
        <WeightChart data={chartData} targetWeight={profile?.target_weight} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-display text-lg font-semibold text-forest-800">Riwayat</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-forest-400">Belum ada catatan berat badan.</p>
        ) : (
          <ul className="divide-y divide-forest-100">
            {[...logs].reverse().map((log) => (
              <li key={log.id} className="flex items-center gap-3 py-3 text-sm">
                {log.photo_url && (
                  <img src={log.photo_url} alt="Foto progres" className="h-12 w-12 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-ink">{log.weight_kg} kg</p>
                  <p className="text-forest-500">
                    {new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {log.waist_cm ? ` · Pinggang ${log.waist_cm} cm` : ''}
                    {log.body_fat_percent ? ` · Lemak ${log.body_fat_percent}%` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
