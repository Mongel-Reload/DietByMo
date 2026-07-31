export function GrowthRing({ percent = 0, size = 132, stroke = 12, label, sublabel }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="growth-ring -rotate-90" width={size} height={size}>
        <circle
          className="track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="stat-number text-2xl font-semibold text-forest-800">{Math.round(clamped)}%</span>
        {label && <span className="text-[11px] text-forest-500 leading-tight">{label}</span>}
        {sublabel && <span className="text-[10px] text-forest-400 leading-tight">{sublabel}</span>}
      </div>
    </div>
  )
}
