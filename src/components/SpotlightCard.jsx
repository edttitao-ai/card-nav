import { useRef, useCallback } from 'react'

export default function SpotlightCard({ card, isFocused }) {
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

  return (
    <a
      ref={cardRef}
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="spotlight-card group flex flex-col h-full no-underline"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 头部：标题 + 外链图标 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-150">
          {card.title}
        </h2>
        <svg
          className="card-link-icon flex-shrink-0 mt-0.5 w-4 h-4 text-gray-300 dark:text-gray-600 transition-colors duration-200 group-hover:text-gray-400 dark:group-hover:text-gray-500"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M12 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10 3h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-4">
        {card.description}
      </p>

      {/* 分类标签 */}
      <div className="mt-auto">
        <span className="tag tag-inactive">{card.category}</span>
      </div>
    </a>
  )
}