import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function SalesChart({ data = [] }) {
  const hasData = data.some((d) => d.ventes > 0)

  return (
    <div className="bg-panel border border-line rounded-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-ink text-sm font-semibold tracking-tight">
          Évolution des ventes (7 derniers jours)
        </h3>
        <span className="text-muted text-[11px] font-mono">7 jours</span>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-muted text-sm font-mono border border-dashed border-line rounded">
          Aucune vente enregistrée sur les 7 derniers jours.
        </div>
      ) : (
        <div className="h-64 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E333C" vertical={false} />
              <XAxis
                dataKey="jour"
                stroke="#8B9099"
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#2E333C' }}
                tickLine={false}
              />
              <YAxis
                stroke="#8B9099"
                tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v} MAD`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1B1E24',
                  border: '1px solid #2E333C',
                  borderRadius: '6px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#8B9099' }}
                itemStyle={{ color: '#C97A3D' }}
                formatter={(v) => [`${v} MAD`, 'Ventes']}
              />
              <Line
                type="monotone"
                dataKey="ventes"
                stroke="#C97A3D"
                strokeWidth={2}
                dot={{ fill: '#C97A3D', r: 3 }}
                activeDot={{ r: 5, fill: '#C97A3D' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}