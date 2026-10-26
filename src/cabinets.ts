// Les cabinets viennent des réglages du client (clients/<nom>/config.ts). Rien à modifier ici.
import { site } from './site'
import type { Cabinet } from './siteTypes'

export type { Cabinet }
export const cabinets: Cabinet[] = site.cabinets
export const cabinetNom = (id: string) => cabinets.find((c) => c.id === id)?.court ?? ''
export const telHref = (t: string) => `tel:${t.replace(/\s/g, '')}`
