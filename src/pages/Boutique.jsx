import { useEffect, useState } from 'react'
import api from '../api'
import { Store } from 'lucide-react'

const emptyForm = {
  nom: '',
  description: '',
  telephone: '',
  email: '',
  adresse: '',
  emplacement: '',
}

export default function Boutique() {
  const [boutique, setBoutique] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/user')
        // on cherche la boutique du vendeur via l'endpoint boutiques + filtre local
        // (le backend n'expose pas /me/boutique directement)
        const boutiquesRes = await api.get('/boutiques')
        const mine = (boutiquesRes.data.data || []).find(
          (b) => b.proprietaire?.id === data.id
        )
        if (mine) {
          setBoutique(mine)
          setForm({
            nom: mine.nom || '',
            description: mine.description || '',
            telephone: mine.telephone || '',
            email: mine.email || '',
            adresse: mine.adresse || '',
            emplacement: mine.emplacement || '',
          })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      if (boutique) {
        const { data } = await api.put(`/boutiques/${boutique.id}`, form)
        setBoutique(data.data)
        setMessage({ type: 'ok', text: 'Boutique mise à jour.' })
      } else {
        const { data } = await api.post('/boutiques', form)
        setBoutique(data.data)
        setMessage({ type: 'ok', text: 'Boutique créée avec succès.' })
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Une erreur est survenue.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted text-sm font-mono">Chargement…</div>
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Store size={20} className="text-copper" strokeWidth={1.75} />
        <h1 className="text-xl font-semibold text-ink tracking-tight">
          {boutique ? 'Ma boutique' : 'Créer ma boutique'}
        </h1>
      </div>

      {!boutique && (
        <p className="text-muted text-sm mb-6">
          Vous devez créer votre boutique avant de pouvoir ajouter des produits.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nom de la boutique" name="nom" value={form.nom} onChange={handleChange} required />
        <Field
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          textarea
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Téléphone" name="telephone" value={form.telephone} onChange={handleChange} required />
          <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
        </div>
        <Field label="Adresse" name="adresse" value={form.adresse} onChange={handleChange} required />
        <Field
          label="Emplacement (dans le centre)"
          name="emplacement"
          value={form.emplacement}
          onChange={handleChange}
          placeholder="Bloc A, niveau 2…"
          required
        />

        {message && (
          <div
            className={`text-sm rounded px-3 py-2 border ${
              message.type === 'ok'
                ? 'text-teal bg-teal/10 border-teal/30'
                : 'text-danger bg-danger/10 border-danger/30'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-copper hover:bg-copper/90 disabled:opacity-50 text-base font-medium text-sm rounded px-4 py-2.5 transition-colors"
        >
          {saving ? 'Enregistrement…' : boutique ? 'Enregistrer' : 'Créer la boutique'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, textarea, ...props }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label className="block text-xs font-mono text-muted mb-2">{label}</label>
      <Tag
        {...props}
        rows={textarea ? 3 : undefined}
        className="w-full bg-panel border border-line rounded px-3 py-2.5 text-ink text-sm placeholder:text-muted/60 focus:border-copper transition-colors"
      />
    </div>
  )
}
