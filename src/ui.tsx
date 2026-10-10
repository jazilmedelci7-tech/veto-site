import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${on ? 'in' : ''} ${className}`}>{children}</div>
}

const ToastCtx = createContext<(m: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const show = useCallback((m: string) => { setMsg(m); window.setTimeout(() => setMsg(null), 2600) }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div role="status" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 animate-pop rounded-xl bg-brand-dark px-5 py-3 font-bold text-white shadow-xl">{msg}</div>}
    </ToastCtx.Provider>
  )
}

export function Confirm({ open, title, text, label = 'Supprimer', onConfirm, onCancel }: { open: boolean; title: string; text: string; label?: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-brand-dark/50 p-4" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-label={title} className="card w-full max-w-md animate-pop" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-2 text-xl font-extrabold">{title}</h2>
        <p className="mb-6 text-brand-muted">{text}</p>
        <div className="flex justify-end gap-3"><button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button><button type="button" className="btn bg-red-700 text-white" onClick={onConfirm}>{label}</button></div>
      </div>
    </div>
  )
}
