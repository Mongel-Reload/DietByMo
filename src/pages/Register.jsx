import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const data = await signUp(email, password, fullName)
      if (data.session) {
        navigate('/profil')
      } else {
        setInfo('Akun berhasil dibuat. Silakan cek email untuk verifikasi, lalu masuk.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest-700 font-display text-xl font-semibold text-white">
            M
          </span>
          <h1 className="font-display text-2xl font-semibold text-forest-800">Buat akun baru</h1>
          <p className="mt-1 text-sm text-forest-500">Mulai catat dan pantau progres dietmu</p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          {info && <div className="rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-700">{info}</div>}
          <div>
            <label className="label-field">Nama lengkap</label>
            <input
              type="text"
              required
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama kamu"
            />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="label-field">Kata sandi</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-forest-600">
          Sudah punya akun?{' '}
          <Link to="/masuk" className="font-semibold text-forest-800 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
