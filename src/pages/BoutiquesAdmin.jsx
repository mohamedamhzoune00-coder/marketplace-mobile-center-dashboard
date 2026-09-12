import { useEffect, useState } from 'react'
import api from '../api'
import StatusTag from '../components/StatusTag'
import { Store } from 'lucide-react'

export default function BoutiquesAdmin() {
  const [boutiques, setBoutiques] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await api.get('/boutiques')
      setBoutiques(data.data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleActif(b) {
    const { data } = await api.put(`/boutiques/${b.id}`, { actif: !b.actif })
    setBoutiques((prev) => prev.map((x) => (x.id === b.id ? data.data : x)))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Store size={20} className="text-copper" strokeWidth={1.75} />
        <h1 className="text-xl font-semibold text-ink tracking-tight">Boutiques</h1>
      </div>

      {loading ? (
        <div className="text-muted text-sm font-mono">Chargement…</div>
      ) : (
        <div className="border border-line rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel2 text-muted text-xs font-mono text-left">
                <th className="px-4 py-2.5 font-normal">Boutique</th>
                <th className="px-4 py-2.5 font-normal">Propriétaire</th>
                <th className="px-4 py-2.5 font-normal">Emplacement</th>
                <th className="px-4 py-2.5 font-normal">Statut</th>
                <th className="px-4 py-2.5 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {boutiques.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-4 py-3 text-ink">{b.nom}</td>
                  <td className="px-4 py-3 text-muted">{b.proprietaire?.name}</td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">{b.emplacement}</td>
                  <td className="px-4 py-3">
                    <StatusTag value={b.actif ? 'actif' : 'inactif'} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActif(b)}
                      className="text-xs font-medium text-copper hover:text-copper/80 transition-colors"
                    >
                      {b.actif ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
