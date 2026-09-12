import { useEffect, useState } from 'react'
import api from '../api'
import StatusTag from '../components/StatusTag'
import { ShieldAlert } from 'lucide-react'

export default function Signalements() {
  const [signalements, setSignalements] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await api.get('/signalements')
    setSignalements(data.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatut(id, statut) {
    await api.put(`/signalements/${id}`, { statut })
    load()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert size={20} className="text-copper" strokeWidth={1.75} />
        <h1 className="text-xl font-semibold text-ink tracking-tight">Signalements</h1>
      </div>

      {loading ? (
        <div className="text-muted text-sm font-mono">Chargement…</div>
      ) : signalements.length === 0 ? (
        <div className="text-muted text-sm border border-dashed border-line rounded p-8 text-center">
          Aucun signalement.
        </div>
      ) : (
        <div className="space-y-3">
          {signalements.map((s) => (
            <div key={s.id} className="bg-panel border border-line rounded p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-ink text-sm font-medium">{s.produit?.nom}</span>
                    <StatusTag value={s.statut} />
                  </div>
                  <div className="text-muted text-xs font-mono mb-2">
                    signalé par {s.user?.name}
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{s.raison}</p>
                </div>

                {s.statut === 'en_attente' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateStatut(s.id, 'accepte')}
                      className="text-xs font-medium bg-teal/15 text-teal border border-teal/40 rounded px-2.5 py-1.5 hover:bg-teal/25 transition-colors"
                    >
                      Traiter
                    </button>
                    <button
                      onClick={() => updateStatut(s.id, 'refuse')}
                      className="text-xs font-medium bg-danger/15 text-danger border border-danger/40 rounded px-2.5 py-1.5 hover:bg-danger/25 transition-colors"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
