import { useEffect, useState } from 'react'
import api from '../api'
import { Clock } from 'lucide-react'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function Horaires() {
  const [horaires, setHoraires] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/horaires-boutiques')
        const map = {}
        for (const h of data.data || []) {
          map[h.jour] = h
        }
        setHoraires(map)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function updateLocal(jour, field, value) {
    setHoraires((prev) => ({
      ...prev,
      [jour]: { ...(prev[jour] || { jour }), [field]: value },
    }))
  }

  async function handleSave(jour) {
    setSaving(jour)
    setNotice(null)
    const h = horaires[jour] || { jour }
    const payload = {
      jour,
      ferme: !!h.ferme,
      heure_ouverture: h.ferme ? null : h.heure_ouverture,
      heure_fermeture: h.ferme ? null : h.heure_fermeture,
    }
    try {
      if (h.id) {
        const { data } = await api.put(`/horaires-boutiques/${h.id}`, payload)
        setHoraires((prev) => ({ ...prev, [jour]: data.data }))
      } else {
        const { data } = await api.post('/horaires-boutiques', payload)
        setHoraires((prev) => ({ ...prev, [jour]: data.data }))
      }
      setNotice({ type: 'success', text: `Horaire de ${jour} enregistré.` })
      setTimeout(() => setNotice(null), 2500)
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Erreur de sauvegarde.' })
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <div className="text-muted text-sm font-mono">Chargement…</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Clock size={20} className="text-copper" strokeWidth={1.75} />
        <h1 className="text-xl font-semibold text-ink tracking-tight">Horaires d'ouverture</h1>
      </div>

      {notice && (
        <div
          className={`mb-4 text-sm border rounded px-3 py-2 ${
            notice.type === 'error'
              ? 'text-danger bg-danger/10 border-danger/30'
              : 'text-teal bg-teal/10 border-teal/30'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="space-y-2">
        {JOURS.map((jour) => {
          const h = horaires[jour] || {}
          const isClosed = !!h.ferme
          const isSaving = saving === jour

          return (
            <div
              key={jour}
              className="bg-panel border border-line rounded px-4 py-3"
            >
              {/* Ligne 1 : jour + fermé + bouton */}
              <div className="flex items-center gap-3 mb-3 md:mb-0">
                <div className="w-20 md:w-24 text-sm text-ink font-medium md:font-normal shrink-0">
                  {jour}
                </div>

                <label className="flex items-center gap-1.5 text-xs text-muted shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => updateLocal(jour, 'ferme', e.target.checked)}
                    className="accent-copper"
                  />
                  Fermé
                </label>

                {/* Enregistrer : caché sur mobile dans cette ligne */}
                <button
                  onClick={() => handleSave(jour)}
                  disabled={isSaving}
                  className="hidden md:inline-block ml-auto text-xs font-medium text-copper hover:text-copper/80 disabled:opacity-50 transition-colors shrink-0"
                >
                  {isSaving ? '…' : 'Enregistrer'}
                </button>
              </div>

              {/* Ligne 2 : heures + bouton mobile */}
              {!isClosed && (
                <div className="flex items-center gap-2 md:ml-[6.5rem]">
                  <input
                    type="time"
                    value={h.heure_ouverture?.slice(0, 5) || ''}
                    onChange={(e) => updateLocal(jour, 'heure_ouverture', e.target.value)}
                    className="flex-1 md:flex-none bg-panel2 border border-line rounded px-2 py-1.5 text-ink text-xs font-mono focus:border-copper focus:outline-none transition-colors"
                  />
                  <span className="text-muted text-xs">—</span>
                  <input
                    type="time"
                    value={h.heure_fermeture?.slice(0, 5) || ''}
                    onChange={(e) => updateLocal(jour, 'heure_fermeture', e.target.value)}
                    className="flex-1 md:flex-none bg-panel2 border border-line rounded px-2 py-1.5 text-ink text-xs font-mono focus:border-copper focus:outline-none transition-colors"
                  />

                  {/* Enregistrer : visible sur mobile à droite des heures */}
                  <button
                    onClick={() => handleSave(jour)}
                    disabled={isSaving}
                    className="md:hidden ml-auto text-xs font-medium text-copper hover:text-copper/80 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {isSaving ? '…' : 'Enregistrer'}
                  </button>
                </div>
              )}

              {/* Bouton mobile quand fermé */}
              {isClosed && (
                <button
                  onClick={() => handleSave(jour)}
                  disabled={isSaving}
                  className="md:hidden text-xs font-medium text-copper hover:text-copper/80 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? '…' : 'Enregistrer'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}