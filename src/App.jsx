import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import BentoCard from './components/BentoCard.jsx'
import CardModal from './components/CardModal.jsx'
import ContextMenu from './components/ContextMenu.jsx'
import SidebarModal from './components/SidebarModal.jsx'
import SidebarContextMenu from './components/SidebarContextMenu.jsx'
import StatsCard from './components/StatsCard.jsx'
import LogList from './components/LogList.jsx'
import TrendChart from './components/TrendChart.jsx'

const API_BASE = '/api'

const DEFAULT_SIDEBAR = [
  { id: 'dashboard', label: '首页', icon: 'dashboard' },
]

const DEFAULT_CATEGORIES = ['前端', '后端', 'DevOps', '工具', '视频', '阅读', '文档', 'AI', '设计', '生活', '学习', '工作', '金融', '社区']

const FAVORITES_ITEM = { id: 'favorites', label: '收藏夹', icon: 'star' }

const Icon = ({ name, className = '' }) => {
  const icons = {
    dashboard: <svg viewBox="0 0 20 20" fill="none" className={className}><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
    portfolio: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M3 14V6l4-2 4 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="5" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    github: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M10 3c-3.87 0-7 3.13-7 7 0 3.09 2 5.73 4.77 6.65.35.06.48-.15.48-.34v-1.2c-1.94.42-2.35-.94-2.35-.94-.32-.81-.78-1.03-.78-1.03-.64-.44.05-.43.05-.43.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.93-1.55-.18-3.18-.78-3.18-3.45 0-.76.27-1.38.72-1.87-.07-.18-.31-.89.07-1.84 0 0 .59-.19 1.93.72a6.7 6.7 0 0 1 1.75-.24c.6 0 1.2.08 1.75.24 1.34-.91 1.93-.72 1.93-.72.38.95.14 1.66.07 1.84.45.49.72 1.11.72 1.87 0 2.68-1.63 3.27-3.19 3.45.25.22.48.64.48 1.29v1.91c0 .19.13.4.48.34A6.997 6.997 0 0 0 17 10c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
    bookmark: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M5 3a2 2 0 0 0-2 2v12l5-3 5 3V5a2 2 0 0 0-2-2H5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    notes: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M4 4h12v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 8h4M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    tools: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M14.5 5.5L5.5 14.5M8 3l2 2M12 7l2 2M3 12l2 2M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="14.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
    menu: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    close: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    plus: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    star: <svg viewBox="0 0 20 20" fill="none" className={className}><path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.33L10 14.27l-4.77 2.45.91-5.33-3.87-3.77 5.34-.78L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    logs: <svg viewBox="0 0 20 20" fill="none" className={className}><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 7h14M7 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  }
  return icons[name] || null
}

