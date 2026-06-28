import { useState, useEffect, useRef } from 'react'
import ConfirmDialog from './ConfirmDialog.jsx'

const SIDEBAR_ICONS = [
  { id: 'dashboard', label: '仪表盘' },
  { id: 'portfolio', label: '作品集' },
  { id: 'github', label: 'GitHub' },
  { id: 'bookmark', label: '收藏' },
  { id: 'notes', label: '笔记' },
  { id: 'tools', label: '工具' },
]

const IconPreview = ({ name, className = '' }) => {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    portfolio: (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <path d="M3 14V6l4-2 4 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="5" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    github: (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <path d="M10 3c-3.87 0-7 3.13-7 7 0 3.09 2 5.73 4.77 6.65.35.06.48-.15.48-.34v-1.2c-1.94.42-2.35-.94-2.35-.94-.32-.81-.78-1.03-.78-1.03-.64-.44.05-.43.05-.43.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.93-1.55-.18-3.18-.78-3.18-3.45 0-.76.27-1.38.72-1.87-.07-.18-.31-.89.07-1.84 0 0 .59-.19 1.93.72a6.7 6.7 0 0 1 1.75-.24c.6 0 1.2.08 1.75.24 1.34-.91 1.93-.72 1.93-.72.38.95.14 1.66.07 1.84.45.49.72 1.11.72 1.87 0 2.68-1.63 3.27-3.19 3.45.25.22.48.64.48 1.29v1.91c0 .19.13.4.48.34A6.997 6.997 0 0 0 17 10c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
    bookmark: (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <path d="M5 3a2 2 0 0 0-2 2v12l5-3 5 3V5a2 2 0 0 0-2-2H5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    notes: (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <path d="M4 4h12v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 8h4M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    tools: (
      <svg viewBox="0 0 20 20" fill="none" className={className}>
        <path d="M14.5 5.5L5.5 14.5M8 3l2 2M12 7l2 2M3 12l2 2M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  }
  return icons[name] || icons.dashboard
}

export default function SidebarModal({ isOpen, onClose, onSave, onDelete, item }) {
  const [form, setForm] = useState({ id: '', label: '', icon: 'dashboard' })
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const labelRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setForm({ id: item.id, label: item.label, icon: item.icon || 'dashboard' })
      } else {
        setForm({ id: '', label: '', icon: 'dashboard' })
      }
      setErrors({})
      setTimeout(() => labelRef.current?.focus(), 100)
    }
  }, [isOpen, item])

  const validate = () => {
    const errs = {}
    if (!form.id.trim()) errs.id = '请输入 ID'
    else if (!/^[a-z0-9-]+$/.test(form.id)) errs.id = 'ID 只能包含小写字母、数字和连字符'
    if (!form.label.trim()) errs.label = '请输入名称'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validate()) return
    onSave({ ...form, id: form.id.toLowerCase().replace(/\s+/g, '-') })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{ background: '#ffffff', border: '1px solid #ede9e1' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: '#3d3831' }}>
            {item ? '编辑栏目' : '新增栏目'}
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
              栏目名称
            </label>
            <input
              ref={labelRef}
              type="text"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all"
              style={{
                background: '#faf8f4',
                borderColor: errors.label ? '#e53e3e' : '#ede9e1',
                color: '#3d3831',
              }}
              placeholder="例如：我的收藏"
            />
            {errors.label && <p className="mt-1 text-xs" style={{ color: '#e53e3e' }}>{errors.label}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5c5049' }}>
              栏目 ID <span style={{ color: '#c9c0b4', fontWeight: 400 }}>（唯一标识）</span>
            </label>
            <input
              type="text"
              value={form.id}
              onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none transition-all"
              style={{
                background: item ? '#f0ede8' : '#faf8f4',
                borderColor: errors.id ? '#e53e3e' : '#ede9e1',
                color: item ? '#8c7e72' : '#3d3831',
              }}
              placeholder="例如：my-favorites"
              disabled={!!item}
              readOnly={!!item}
            />
            {errors.id && <p className="mt-1 text-xs" style={{ color: '#e53e3e' }}>{errors.id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5c5049' }}>
              图标
            </label>
            <div className="grid grid-cols-6 gap-2">
              {SIDEBAR_ICONS.map(icon => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon: icon.id }))}
                  className="p-2 rounded-xl transition-all"
                  style={{
                    background: form.icon === icon.id ? 'rgba(192, 97, 42, 0.1)' : '#faf8f4',
                    border: form.icon === icon.id ? '2px solid #c0612a' : '2px solid transparent',
                    color: form.icon === icon.id ? '#c0612a' : '#8c7e72',
                  }}
                  title={icon.label}
                >
                  <IconPreview name={icon.id} className="w-5 h-5 mx-auto" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {item && onDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
              >
                删除
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: '#f5f1eb', color: '#5c5049', border: '1px solid #ede9e1' }}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: '#c0612a', color: '#ffffff' }}
            >
              保存
            </button>
          </div>
        </form>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title={item.label}
          message={`确定要删除「${item.label}」吗？该栏目下的所有链接也会被删除。`}
          onConfirm={() => { onDelete(item.id); onClose() }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
