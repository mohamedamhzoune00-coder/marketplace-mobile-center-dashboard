import { useEffect, useState } from 'react'
import api from '../api'
import Modal from '../components/Modal'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'

const emptyForm = {
  nom: '',
  description: '',
  prix: '',
  stock: '',
  marque: '',
  modele: '',
  category_id: '',
  disponible: true,
}

export default function Produits() {
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [produitsRes, categoriesRes] = await Promise.all([
      api.get('/produits'),
      api.get('/categories'),
    ])
    setProduits(produitsRes.data.data || [])
    setCategories(categoriesRes.data.data || [])
    setLoading(false)
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

  function openEdit(produit) {
    setEditing(produit)
    setForm({
      nom: produit.nom,
      description: produit.description || '',
      prix: produit.prix,
      stock: produit.stock,
      marque: produit.marque || '',
      modele: produit.modele || '',
      category_id: produit.category?.id || '',
      disponible: produit.disponible,
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await api.put(`/produits/${editing.id}`, form)
      } else {
        await api.post('/produits', form)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce produit ?')) return
    await api.delete(`/produits/${id}`)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package size={20} className="text-copper" strokeWidth={1.75} />
          <h1 className="text-xl font-semibold text-ink tracking-tight">Produits</h1>
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
      ) : produits.length === 0 ? (
        <div className="text-muted text-sm border border-dashed border-line rounded p-8 text-center">
          Aucun produit pour l'instant. Ajoutez-en un pour commencer.
        </div>
      ) : (
        <div className="border border-line rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel2 text-muted text-xs font-mono text-left">
                <th className="px-4 py-2.5 font-normal">Produit</th>
                <th className="px-4 py-2.5 font-normal text-right">Prix</th>
                <th className="px-4 py-2.5 font-normal text-right">Stock</th>
                <th className="px-4 py-2.5 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="text-ink">{p.nom}</div>
                    <div className="text-muted text-xs">{p.category?.nom}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-ink">
                    {Number(p.prix).toLocaleString('fr-MA')} DH
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-ink">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-muted hover:text-ink transition-colors"
                      >
                        <Pencil size={15} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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
        <Modal title={editing ? 'Modifier le produit' : 'Nouveau produit'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nom" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} required />
            <div>
              <label className="block text-xs font-mono text-muted mb-2">Catégorie</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
                className="w-full bg-panel2 border border-line rounded px-3 py-2.5 text-ink text-sm focus:border-copper transition-colors"
              >
                <option value="">Choisir…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Prix (DH)"
                type="number"
                value={form.prix}
                onChange={(v) => setForm({ ...form, prix: v })}
                required
              />
              <Field
                label="Stock"
                type="number"
                value={form.stock}
                onChange={(v) => setForm({ ...form, stock: v })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Marque" value={form.marque} onChange={(v) => setForm({ ...form, marque: v })} />
              <Field label="Modèle" value={form.modele} onChange={(v) => setForm({ ...form, modele: v })} />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-2">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-panel2 border border-line rounded px-3 py-2.5 text-ink text-sm focus:border-copper transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-copper hover:bg-copper/90 text-base font-medium text-sm rounded px-3 py-2.5 transition-colors"
            >
              {editing ? 'Enregistrer' : 'Créer le produit'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, onChange, ...props }) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted mb-2">{label}</label>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-panel2 border border-line rounded px-3 py-2.5 text-ink text-sm focus:border-copper transition-colors"
      />
    </div>
  )
}