function Sidebar({ isOpen, onClose, items, activeItem, onSelectItem, onEdit }) {
  const favoritesItem = FAVORITES_ITEM
  return (
      <>
        {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
        <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-[260px] shrink-0`} style={{ background: 'rgba(250, 248, 244, 0.95)', borderRight: '1px solid #ede9e1', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div className="h-16 flex items-center justify-between px-5" style={{ borderBottom: '1px solid #ede9e1' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" >
                <img src="/icon/zhaoshou.svg" alt="" className="w-5 h-5" style={{ color: '#c0612a' }} />
              </div>
              <span className="text-base font-bold tracking-tight" style={{ color: '#3d3831', textShadow: '0 1px 2px rgba(192, 97, 42, 0.1)' }}>涛的导航站</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 rounded-lg transition-colors" style={{ color: '#8c7e72' }} aria-label="关闭侧边栏"><Icon name="close" className="w-5 h-5" /></button>
          </div>
          <nav className="flex-1 py-4 px-3 overflow-y-auto flex flex-col">
            <ul className="space-y-1">
              <li>
                <button
                    onClick={() => onSelectItem(favoritesItem.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
                    style={{ background: activeItem === favoritesItem.id ? 'rgba(192, 97, 42, 0.08)' : 'transparent', color: activeItem === favoritesItem.id ? '#c0612a' : '#5c5049', fontWeight: activeItem === favoritesItem.id ? 500 : 400 }}
                >
                  <Icon name={favoritesItem.icon} className="w-5 h-5 shrink-0" />
                  <span>{favoritesItem.label}</span>
                </button>
              </li>
              <li>
                <button
                    onClick={() => onSelectItem('logs')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
                    style={{ background: activeItem === 'logs' ? 'rgba(192, 97, 42, 0.08)' : 'transparent', color: activeItem === 'logs' ? '#c0612a' : '#5c5049', fontWeight: activeItem === 'logs' ? 500 : 400 }}
                >
                  <Icon name="logs" className="w-5 h-5 shrink-0" />
                  <span>日志</span>
                </button>
              </li>
            </ul>
            <div className="mt-3">
              <ul className="space-y-1 flex-1">
                {items.map(item => (
                    <li key={item.id} className="group relative">
                      <button
                          onClick={() => onSelectItem(item.id)}
                          onMouseEnter={e => { if (activeItem !== item.id) e.currentTarget.style.background = 'rgba(192, 97, 42, 0.14)' }}
                          onMouseLeave={e => { if (activeItem !== item.id) e.currentTarget.style.background = 'transparent' }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
                          style={{ background: activeItem === item.id ? 'rgba(192, 97, 42, 0.08)' : 'transparent', color: activeItem === item.id ? '#c0612a' : '#5c5049', fontWeight: activeItem === item.id ? 500 : 400 }}
                      >
                        <Icon name={item.icon || item.id} className="w-5 h-5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                      <button onClick={e => { e.stopPropagation(); onEdit(item) }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192, 97, 42, 0.14)'; e.currentTarget.style.color = '#c0612a' }} onMouseLeave={e => { e.currentTarget.style.background = '#faf8f4'; e.currentTarget.style.color = '#c9c0b4' }} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded transition-all" style={{ color: '#c9c0b4', background: '#faf8f4' }} aria-label="编辑栏目" title="编辑栏目">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none"><path d="M14.5 3.5L16.5 5.5M3 17l2-6 8.5-8.5a2.12 2.12 0 0 1 3 3L8 14l-6 2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </li>
                ))}
              </ul>
            </div>
          </nav>

        </aside>
      </>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard')
  const [sidebarItems, setSidebarItems] = useState(DEFAULT_SIDEBAR)
  const [sidebarModalOpen, setSidebarModalOpen] = useState(false)
  const [editingSidebarItem, setEditingSidebarItem] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [sidebarContextMenu, setSidebarContextMenu] = useState(null)
  const searchRef = useRef(null)

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [categoryStats, setCategoryStats] = useState([])
  const [favorites, setFavorites] = useState([])
  const [logs, setLogs] = useState([])
  const [backendStatus, setBackendStatus] = useState('checking') // checking | online | offline
  const [clickRanking, setClickRanking] = useState([])
  const [imgErrors, setImgErrors] = useState({})

  // 加载点击排行榜（同步最新卡片标题）
  useEffect(() => {
    if (activeSidebarItem === 'dashboard') {
      Promise.all([
        fetch(`${API_BASE}/clicks`).then(res => res.json()),
        fetch(`${API_BASE}/files`).then(res => res.json())
      ]).then(([clicksData, files]) => {
        const sidebarFiles = files.filter(f => f !== 'sidebar' && f !== 'stats' && f !== 'dashboard' && f !== 'favorites' && f !== 'logs' && f !== 'clicks')
        Promise.all(sidebarFiles.map(f => fetch(`${API_BASE}/data/${f}`).then(r => r.json())))
          .then(allCards => {
            const titleMap = {}
            allCards.flat().forEach(c => { if (c && c.id) titleMap[c.id] = c.title })
            const updated = (Array.isArray(clicksData) ? clicksData : []).map(item => ({
              ...item,
              cardTitle: titleMap[item.cardId] || item.cardTitle
            }))
            setClickRanking(updated)
          })
          .catch(() => setClickRanking(Array.isArray(clicksData) ? clicksData : []))
      }).catch(() => {})
    }
  }, [activeSidebarItem])

  // 检测后端状态
  useEffect(() => {
    const checkBackend = () => {
      fetch(`${API_BASE}/files`, { signal: AbortSignal.timeout(5000) })
          .then(res => {
            if (res.ok) setBackendStatus('online')
          })
          .catch(() => setBackendStatus('offline'))
    }
    checkBackend()
    const interval = setInterval(checkBackend, 3600000) // 每小时检测一次
    return () => clearInterval(interval)
  }, [])

  // 加载左侧栏目数据
  useEffect(() => {
    fetch(`${API_BASE}/data/sidebar`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setSidebarItems(data) })
        .catch(() => {})
  }, [])

  // 加载收藏夹数据
  useEffect(() => {
    fetch(`${API_BASE}/data/favorites`)
        .then(res => res.json())
        .then(data => setFavorites(Array.isArray(data) ? data : []))
        .catch(() => {})
  }, [])

  // 加载日志数据
  useEffect(() => {
    fetch(`${API_BASE}/data/logs`)
        .then(res => res.json())
        .then(data => setLogs(Array.isArray(data) ? data : []))
        .catch(() => {})
  }, [])

  // 加载栏目数据
  useEffect(() => {
    if (activeSidebarItem === 'dashboard') {
      setCards([])
      // 每次会话只统计一次
      if (!sessionStorage.getItem('visited')) {
        sessionStorage.setItem('visited', 'true')
        fetch(`${API_BASE}/data/stats`, { method: 'POST' })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => {})
      } else {
        fetch(`${API_BASE}/data/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => {})
      }
      // 获取真实分类统计
      Promise.all([
        fetch(`${API_BASE}/data/sidebar`).then(res => res.json()),
        fetch(`${API_BASE}/files`).then(res => res.json()),
      ]).then(([sidebarData, files]) => {
        const sidebarMap = {}
        sidebarData.forEach(item => { sidebarMap[item.id] = item.label })
        const dataFiles = files.filter(f => f !== 'sidebar' && f !== 'stats' && f !== 'dashboard' && f !== 'favorites' && f !== 'logs')
        return Promise.all(dataFiles.map(f =>
            fetch(`${API_BASE}/data/${f}`)
                .then(res => res.json())
                .then(data => ({
                  name: sidebarMap[f] || f,
                  count: Array.isArray(data) ? data.length : 0
                }))
                .catch(() => ({ name: sidebarMap[f] || f, count: 0 }))
        ))
      }).then(results => setCategoryStats(results.filter(r => r.count > 0)))
          .catch(() => {})
      return
    }
    if (activeSidebarItem === 'favorites') {
      setCards(favorites.map(f => ({ ...f, pinned: false })))
      setSearch('')
      setActiveCategory('全部')
      return
    }
    if (activeSidebarItem === 'logs') {
      setCards([])
      setSearch('')
      setActiveCategory('全部')
      return
    }
    setLoading(true)
    fetch(`${API_BASE}/data/${activeSidebarItem}`)
        .then(res => res.json())
        .then(data => { setCards(Array.isArray(data) ? data : []); setLoading(false) })
        .catch(() => { setCards([]); setLoading(false) })
    setSearch('')
    setActiveCategory('全部')
  }, [activeSidebarItem])

  // 保存到后端
  const saveCards = useCallback((newCards) => {
    if (activeSidebarItem === 'dashboard') return
    setCards(newCards)
    fetch(`${API_BASE}/data/${activeSidebarItem}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCards),
    }).catch(console.error)
  }, [activeSidebarItem])

  // 保存栏目到后端
  const saveSidebarItems = useCallback((newItems) => {
    setSidebarItems(newItems)
    fetch(`${API_BASE}/data/sidebar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItems),
    }).catch(console.error)
  }, [])

  const categories = useMemo(() => ['全部', ...new Set([...DEFAULT_CATEGORIES, ...cards.map(c => c.category)])], [cards])

  const filtered = useMemo(() => {
    return cards
        .filter(card => {
          const matchSearch = card.title.toLowerCase().includes(search.toLowerCase()) || card.description.toLowerCase().includes(search.toLowerCase())
          const matchCategory = activeCategory === '全部' || card.category === activeCategory
          return matchSearch && matchCategory
        })
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          return 0
        })
  }, [cards, search, activeCategory])

  useEffect(() => {
    const handler = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = e => e.preventDefault()
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  useEffect(() => {
    setFocusedIndex(-1)
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target) } }) }, { threshold: 0.06 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [filtered])

  const handleKeyDown = useCallback(e => {
    if (filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter' && focusedIndex >= 0) { const card = filtered[focusedIndex]; if (card) window.open(card.url, '_blank', 'noopener,noreferrer') }
    else if (e.key === 'Escape') { searchRef.current?.blur(); setFocusedIndex(-1) }
  }, [filtered, focusedIndex])

  const clearFilter = () => { setSearch(''); setActiveCategory('全部') }

  // 添加日志记录
  const addLog = useCallback((card, action) => {
    const currentSidebar = sidebarItems.find(i => i.id === activeSidebarItem)
    const logEntry = {
      id: `log-${Date.now()}`,
      ip: '127.0.0.1',
      sidebarId: activeSidebarItem,
      sidebarLabel: currentSidebar?.label || '未知',
      cardTitle: card.title,
      category: card.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setLogs(prev => [logEntry, ...prev])
    fetch(`${API_BASE}/data/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry),
    }).catch(console.error)
  }, [activeSidebarItem, sidebarItems])

  const handleAddCard = () => { setEditingCard(null); setModalOpen(true) }
  const handleEditCard = card => { setEditingCard(card); setModalOpen(true) }
  const handleSaveCard = card => {
    setCards(prev => {
      const exists = prev.find(c => c.id === card.id)
      const newCards = exists ? prev.map(c => c.id === card.id ? card : c) : [...prev, card]
      saveCards(newCards)
      addLog(card, exists ? 'update' : 'create')
      return newCards
    })
  }
  const handleDeleteCard = id => {
    const newCards = cards.filter(c => c.id !== id)
    saveCards(newCards)
  }
  const handleTogglePin = id => {
    const newCards = cards.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c)
    saveCards(newCards)
  }
  const handleToggleFavorite = card => {
    const isFavorited = favorites.some(f => f.id === card.id)
    let newFavorites
    if (isFavorited) {
      newFavorites = favorites.filter(f => f.id !== card.id)
    } else {
      newFavorites = [...favorites, { ...card, favoriteId: Date.now() }]
    }
    setFavorites(newFavorites)
    fetch(`${API_BASE}/data/favorites`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFavorites),
    }).catch(console.error)
  }

  const handleAddSidebarItem = () => { setEditingSidebarItem(null); setSidebarModalOpen(true) }
  const handleEditSidebarItem = item => { setEditingSidebarItem(item); setSidebarModalOpen(true) }
  const handleSaveSidebarItem = item => {
    const exists = sidebarItems.find(i => i.id === item.id)
    const newItems = exists ? sidebarItems.map(i => i.id === item.id ? item : i) : [...sidebarItems, item]
    saveSidebarItems(newItems)
  }
  const handleDeleteSidebarItem = id => {
    const newItems = sidebarItems.filter(i => i.id !== id)
    if (activeSidebarItem === id && newItems.length > 0) setActiveSidebarItem(newItems[0].id)
    saveSidebarItems(newItems)
  }

  const currentSidebarItem = sidebarItems.find(i => i.id === activeSidebarItem)

  return (
      <div className="min-h-screen flex" onContextMenu={e => {
        if (e.target.closest('aside')) {
          e.preventDefault()
          setSidebarContextMenu({ x: e.clientX, y: e.clientY })
          return
        }
        e.preventDefault()
        const cardEl = e.target.closest('[data-card-id]')
        const cardId = cardEl?.dataset.cardId
        const cardData = cardId ? filtered.find(c => c.id === cardId) : null
        setContextMenu({ x: e.clientX, y: e.clientY, card: cardData || null })
      }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} items={sidebarItems} activeItem={activeSidebarItem} onSelectItem={setActiveSidebarItem} onEdit={handleEditSidebarItem} />
        <div className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center px-4" style={{ background: 'rgba(250, 248, 244, 0.88)', borderBottom: '1px solid #ede9e1', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg" style={{ color: '#5c5049' }} aria-label="打开侧边栏"><Icon name="menu" className="w-5 h-5" /></button>
          </header>
          <main className="max-w-6xl mx-auto px-6 py-12" onKeyDown={handleKeyDown} tabIndex={-1}>
            {activeSidebarItem === 'dashboard' ? (
                <div>
                  <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#3d3831' }}>数据概览</h1>
                    <p className="text-sm" style={{ color: '#8c7e72' }}>网站访问与链接统计</p>
                  </div>

                  {(stats || backendStatus === 'offline') ? (
                      <>
                        {/* 后端状态 */}
                        <div className="mb-8 flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{
                            background: backendStatus === 'offline' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            color: backendStatus === 'offline' ? '#dc2626' : '#16a34a'
                          }}>
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: backendStatus === 'offline' ? '#ef4444' : '#22c55e' }} />
                            {backendStatus === 'checking' ? '检测中...' : backendStatus === 'offline' ? '后端服务断开' : '后端服务正常'}
                          </div>
                        </div>

                        {stats && (
                            <>
                              {/* 顶部统计卡片 */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <StatsCard title="总访问量" value={stats.totalVisits.toLocaleString()} subtitle="累计浏览次数" accent />
                                <StatsCard title="本周访问" value={stats.last7Days.reduce((s, d) => s + d.count, 0)} subtitle="最近7天" />
                                <StatsCard title="链接总数" value={categoryStats.reduce((s, c) => s + c.count, 0)} subtitle="各分类合计" />
                                <StatsCard title="分类数量" value={stats.categories.length} subtitle="活跃分类" />
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* 分类统计 */}
                              <section className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #ede9e1' }}>
                                <h2 className="text-sm font-semibold pb-3 mb-3" style={{ color: '#8c7e72', borderBottom: '1px solid #ede9e1' }}>栏目网站数量</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {categoryStats.map((cat, i) => {
                                    const max = Math.max(...categoryStats.map(c => c.count))
                                    const width = max > 0 ? (cat.count / max) * 100 : 0
                                    return (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #ede9e1' }}>
                                          <span className="text-sm font-medium w-16 shrink-0 truncate" style={{ color: '#3d3831' }} title={cat.name}>{cat.name}</span>
                                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#f0ece4' }}>
                                            <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, background: '#c0612a' }} />
                                          </div>
                                          <span className="text-sm font-semibold w-8 text-right shrink-0" style={{ color: '#c0612a' }}>{cat.count}</span>
                                        </div>
                                    )
                                  })}
                                </div>
                              </section>

                              {/* 卡片点击排行榜 */}
                              {clickRanking.length > 0 && (
                                <section className="rounded-2xl p-4" style={{ background: '#ffffff', border: '1px solid #ede9e1' }}>
                                  <h2 className="text-sm font-semibold pb-3 mb-3" style={{ color: '#8c7e72', borderBottom: '1px solid #ede9e1' }}>卡片点击 Top5 排行</h2>
                                  <div className="space-y-2">
                                    {(() => {
                                      const maxCount = clickRanking[0]?.count || 1
                                      return clickRanking.slice(0, 5).map((item, i) => {
                                        const width = (item.count / maxCount) * 100
                                        return (
                                          <div
                                            key={item.cardId}
                                            className="grid gap-x-3 gap-y-2 py-3 px-3.5 rounded-lg transition-all"
                                            style={{ background: '#ffffff', border: '1px solid #ede9e1', gridTemplateColumns: 'auto auto 1fr auto auto', alignItems: 'center' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                                          >
                                            <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold shrink-0 text-sm" style={{
                                              background: i === 0 ? 'rgba(255, 193, 7, 0.12)' : i === 1 ? 'rgba(192, 192, 192, 0.12)' : i === 2 ? 'rgba(205, 127, 50, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                                              color: i === 0 ? '#d97706' : i === 1 ? '#64748b' : i === 2 ? '#b45309' : '#8c7e72'
                                            }}>
                                              {i + 1}
                                            </div>
                                            <img
                                              src={imgErrors[item.cardId] ? '/icon/mengyou.png' : (item.favicon || '/icon/mengyou.png')}
                                              alt=""
                                              className="w-6 h-6 rounded shrink-0"
                                              onError={e => {
                                                if (!imgErrors[item.cardId]) {
                                                  setImgErrors(prev => ({ ...prev, [item.cardId]: true }))
                                                }
                                              }}
                                            />
                                            <div className="text-sm font-medium truncate" style={{ color: '#3d3831' }}>{item.cardTitle}</div>
                                            <span className="px-2 py-0.5 rounded text-xs shrink-0" style={{ background: 'rgba(192, 97, 42, 0.08)', color: '#c0612a' }}>
                                              {item.category || item.sidebarLabel}
                                            </span>
                                            <div className="flex items-center gap-2 shrink-0">
                                              <div className="w-16 sm:w-20 h-2 rounded-full overflow-hidden" style={{ background: '#f0ece4' }}>
                                                <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, background: '#c0612a' }} />
                                              </div>
                                              <span className="font-semibold text-sm w-8 text-right" style={{ color: '#c0612a' }}>{item.count}</span>
                                            </div>
                                          </div>
                                        )
                                      })
                                    })()}
                                  </div>
                                </section>
                              )}
                              </div>

                              {stats && stats.last7Days && (
                                <div className="mt-6">
                                  <TrendChart data={stats.last7Days} />
                                </div>
                              )}
                            </>
                        )}
                      </>
                  ) : (
                      <div className="text-center py-16">
                        <p style={{ color: '#c9c0b4' }}>加载中...</p>
                      </div>
                  )}
                </div>
            ) : activeSidebarItem === 'logs' ? (
                <div>
                  <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#3d3831' }}>日志</h1>
                    <p className="text-sm" style={{ color: '#8c7e72' }}>{logs.length} 条记录</p>
                  </div>
                  <LogList logs={logs} sidebarItems={sidebarItems} />
                </div>
            ) : (
                <>
                  <div className="flex items-start justify-between mb-10">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#3d3831' }}>{activeSidebarItem === 'favorites' ? '收藏夹' : (currentSidebarItem?.label || '导航站')}</h1>
                      <p className="text-sm" style={{ color: '#b5ada3' }}>{filtered.length} 个链接</p>
                    </div>
                  </div>
                  <div className="relative max-w-md mb-6">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#c9c0b4' }} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    <input ref={searchRef} type="text" className="search-input" placeholder="搜索..." value={search} onChange={e => setSearch(e.target.value)} aria-label="搜索链接" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-10">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={"tag " + (activeCategory === cat ? 'tag-active' : 'tag-inactive')}>{cat}</button>
                    ))}
                  </div>
                  {filtered.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list" aria-label="链接列表">
                        {filtered.map((card, i) => (
                            <div key={card.id} data-card-id={card.id} className="reveal" style={{ animationDelay: Math.min(i * 40, 320) + 'ms' }} role="listitem">
                              <BentoCard key={card.id} card={card} isFocused={focusedIndex === i} isFavorited={favorites.some(f => f.id === card.id)} inFavorites={activeSidebarItem === 'favorites'} sidebarItem={currentSidebarItem} />
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-24">
                        <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-2xl" style={{ background: '#ffffff', border: '1px solid #ede9e1', boxShadow: '0 1px 4px rgba(61,56,49,0.06)' }}>
                          <svg className="w-6 h-6" style={{ color: '#c9c0b4' }} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" /></svg>
                        </div>
                        <p className="text-sm mb-3" style={{ color: '#b5ada3' }}>没有找到匹配的链接</p>
                        <button onClick={clearFilter} className="text-sm font-medium transition-colors" style={{ color: '#c0612a' }}>清除筛选</button>
                      </div>
                  )}
               </>
            )}
        </main>
      </div>
      <CardModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveCard} onDelete={handleDeleteCard} card={editingCard} categories={categories} />
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} card={contextMenu.card} onClose={() => setContextMenu(null)} onEdit={handleEditCard} onDelete={handleDeleteCard} onAdd={handleAddCard} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} isFavorited={contextMenu.card ? favorites.some(f => f.id === contextMenu.card.id) : false} />}
      <SidebarModal isOpen={sidebarModalOpen} onClose={() => setSidebarModalOpen(false)} onSave={handleSaveSidebarItem} onDelete={handleDeleteSidebarItem} item={editingSidebarItem} />
      {sidebarContextMenu && (
        <SidebarContextMenu
          x={sidebarContextMenu.x}
          y={sidebarContextMenu.y}
          onAdd={() => { handleAddSidebarItem(); setSidebarContextMenu(null) }}
          onClose={() => setSidebarContextMenu(null)}
        />
      )}
    </div>
  )
}