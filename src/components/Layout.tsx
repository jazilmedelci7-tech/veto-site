import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api'
import { AdminStoreProvider, useStore } from '../store'
import { cabinets, telHref } from '../cabinets'
import { site } from '../site'
import { listRappels } from '../data'
import { ErrorBox, Reveal } from '../ui'

export function Logo({ variant = 'white', className = '' }: { variant?: 'white' | 'blue'; className?: string }) {
  return <img src={`/logo-${variant}.png`} alt={`Logo ${site.nom}`} className={className} />
}

export function Brand({ size = 'h-12' }: { size?: string }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <Logo className={size} />
      <span className="leading-tight">
        <strong className="block text-lg md:text-xl">{site.nom}</strong>
        <span className="text-[13px] opacity-85">{cabinets.map((c) => c.court).join(' · ')}</span>
      </span>
    </Link>
  )
}

export function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const links: [string, string][] = [['/', 'Accueil'], ['/services', 'Services'], ['/contact', 'Contact']]

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  return (
    <header className="wrap flex flex-wrap items-center justify-between py-3 text-white md:py-4">
      <Brand size="h-11 md:h-14" />
      <button className="rounded-lg border border-white/50 px-4 py-2 font-bold md:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Fermer' : 'Menu'}</button>
      <nav className={`${open ? 'flex animate-drop' : 'hidden'} w-full flex-col gap-4 py-4 text-[15px] md:flex md:w-auto md:flex-row md:items-center md:gap-8 md:py-0`}>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `border-b-2 pb-1 transition-colors ${isActive ? 'border-white font-extrabold' : 'border-transparent hover:border-white/60'}`}>{label}</NavLink>
        ))}
        <Link to="/rendez-vous" className="btn btn-white text-center">Prendre rendez-vous</Link>
      </nav>
    </header>
  )
}

/** Horaires du pied de page : une seule liste si tous les cabinets ont les mêmes horaires, sinon une par cabinet. */
function horairesFooter() {
  const memes = cabinets.every((c) => JSON.stringify(c.horaires) === JSON.stringify(cabinets[0].horaires))
  const liste = (c: (typeof cabinets)[number]) => c.horaires.map((h) => <div key={h.jours}>{h.jours} : {h.heures}</div>)
  if (memes) return <div>{liste(cabinets[0])}</div>
  return <>{cabinets.map((c) => <div key={c.id} className="mt-1"><em>{c.court}</em>{liste(c)}</div>)}</>
}

export function Footer() {
  return (
    <footer className="bg-brand text-white">
      <div className="wrap grid gap-8 py-10 text-sm leading-8 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex items-start gap-4">
          <Logo className="h-20" />
          <div><strong className="text-lg">{site.nom}</strong>{cabinets.map((c) => <div key={c.id} className="mt-2 leading-6"><strong>{c.court}</strong><br />{c.adresse}<br /><a className="hover:underline" href={telHref(c.telephone)}>{c.telephone}</a></div>)}</div>
        </div>
        <div><strong>Pages</strong>{[...links, ['/rendez-vous', 'Rendez-vous'] as [string, string]].map(([to, l]) => <Link key={to} to={to} className="block hover:underline">{l}</Link>)}</div>
        <div><strong>Horaires</strong>{horairesFooter()}<Link to="/admin" className="block opacity-70 hover:opacity-100">Espace vétérinaire</Link></div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 10)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <>
      <div className={`sticky top-0 z-40 bg-brand transition-shadow duration-300 ${scrolled ? 'shadow-lg shadow-brand-dark/30' : ''}`}><Header /></div>
      <div key={pathname} className="animate-fade-in"><Outlet /></div>
      <Footer />
    </>
  )
}

export function PageHero({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-brand pb-12 text-white md:pb-14">
      <div className="wrap pt-6"><h1 className="animate-fade-up text-3xl font-extrabold md:text-5xl">{title}</h1><p className="mt-3 max-w-xl animate-fade-up text-lg opacity-90 [animation-delay:150ms]">{text}</p></div>
    </div>
  )
}

