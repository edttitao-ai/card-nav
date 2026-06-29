import { useState } from 'react'

const TrendChart = ({ data }) => {
  if (!data || data.length === 0) return null
  const [hovered, setHovered] = useState(null)
  const W = 600, H = 160, PL = 12, PR = 12, PT = 12, PB = 32
  const chartW = W - PL - PR, chartH = H - PT - PB
  const maxVal = Math.max(...data.map(d => d.count), 1)

  const pts = data.map((d, i) => ({
    x: PL + (i / (data.length - 1 || 1)) * chartW,
    y: PT + chartH - (d.count / maxVal) * chartH,
    label: d.date,
    count: d.count,
  }))

  const smoothPath = (pts) => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x},${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(i + 2, pts.length - 1)]
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
    }
    return d
  }

  const lineD = smoothPath(pts)
  const areaD = lineD + ` L ${pts[pts.length - 1].x},${PT + chartH} L ${pts[0].x},${PT + chartH} Z`
  const gradId = 'trendGrad'
  const maxCount = maxVal

  return (
    <section className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #ede9e1' }}>
      <h2 className="text-sm font-semibold pb-3 mb-3" style={{ color: '#8c7e72', borderBottom: '1px solid #ede9e1' }}>近7天访问趋势</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0612a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c0612a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const y = PT + chartH * (1 - frac)
          const val = Math.round(maxCount * frac)
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={PL + chartW} y2={y} stroke="#ede9e1" strokeWidth="1" />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#c9c0b4">{val}</text>
            </g>
          )
        })}
        <path d={areaD} fill={`url(#${gradId})`} />
        <path d={lineD} fill="none" stroke={hovered !== null ? '#d4805a' : '#c0612a'} strokeWidth={hovered !== null ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((pt, i) => {
          const isHovered = hovered === i
          return (
            <g key={i} style={{ cursor: 'pointer' }}
              onMouseEnter={() => { setHovered(i); }}
              onMouseLeave={() => { setHovered(null); }}
            >
              <circle cx={pt.x} cy={pt.y} r={isHovered ? 6 : (i === pts.length - 1 ? 5 : 3.5)} fill={isHovered || i === pts.length - 1 ? '#c0612a' : '#ffffff'} stroke="#c0612a" strokeWidth="2" />
              <text x={pt.x} y={isHovered ? pt.y - 12 : pt.y - 8} textAnchor="middle" fontSize="10" fontWeight={isHovered ? '700' : '600'} fill="#c0612a">{pt.count}</text>
              <text x={pt.x} y={PT + chartH + 16} textAnchor="middle" fontSize="10" fill={isHovered ? '#c0612a' : '#c9c0b4'} fontWeight={isHovered ? '600' : '400'}>{pt.label}</text>
            </g>
          )
        })}
        {hovered !== null && (
          <g>
            <rect x={pts[hovered].x - 42} y={pts[hovered].y - 42} width="84" height="26" rx="6" fill="#3d3831" />
            <text x={pts[hovered].x} y={pts[hovered].y - 24} textAnchor="middle" fontSize="10" fill="#faf8f4" fontWeight="600">{pts[hovered].label} · {pts[hovered].count}次</text>
          </g>
        )}
      </svg>
    </section>
  )
}

export default TrendChart
