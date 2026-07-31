export function StatCard({ title, value, unit, trend, icon }) {
  return (
    <div className="card flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-forest-500">{title}</span>
        {icon && <span className="text-forest-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="stat-number text-2xl font-semibold text-ink">{value}</span>
        {unit && <span className="text-xs text-forest-500">{unit}</span>}
      </div>
      {trend && (
        <span
          className={`chip w-fit ${
            trend.direction === 'down'
              ? 'bg-forest-50 text-forest-700'
              : trend.direction === 'up'
              ? 'bg-mango-500/10 text-mango-600'
              : 'bg-sand-200 text-forest-600'
          }`}
        >
          {trend.text}
        </span>
      )}
    </div>
  )
}
