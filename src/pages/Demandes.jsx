import { useEffect, useState } from 'react'
import api from '../api'
import StatusTag from '../components/StatusTag'
import { ClipboardList, Check, X } from 'lucide-react'

export default function Demandes() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingOn, setActingOn] = useState(null)
  const [notice, setNotice] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/demandes')
      setDemandes(data.data || [])
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Erreur de chargement.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAction(id, action) {
    setActingOn(id)
    try {
      await api.patch(`/demandes/${id}/${action}`)
      load()
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Action impossible.' })
    } finally {
      setActingOn(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ClipboardList size={20} className="text-copper" strokeWidth={1.75} />
        <h1 className="text-xl font-semibold text-ink tracking-tight">Demandes</h1>
      </div>

      {notice && (
        <div className="mb-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="text-muted text-sm font-mono">Chargement…</div>
      ) : demandes.length === 0 ? (
        <div className="text-muted text-sm border border-dashed border-line rounded p-8 text-center">
          Aucune demande pour l'instant.
        </div>
      ) : (
        <div className="space-y-3">
          {demandes.map((d) => (
            <div key={d.id} className="bg-panel border border-line rounded p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-ink text-sm font-medium">{d.produit?.nom}</span>
                    <StatusTag value={d.statut} />
                  </div>
                  <div className="text-muted text-xs space-x-3 font-mono">
                    <span>{d.nom_client}</span>
                    <span>{d.telephone}</span>
                    <span>x{d.quantite}</span>
                  </div>
                  {d.message && (
                    <p className="text-muted text-sm mt-2 leading-relaxed">{d.message}</p>
                  )}
                </div>

                {d.statut === 'en_attente' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(d.id, 'accepter')}
                      disabled={actingOn === d.id}
                      className="flex items-center gap-1.5 text-xs font-medium bg-teal/15 text-teal border border-teal/40 rounded px-2.5 py-1.5 hover:bg-teal/25 disabled:opacity-50 transition-colors"
                    >
                      <Check size={14} strokeWidth={2} />
                      Accepter
                    </button>
                    <button
                      onClick={() => handleAction(d.id, 'refuser')}
                      disabled={actingOn === d.id}
                      className="flex items-center gap-1.5 text-xs font-medium bg-danger/15 text-danger border border-danger/40 rounded px-2.5 py-1.5 hover:bg-danger/25 disabled:opacity-50 transition-colors"
                    >
                      <X size={14} strokeWidth={2} />
                      Refuser
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
