import { useState } from 'react'
import {
  LayoutGrid,
  Package,
  ClipboardList,
  Clock,
  Store,
  LogOut,
  CircuitBoard,
  ShieldAlert,
  FolderTree,
  ScrollText,
  Menu,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
  { to: '/categories-admin', label: 'Catégories', icon: FolderTree },
  { to: '/signalements', label: 'Signalements', icon: ShieldAlert },
  { to: '/journaux-audit', label: 'Journaux', icon: ScrollText },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = user?.role === 'super_admin' ? adminLinks : vendeurLinks

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex bg-base">
      {/* Overlay mobile */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 shrink-0
          bg-panel border-r border-line
          flex flex-col
          transform transition-transform duration-200 ease-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-60 md:shrink-0
        `}
      >
        {/* Header sidebar */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-line">
          <div className="w-8 h-8 rounded bg-copper/15 border border-copper/40 flex items-center justify-center shrink-0">
            <CircuitBoard size={16} className="text-copper" strokeWidth={1.75} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-ink text-sm font-semibold tracking-tight truncate">
              Mobile Center
            </div>
            <div className="text-muted text-[11px] font-mono truncate">
              {user?.role === 'super_admin' ? 'administration' : 'console vendeur'}
            </div>
          </div>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Fermer le menu"
            className="md:hidden p-1.5 rounded text-muted hover:text-ink hover:bg-panel2 transition-colors"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-panel2 text-ink'
                    : 'text-muted hover:text-ink hover:bg-panel2/60'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-line p-3">
          <div className="px-3 py-2 mb-1">
            <div className="text-ink text-sm truncate">{user?.name}</div>
            <div className="text-muted text-[11px] font-mono truncate">
              {user?.email}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-sm text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 h-16 bg-panel/95 backdrop-blur border-b border-line">
          <div className="h-full flex items-center justify-between px-4">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="p-2 -ml-2 rounded text-muted hover:text-ink hover:bg-panel2 transition-colors"
            >
              <Menu size={21} strokeWidth={1.75} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-copper/15 border border-copper/40 flex items-center justify-center">
                <CircuitBoard size={14} className="text-copper" strokeWidth={1.75} />
              </div>
              <span className="text-ink text-sm font-semibold">Mobile Center</span>
            </div>

            <div className="w-8" />
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="w-full max-w-5xl mx-auto px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}