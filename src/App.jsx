import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import BentoCard from './components/BentoCard.jsx'
import defaultCards from './data/cards.json'

const STORAGE_KEY = 'card-nav-data'

const getCategories = cards => ['全部', ...new Set(cards.map(c => c.category))]

// 均衡网格：所有卡片等宽

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

  const categories = useMemo(() => getCategories(cards), [cards])

  const filtered = useMemo(() => {
    return cards.filter(card => {
      const matchSearch =
        card.title.toLowerCase().includes(search.toLowerCase()) ||
        card.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = activeCategory === '全部' || card.category === activeCategory
      return matchSearch && matchCategory
    })
  }, [cards, search, activeCategory])

  // localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
    } catch (e) {
      console.warn('localStorage save failed:', e)
    }
  }, [cards])

  // Cmd/Ctrl + K
  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
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
      { threshold: 0.06 }
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

  const clearFilter = () => {
    setSearch('')
    setActiveCategory('全部')
  }

  return (
    <div className="min-h-screen">
      {/* 导航 */}
      <header className="nav-bar">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(192, 97, 42, 0.1)',
                border: '1px solid rgba(192, 97, 42, 0.2)',
              }}
            >
              <svg className="w-3.5 h-3.5" style={{ color: '#c0612a' }} viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">导航站</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: '#b5ada3' }}>
              {filtered.length} / {cards.length}
            </span>
            <kbd
              className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[11px] rounded-md"
              style={{
                background: '#f5f1eb',
                color: '#b5ada3',
                border: '1px solid #ede9e1',
              }}
            >
              <span>⌘</span>K
            </kbd>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12" onKeyDown={handleKeyDown} tabIndex={-1}>
        {/* 标题 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#3d3831' }}>
            导航站
          </h1>
          <p className="text-sm" style={{ color: '#b5ada3' }}>
            收藏夹入口，快速访问
          </p>
        </div>

        {/* 搜索 */}
        <div className="relative max-w-md mb-6">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: '#c9c0b4' }}
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
            placeholder="搜索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="搜索链接"
          />
        </div>

        {/* 分类 */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`tag ${activeCategory === cat ? 'tag-active' : 'tag-inactive'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bento 网格 */}
        {filtered.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            role="list"
            aria-label="链接列表"
          >
            {filtered.map((card, i) => (
              <div
                key={card.id}
                className="reveal"
                style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
                role="listitem"
              >
                <BentoCard card={card} isFocused={focusedIndex === i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div
              className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-2xl"
              style={{
                background: '#ffffff',
                border: '1px solid #ede9e1',
                boxShadow: '0 1px 4px rgba(61,56,49,0.06)',
              }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: '#c9c0b4' }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
            <p className="text-sm mb-3" style={{ color: '#b5ada3' }}>
              没有找到匹配的链接
            </p>
            <button
              onClick={clearFilter}
              className="text-sm font-medium transition-colors"
              style={{ color: '#c0612a' }}
            >
              清除筛选
            </button>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 text-center" style={{ borderTop: '1px solid #ede9e1' }}>
        <p className="text-xs" style={{ color: '#c9c0b4' }}>导航站</p>
      </footer>
    </div>
  )
}
