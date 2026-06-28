export default function ConfirmDialog({ title, message, confirmText = '删除', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{ background: '#ffffff', border: '1px solid #ede9e1' }}
      >
        <h3 className="text-base font-semibold mb-2" style={{ color: '#1a1714' }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: '#8c7e72' }}>
          确定要删除<span style={{ color: '#c0612a', fontWeight: 600 }}>「{title}」</span>吗？此操作不可恢复。
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: '#f5f1eb', color: '#5c5049', border: '1px solid #ede9e1' }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: '#dc2626', color: '#ffffff' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}