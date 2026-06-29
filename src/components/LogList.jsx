import { useState, useRef, useEffect } from 'react'

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

export default function LogList({ logs, sidebarItems }) {
  const [search, setSearch] = useState('')
  const [filterSidebar, setFilterSidebar] = useState('全部')
  const [page, setPage] = useState(1)

  // 从 sidebarItems 获取栏目选项，排除 dashboard 和 favorites
  const sidebarOptions = ['全部', ...sidebarItems.filter(s => s.id !== 'dashboard').map(s => s.label)]

  const filtered = logs.filter(log => {
    const matchSearch =
      log.cardTitle.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.includes(search) ||
      log.category.toLowerCase().includes(search.toLowerCase())
    const matchSidebar = filterSidebar === '全部' || log.sidebarLabel === filterSidebar
    return matchSearch && matchSidebar
  }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 搜索或筛选时重置页码
  useEffect(() => { setPage(1) }, [search, filterSidebar])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
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
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #ede9e1', background: '#ffffff' }}>
            <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr style={{ background: '#faf8f4', borderBottom: '1px solid #ede9e1' }}>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: '#8c7e72' }}>IP</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: '#8c7e72' }}>栏目</th>
                    <th className="text-left px-4 py-3 font-medium" style={{ color: '#8c7e72' }}>卡片标题</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: '#8c7e72' }}>分类</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell" style={{ color: '#8c7e72' }}>创建时间</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell" style={{ color: '#8c7e72' }}>更新时间</th>
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
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#8c7e72' }}>{log.ip}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-2 py-1 rounded-md text-xs font-medium" style={{ background: 'rgba(192, 97, 42, 0.08)', color: '#c0612a' }}>
                          {log.sidebarLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: '#3d3831' }}>{log.cardTitle}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="px-2 py-1 rounded-md text-xs" style={{ background: '#f0ece4', color: '#5c5049' }}>
                          {log.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: '#8c7e72' }}>{formatDate(log.createdAt)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: '#8c7e72' }}>{formatDate(log.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
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
      )}
    </div>
  )
}
