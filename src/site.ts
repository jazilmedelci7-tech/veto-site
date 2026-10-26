// Point d'entrée unique vers les réglages du client choisi (variable CLIENT, voir vite.config.ts).
import config from '@client/config'

export const site = config

/** Convertit #RRGGBB en teintes utilisées par le site (clair, foncé…). */
export function palette(hex: string): Record<string, string> {
  const ok = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#1D3FA8'
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(ok.slice(i, i + 2), 16))
  const mix = (t: number, to: number) => [r, g, b].map((c) => Math.round(c + (to - c) * t)).join(' ')
  return {
    '--brand': `${r} ${g} ${b}`,
    '--brand-dark': mix(0.6, 0),
    '--brand-light': mix(0.95, 255),
    '--brand-soft': mix(0.85, 255),
    '--brand-line': mix(0.82, 255),
    '--brand-muted': [r, g, b].map((c, i) => Math.round(c * 0.4 + [96, 100, 110][i] * 0.6)).join(' '),
  }
}
