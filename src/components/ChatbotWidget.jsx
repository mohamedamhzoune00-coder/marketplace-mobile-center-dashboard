import { useState, useEffect, useRef } from 'react'
import {
  Send,
  X,
  RotateCcw,
  Sparkles,
  Smartphone,
  Store,
  Wrench,
  Bot
} from 'lucide-react'
import api from '../api'

// SVG dyal robot 3asri w modern b7al li f tsswira
function RobotAvatar({ className = 'w-10 h-10', glowing = false }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className} ${
        glowing ? 'drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]' : ''
      }`}
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Antenne */}
        <line x1="50" y1="18" x2="50" y2="8" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="7" r="5" fill="#00F0FF" />
        <circle cx="50" cy="7" r="7" stroke="#00F0FF" strokeWidth="1.5" opacity="0.6" />

        {/* Wednin (Ears / Pods) */}
        <rect x="8" y="40" width="8" height="24" rx="4" fill="#0EA5E9" stroke="#38BDF8" strokeWidth="2" />
        <rect x="84" y="40" width="8" height="24" rx="4" fill="#0EA5E9" stroke="#38BDF8" strokeWidth="2" />

        {/* Ras (Head) */}
        <rect
          x="16"
          y="18"
          width="68"
          height="62"
          rx="22"
          fill="url(#botGradient)"
          stroke="#38BDF8"
          strokeWidth="2.5"
        />

        {/* L'ecran dyal wjah (Face screen) */}
        <rect
          x="24"
          y="27"
          width="52"
          height="44"
          rx="14"
          fill="#0B132B"
          stroke="#0284C7"
          strokeWidth="1.5"
        />

        {/* 3inin (Glowing Eyes) */}
        <ellipse cx="38" cy="46" rx="6" ry="7" fill="#00F0FF" />
        <ellipse cx="62" cy="46" rx="6" ry="7" fill="#00F0FF" />
        <circle cx="36" cy="44" r="2" fill="#FFFFFF" />
        <circle cx="60" cy="44" r="2" fill="#FFFFFF" />

        {/* D7ka (Smile) */}
        <path
          d="M 40 58 Q 50 67 60 58"
          stroke="#00F0FF"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="botGradient" x1="16" y1="18" x2="84" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('chatbot_session_id') || ''
  })

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll automatique l ta7t m3a kol message jdid
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, isOpen])

  // Chargement dyal l'historique ila kan deja session_id
  useEffect(() => {
    if (sessionId) {
      api
        .get(`/chatbot/history?session_id=${sessionId}`)
        .then((res) => {
          if (res.data?.messages && res.data.messages.length > 0) {
            setMessages(
              res.data.messages.map((m) => ({
                role: m.role,
                text: m.content,
              }))
            )
          } else {
            initWelcomeMessage()
          }
        })
        .catch(() => {
          initWelcomeMessage()
        })
    } else {
      initWelcomeMessage()
    }
  }, [])

  // Focus 3la input mli t7al la fenetre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  // Écouteur d'événements bach it7al mn ay blasa (khososan mn bottom nav f telephone)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    const handleToggle = () => setIsOpen((prev) => !prev)
    const handleClose = () => setIsOpen(false)
    window.addEventListener('open-chatbot', handleOpen)
    window.addEventListener('toggle-chatbot', handleToggle)
    window.addEventListener('close-chatbot', handleClose)
    return () => {
      window.removeEventListener('open-chatbot', handleOpen)
      window.removeEventListener('toggle-chatbot', handleToggle)
      window.removeEventListener('close-chatbot', handleClose)
    }
  }, [])

  const initWelcomeMessage = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'سلام! 👋 أنا Smsar Bot 🤖، المساعد الذكي ديال Mobile Center مكناس.\nكيفاش نقدر نعاونك اليوم؟ سولي على التليفونات، البوتيكات، أو الإصلاح!',
      },
    ])
  }

  // Sift l message
  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim()
    if (!textToSend || loading) return

    setInput('')
    const newMessages = [...messages, { role: 'user', text: textToSend }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await api.post('/chatbot/message', {
        message: textToSend,
        session_id: sessionId || undefined,
      })

      if (res.data?.session_id && !sessionId) {
        setSessionId(res.data.session_id)
        localStorage.setItem('chatbot_session_id', res.data.session_id)
      }

      setMessages([
        ...newMessages,
        { role: 'assistant', text: res.data.reply },
      ])
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'سمح ليا، كاين مشكل فـ الاتصال بالخدمة. عاود جرب من بعد شوية.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Mse7 l'historique
  const handleClearHistory = async () => {
    if (sessionId) {
      try {
        await api.delete('/chatbot/history', { data: { session_id: sessionId } })
      } catch (e) {
        // Ignorer l'erreur
      }
    }
    localStorage.removeItem('chatbot_session_id')
    setSessionId('')
    initWelcomeMessage()
  }

  // Suggestion rapide
  const handleQuickQuestion = (q) => {
    handleSend(q)
  }

  return (
    <aside
      aria-label="Smsar Bot - Assistant IA"
      className={`fixed z-50 transition-all ${
        isOpen
          ? 'bottom-20 inset-x-3 sm:inset-auto sm:bottom-6 sm:right-6 pointer-events-auto'
          : 'bottom-6 right-6 pointer-events-auto'
      }`}
    >
      {/* Fenêtre dyal Chatbot (Glassmorphism & Cyber Glow) */}
      {isOpen && (
        <section
          aria-label="Boîte de discussion Smsar Bot"
          className="relative w-full sm:w-[390px] h-[550px] max-h-[72vh] sm:max-h-[82vh] flex flex-col rounded-3xl overflow-hidden border border-cyan-400/40 bg-[#0B111E]/95 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.35)] transition-all duration-300 animate-in fade-in zoom-in-95"
        >
          {/* Ligne néon lumineuse f l-fo9 */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#00F0FF]" />

          {/* Header */}
          <header className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-[#0F172A]/70 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <RobotAvatar className="w-10 h-10" glowing />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0B111E] rounded-full shadow-[0_0_8px_#34D399]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-base font-bold tracking-wide">
                    Smsar Bot
                  </h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    سمسار مكناس
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200/60 font-mono">
                  Marketplace Mobile Center
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="مسح المحادثة"
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="إغلاق"
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm selection:bg-cyan-500 selection:text-black">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={index}
                  className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser && <RobotAvatar className="w-7 h-7 mb-1 shrink-0" />}

                  <div
                    className={`relative max-w-[82%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-lg whitespace-pre-line ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-none shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-cyan-300/30 font-medium'
                        : 'bg-[#131F37]/80 text-slate-100 rounded-bl-none border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-end gap-2.5">
                <RobotAvatar className="w-7 h-7 mb-1 shrink-0" glowing />
                <div className="bg-[#131F37]/80 border border-cyan-500/30 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (ila l-mou7adatta 9sira) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleQuickQuestion('عندكم شي iPhone؟')}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-cyan-200 bg-cyan-950/60 border border-cyan-400/30 hover:bg-cyan-900/60 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              >
                <Smartphone size={12} className="text-cyan-400" />
                iPhones للبيع
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion('شنو هما البوتيكات اللي كاينين؟')}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-cyan-200 bg-cyan-950/60 border border-cyan-400/30 hover:bg-cyan-900/60 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              >
                <Store size={12} className="text-cyan-400" />
                المحلات
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion('واش كديرو إصلاح شاشات الهواتف؟')}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-cyan-200 bg-cyan-950/60 border border-cyan-400/30 hover:bg-cyan-900/60 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              >
                <Wrench size={12} className="text-cyan-400" />
                إصلاح
              </button>
            </div>
          )}

          {/* Input Footer */}
          <footer className="p-3 border-t border-cyan-500/20 bg-[#090E18]/80 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="سول على تليفون، بوتيك، أو ثمن..."
                disabled={loading}
                className="flex-1 bg-[#131F37]/70 border border-cyan-500/30 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-inner transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                title="إرسال"
                className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-sky-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center shrink-0 active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
          </footer>
        </section>
      )}

      {/* Bouton Flottant (Robot Avatar Futuriste li f jnab) - Fa9at f PC (hidden sm:flex) */}
      {!isOpen && (
        <button
          type="button"
          data-chatbot-toggle
          onClick={() => setIsOpen(true)}
          className="group relative hidden sm:flex items-center gap-3 p-2 pr-4 rounded-full bg-[#0B111E]/85 border-2 border-cyan-400/60 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          {/* Glowing Ring Animation */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 opacity-30 group-hover:opacity-60 blur-sm transition-opacity" />

          <RobotAvatar className="relative w-12 h-12" glowing />

          <div className="relative text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-xs font-bold tracking-wide">
                Smsar Bot
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
            </div>
            <p className="text-[11px] text-cyan-300 font-medium">
              سول سمسار الذكي ✨
            </p>
          </div>
        </button>
      )}
    </aside>
  )
}