export function Cta() {
  return (
    <section className="bg-brand text-white">
      <Reveal>
        <div className="wrap flex flex-col items-start justify-between gap-5 py-10 md:flex-row md:items-center md:py-12">
          <div><h2 className="mb-1 text-2xl font-extrabold md:text-3xl">Un rendez-vous pour votre compagnon ?</h2><p className="opacity-90">{cabinets.length > 1 ? cabinets.map((c) => `${c.court} : ${c.telephone}`).join(' · ') : cabinets[0].telephone}</p></div>
          <Link to="/rendez-vous" className="btn btn-white">Prendre rendez-vous</Link>
        </div>
      </Reveal>
    </section>
  )
}

function AccountMenu() {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const out = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc) }
  }, [open])
  const quit = async () => { try { await api.logout() } catch { /* déjà déconnecté */ } nav('/admin/login') }
  const row = 'block w-full px-4 py-2.5 text-left text-[15px] text-brand-dark hover:bg-brand-light'
  return (
    <div ref={box} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-white/10">
        <Logo className="h-10 md:h-11" />
        <span className="min-w-0 flex-1 leading-tight"><strong className="block">{site.nom}</strong><span className="text-[12px] opacity-80">Espace vétérinaire</span></span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l5 5 5-5" /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute left-0 right-0 z-50 mt-2 animate-drop overflow-hidden rounded-lg border border-brand-line bg-white py-1 shadow-xl md:right-auto md:w-56">
          <Link role="menuitem" to="/" className={row}>Voir le site</Link>
          <Link role="menuitem" to="/admin/notifications" className={row}>Notifications</Link>
          <Link role="menuitem" to="/admin/mot-de-passe" className={row}>Mot de passe</Link>
          <div className="my-1 border-t border-brand-line" />
          <button role="menuitem" type="button" className={`${row} font-bold text-red-700`} onClick={quit}>Déconnexion</button>
        </div>
      )}
    </div>
  )
}

function AdminShell() {
  const { rdvs, fiches } = useStore()
  const nouvelles = rdvs.filter((r) => r.statut === 'nouvelle').length
  const rappelsUrgents = listRappels(fiches, 7).length
  const item = ({ isActive }: { isActive: boolean }) => `whitespace-nowrap rounded-lg px-3.5 py-2.5 transition-colors md:py-3 ${isActive ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="relative z-30 bg-brand p-4 text-white md:sticky md:top-0 md:h-screen md:p-5">
        <AccountMenu />
        <nav className="mt-4 flex flex-wrap gap-1.5 text-[15px] md:mt-8 md:flex-col md:flex-nowrap">
          <NavLink to="/admin" end className={item}>Fiches clients</NavLink>
          <NavLink to="/admin/rendez-vous" className={item}>Rendez-vous{nouvelles > 0 && <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-brand">{nouvelles}</span>}</NavLink>
          <NavLink to="/admin/rappels" className={item}>Rappels{rappelsUrgents > 0 && <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-brand">{rappelsUrgents}</span>}</NavLink>
          <NavLink to="/admin/statistiques" className={item}>Statistiques</NavLink>
          <NavLink to="/admin/sauvegardes" className={item}>Sauvegardes</NavLink>
        </nav>
      </aside>
      <main className="min-w-0 p-4 md:p-10"><Outlet /></main>
    </div>
  )
}

export function AdminLayout() {
  const [status, setStatus] = useState<'checking' | 'in' | 'out' | 'down'>('checking')
  const [msg, setMsg] = useState('')
  const check = () => {
    setStatus('checking')
    api.me().then(() => setStatus('in')).catch((e) => {
      if (e instanceof ApiError && e.status === 401) setStatus('out')
      else { setMsg(e instanceof Error ? e.message : 'Erreur'); setStatus('down') }
    })
  }
  useEffect(check, [])
  if (status === 'checking') return <div className="flex min-h-screen items-center justify-center text-brand-muted">Chargement…</div>
  if (status === 'out') return <Navigate to="/admin/login" replace />
  if (status === 'down') return <div className="mx-auto max-w-md p-6"><ErrorBox message={msg} onRetry={check} /></div>
  return <AdminStoreProvider onUnauthorized={() => setStatus('out')}><AdminShell /></AdminStoreProvider>
}
