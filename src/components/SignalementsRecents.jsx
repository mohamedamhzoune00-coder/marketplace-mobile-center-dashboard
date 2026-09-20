const PRIORITY_STYLE = {
  Haute: 'text-priority-haute bg-priority-haute/10 border-priority-haute/40',
  Moyenne: 'text-priority-moyenne bg-priority-moyenne/10 border-priority-moyenne/40',
  Basse: 'text-priority-basse bg-priority-basse/10 border-priority-basse/40',
}

const STATUT_STYLE = {
  'En cours': 'text-teal bg-teal/10 border-teal/40',
  Nouveau: 'text-copper bg-copper/10 border-copper/40',
  Résolu: 'text-muted bg-muted/10 border-muted/40',
}

export default function SignalementsRecents({ signalements = [] }) {
  return (
    <div className="bg-panel border border-line rounded-lg p-5">
      <h3 className="text-ink text-sm font-semibold tracking-tight mb-5">
        Derniers Signalements
      </h3>

      {signalements.length === 0 ? (
        <div className="text-center py-8 text-muted text-sm font-mono border border-dashed border-line rounded">
          Aucun signalement récent.
        </div>
      ) : (
        <div className="space-y-3">
          {signalements.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 pb-3 border-b border-line last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="text-ink text-sm font-medium truncate">{s.boutique}</div>
                <div className="text-muted text-xs font-mono mt-0.5 truncate">{s.type}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    STATUT_STYLE[s.statut] || STATUT_STYLE['Nouveau']
                  }`}
                >
                  {s.statut}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    PRIORITY_STYLE[s.priorite] || PRIORITY_STYLE['Moyenne']
                  }`}
                >
                  {s.priorite}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}