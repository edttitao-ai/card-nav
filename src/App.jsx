import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Card from './components/Card.jsx'
import SpotlightCard from './components/SpotlightCard.jsx'
import defaultCards from './data/cards.json'

const STORAGE_KEY = 'card-nav-data'

// 提取所有分类
const getCategories = cards => ['全部', ...new Set(cards.map(c => c.category))]

export default function App() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : defaultCards
    } catch {
      return defaultCards
    }
  })
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const searchRef = useRef(null)
  const cardRefs = useRef([])

  const categories = useMemo(() => getCategories(cards), [cards])

  // 过滤逻辑
  const filtered = useMemo(() => {
    return cards.filter(card => {
      const matchSearch =
        card.title.toLowerCase().includes(search.toLowerCase()) ||
        card.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = activeCategory === '全部' || card.category === activeCategory
      return matchSearch && matchCategory
    })
  }, [cards, search, activeCategory])

  // localStorage 持久化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
    } catch (e) {
      console.warn('localStorage save failed:', e)
    }
  }, [cards])

  // Cmd/Ctrl + K 聚焦搜索
  useEffect(() => {
    const handleKeyDown = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 滚动渐入
  useEffect(() => {
    setFocusedIndex(-1)
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 }
    )

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [filtered])

  // 键盘导航
  const handleKeyDown = useCallback(
    e => {
      if (filtered.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex(i => Math.max(i - 1, -1))
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        const card = filtered[focusedIndex]
        if (card) window.open(card.url, '_blank', 'noopener,noreferrer')
      } else if (e.key === 'Escape') {
        searchRef.current?.blur()
        setFocusedIndex(-1)
      }
    },
    [filtered, focusedIndex]
  )

  // 清除筛选
  const clearFilter = () => {
    setSearch('')
    setActiveCategory('全部')
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">导航站</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {filtered.length} / {cards.length} 个链接
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10" onKeyDown={handleKeyDown}>
        {/* 搜索 + 分类 */}
        <div className="mb-8 space-y-4">
          {/* 搜索框 */}
          <div className="relative max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              className="search-input"
              placeholder="搜索标题或描述..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="搜索"
            />
          </div>

          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`tag cursor-pointer ${activeCategory === cat ? 'tag-active' : 'tag-inactive'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 卡片网格 */}
        {filtered.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            role="list"
            aria-label="链接列表"
          >
            {filtered.map((card, i) => (
              <div
                key={card.id}
                ref={el => (cardRefs.current[i] = el)}
                className={`reveal ${focusedIndex === i ? 'ring-2 ring-emerald-400 dark:ring-emerald-500 rounded-xl' : ''}`}
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                role="listitem"
              >
                <SpotlightCard
                  card={card}
                  isFocused={focusedIndex === i}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" viewBox="0 0 48 48" fill="none">
                <circle cx="21" cy="21" r="13" stroke="currentColor" strokeWidth="2" />
                <path d="M31 31L42 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M15 21h12M21 15v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              </svg>
            </div>
            <p className="text-base text-gray-400 dark:text-gray-500">没有找到匹配的链接</p>
            <button
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
              onClick={clearFilter}
            >
              清除筛选
            </button>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-100 dark:border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          导航站
        </div>
      </footer>
    </div>
  )
}