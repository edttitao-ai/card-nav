import { useRef, useCallback, useState } from 'react'

const DEFAULT_FAVICON = '/icon/mengyou.png'

export default function BentoCard({ card, isFocused, size = 'normal' }) {
  const [imgError, setImgError] = useState(false)
  const cardRef = useRef(null)

  const handleMouseMove = useCallback(e => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    el.style.setProperty('--mx', `${x}%`)
    el.style.setProperty('--my', `${y}%`)
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '50%')
  }, [])

  const cardClass = size === 'large' ? 'bento-card bento-card-lg' : 'bento-card'

  return (
    <a
      ref={cardRef}
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardClass} flex flex-col h-full ${isFocused ? 'focused' : ''} ${card.pinned ? 'bordered-pinned' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-2 mb-1">
        {card.pinned && (
          <span style={{ color: '#c0612a' }}>
            <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor"><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/></svg>
          </span>
        )}
        <span className="card-category">{card.category}</span>
      </div>

      <h2 className="card-title">{card.title}</h2>

      <p className="card-desc flex-1">{card.description}</p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <svg
          className="card-arrow"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 16L16 4M16 4H8M16 4v8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {card.favicon && !imgError ? (
          <img
            src={card.favicon}
            alt=""
            className="w-4 h-4 rounded"
            onError={() => setImgError(true)}
            onLoad={e => { if (e.target.naturalWidth <= 16) setImgError(true) }}
          />
        ) : (
          <img
            src={DEFAULT_FAVICON}
            alt=""
            className="w-4 h-4 rounded"
          />
        )}
      </div>
    </a>
  )
}
