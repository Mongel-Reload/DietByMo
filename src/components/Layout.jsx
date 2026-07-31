import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Beranda', icon: '🏠' },
  { to: '/olahraga', label: 'Olahraga', icon: '🏃' },
  { to: '/berat-badan', label: 'Berat', icon: '⚖️' },
  { to: '/kebiasaan', label: 'Kebiasaan', icon: '✅' },
  { to: '/jurnal-makan', label: 'Jurnal', icon: '🍽️' }
]

export function Layout({ children }) {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/masuk')
  }

  return (
    <div className="min-h-screen bg-sand-100 pb-20 sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-forest-100 bg-sand-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-700 font-display text-sm font-semibold text-white">
              M
            </span>
            <span className="font-display text-lg font-semibold text-forest-800">DietTrackbyMo</span>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-forest-700 text-white' : 'text-forest-700 hover:bg-forest-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/laporan-mingguan"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-forest-700 text-white' : 'text-forest-700 hover:bg-forest-50'
                }`
              }
            >
              Laporan
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-mango-500 text-white' : 'text-mango-600 hover:bg-mango-500/10'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <NavLink
              to="/profil"
              className="hidden text-sm font-medium text-forest-700 hover:underline sm:block"
            >
              {profile?.full_name || 'Profil'}
            </NavLink>
            <button onClick={handleSignOut} className="btn-secondary !px-3 !py-1.5 text-xs">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-forest-100 bg-white/95 backdrop-blur sm:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? 'text-forest-700' : 'text-forest-400'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
