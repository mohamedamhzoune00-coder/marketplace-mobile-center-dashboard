import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Store,
  ShoppingCart,
  Search,
  Smartphone,
  ShieldCheck,
  Star,
  X,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
} from 'lucide-react'
import api from '../api'
import ChatbotWidget from '../components/ChatbotWidget'

// Helper image produit
function getProductImageUrl(p) {
  if (!p) return null
  const firstImg = p.images?.[0]
  if (!firstImg) return null
  if (typeof firstImg === 'string') {
    return firstImg.startsWith('http') ? firstImg : `http://127.0.0.1:8000/storage/${firstImg}`
  }
  if (firstImg.url) return firstImg.url
  if (firstImg.chemin) return `http://127.0.0.1:8000/storage/${firstImg.chemin}`
  return null
}

// Helper logo boutique
function getBoutiqueLogoUrl(b) {
  if (!b?.logo) return null
  return b.logo.startsWith('http') ? b.logo : `http://127.0.0.1:8000/storage/${b.logo}`
}

export default function BoutiquePage() {
  const { id } = useParams()
  const [boutique, setBoutique] = useState(null)
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderForm, setOrderForm] = useState({ nom_client: '', telephone_client: '', notes: '' })

  useEffect(() => {
    async function fetchData() {
      try {
        const [bRes, pRes] = await Promise.allSettled([
          api.get(`/boutiques/${id}`),
          api.get('/produits'),
        ])

        if (bRes.status === 'fulfilled') {
          setBoutique(bRes.value.data?.data || bRes.value.data)
        }
        if (pRes.status === 'fulfilled') {
          const all = pRes.value.data?.data || pRes.value.data || []
          // نفلتر غير منتجات هاد البوتيك
          setProduits(all.filter(p => String(p.boutique?.id || p.boutique_id) === String(id)))
        }
      } catch (err) {
        console.error('Erreur BoutiquePage:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Filtre par recherche
  const filteredProduits = produits.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.nom?.toLowerCase().includes(q) ||
      p.marque?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  })

  // Soumission commande
  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      await api.post('/demandes', {
        produit_id: selectedProduct.id,
        nom_client: orderForm.nom_client,
        telephone: orderForm.telephone_client,
        message: orderForm.notes || `Demande via page boutique ${boutique?.nom}`,
        quantite: 1,
      })
      setOrderSuccess(true)
      setTimeout(() => {
        setOrderSuccess(false)
        setOrderModalOpen(false)
        setOrderForm({ nom_client: '', telephone_client: '', notes: '' })
      }, 2500)
    } catch (err) {
      alert(err.response?.data?.message || 'وقع مشكل فـ إرسال الطلب')
    }
  }

  // Gradient de secours si pas de logo
  const headerBg = getBoutiqueLogoUrl(boutique)

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">

      {/* ====== HERO HEADER BOUTIQUE ====== */}
      <header className="relative overflow-hidden">
        {/* Background : logo/couverture ou gradient neon */}
        {headerBg ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${headerBg})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-900 to-[#0A0D14]">
            <div className="absolute inset-0 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05]" />
          </div>
        )}
        {/* Ligne neon top */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00F0FF]" />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0D14]/60 via-[#0A0D14]/50 to-[#0A0D14]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
          {/* Breadcrumb nav */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              <span>الرئيسية</span>
            </Link>
            <ChevronRight size={14} className="text-slate-600" />
            <span className="text-cyan-300 text-sm font-medium">
              {boutique?.nom || 'المحل'}
            </span>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-8 w-48 bg-slate-700/50 rounded-xl" />
              <div className="h-4 w-64 bg-slate-700/30 rounded-xl" />
            </div>
          ) : boutique ? (
            <div className="flex items-start gap-6 flex-wrap">
              {/* Logo Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0A0D14]/80 border-2 border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-sm overflow-hidden">
                {getBoutiqueLogoUrl(boutique) ? (
                  <img src={getBoutiqueLogoUrl(boutique)} alt={boutique.nom} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-cyan-300">
                    {boutique.nom?.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Infos boutique */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {boutique.nom}
                  </h1>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                    ✓ مفتوح الآن
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300">
                    Mobile Center Meknès
                  </span>
                </div>

                {boutique.description && (
                  <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                    {boutique.description}
                  </p>
                )}

                {/* Badges infos */}
                <div className="flex flex-wrap gap-3 pt-1 text-xs font-mono text-slate-300">
                  {boutique.emplacement && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                      <MapPin size={13} className="text-cyan-400" />
                      <span>{boutique.emplacement}</span>
                    </div>
                  )}
                  {boutique.telephone && (
                    <a
                      href={`tel:${boutique.telephone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-400 transition-colors"
                    >
                      <Phone size={13} className="text-cyan-400" />
                      <span>{boutique.telephone}</span>
                    </a>
                  )}
                  {boutique.email && (
                    <a
                      href={`mailto:${boutique.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-400 transition-colors"
                    >
                      <Mail size={13} className="text-cyan-400" />
                      <span>{boutique.email}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
                    <ShoppingCart size={13} className="text-cyan-400" />
                    <span>{produits.length} منتج</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-emerald-500/20">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>محل معتمد</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">هاد المحل ما لقيناهش.</p>
          )}
        </div>
      </header>

      {/* ====== PRODUCTS SECTION ====== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Search + count */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث فـ منتجات هاد المحل..."
              className="w-full pl-9 pr-4 py-2 bg-[#131F37]/60 border border-cyan-500/30 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-400/30">
            {filteredProduits.length} منتج
          </span>
        </div>

        {/* Produits Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-cyan-500/10 bg-[#0F172A]/60 p-4 animate-pulse h-64" />
            ))}
          </div>
        ) : filteredProduits.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-cyan-500/20 bg-[#0F172A]/50 space-y-3">
            <Smartphone size={40} className="text-cyan-400/30 mx-auto" />
            <p className="text-slate-400 text-sm">
              {search ? 'ما لقينا منتوج يطابق بحثك.' : 'هاد المحل ما زال خصاه يضيف منتجاتو.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs font-mono text-cyan-400 hover:underline">
                إعادة ضبط البحث
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProduits.map(p => {
              const dispo = p.disponible !== false && p.stock > 0
              const imgUrl = getProductImageUrl(p)
              return (
                <div
                  key={p.id}
                  className="group rounded-2xl border border-cyan-500/20 bg-[#0F172A]/80 backdrop-blur-xl flex flex-col hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 overflow-hidden"
                >
                  {/* Image produit */}
                  <div className="relative w-full h-44 bg-[#0A0E17]/90 flex items-center justify-center overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.nom}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.onerror = null; e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600">
                        <Smartphone size={32} className="text-cyan-400/30 mb-1" />
                        <span className="text-[10px] font-mono text-cyan-400/40">Mobile Center</span>
                      </div>
                    )}
                    {/* Badge dispo */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        dispo
                          ? 'text-emerald-400 border-emerald-400/40 bg-emerald-950/70'
                          : 'text-red-400 border-red-400/40 bg-red-950/70'
                      }`}>
                        {dispo ? 'متوفر' : 'نفد'}
                      </span>
                    </div>
                  </div>

                  {/* Infos + action */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm leading-snug group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {p.nom}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                        {p.description || `${p.marque || ''} ${p.modele || ''}`}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-cyan-500/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-mono text-slate-400">الثمن</div>
                        <div className="text-base font-extrabold text-cyan-300 font-mono">
                          {p.prix} <span className="text-[10px] font-sans text-cyan-400">MAD</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!dispo}
                        onClick={() => { setSelectedProduct(p); setOrderModalOpen(true) }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ShoppingCart size={12} />
                        <span>طلب</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ====== ORDER MODAL ====== */}
      {orderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-400/40 bg-[#0B111E] p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)]">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <button
              type="button"
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl"
            >
              <X size={18} />
            </button>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-white">تم إرسال طلبك بنجاح!</h3>
                <p className="text-xs text-slate-300">
                  سيتواصل معك <span className="text-cyan-300 font-bold">{boutique?.nom}</span> مباشرة لتأكيد الطلب.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                {/* Header produit */}
                <div className="flex items-center gap-3">
                  {getProductImageUrl(selectedProduct) && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-cyan-500/30 shrink-0">
                      <img src={getProductImageUrl(selectedProduct)} alt={selectedProduct.nom} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">طلب • COMMANDER</span>
                    <h3 className="text-lg font-bold text-white">{selectedProduct.nom}</h3>
                    <p className="text-cyan-300 font-mono font-bold">{selectedProduct.prix} MAD</p>
                  </div>
                </div>

                {/* Info boutique */}
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300">
                  🏪 <span className="text-cyan-200 font-semibold">{boutique?.nom}</span> — {boutique?.emplacement}
                </div>

                {/* Champs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      required
                      placeholder="محمد العمراني"
                      value={orderForm.nom_client}
                      onChange={e => setOrderForm({ ...orderForm, nom_client: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">رقم الهاتف (واتساب)</label>
                    <input
                      type="tel"
                      required
                      placeholder="0612345678"
                      value={orderForm.telephone_client}
                      onChange={e => setOrderForm({ ...orderForm, telephone_client: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">ملاحظة (اختياري)</label>
                    <textarea
                      rows={2}
                      placeholder="بغيتي تسول على لون أو ضمان..."
                      value={orderForm.notes}
                      onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95"
                >
                  تأكيد الطلب ✅
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Karim Bot */}
      <ChatbotWidget />
    </div>
  )
}
