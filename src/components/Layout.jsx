import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutGrid,
  Package,
  ClipboardList,
  Clock,
  Store,
  LogOut,
  CircuitBoard,
  ShieldAlert,
} from 'lucide-react'

const vendeurLinks = [
  { to: '/', label: 'Vue générale', icon: LayoutGrid },
  { to: '/boutique', label: 'Ma boutique', icon: Store },
  { to: '/produits', label: 'Produits', icon: Package },
  { to: '/demandes', label: 'Demandes', icon: ClipboardList },
  { to: '/horaires', label: 'Horaires', icon: Clock },
]

const adminLinks = [
  { to: '/', label: 'Vue générale', icon: LayoutGrid },
  { to: '/boutiques', label: 'Boutiques', icon: Store },
  { to: '/signalements', label: 'Signalements', icon: ShieldAlert },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = user?.role === 'super_admin' ? adminLinks : vendeurLinks

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-panel border-r border-line flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-line">
          <div className="w-8 h-8 rounded bg-copper/15 border border-copper/40 flex items-center justify-center shrink-0">
            <CircuitBoard size={16} className="text-copper" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="text-ink text-sm font-semibold tracking-tight truncate">
              Mobile Center
            </div>
            <div className="text-muted text-[11px] font-mono truncate">
              {user?.role === 'super_admin' ? 'administration' : 'console vendeur'}
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-panel2 text-ink'
                    : 'text-muted hover:text-ink hover:bg-panel2/60'
                }`
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="px-3 py-2 mb-1">
            <div className="text-ink text-sm truncate">{user?.name}</div>
            <div className="text-muted text-[11px] font-mono truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
