import { useState, useRef, useEffect } from 'react'

const formatDisplay = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '' : dateStr
}

function DatePicker({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selectedDate = value ? new Date(value + 'T00:00:00') : null
  const displayText = value ? value : placeholder || '选择日期'

  useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : currentYear)
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : currentMonth)

  useEffect(() => {
    if (open && selectedDate) {
      setViewYear(selectedDate.getFullYear())
      setViewMonth(selectedDate.getMonth())
    }
  }, [open, selectedDate])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  // 周一作为起始 (0=周一, 6=周日)
  const startDay = firstDay === 0 ? 6 : firstDay - 1

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const selectDate = (day) => {
    const month = String(viewMonth + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    onChange(`${viewYear}-${month}-${dayStr}`)
    setOpen(false)
  }

  const isToday = (day) => {
    return viewYear === currentYear && viewMonth === currentMonth && day === today.getDate()
  }

  const isSelected = (day) => {
    return selectedDate && viewYear === selectedDate.getFullYear() &&
      viewMonth === selectedDate.getMonth() && day === selectedDate.getDate()
  }

  const isFuture = (day) => {
    const d = new Date(viewYear, viewMonth, day)
    return d > today
  }

  const weeks = []
  let day = 1 - startDay
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      week.push(day)
      day++
    }
    weeks.push(week)
    if (day > daysInMonth) break
  }

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const dayNames = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-9 pr-8 py-2 rounded-xl text-sm cursor-pointer transition-all hover:border-[#c9c0b4]"
        style={{
          background: '#ffffff',
          border: '1px solid #ede9e1',
          color: value ? '#3d3831' : '#b5ada3',
          outline: 'none',
          minWidth: '140px'
        }}
      >
        <svg className="absolute left-3 w-4 h-4 pointer-events-none" style={{ color: '#8c7e72' }} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>{displayText}</span>
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 z-50 rounded-2xl shadow-lg p-4"
          style={{ background: '#ffffff', border: '1px solid #ede9e1', minWidth: '300px' }}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[#faf8f4]"
              style={{ color: '#5c5049' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-sm font-semibold" style={{ color: '#3d3831' }}>
              {viewYear} 年 {monthNames[viewMonth]}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[#faf8f4]"
              style={{ color: '#5c5049' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* 星期头 */}
          <div className="flex mb-2">
            {dayNames.map(d => (
              <div key={d} className="w-9 text-center text-xs" style={{ color: '#8c7e72' }}>{d}</div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex">
                {week.map((day, di) => {
                  const inMonth = day >= 1 && day <= daysInMonth
                  const future = inMonth && isFuture(day)

                  return (
                    <button
                      key={di}
                      type="button"
                      disabled={!inMonth || future}
                      onClick={() => inMonth && !future && selectDate(day)}
                      className="w-9 h-9 text-sm rounded-lg transition-all disabled:opacity-30"
                      style={{
                        background: isSelected(day) ? '#c0612a' : isToday(day) && inMonth ? 'rgba(192, 97, 42, 0.1)' : 'transparent',
                        color: isSelected(day) ? '#ffffff' : inMonth ? '#3d3831' : '#c9c0b4',
                        fontWeight: isSelected(day) || (isToday(day) && inMonth) ? '600' : '400'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected(day) && inMonth && !future) {
                          e.currentTarget.style.background = 'rgba(192, 97, 42, 0.08)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected(day)) {
                          e.currentTarget.style.background = isToday(day) && inMonth ? 'rgba(192, 97, 42, 0.1)' : 'transparent'
                        }
                      }}
                    >
                      {inMonth ? day : ''}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { DatePicker, formatDisplay }