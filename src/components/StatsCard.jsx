export default function StatsCard({ title, value, subtitle, trend, accent = false }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: '#ffffff', border: '1px solid #ede9e1' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm" style={{ color: '#8c7e72' }}>{title}</span>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold tracking-tight mb-1" style={{ color: accent ? '#c0612a' : '#3d3831' }}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs" style={{ color: '#c9c0b4' }}>{subtitle}</p>
      )}
    </div>
  )
}