import { useState, useEffect, useRef } from 'react'

export default function CardModal({ isOpen, onClose, onSave, onDelete, card, categories }) {
  const [form, setForm] = useState({ title: '', description: '', url: '', category: '', favicon: '' })
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (card) {
        setForm({ title: card.title, description: card.description, url: card.url, category: card.category, favicon: card.favicon || '' })
      } else {
        setForm({ title: '', description: '', url: '', category: categories[1] || '', favicon: '' })
      }
      setErrors({})
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [isOpen, card, categories])

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = '请输入标题'
    if (!form.url.trim()) errs.url = '请输入链接'
    else if (!/^https?:\/\/.+/.test(form.url)) errs.url = '链接格式不正确'
    if (!form.category.trim()) errs.category = '请选择分类'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validate()) return
    // 自动从 URL 提取 favicon
    let favicon = form.favicon
    if (!favicon && form.url) {
      try {
        const domain = new URL(form.url).hostname
        favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      } catch {}
    }
    onSave({
      ...form,
      favicon,
      id: card?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{
          background: '#ffffff',
          border: '1px solid #ede9e1',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: '#3d3831' }}>
            {card ? '编辑链接' : '新增链接'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#8c7e72' }}
            aria-label="关闭"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5c5049' }}>
              标题
            </label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all"
              style={{
                background: '#faf8f4',
                borderColor: errors.title ? '#e53e3e' : '#ede9e1',
                color: '#3d3831',
              }}
              placeholder="例如：React 官方文档"
            />
            {errors.title && (
              <p className="mt-1 text-xs" style={{ color: '#e53e3e' }}>{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5c5049' }}>
              链接
            </label>
            <input
              type="url"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all"
              style={{
                background: '#faf8f4',
                borderColor: errors.url ? '#e53e3e' : '#ede9e1',
                color: '#3d3831',
              }}
              placeholder="https://"
            />
            {errors.url && (
              <p className="mt-1 text-xs" style={{ color: '#e53e3e' }}>{errors.url}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5c5049' }}>
              描述
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all resize-none"
              style={{
                background: '#faf8f4',
                borderColor: '#ede9e1',
                color: '#3d3831',
              }}
              rows={2}
              placeholder="简短描述（可选）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5c5049' }}>
              分类
            </label>
            <input
              type="text"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all"
              style={{
                background: '#faf8f4',
                borderColor: errors.category ? '#e53e3e' : '#ede9e1',
                color: '#3d3831',
              }}
              placeholder="例如：前端、工具、文档"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {categories.filter(c => c !== '全部').map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && (
              <p className="mt-1 text-xs" style={{ color: '#e53e3e' }}>{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5c5049' }}>
              Logo <span style={{ color: '#c9c0b4', fontWeight: 400 }}>（可选，自动获取）</span>
            </label>
            <input
              type="url"
              value={form.favicon}
              onChange={e => setForm(f => ({ ...f, favicon: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all"
              style={{
                background: '#faf8f4',
                borderColor: '#ede9e1',
                color: '#3d3831',
              }}
              placeholder="https://www.google.com/s2/favicons?domain=..."
            />
            <p className="mt-1 text-xs" style={{ color: '#c9c0b4' }}>
              留空则自动从链接获取 favicon
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            {card && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(card.id)
                  onClose()
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }}
              >
                删除
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: '#f5f1eb',
                color: '#5c5049',
                border: '1px solid #ede9e1',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: '#c0612a',
                color: '#ffffff',
              }}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}