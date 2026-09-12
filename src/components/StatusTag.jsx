const styles = {
  en_attente: 'text-copper border-copper/40 bg-copper/10',
  acceptee: 'text-teal border-teal/40 bg-teal/10',
  refusee: 'text-danger border-danger/40 bg-danger/10',
  actif: 'text-teal border-teal/40 bg-teal/10',
  inactif: 'text-muted border-line bg-panel2',
}

const labels = {
  en_attente: 'En attente',
  acceptee: 'Acceptée',
  refusee: 'Refusée',
  actif: 'Actif',
  inactif: 'Inactif',
}

export default function StatusTag({ value }) {
  const cls = styles[value] || 'text-muted border-line bg-panel2'
  const label = labels[value] || value
  return (
    <span
      className={`inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded border ${cls}`}
    >
      {label}
    </span>
  )
}
