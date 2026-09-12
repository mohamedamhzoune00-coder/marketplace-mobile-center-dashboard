import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CircuitBoard } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'vendeur' || user.role === 'super_admin') {
        navigate('/')
      } else {
        setError("Ce compte n'a pas accès à la console.")
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Connexion impossible. Vérifiez vos identifiants.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded bg-copper/15 border border-copper/40 flex items-center justify-center">
            <CircuitBoard size={20} className="text-copper" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-ink font-semibold tracking-tight">Mobile Center</div>
            <div className="text-muted text-xs font-mono">console vendeur / admin</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-panel border border-line rounded px-3 py-2.5 text-ink text-sm placeholder:text-muted/60 focus:border-copper transition-colors"
              placeholder="vous@boutique.ma"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted mb-2">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-panel border border-line rounded px-3 py-2.5 text-ink text-sm placeholder:text-muted/60 focus:border-copper transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-copper hover:bg-copper/90 disabled:opacity-50 text-base font-medium text-sm rounded px-3 py-2.5 transition-colors"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
