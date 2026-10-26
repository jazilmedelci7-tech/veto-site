import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, ApiError, errMsg, type FicheInput, type ImageMeta } from './api'
import type { Fiche, FicheImage, Rdv } from './data'

interface Ctx {
  fiches: Fiche[]
  rdvs: Rdv[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  saveFiche: (f: Fiche, isNew: boolean) => Promise<Fiche>
  deleteFiche: (id: string) => Promise<void>
  uploadImage: (id: string, file: File, meta: ImageMeta) => Promise<Fiche>
  updateImage: (id: string, imgId: string, patch: Partial<Pick<FicheImage, 'type' | 'legende' | 'date'>>) => Promise<Fiche>
  deleteImage: (id: string, imgId: string) => Promise<Fiche>
  setRdvStatut: (id: string, s: Rdv['statut']) => Promise<void>
  deleteRdv: (id: string) => Promise<void>
}
const StoreCtx = createContext<Ctx | null>(null)

/** Données de l'espace vétérinaire, lues et écrites via l'API (MongoDB). */
export function AdminStoreProvider({ children, onUnauthorized }: { children: ReactNode; onUnauthorized: () => void }) {
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [rdvs, setRdvs] = useState<Rdv[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unauthorized = useRef(onUnauthorized)
  unauthorized.current = onUnauthorized

  // Toute réponse 401 (session expirée) renvoie vers la page de connexion
  const guard = useCallback(async <T,>(p: Promise<T>): Promise<T> => {
    try { return await p } catch (e) { if (e instanceof ApiError && e.status === 401) unauthorized.current(); throw e }
  }, [])

  const reload = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [f, r] = await guard(Promise.all([api.fiches(), api.rdvs()]))
      setFiches(f); setRdvs(r)
    } catch (e) { setError(errMsg(e)) } finally { setLoading(false) }
  }, [guard])
  useEffect(() => { void reload() }, [reload])

  const keep = (s: Fiche) => setFiches((p) => p.map((x) => (x.id === s.id ? s : x)))

  const value: Ctx = {
    fiches, rdvs, loading, error, reload,
    saveFiche: async (f, isNew) => {
      const { id, images: _images, ...input } = f
      const saved = await guard(isNew ? api.createFiche(input as FicheInput) : api.updateFiche(id, input as FicheInput))
      setFiches((p) => [saved, ...p.filter((x) => x.id !== saved.id)])
      return saved
    },
    uploadImage: async (id, file, meta) => { const s = await guard(api.uploadImage(id, file, meta)); keep(s); return s },
    updateImage: async (id, imgId, patch) => { const s = await guard(api.updateImage(id, imgId, patch)); keep(s); return s },
    deleteImage: async (id, imgId) => { const s = await guard(api.deleteImage(id, imgId)); keep(s); return s },
    deleteFiche: async (id) => { await guard(api.deleteFiche(id)); setFiches((p) => p.filter((x) => x.id !== id)) },
    setRdvStatut: async (id, statut) => { const r = await guard(api.setRdvStatut(id, statut)); setRdvs((p) => p.map((x) => (x.id === id ? r : x))) },
    deleteRdv: async (id) => { await guard(api.deleteRdv(id)); setRdvs((p) => p.filter((x) => x.id !== id)) },
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('AdminStoreProvider manquant')
  return c
}
