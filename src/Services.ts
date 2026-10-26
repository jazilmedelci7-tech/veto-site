// Les services viennent des réglages du client (clients/<nom>/config.ts). Rien à modifier ici.
import { site } from './site'
import type { Service } from './siteTypes'

export type { Service }
export const services: Service[] = site.services
