import { useEffect, useState } from 'react'
import api from '../api'
import { ScrollText } from 'lucide-react'

export default function JournalAuditAdmin() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/journaux-audit')
        setLogs(data.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ScrollText size={20} className="text-copper" strokeWidth={1.75} />
        <h1 className="text-xl font-semibold text-ink tracking-tight">Journaux d'audit</h1>
      </div>

      {loading ? (
        <div className="text-muted text-sm font-mono">Chargement…</div>
      ) : logs.length === 0 ? (
        <div className="text-muted text-sm border border-dashed border-line rounded p-8 text-center">
          Aucun événement enregistré.
        </div>
      ) : (
        <div className="border border-line rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel2 text-muted text-xs font-mono text-left">
                <th className="px-4 py-2.5 font-normal">Action</th>
                <th className="px-4 py-2.5 font-normal">Table</th>
                <th className="px-4 py-2.5 font-normal">Utilisateur</th>
                <th className="px-4 py-2.5 font-normal">Détails</th>
                <th className="px-4 py-2.5 font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-line">
                  <td className="px-4 py-3 text-ink font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">{log.table_concernee}</td>
                  <td className="px-4 py-3 text-muted text-xs">{log.user?.name || '—'}</td>
                  <td className="px-4 py-3 text-muted text-xs">{log.details}</td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
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