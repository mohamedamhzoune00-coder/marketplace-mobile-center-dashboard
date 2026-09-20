import { useEffect, useState } from 'react'
import api from '../api'
import Modal from '../components/Modal'
import { FolderTree, Plus, Pencil, Trash2 } from 'lucide-react'

const emptyForm = { nom: '', description: '', parent_id: '', ordre: 0, actif: true }

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/categories')
      setCategories(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(cat) {
    setEditing(cat)
    setForm({
      nom: cat.nom,
      description: cat.description || '',
      parent_id: cat.parent_id || '',
      ordre: cat.ordre || 0,
      actif: cat.actif,
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = { ...form, parent_id: form.parent_id || null }
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload)
      } else {
        await api.post('/categories', payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette catégorie ?')) return
    try {
      await api.delete(`/categories/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Suppression impossible.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FolderTree size={20} className="text-copper" strokeWidth={1.75} />
          <h1 className="text-xl font-semibold text-ink tracking-tight">Catégories</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-copper hover:bg-copper/90 text-base font-medium text-sm rounded px-3.5 py-2 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Ajouter
        </button>
      </div>

      {loading ? (
        <div className="text-muted text-sm font-mono">Chargement…</div>
      ) : categories.length === 0 ? (
        <div className="text-muted text-sm border border-dashed border-line rounded p-8 text-center">
          Aucune catégorie pour l'instant.
        </div>
      ) : (
        <div className="border border-line rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel2 text-muted text-xs font-mono text-left">
                <th className="px-4 py-2.5 font-normal">Nom</th>
                <th className="px-4 py-2.5 font-normal">Parent</th>
                <th className="px-4 py-2.5 font-normal">Statut</th>
                <th className="px-4 py-2.5 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-3 text-ink">{c.nom}</td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">
                    {categories.find((p) => p.id === c.parent_id)?.nom || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        c.actif
                          ? 'text-teal border-teal/40 bg-teal/10'
                          : 'text-muted border-line bg-panel2'
                      }`}
                    >
                      {c.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-muted hover:text-ink transition-colors"
                      >
                        <Pencil size={15} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 size={15} strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-2">Nom</label>
              <input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
                className="w-full bg-panel2 border border-line rounded px-3 py-2.5 text-ink text-sm focus:border-copper transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-2">Catégorie parente (optionnel)</label>
              <select
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                className="w-full bg-panel2 border border-line rounded px-3 py-2.5 text-ink text-sm focus:border-copper transition-colors"
              >
                <option value="">Aucune (catégorie principale)</option>
                {categories
                  .filter((c) => !editing || c.id !== editing.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-2">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-panel2 border border-line rounded px-3 py-2.5 text-ink text-sm focus:border-copper transition-colors"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              />
              Active
            </label>

            {error && (
              <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-copper hover:bg-copper/90 text-base font-medium text-sm rounded px-3 py-2.5 transition-colors"
            >
              {editing ? 'Enregistrer' : 'Créer la catégorie'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}