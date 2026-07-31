import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export function WeightChart({ data, targetWeight }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-forest-400">
        Belum ada data berat badan. Tambahkan laporan mingguan pertamamu.
      </div>
    )
  }

  return (
    <div className="h-56 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef0ea" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#57906f' }} />
          <YAxis tick={{ fontSize: 11, fill: '#57906f' }} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #d8e5dd', fontSize: 12 }}
            formatter={(value) => [`${value} kg`, 'Berat badan']}
          />
          {targetWeight && (
            <ReferenceLine
              y={targetWeight}
              stroke="#ff8c42"
              strokeDasharray="4 4"
              label={{ value: 'Target', position: 'insideTopRight', fill: '#f26f1f', fontSize: 11 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#1f4b3f"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#1f4b3f' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
