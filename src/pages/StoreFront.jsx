import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CircuitBoard,
  Search,
  ShoppingCart,
  Phone,
  MapPin,
  ExternalLink,
  Store,
  Tag,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  ChevronRight,
  Smartphone,
} from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import ChatbotWidget from '../components/ChatbotWidget'

// Function bach njibo lien dyal tsswira dyal produit
function getProductImageUrl(p) {
  if (!p) return null
  const firstImg = p.images?.[0]
  if (!firstImg) return null
  if (typeof firstImg === 'string') {
    return firstImg.startsWith('http')
      ? firstImg
      : `http://127.0.0.1:8000/storage/${firstImg}`
  }
  if (firstImg.url) return firstImg.url
  if (firstImg.chemin) return `http://127.0.0.1:8000/storage/${firstImg.chemin}`
  return null
}

export default function StoreFront() {
  const { user } = useAuth()
  const [produits, setProduits] = useState([])
  const [boutiques, setBoutiques] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBoutique, setSelectedBoutique] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderForm, setOrderForm] = useState({
    nom_client: '',
    telephone_client: '',
    notes: '',
  })

  // Chargement des données publiques
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, boutRes, catRes] = await Promise.allSettled([
          api.get('/produits'),
          api.get('/boutiques'),
          api.get('/categories'),
        ])

        if (prodRes.status === 'fulfilled') {
          const list = prodRes.value.data?.data || prodRes.value.data || []
          setProduits(list)
        }
        if (boutRes.status === 'fulfilled') {
          const list = boutRes.value.data?.data || boutRes.value.data || []
          setBoutiques(list)
        }
        if (catRes.status === 'fulfilled') {
          const list = catRes.value.data?.data || catRes.value.data || []
          setCategories(list)
        }
      } catch (err) {
        console.error('Erreur chargement storefront:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filtrage des produits
  const filteredProducts = produits.filter((p) => {
    const matchesSearch =
      !search ||
      p.nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.marque?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' ||
      String(p.category?.id || p.category_id) === String(selectedCategory)
    const matchesBoutique =
      selectedBoutique === 'all' ||
      String(p.boutique?.id || p.boutique_id) === String(selectedBoutique)

    return matchesSearch && matchesCategory && matchesBoutique
  })

  // Soumission de commande / demande (connecté ou visiteur)
  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return

    try {
      await api.post('/demandes', {
        produit_id: selectedProduct.id,
        nom_client: orderForm.nom_client,
        telephone: orderForm.telephone_client,
        message: orderForm.notes || 'Demande via StoreFront',
        quantite: 1,
      })

      setOrderSuccess(true)
      setTimeout(() => {
        setOrderSuccess(false)
        setOrderModalOpen(false)
        setOrderForm({ nom_client: '', telephone_client: '', notes: '' })
      }, 2500)
    } catch (err) {
      console.error('Erreur demande:', err)
      alert(err.response?.data?.message || 'وقع مشكل فـ إرسال الطلب، عاود جرب.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Background Bab Mansour Cyberpunk avec l'image réelle */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-80 transition-opacity duration-500"
        style={{ backgroundImage: 'url(/images/bab-mansour-cyber.jpg)' }}
      />
      {/* Léger overlay pour garder la lisibilité du texte tout en affichant l'image */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0A0D14]/60 via-[#0A0D14]/40 to-[#0A0D14]/90 pointer-events-none" />

      {/* Cyber Circuit Lines décoratifs */}
      <div className="fixed inset-0 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

      {/* Top Navbar Futuriste */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#0B111E]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-all">
              <CircuitBoard className="text-cyan-400" size={22} />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                MOBILE CENTER
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
                  Meknès
                </span>
              </span>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Centre Commercial Électronique & Réparation
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un téléphone, accessoire, boutique..."
                className="w-full pl-10 pr-4 py-2 bg-[#131F37]/60 border border-cyan-500/30 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation & Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/20 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <span>لوحة التحكم ({user.name})</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
              >
                <Store size={16} />
                <span>دخول التجار / Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="p-3 border-t border-cyan-500/10 md:hidden bg-[#0B111E]/90">
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit, boutique..."
              className="w-full pl-9 pr-4 py-2 bg-[#131F37]/80 border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero Banner HUD */}
        <div className="relative rounded-3xl border border-cyan-500/30 bg-[#0F172A]/70 backdrop-blur-xl p-6 sm:p-10 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.2)]">
          {/* Ligne néon lumineuse */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00F0FF]" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono">
              <Sparkles size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>MARCHÉ ÉLECTRONIQUE DE MEKNÈS • BAB MANSOUR</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              أكبر تجمع لمتاجر{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                الهواتف والإلكترونيات
              </span>{' '}
              فـ مكناس
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              تصفح الهواتف الذكية، الإكسسوارات، وخدمات الإصلاح المتاحة فـ المحلات ديال Mobile Center. سول المساعد الذكي Karim Bot لتحت وغادي يلقا ليك أحسن ثمن فالحين!
            </p>

            {/* Quick Stats Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-cyan-200">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center gap-2">
                <Store size={14} className="text-cyan-400" />
                <span>{boutiques.length || 5} محلات نشيطة</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center gap-2">
                <ShoppingCart size={14} className="text-cyan-400" />
                <span>{produits.length || 10}+ منتوج متوفر</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>ضمان ومحلات معتمدة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boutiques HUD Panels (Style identique à l'image) */}
        {boutiques.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Store className="text-cyan-400" size={20} />
                <span>المحلات المعتمدة بـ Mobile Center</span>
              </h2>
              <button
                type="button"
                onClick={() => setSelectedBoutique('all')}
                className="text-xs font-mono text-cyan-400 hover:underline"
              >
                عرض كل المحلات
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {boutiques.slice(0, 8).map((b, idx) => {
                // ألوان gradient مخصصة ila ma kandch logo
                const gradients = [
                  'from-cyan-900/90 to-slate-900/90',
                  'from-violet-900/90 to-slate-900/90',
                  'from-emerald-900/90 to-slate-900/90',
                  'from-orange-900/90 to-slate-900/90',
                  'from-rose-900/90 to-slate-900/90',
                  'from-sky-900/90 to-slate-900/90',
                  'from-teal-900/90 to-slate-900/90',
                  'from-amber-900/90 to-slate-900/90',
                ]
                const gradient = gradients[idx % gradients.length]
                const logoUrl = b.logo
                  ? `http://127.0.0.1:8000/storage/${b.logo}`
                  : null

                return (
                  <Link
                    key={b.id}
                    to={`/boutique/${b.id}`}
                    className="relative rounded-2xl border border-cyan-500/20 overflow-hidden group hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 h-48 flex flex-col justify-end cursor-pointer"
                  >
                    {/* Background: logo ou gradient */}
                    {logoUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${logoUrl})` }}
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                        {/* Initiales géantes en arrière-plan */}
                        <span className="absolute inset-0 flex items-center justify-center text-8xl font-black text-white/5 select-none pointer-events-none">
                          {b.nom?.slice(0, 2).toUpperCase()}
                        </span>
                        {/* Motif circuit */}
                        <div className="absolute inset-0 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.06]" />
                      </div>
                    )}

                    {/* Overlay gradient sombre en bas */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14]/95 via-[#0A0D14]/40 to-transparent" />

                    {/* Badge statut haut à droite */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                        مفتوح الآن
                      </span>
                    </div>

                    {/* Logo avatar haut à gauche */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="w-10 h-10 rounded-xl bg-[#0A0D14]/80 border border-cyan-400/50 flex items-center justify-center font-bold text-cyan-300 text-sm backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        {b.nom?.slice(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Contenu bas de carte */}
                    <div className="relative z-10 p-4">
                      <h3 className="font-bold text-white text-base truncate group-hover:text-cyan-300 transition-colors">
                        {b.nom}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={11} className="text-cyan-400 shrink-0" />
                        <span>{b.emplacement || 'Étage 1 • Mobile Center'}</span>
                      </p>
                      <p className="text-xs text-cyan-200/70 flex items-center gap-1 mt-0.5">
                        <Phone size={11} className="text-cyan-400 shrink-0" />
                        <span>{b.telephone || '0600-000000'}</span>
                      </p>
                      {/* CTA */}
                      <div className="mt-2 flex items-center gap-1 text-cyan-400 text-xs font-semibold group-hover:gap-2 transition-all">
                        <span>عرض المنتجات</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-slate-900/60 border border-cyan-500/20 text-slate-300 hover:text-white hover:border-cyan-400/40'
            }`}
          >
            جميع الأصناف
          </button>
          {categories.map((cat) => {
            const isSelected = String(selectedCategory) === String(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-900/60 border border-cyan-500/20 text-slate-300 hover:text-white hover:border-cyan-400/40'
                }`}
              >
                {cat.nom}
              </button>
            )
          })}
        </div>

        {/* Products Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShoppingCart className="text-cyan-400" size={20} />
              <span>المنتجات المعروضة للبيع</span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-400/30">
                {filteredProducts.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="py-20 text-center font-mono text-cyan-300 text-sm">
              جاري تحميل السلع والأسعار...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-cyan-500/20 bg-[#0F172A]/50 backdrop-blur-md space-y-2">
              <p className="text-slate-400 text-sm">
                ما لقينا حتى منتوج كيطابق هاد البحث.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSelectedCategory('all')
                  setSelectedBoutique('all')
                }}
                className="text-xs font-mono text-cyan-400 hover:underline"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((p) => {
                const dispo = p.disponible !== false && p.stock > 0
                return (
                  <div
                    key={p.id}
                    className="group rounded-2xl border border-cyan-500/25 bg-[#0F172A]/80 backdrop-blur-xl p-4 flex flex-col justify-between hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300"
                  >
                    <div>
                      {/* Product Header / Boutique Tag */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-mono text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/30 truncate max-w-[150px]">
                          🏪 {p.boutique?.nom || 'Mobile Center'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            dispo
                              ? 'text-emerald-400 border-emerald-400/40 bg-emerald-950/40'
                              : 'text-red-400 border-red-400/40 bg-red-950/40'
                          }`}
                        >
                          {dispo ? 'متوفر' : 'نفد المخزون'}
                        </span>
                      </div>

                      {/* Image du produit */}
                      <div className="relative w-full h-44 mb-3 rounded-xl overflow-hidden bg-[#0A0E17]/90 border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-400/50 transition-all">
                        {getProductImageUrl(p) ? (
                          <img
                            src={getProductImageUrl(p)}
                            alt={p.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-500">
                            <Smartphone size={36} className="text-cyan-400/40 mb-1" />
                            <span className="text-[10px] font-mono text-cyan-400/50">Mobile Center</span>
                          </div>
                        )}
                      </div>

                      {/* Title & Brand */}
                      <h3 className="font-bold text-white text-base leading-snug group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {p.nom}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                        {p.description || `موديل: ${p.modele || p.marque || 'أصلي معتمد'}`}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-4 mt-3 border-t border-cyan-500/15 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-mono text-slate-400">
                          الثمن
                        </div>
                        <div className="text-lg font-extrabold text-cyan-300 font-mono">
                          {p.prix} <span className="text-xs font-sans text-cyan-400">MAD</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(p)
                          setOrderModalOpen(true)
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <ShoppingCart size={13} />
                        <span>طلب</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal Commander / Contact */}
      {orderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-400/40 bg-[#0B111E] p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)]">
            <button
              type="button"
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-white">
                  تم إرسال طلبك بنجاح!
                </h3>
                <p className="text-xs text-slate-300">
                  سيتواصل معك صاحب المحل مباشرة لتأكيد الطلب واستلامه من المركز التجاري.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  {getProductImageUrl(selectedProduct) && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-cyan-500/30 shrink-0">
                      <img
                        src={getProductImageUrl(selectedProduct)}
                        alt={selectedProduct.nom}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                      طلب منتج • COMMANDER
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {selectedProduct.nom}
                    </h3>
                    <p className="text-cyan-300 font-mono text-base font-bold">
                      {selectedProduct.prix} MAD
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-xs space-y-1 text-slate-300">
                  <p className="font-semibold text-cyan-200">
                    🏪 المحل: {selectedProduct.boutique?.nom || 'Mobile Center'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    يمكنك استلام هذا المنتج مباشرة من المحل بمكناس أو طلب توصيله.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="محمد العمراني"
                      value={orderForm.nom_client}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, nom_client: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      رقم الهاتف (واتساب)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0612345678"
                      value={orderForm.telephone_client}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          telephone_client: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      ملاحظة أو استفسار (اختياري)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="بغيت نسول على الضمان أو اللون المتوفر..."
                      value={orderForm.notes}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, notes: e.target.value })
                      }
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95"
                >
                  تأكيد الطلب الآن ✅
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Karim Bot Assistant (Flottant en bas à droite) */}
      <ChatbotWidget />
    </div>
  )
}
