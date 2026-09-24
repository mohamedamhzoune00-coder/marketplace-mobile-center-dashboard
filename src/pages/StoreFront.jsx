import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CircuitBoard,
  Search,
  ShoppingCart,
  Phone,
  MapPin,
  Store,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  ChevronRight,
  Smartphone,
  LayoutGrid,
  MessageCircle,
  User,
  Home,
  Plus,
  Minus,
  Heart,
  Star,
  Headphones,
  Watch,
  Gamepad2,
  Tablet,
  Send,
  SlidersHorizontal,
  Cpu,
  Grid,
  Zap,
} from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import ChatbotWidget from '../components/ChatbotWidget'

// === HELPERS ===
function getProductImageUrl(p) {
  if (!p) return null
  const firstImg = p.images?.[0]
  if (!firstImg) return null
  if (typeof firstImg === 'string')
    return firstImg.startsWith('http') ? firstImg : `http://127.0.0.1:8000/storage/${firstImg}`
  if (firstImg.url) return firstImg.url
  if (firstImg.chemin) return `http://127.0.0.1:8000/storage/${firstImg.chemin}`
  return null
}

// Icons ديال الأصناف
const CATEGORY_ICONS = {
  'هواتف ذكية': Smartphone,
  'smartphones': Smartphone,
  'هواتف': Smartphone,
  'إكسسوارات': Headphones,
  'accessoires': Headphones,
  'سماعات': Headphones,
  'audio': Headphones,
  'ساعات': Watch,
  'smartwatches': Watch,
  'gaming': Gamepad2,
  'ألعاب': Gamepad2,
  'tablettes': Tablet,
  'لوحات': Tablet,
}

function getCategoryIcon(catName) {
  if (!catName) return LayoutGrid
  const lower = catName.toLowerCase()
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return LayoutGrid
}

