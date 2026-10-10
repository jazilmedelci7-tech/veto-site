import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { Fiche, Rdv, seedFiches, seedRdvs } from './data'

const KEY = 'vet-data-v1' // Stockage navigateur : à remplacer par l'API MongoDB (voir README)
interface State { fiches: Fiche[]; rdvs: Rdv[] }
interface Ctx extends State {
  saveFiche: (f: Fiche) => void
  deleteFiche: (id: string) => void
  addRdv: (r: Pick<Rdv, 'nom' | 'telephone' | 'animal' | 'date' | 'message'>) => void
  setRdvStatut: (id: string, s: Rdv['statut']) => void
  deleteRdv: (id: string) => void
}
export const newId = () => Math.random().toString(36).slice(2, 10)
const load = (): State => {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r) } catch { /* ignore */ }
  return { fiches: seedFiches, rdvs: seedRdvs }
}
const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ } }, [s])
  const value: Ctx = {
    ...s,
    saveFiche: (f) => setS((p) => ({ ...p, fiches: p.fiches.some((x) => x.id === f.id) ? p.fiches.map((x) => (x.id === f.id ? f : x)) : [f, ...p.fiches] })),
    deleteFiche: (id) => setS((p) => ({ ...p, fiches: p.fiches.filter((x) => x.id !== id) })),
    addRdv: (r) => setS((p) => ({ ...p, rdvs: [{ ...r, id: newId(), statut: 'nouvelle', createdAt: new Date().toISOString().slice(0, 10) }, ...p.rdvs] })),
    setRdvStatut: (id, statut) => setS((p) => ({ ...p, rdvs: p.rdvs.map((x) => (x.id === id ? { ...x, statut } : x)) })),
    deleteRdv: (id) => setS((p) => ({ ...p, rdvs: p.rdvs.filter((x) => x.id !== id) })),
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('StoreProvider manquant')
  return c
}
