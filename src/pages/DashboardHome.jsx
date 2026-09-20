import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import {
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import SalesChart from '../components/SalesChart'
import SignalementsRecents from '../components/SignalementsRecents'

export default function DashboardHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/stats/dashboard')
        setStats(data)
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || 'Erreur de chargement.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const isAdmin = user?.role === 'super_admin'

  function formatNumber(n) {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n)
  }

  function formatDelta(delta) {
    if (delta === 0) return 'Stable'
    const sign = delta > 0 ? '+' : ''
    return `${sign}${delta}% vs. last week`
  }

  return (
    <div className="space-y-6">
      {/* Hero header avec image Bab Mansour */}
      <div className="relative overflow-hidden rounded-lg border border-line bg-panel min-h-[200px] md:min-h-[240px]">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/bab-mansour.jpg)' }}
          aria-hidden="true"
        />

        {/* Overlay gradient (lisibilité du texte à gauche) */}
        <div className="absolute inset-0 bg-gradient-to-r from-base via-base/90 to-base/30" />

        {/* Cercles décoratifs animés */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-copper/20 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-teal/10 blur-3xl animate-pulse pointer-events-none" />

        {/* Contenu (texte) */}
        <div className="relative z-10 p-6 md:p-8 max-w-md">
          <h1 className="text-2xl md:text-3xl font-semibold text-ink tracking-tight mb-2">
            Vue générale
          </h1>
          <p className="text-muted text-sm md:text-base">
            Bienvenue {user?.name}, voici un aperçu de l'activité{' '}
            {isAdmin ? 'globale' : 'de votre boutique'}.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="text-muted text-sm font-mono">Chargement…</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Chiffre d'Affaires"
              value={`${formatNumber(stats.chiffre_affaires.valeur)} MAD`}
              delta={formatDelta(stats.chiffre_affaires.delta)}
              deltaType={stats.chiffre_affaires.delta >= 0 ? 'up' : 'down'}
              color="copper"
            />
            <StatCard
              icon={Users}
              label="Nombre d'Utilisateurs"
              value={formatNumber(stats.utilisateurs.total)}
              delta={formatDelta(stats.utilisateurs.delta)}
              deltaType="up"
              color="teal"
            />
            <StatCard
              icon={ShoppingCart}
              label="Commandes en attente"
              value={formatNumber(stats.commandes.total)}
              delta={formatDelta(stats.commandes.delta)}
              deltaType="up"
              color="ink"
            />
            <StatCard
              icon={AlertTriangle}
              label="Alerte Stocks"
              value={formatNumber(stats.alertes_stock.total)}
              delta="Produits critiques"
              deltaType="down"
              color="danger"
            />
          </div>

          {/* Chart + Signalements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesChart data={stats.ventes_7_jours} />
            <SignalementsRecents signalements={stats.signalements_recents} />
          </div>

          {/* Boutiques populaires */}
          <div className="bg-panel border border-line rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <h3 className="text-ink text-sm font-semibold tracking-tight">
                Boutiques Populaires
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-panel2 text-muted text-xs font-mono text-left">
                    <th className="px-5 py-2.5 font-normal">Boutique</th>
                    <th className="px-5 py-2.5 font-normal">Propriétaire</th>
                    <th className="px-5 py-2.5 font-normal">Ventes (Total)</th>
                    <th className="px-5 py-2.5 font-normal">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.boutiques_populaires.length === 0 ? (
                    <tr className="border-t border-line">
                      <td colSpan={4} className="px-5 py-6 text-center text-muted text-sm">
                        Aucune boutique.
                      </td>
                    </tr>
                  ) : (
                    stats.boutiques_populaires.map((b) => (
                      <tr key={b.id} className="border-t border-line">
                        <td className="px-5 py-3 text-ink">{b.nom}</td>
                        <td className="px-5 py-3 text-muted">{b.proprietaire}</td>
                        <td className="px-5 py-3 text-muted font-mono text-xs">
                          {formatNumber(b.ventes)} MAD
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded border ${
                              b.actif
                                ? 'text-teal border-teal/40 bg-teal/10'
                                : 'text-muted border-muted/40 bg-muted/10'
                            }`}
                          >
                            {b.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}