export default function StoreFront() {
  const { user } = useAuth()

  // === STATE ===
  const [produits, setProduits] = useState([])
  const [boutiques, setBoutiques] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('home') // home, categories, cart, account

  // سلة التسوق
  const [cart, setCart] = useState([])
  // المفضلة
  const [favorites, setFavorites] = useState([])
  // تفاصيل المنتج (bottom sheet)
  const [selectedProduct, setSelectedProduct] = useState(null)
  // Modal الطلب
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderForm, setOrderForm] = useState({ nom_client: '', telephone_client: '', notes: '' })
  // Toast notification
  const [toast, setToast] = useState('')

  // === FETCH DATA ===
  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, bRes, cRes] = await Promise.allSettled([
          api.get('/produits'),
          api.get('/boutiques'),
          api.get('/categories'),
        ])
        if (pRes.status === 'fulfilled') setProduits(pRes.value.data?.data || pRes.value.data || [])
        if (bRes.status === 'fulfilled') setBoutiques(bRes.value.data?.data || bRes.value.data || [])
        if (cRes.status === 'fulfilled') setCategories(cRes.value.data?.data || cRes.value.data || [])
      } catch (err) {
        console.error('Erreur fetch:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // === HELPERS ===
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // Favorites
  const toggleFavorite = (productId, e) => {
    if (e) e.stopPropagation()
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId))
      showToast('تمت إزالته من المفضلة')
    } else {
      setFavorites([...favorites, productId])
      showToast('تمت الإضافة إلى المفضلة ❤️')
    }
  }

  // Cart
  const addToCart = (product, e) => {
    if (e) e.stopPropagation()
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    showToast(`${product.nom} تزادت للسلة 🛒`)
  }

  const updateCartQty = (productId, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      }).filter(Boolean)
    )
  }

  const totalCartPrice = cart.reduce((sum, item) => sum + ((item.product.prix || 0) * item.quantity), 0)

  // Filter
  const filteredProducts = produits.filter(p => {
    const matchesSearch = !search ||
      p.nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.marque?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' ||
      String(p.category?.id || p.category_id) === String(selectedCategory)
    return matchesSearch && matchesCategory
  })

  // Order submit
  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    const product = selectedProduct || cart[0]?.product
    if (!product) return
    try {
      // Envoyer tous les items de la cart ou le produit sélectionné
      const items = orderModalOpen && selectedProduct
        ? [{ produit_id: selectedProduct.id, quantite: 1 }]
        : cart.map(item => ({ produit_id: item.product.id, quantite: item.quantity }))

      for (const item of items) {
        await api.post('/demandes', {
          produit_id: item.produit_id,
          nom_client: orderForm.nom_client,
          telephone: orderForm.telephone_client,
          message: orderForm.notes || 'Demande via StoreFront',
          quantite: item.quantite,
        })
      }
      setOrderSuccess(true)
      setTimeout(() => {
        setOrderSuccess(false)
        setOrderModalOpen(false)
        setOrderForm({ nom_client: '', telephone_client: '', notes: '' })
        if (!selectedProduct) setCart([])
      }, 2500)
    } catch (err) {
      alert(err.response?.data?.message || 'وقع مشكل فـ إرسال الطلب')
    }
  }

  // Gradient boutiques
  const gradients = [
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-700',
    'from-violet-500 to-purple-700',
    'from-orange-500 to-amber-700',
    'from-rose-500 to-pink-700',
    'from-sky-500 to-indigo-700',
  ]

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-60" style={{ backgroundImage: 'url(/images/bab-mansour-cyber.jpg)' }} />
      <div className="fixed inset-0 bg-gradient-to-b from-[#070b12]/70 via-[#070b12]/50 to-[#070b12]/95 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      {/* === TOAST NOTIFICATION === */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-cyan-500/95 text-slate-950 font-bold px-4 py-2 rounded-full text-xs shadow-[0_0_20px_rgba(0,242,254,0.5)] backdrop-blur-md flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          {toast}
        </div>
      )}

      {/* === TOP NAVBAR === */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#0b111e]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.4)] border border-cyan-300/30">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-black tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                MOBILE CENTER
              </h1>
              <p className="text-[9px] sm:text-[10px] text-cyan-400/80 font-medium flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" /> MEKNÈS • BAB MANSOUR
              </p>
            </div>
          </Link>

          {/* Search — desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un produit, boutique..."
                className="w-full pr-10 pl-10 py-2 bg-[#151e2e] border border-cyan-500/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 transition-all"
              />
              <button className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Auth */}
          <div className="shrink-0">
            {user ? (
              <Link to="/dashboard" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 text-xs font-semibold">
                لوحة التحكم <ArrowRight size={14} />
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-xs font-semibold shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                <Store size={14} /> دخول التجار
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-3 pb-2 md:hidden">
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن هاتف أو محل..."
              className="w-full pr-9 pl-4 py-2 bg-[#151e2e] border border-cyan-500/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 pb-24 sm:pb-10">

        {/* ==================== TAB: HOME ==================== */}
        {activeTab === 'home' && (
          <>
            {/* HERO BANNER (S24 Series Banner - Style identique à l'image) */}
            <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#0c1626] via-[#09111c] to-[#060a12] p-4 sm:p-7 shadow-[0_0_35px_rgba(6,182,212,0.18)]">
              {/* Lueur néon en haut et fond */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00F0FF]" />
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="grid grid-cols-12 items-center gap-3 sm:gap-6 relative z-10">
                {/* Colonne Gauche: Titre, New arrivals, Bouton Shop now */}
                <div className="col-span-7 flex flex-col justify-center space-y-2.5 sm:space-y-3.5 text-right">
                  <h2 className="text-sm sm:text-2xl font-black text-white leading-snug">
                    أكبر تجمع للهواتف<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                      والإلكترونيات
                    </span>{' '}
                    ف مكناس
                  </h2>

                  <div className="space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase block">
                      NEW ARRIVALS:
                    </span>
                    <h3 className="text-base sm:text-2xl font-black text-white tracking-tight">
                      S24 Series
                    </h3>
                  </div>

                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const s24 = produits.find(p => p.nom?.toLowerCase().includes('s24'))
                        if (s24) {
                          setSelectedProduct(s24)
                        } else {
                          setSearch('s24')
                        }
                      }}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#0e2236] border border-cyan-400/40 hover:border-cyan-300 hover:bg-cyan-950/60 text-cyan-300 hover:text-white font-bold text-[11px] sm:text-xs shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-95 transition-all flex items-center gap-1.5 w-fit group"
                    >
                      <span>Shop now</span>
                      <ChevronRight size={13} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Colonne Droite: Image Samsung S24 Ultra avec S-Pen */}
                <div className="col-span-5 relative flex items-center justify-center">
                  <div className="relative w-full h-36 sm:h-52 flex items-center justify-center">
                    <div className="absolute inset-0 bg-cyan-400/10 rounded-full blur-xl scale-75" />
                    <img
                      src="/images/s24-banner.webp"
                      alt="Samsung Galaxy S24 Ultra"
                      className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Carousel Indicators (Pill active + dots) */}
              <div className="flex items-center justify-center gap-1.5 pt-3 relative z-10">
                <span className="w-5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700/80" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700/80" />
              </div>
            </div>

            {/* CATEGORIES مع ICONS */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-cyan-400" /> الأصناف الرئيسية
                </h3>
                <button onClick={() => setActiveTab('categories')} className="text-[11px] text-cyan-400 font-semibold">
                  عرض الكل
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-[#151e2e] text-slate-300 border-cyan-900/30 hover:border-cyan-500/40'
                  }`}
                >
                  <LayoutGrid className={`w-3.5 h-3.5 ${selectedCategory === 'all' ? 'text-slate-950' : 'text-cyan-400'}`} />
                  جميع الأصناف
                </button>

                {categories.map(cat => {
                  const isSelected = String(selectedCategory) === String(cat.id)
                  const IconComp = getCategoryIcon(cat.nom)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(String(cat.id))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                          : 'bg-[#151e2e] text-slate-300 border-cyan-900/30 hover:border-cyan-500/40'
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
                      {cat.nom}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* BOUTIQUES */}
            {boutiques.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-cyan-400" /> المحلات المعتمدة
                  </h3>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">نشيطة</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {boutiques.slice(0, 8).map((b, idx) => {
                    const logoUrl = b.logo ? `http://127.0.0.1:8000/storage/${b.logo}` : null
                    return (
                      <Link
                        key={b.id}
                        to={`/boutique/${b.id}`}
                        className="group p-3 rounded-2xl bg-gradient-to-b from-[#131d2e] to-[#0f1724] border border-cyan-500/20 hover:border-cyan-400/60 transition-all hover:shadow-[0_0_20px_rgba(0,242,254,0.15)] relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${gradients[idx % gradients.length]} flex items-center justify-center text-white font-black text-xs shadow-md overflow-hidden`}>
                            {logoUrl ? (
                              <img src={logoUrl} alt={b.nom} className="w-full h-full object-cover" />
                            ) : (
                              b.nom?.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-medium">
                            مفتوح
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                          {b.nom}
                        </h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          {b.emplacement || 'Mobile Center'}
                        </p>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-cyan-400 font-bold">عرض المنتجات</span>
                          <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* PRODUCTS GRID */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> المنتجات المعروضة للبيع
                </h3>
                <span className="text-[10px] text-slate-400">
                  {filteredProducts.length} من {produits.length}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-cyan-500/10 bg-[#121a28] animate-pulse overflow-hidden">
                      <div className="h-36 bg-slate-800/50" />
                      <div className="p-3 space-y-2"><div className="h-3 bg-slate-700/50 rounded w-3/4" /><div className="h-5 bg-slate-700/40 rounded w-1/2" /></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-[#131b28] rounded-2xl border border-dashed border-slate-700 space-y-2">
                  <Search className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">لم يتم العثور على أي منتج</p>
                  <button onClick={() => { setSearch(''); setSelectedCategory('all') }} className="text-xs text-cyan-400 underline font-semibold">
                    إعادة ضبط التصفية
                  </button>
                </div>
              ) : (
                /* 2 cols mobile, 3 sm, 4 lg */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map(p => {
                    const dispo = p.disponible !== false && p.stock > 0
                    const imgUrl = getProductImageUrl(p)
                    const isFav = favorites.includes(p.id)
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className="group cursor-pointer rounded-2xl bg-[#121a28] border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,242,254,0.12)] flex flex-col overflow-hidden relative"
                      >
                        {/* Boutique badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[9px] font-bold text-cyan-300 truncate max-w-[90px] block">
                            {p.boutique?.nom || 'MC'}
                          </span>
                        </div>

                        {/* Heart */}
                        <button
                          onClick={e => toggleFavorite(p.id, e)}
                          className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-slate-950/60 backdrop-blur-md text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        {/* Image */}
                        <div className="w-full h-36 sm:h-40 bg-[#0a0f18] relative overflow-hidden flex items-center justify-center p-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt={p.nom} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy"
                              onError={e => { e.target.onerror = null; e.target.style.display = 'none' }} />
                          ) : (
                            <div className="flex flex-col items-center">
                              <Smartphone size={32} className="text-cyan-400/30 mb-1" />
                              <span className="text-[10px] font-mono text-cyan-400/40">Mobile Center</span>
                            </div>
                          )}
                          {/* Badge dispo */}
                          {!dispo && (
                            <div className="absolute bottom-2 right-2">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border text-red-400 border-red-400/40 bg-red-950/70 backdrop-blur-sm">نفد</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                          <div>
                            <h4 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                              {p.nom}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {p.description || `${p.marque || ''} ${p.modele || ''}`}
                            </p>
                          </div>

                          <div className="flex items-end justify-between pt-1.5 border-t border-slate-800/60">
                            <div>
                              <div className="text-xs font-black text-cyan-400">
                                {p.prix} <span className="text-[9px]">MAD</span>
                              </div>
                            </div>
                            <button
                              onClick={e => addToCart(p, e)}
                              disabled={!dispo}
                              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)] transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* ==================== TAB: CATEGORIES ==================== */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">جميع أصناف المنتجات</h2>
            <div className="grid grid-cols-1 gap-3">
              {categories.map(cat => {
                const IconComp = getCategoryIcon(cat.nom)
                const count = produits.filter(p => String(p.category?.id || p.category_id) === String(cat.id)).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(String(cat.id)); setActiveTab('home') }}
                    className="p-4 rounded-2xl bg-[#121b2a] border border-cyan-500/20 hover:border-cyan-400/60 flex items-center justify-between transition-all hover:bg-[#162235] text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-100">{cat.nom}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">{count} منتجات متوفرة</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB: CART (سلة التسوق) ==================== */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-cyan-400" /> سلة التسوق
              </h2>
              <span className="text-xs text-slate-400">{cart.length} عناصر</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
                <p className="text-xs text-slate-400">سلة التسوق فارغة حالياً</p>
                <button onClick={() => setActiveTab('home')} className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                  تصفح المنتجات الآن
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => {
                  const imgUrl = getProductImageUrl(item.product)
                  return (
                    <div key={item.product.id} className="p-3 rounded-2xl bg-[#121a28] border border-cyan-500/20 flex items-center justify-between gap-3">
                      <div className="w-14 h-14 bg-[#0a0f18] rounded-xl p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.product.nom} className="w-full h-full object-contain" />
                        ) : (
                          <Smartphone size={20} className="text-cyan-400/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{item.product.nom}</h4>
                        <p className="text-[10px] text-slate-400">المحل: {item.product.boutique?.nom || 'MC'}</p>
                        <p className="text-xs font-bold text-cyan-400 mt-0.5">
                          {(item.product.prix * item.quantity).toLocaleString()} MAD
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-[#0a0f18] border border-slate-800 rounded-xl p-1">
                        <button onClick={() => updateCartQty(item.product.id, -1)} className="p-1 text-slate-400 hover:text-white">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1.5 text-cyan-300">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.product.id, 1)} className="p-1 text-slate-400 hover:text-white">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Summary */}
                <div className="p-4 rounded-2xl bg-[#152033] border border-cyan-500/30 space-y-2.5 mt-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>المجموع الفرعي</span>
                    <span>{totalCartPrice.toLocaleString()} MAD</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>التوصيل بمكناس</span>
                    <span className="text-emerald-400 font-bold">مجاني</span>
                  </div>
                  <div className="border-t border-slate-700/80 pt-2 flex justify-between text-sm font-bold text-white">
                    <span>المجموع الكلي</span>
                    <span className="text-cyan-400">{totalCartPrice.toLocaleString()} MAD</span>
                  </div>

                  <button
                    onClick={() => { setSelectedProduct(null); setOrderModalOpen(true) }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,242,254,0.4)] mt-2 active:scale-95 transition-all"
                  >
                    تأكيد الطلب الآن ✅
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: ACCOUNT ==================== */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121b2a] border border-cyan-500/20 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
                {user?.name?.charAt(0) || 'Z'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">{user?.name || 'زائر Mobile Center'}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">مكناس، المغرب</p>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={() => showToast(`عندك ${favorites.length} فـ المفضلة`)} className="w-full p-3 rounded-xl bg-[#121b2a] border border-slate-800 flex items-center justify-between text-xs text-slate-200">
                <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> المنتجات المفضلة ({favorites.length})</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
              <Link to="/login" className="w-full p-3 rounded-xl bg-[#121b2a] border border-slate-800 flex items-center justify-between text-xs text-slate-200">
                <span className="flex items-center gap-2"><Store className="w-4 h-4 text-cyan-400" /> دخول التجار / Admin</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* === MOBILE BOTTOM NAVIGATION === */}
      <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-[#0b1019]/95 backdrop-blur-xl border-t border-cyan-950/60 px-4 py-2">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-500'}`}>
            <Home className="w-5 h-5" /><span>الرئيسية</span>
          </button>

          <button onClick={() => setActiveTab('categories')} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${activeTab === 'categories' ? 'text-cyan-400' : 'text-slate-500'}`}>
            <Grid className="w-5 h-5" /><span>الأصناف</span>
          </button>

          {/* Semsar — bouton central */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('toggle-chatbot'))
              document.querySelector('[data-chatbot-toggle]')?.click()
            }}
            className="relative -top-4 flex flex-col items-center group cursor-pointer"
          >
            <div className="p-3 rounded-full bg-gradient-to-tr from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,242,254,0.6)] border-2 border-[#0b1019] group-hover:scale-110 group-active:scale-95 transition-transform relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="2" x2="12" y2="5" stroke="#070b12" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="1.5" r="1" fill="#070b12"/>
                <rect x="5" y="5" width="14" height="10" rx="3" fill="#070b12" stroke="#070b12" strokeWidth="0.5"/>
                <circle cx="9" cy="10" r="1.5" fill="#00F0FF"/>
                <circle cx="15" cy="10" r="1.5" fill="#00F0FF"/>
                <path d="M9.5 13 Q12 15 14.5 13" stroke="#00F0FF" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <rect x="8" y="15" width="8" height="5" rx="1.5" fill="#070b12"/>
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0b1019] animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0b1019]" />
            </div>
            <span className="text-[9px] font-mono text-cyan-300 font-bold mt-0.5">سمسار</span>
          </button>

          <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative transition-colors ${activeTab === 'cart' ? 'text-cyan-400' : 'text-slate-500'}`}>
            <ShoppingCart className="w-5 h-5" /><span>السلة</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-cyan-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          <button onClick={() => setActiveTab('account')} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-colors ${activeTab === 'account' ? 'text-cyan-400' : 'text-slate-500'}`}>
            <User className="w-5 h-5" /><span>حسابي</span>
          </button>
        </div>
      </nav>

      {/* === PRODUCT DETAIL BOTTOM SHEET === */}
      {selectedProduct && !orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end" onClick={() => setSelectedProduct(null)}>
          <div className="bg-[#0f1726] border-t border-cyan-500/40 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <Link
                to={`/boutique/${selectedProduct.boutique?.id || selectedProduct.boutique_id}`}
                className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 font-bold"
              >
                🏪 {selectedProduct.boutique?.nom || 'Mobile Center'}
              </Link>
              <button onClick={() => setSelectedProduct(null)} className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image */}
            <div className="w-full h-56 bg-[#0a0f18] rounded-2xl p-4 flex items-center justify-center overflow-hidden">
              {getProductImageUrl(selectedProduct) ? (
                <img src={getProductImageUrl(selectedProduct)} alt={selectedProduct.nom} className="h-full object-contain" />
              ) : (
                <Smartphone size={48} className="text-cyan-400/20" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-white">{selectedProduct.nom}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-black text-cyan-400">{selectedProduct.prix} MAD</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#141e30] p-3 rounded-xl border border-slate-800">
              {selectedProduct.description || `${selectedProduct.marque || ''} ${selectedProduct.modele || ''} — أصلي ومعتمد من المحل`}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }}
                className="flex-1 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,242,254,0.4)] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-4 h-4" /> إضافة للسلة
              </button>
              <button
                onClick={() => { setOrderModalOpen(true) }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4" /> طلب مباشر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === ORDER MODAL === */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-cyan-400/40 bg-[#0B111E] p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)]">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-t-3xl" />
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4 sm:hidden" />
            <button onClick={() => { setOrderModalOpen(false); setOrderSuccess(false) }} className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl">
              <X size={18} />
            </button>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-white">تم إرسال طلبك بنجاح!</h3>
                <p className="text-xs text-slate-300">سيتواصل معك صاحب المحل مباشرة لتأكيد الطلب.</p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">طلب منتج</span>
                  <h3 className="text-lg font-bold text-white">
                    {selectedProduct ? selectedProduct.nom : `${cart.length} منتجات فـ السلة`}
                  </h3>
                  <p className="text-cyan-300 font-mono font-bold">
                    {selectedProduct ? `${selectedProduct.prix} MAD` : `${totalCartPrice.toLocaleString()} MAD`}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل</label>
                    <input type="text" required placeholder="محمد العمراني" value={orderForm.nom_client}
                      onChange={e => setOrderForm({ ...orderForm, nom_client: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">رقم الهاتف (واتساب)</label>
                    <input type="tel" required placeholder="0612345678" value={orderForm.telephone_client}
                      onChange={e => setOrderForm({ ...orderForm, telephone_client: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">ملاحظة (اختياري)</label>
                    <textarea rows={2} placeholder="بغيت نسول على الضمان أو اللون..." value={orderForm.notes}
                      onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#131F37] border border-cyan-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400" />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition-all">
                  تأكيد الطلب ✅
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Karim Bot / سمسار */}
      <ChatbotWidget />
    </div>
  )
}
