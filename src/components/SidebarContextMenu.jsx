import { useState, useEffect, useRef } from 'react'

export default function SidebarContextMenu({ x, y, onAdd, onEdit, onClose }) {
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

  const style = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 100) + 'px',
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
        <button
          style={btnStyle}
          onClick={() => { onAdd(); onClose() }}
          onMouseEnter={e => e.target.style.background = '#faf8f4'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" style={{color: '#c0612a'}}>
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          新增栏目
        </button>
      </div>
    </div>
  )
}