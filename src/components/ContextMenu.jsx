import { useState, useEffect, useRef } from 'react'
import ConfirmDialog from './ConfirmDialog.jsx'

export default function ContextMenu({ x, y, card, onClose, onEdit, onDelete, onAdd, onTogglePin }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    const handleEsc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  // 防止菜单超出屏幕
  const style = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 140) + 'px',
    left: Math.min(x, window.innerWidth - 160) + 'px',
    zIndex: 100,
  }

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: 'transparent',
    color: '#3d3831',
  }

  return (
      <div ref={menuRef} style={style}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #ede9e1',
          borderRadius: '12px',
          padding: '6px',
          boxShadow: '0 4px 20px rgba(61,56,49,0.12)',
          minWidth: '140px',
        }}>
          {card ? (
              <>
                <button
                    style={btnStyle}
                    onClick={() => { onEdit(card); onClose() }}
                    onMouseEnter={e => e.target.style.background = '#faf8f4'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" style={{color: '#c0612a'}}>
                    <path d="M14.5 3.5L16.5 5.5M3 17l2-6 8.5-8.5a2.12 2.12 0 0 1 3 3L8 14l-6 2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  编辑
                </button>
                <button
                    style={btnStyle}
                    onClick={() => { onTogglePin(card.id); onClose() }}
                    onMouseEnter={e => e.target.style.background = '#faf8f4'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" style={{color: card.pinned ? '#c0612a' : '#8c7e72'}}>
                    <path d="M12 4l1 3h3l-2.5 2 1 3-2.5-1.5-2.5 1.5 1-3L8 7h3l1-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {card.pinned ? '取消置顶' : '置顶'}
                </button>
                <button
                    style={btnStyle}
                    onClick={() => setConfirmDelete(true)}
                    onMouseEnter={e => { e.target.style.background = '#fef2f2'; e.target.style.color = '#dc2626' }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#3d3831' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                    <path d="M3 6h14M8 6V4h4v2M5 6v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  删除
                </button>
              </>
          ) : (
              <button
                  style={btnStyle}
                  onClick={() => { onAdd(); onClose() }}
                  onMouseEnter={e => e.target.style.background = '#faf8f4'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" style={{color: '#c0612a'}}>
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                新增链接
              </button>
          )}
        </div>
        {confirmDelete && (
            <ConfirmDialog
                title={card.title}
                message={`确定要删除「${card.title}」吗？此操作不可恢复。`}
                onConfirm={() => { onDelete(card.id); onClose() }}
                onCancel={() => setConfirmDelete(false)}
            />
        )}
      </div>
  )
}
