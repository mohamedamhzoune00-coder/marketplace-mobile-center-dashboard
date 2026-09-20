export default function StatCard({ icon: Icon, label, value, delta, deltaType = 'up', color = 'copper' }) {
  const colorMap = {
    copper: 'text-copper bg-copper/10 border-copper/30',
    teal: 'text-teal bg-teal/10 border-teal/30',
    danger: 'text-danger bg-danger/10 border-danger/30',
    ink: 'text-ink bg-ink/10 border-ink/30',
  }

  const deltaColor = deltaType === 'up' ? 'text-teal' : 'text-danger'

  return (
    <div className="bg-panel border border-line rounded-lg p-5 hover:border-copper/40 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          <Icon size={15} strokeWidth={1.75} />
        </div>
        <span className="text-muted text-xs font-mono truncate">{label}</span>
      </div>

      <div className="text-ink text-2xl font-semibold font-mono tracking-tight leading-none">
        {value}
      </div>

      {delta && (
        <div className={`text-xs font-mono mt-2 ${deltaColor}`}>
          {delta}
        </div>
      )}
    </div>
  )
}