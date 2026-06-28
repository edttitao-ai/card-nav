import ExternalLinkIcon from './ExternalLinkIcon.jsx'

export default function Card({ card }) {
  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card group flex flex-col h-full no-underline"
    >
      {/* 头部：标题 + 外链图标 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
          {card.title}
        </h2>
        <ExternalLinkIcon />
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