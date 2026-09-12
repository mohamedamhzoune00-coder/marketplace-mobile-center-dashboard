import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { Package, ClipboardList, Store, AlertTriangle } from 'lucide-react'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-panel border border-line rounded p-5">
      <div className="flex items-center justify-between mb-4">
        <Icon size={18} strokeWidth={1.75} className={accent ? 'text-copper' : 'text-muted'} />
      </div>
      <div className="text-2xl font-mono text-ink mb-1">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ produits: 0, demandes: 0, enAttente: 0, boutique: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        if (user.role === 'vendeur') {
          const [produitsRes, demandesRes] = await Promise.all([
            api.get('/produits'),
            api.get('/demandes').catch(() => ({ data: { data: [] } })),
          ])
          const demandes = demandesRes.data.data || []
          setStats({
            produits: produitsRes.data.meta?.total ?? produitsRes.data.data?.length ?? 0,
            demandes: demandes.length,
            enAttente: demandes.filter((d) => d.statut === 'en_attente').length,
          })
        }
      } catch {
        // silence — la page affiche juste 0 si un endpoint échoue
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink tracking-tight">
          Bonjour, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-muted text-sm mt-1">Voici l'état de votre activité aujourd'hui.</p>
      </div>

      {loading ? (
        <div className="text-muted text-sm font-mono">Chargement…</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Package} label="Produits en ligne" value={stats.produits} />
          <StatCard icon={ClipboardList} label="Demandes reçues" value={stats.demandes} />
          <StatCard
            icon={AlertTriangle}
            label="En attente de réponse"
            value={stats.enAttente}
            accent
          />
        </div>
      )}
    </div>
  )
}
