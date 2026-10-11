import React, { useEffect } from 'react'
import { Sparkles, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type: 'success' | 'info' | 'warning' | 'error'
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) =>
      setTimeout(() => {
        onDismiss(t.id)
      }, 5000)
    )
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [toasts, onDismiss])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 shadow-2xl backdrop-blur-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-300'
              : toast.type === 'warning'
              ? 'border-amber-500/40 bg-slate-900/95 text-amber-300'
              : toast.type === 'error'
              ? 'border-rose-500/40 bg-slate-900/95 text-rose-300'
              : 'border-sky-500/40 bg-slate-900/95 text-sky-300'
          }`}
        >
          {toast.type === 'success' ? (
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          ) : toast.type === 'warning' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
          )}

          <div className="flex-1">
            <h5 className="text-xs font-semibold text-slate-100">{toast.title}</h5>
            {toast.description && (
              <p className="mt-0.5 text-[11px] text-slate-400">{toast.description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
