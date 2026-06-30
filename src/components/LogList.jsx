import { useState, useRef, useEffect } from 'react'
import { DatePicker } from './DatePicker.jsx'

const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function CustomDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find(o => o === value) || options[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
        style={{ background: '#ffffff', border: '1px solid #ede9e1', color: '#3d3831' }}
      >
        <span>{selected}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: '#8c7e72' }} viewBox="0 0 20 20" fill="none">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 rounded-lg overflow-hidden shadow-lg" style={{ background: '#ffffff', border: '1px solid #ede9e1', minWidth: '120px' }}>
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm transition-colors"
              style={{ background: opt === selected ? '#faf8f4' : 'transparent', color: '#3d3831' }}
              onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
              onMouseLeave={e => e.currentTarget.style.background = opt === selected ? '#faf8f4' : 'transparent'}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const PAGE_SIZE = 10

export default function LogList({ logs, sidebarItems, visitors }) {
  const [activeTab, setActiveTab] = useState('changes') // changes | visitors
  const [search, setSearch] = useState('')
  const [filterSidebar, setFilterSidebar] = useState('全部')
  const [page, setPage] = useState(1)
  const [changesDateRange, setChangesDateRange] = useState({ start: '', end: '' }) // 改动日志日期筛选
  const [visitorsDateRange, setVisitorsDateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 6) // 默认最近7天
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }) // 访客日志日期筛选

  // 从 sidebarItems 获取栏目选项，排除 dashboard 和 favorites
  const sidebarOptions = ['全部', ...sidebarItems.filter(s => s.id !== 'dashboard').map(s => s.label)]

  // 网站改动日志筛选
  const filtered = logs.filter(log => {
    const matchSearch =
      log.cardTitle.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.includes(search) ||
      log.category.toLowerCase().includes(search.toLowerCase())
    const matchSidebar = filterSidebar === '全部' || log.sidebarLabel === filterSidebar
    const ts = new Date(log.updatedAt).getTime()
    const matchStart = !changesDateRange.start || ts >= new Date(changesDateRange.start).setHours(0, 0, 0, 0)
    const matchEnd = !changesDateRange.end || ts <= new Date(changesDateRange.end).setHours(23, 59, 59, 999)
    return matchSearch && matchSidebar && matchStart && matchEnd
  }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 访客日志筛选
  const filteredVisitors = (visitors || []).filter(v => {
    const matchSearch = search === '' ||
      v.ip.toLowerCase().includes(search.toLowerCase()) ||
      (v.browser && v.browser.toLowerCase().includes(search.toLowerCase())) ||
      (v.device && v.device.includes(search))
    const ts = new Date(v.timestamp).getTime()
    const matchStart = !visitorsDateRange.start || ts >= new Date(visitorsDateRange.start).setHours(0, 0, 0, 0)
    const matchEnd = !visitorsDateRange.end || ts <= new Date(visitorsDateRange.end).setHours(23, 59, 59, 999)
    return matchSearch && matchStart && matchEnd
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const visitorsTotalPages = Math.ceil(filteredVisitors.length / PAGE_SIZE)
  const paginatedVisitors = filteredVisitors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 搜索或筛选时重置页码
  useEffect(() => { setPage(1) }, [search, filterSidebar])

  const switchTab = (tab) => {
    setActiveTab(tab)
    setPage(1)
    setSearch('')
    setFilterSidebar('全部')
    setChangesDateRange({ start: '', end: '' })
    setVisitorsDateRange({ start: '', end: '' })
  }

  return (
    <div className="space-y-6">
      {/* 标签页切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => switchTab('changes')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: activeTab === 'changes' ? '#c0612a' : '#ffffff',
            color: activeTab === 'changes' ? '#ffffff' : '#5c5049',
            border: '1px solid ' + (activeTab === 'changes' ? '#c0612a' : '#ede9e1')
          }}
        >
          网站改动日志
        </button>
        <button
          onClick={() => switchTab('visitors')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: activeTab === 'visitors' ? '#c0612a' : '#ffffff',
            color: activeTab === 'visitors' ? '#ffffff' : '#5c5049',
            border: '1px solid ' + (activeTab === 'visitors' ? '#c0612a' : '#ede9e1')
          }}
        >
          网站访客日志
        </button>
      </div>

      {/* 搜索和筛选 - 仅改动日志显示 */}
      {activeTab === 'changes' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#c9c0b4' }} viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="搜索标题、IP、分类..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input pl-9"
            />
          </div>
          <CustomDropdown
            value={filterSidebar}
            options={sidebarOptions}
            onChange={setFilterSidebar}
          />
          <div className="flex items-center gap-2">
            <DatePicker
              value={changesDateRange.start}
              onChange={val => setChangesDateRange(prev => ({ ...prev, start: val }))}
              placeholder="开始日期"
            />
            <span className="text-sm px-1" style={{ color: '#b5ada3' }}>至</span>
            <DatePicker
              value={changesDateRange.end}
              onChange={val => setChangesDateRange(prev => ({ ...prev, end: val }))}
              placeholder="结束日期"
            />
            {(changesDateRange.start || changesDateRange.end) && (
              <button
                onClick={() => setChangesDateRange({ start: '', end: '' })}
                className="px-3 py-2 rounded-xl text-sm transition-all hover:bg-[#faf8f4]"
                style={{ background: 'transparent', color: '#8c7e72', border: '1px solid #ede9e1' }}
              >
                重置
              </button>
            )}
          </div>
        </div>
      )}

      {/* 搜索 - 仅访客日志显示 */}
      {activeTab === 'visitors' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#c9c0b4' }} viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="搜索IP、浏览器、设备..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <DatePicker
              value={visitorsDateRange.start}
              onChange={val => setVisitorsDateRange(prev => ({ ...prev, start: val }))}
              placeholder="开始日期"
            />
            <span className="text-sm px-1" style={{ color: '#b5ada3' }}>至</span>
            <DatePicker
              value={visitorsDateRange.end}
              onChange={val => setVisitorsDateRange(prev => ({ ...prev, end: val }))}
              placeholder="结束日期"
            />
            {(visitorsDateRange.start || visitorsDateRange.end) && (
              <button
                onClick={() => setVisitorsDateRange({ start: '', end: '' })}
                className="px-3 py-2 rounded-xl text-sm transition-all hover:bg-[#faf8f4]"
                style={{ background: 'transparent', color: '#8c7e72', border: '1px solid #ede9e1' }}
              >
                重置
              </button>
            )}
          </div>
        </div>
      )}

      {/* 网站改动日志内容 */}
      {activeTab === 'changes' && (
        filtered.length > 0 ? (
          <>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #ede9e1', background: '#ffffff' }}>
              <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: '#c9c0b4 transparent' }}>
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr style={{ background: '#faf8f4', borderBottom: '1px solid #ede9e1' }}>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>IP</th>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>栏目</th>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>卡片标题</th>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>分类</th>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>创建时间</th>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>更新时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((log, i) => (
                      <tr
                        key={log.id}
                        className="transition-colors"
                        style={{ borderBottom: i < paginated.length - 1 ? '1px solid #f0ece4' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap" style={{ color: '#3d3831' }}>{log.ip}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap" style={{ background: 'rgba(192, 97, 42, 0.08)', color: '#c0612a' }}>
                            {log.sidebarLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#3d3831' }}>{log.cardTitle}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-md text-xs whitespace-nowrap" style={{ background: '#f0ece4', color: '#5c5049' }}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: '#3d3831' }}>{formatDate(log.createdAt)}</td>
                        <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: '#3d3831' }}>{formatDate(log.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-40"
                  style={{ background: '#faf8f4', color: '#3d3831', border: '1px solid #ede9e1' }}
                >
                  上一页
                </button>
                <span className="px-3 py-1.5 text-sm" style={{ color: '#5c5049' }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-40"
                  style={{ background: '#faf8f4', color: '#3d3831', border: '1px solid #ede9e1' }}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p style={{ color: '#b5ada3' }}>暂无日志记录</p>
          </div>
        )
      )}

      {/* 网站访客日志内容 */}
      {activeTab === 'visitors' && (
        filteredVisitors.length > 0 ? (
          <>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #ede9e1', background: '#ffffff' }}>
              <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: '#c9c0b4 transparent' }}>
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr style={{ background: '#faf8f4', borderBottom: '1px solid #ede9e1' }}>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>IP</th>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>访问时间</th>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>浏览器</th>
                      <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#8c7e72' }}>设备</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVisitors.map((v, i) => (
                      <tr
                        key={i}
                        className="transition-colors"
                        style={{ borderBottom: i < paginatedVisitors.length - 1 ? '1px solid #f0ece4' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#faf8f4'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap" style={{ color: '#3d3831' }}>{v.ip}</td>
                        <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: '#3d3831' }}>{formatDate(v.timestamp)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-md text-xs whitespace-nowrap" style={{ background: '#f0ece4', color: '#5c5049' }}>
                            {v.browser}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap" style={{ background: 'rgba(192, 97, 42, 0.08)', color: '#c0612a' }}>
                            {v.device}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {visitorsTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-40"
                  style={{ background: '#faf8f4', color: '#3d3831', border: '1px solid #ede9e1' }}
                >
                  上一页
                </button>
                <span className="px-3 py-1.5 text-sm" style={{ color: '#5c5049' }}>
                  {page} / {visitorsTotalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(visitorsTotalPages, p + 1))}
                  disabled={page === visitorsTotalPages}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-40"
                  style={{ background: '#faf8f4', color: '#3d3831', border: '1px solid #ede9e1' }}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p style={{ color: '#b5ada3' }}>暂无访客记录</p>
          </div>
        )
      )}
    </div>
  )
}