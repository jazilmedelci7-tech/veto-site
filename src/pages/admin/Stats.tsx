import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ageFrom, listRappels, todayLocal } from '../../data'
import { cabinetNom } from '../../cabinets'
import { useStore } from '../../store'
import { ErrorBox } from '../../ui'

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

/** Les n derniers mois, du plus ancien au plus récent : { key: '2026-10', label: 'oct.' } */
function derniersMois(n: number) {
  const [y, m] = todayLocal().split('-').map(Number)
  return Array.from({ length: n }, (_, i) => {
    const t = (y * 12 + (m - 1)) - (n - 1 - i)
    const yy = Math.floor(t / 12), mm = t % 12
    return { key: `${yy}-${String(mm + 1).padStart(2, '0')}`, label: MOIS[mm] }
  })
}
const top = (items: string[], n: number) => {
  const c = new Map<string, number>()
  for (const x of items) { const k = x.replace(/\s*\(.*\)/, '').trim(); if (k) c.set(k, (c.get(k) ?? 0) + 1) }
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return <div className="border-l-4 border-brand bg-white p-4"><p className="text-sm text-brand-muted">{label}</p><p className="text-3xl font-extrabold tabular-nums">{value}</p>{hint && <p className="text-xs text-brand-muted">{hint}</p>}</div>
}

function Columns({ title, data, unit }: { title: string; data: { label: string; n: number }[]; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.n))
  const total = data.reduce((s, d) => s + d.n, 0)
  return (
    <section className="bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3"><h2 className="font-extrabold">{title}</h2><span className="text-sm text-brand-muted">{total} {unit}</span></div>
      <div className="flex h-44 items-end gap-1.5" role="img" aria-label={`${title} : ${data.map((d) => `${d.label} ${d.n}`).join(', ')}`}>
        {data.map((d) => (
          <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <span className="mb-1 text-center text-[11px] tabular-nums text-brand-muted">{d.n || ''}</span>
            <div className="w-full rounded-t-sm bg-brand transition-all" style={{ height: `${(d.n / max) * 100}%`, minHeight: d.n ? 3 : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">{data.map((d) => <span key={d.label} className="min-w-0 flex-1 truncate text-center text-[11px] text-brand-muted">{d.label}</span>)}</div>
    </section>
  )
}

function Rows({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]))
  return (
    <section className="bg-white p-5">
      <h2 className="mb-4 font-extrabold">{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-brand-muted">{empty}</p> : (
        <ul className="grid gap-3">{rows.map(([k, n]) => (
          <li key={k}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate">{k}</span><strong className="tabular-nums">{n}</strong></div>
            <div className="h-2 bg-brand-soft"><div className="h-2 bg-brand" style={{ width: `${(n / max) * 100}%` }} /></div></li>
        ))}</ul>
      )}
    </section>
  )
}

export default function Stats() {
  const { fiches, rdvs, loading, error, reload } = useStore()
  const s = useMemo(() => {
    const mois = derniersMois(12)
    const visites = fiches.flatMap((f) => f.visites)
    const visitesParMois = mois.map((m) => ({ label: m.label, n: visites.filter((v) => v.date.slice(0, 7) === m.key).length }))
    const rdvParMois = mois.map((m) => ({ label: m.label, n: rdvs.filter((r) => (r.createdAt ?? '').slice(0, 7) === m.key).length }))
    const il30 = new Date(Date.now() - 30 * 86400000).toISOString()
    const nouvellesFiches = fiches.filter((f) => (f.createdAt ?? '') >= il30).length
    const rdv30 = rdvs.filter((r) => (r.createdAt ?? '') >= il30).length
    const conf = rdvs.filter((r) => r.statut === 'confirmée').length
    const ref = rdvs.filter((r) => r.statut === 'refusée').length
    const nouv = rdvs.filter((r) => r.statut === 'nouvelle').length
    const especes = top(fiches.map((f) => f.espece), 6)
    const motifs = top(visites.flatMap((v) => v.motifs), 6)
    const vaccins = top(visites.flatMap((v) => v.vaccins), 6)
    const cab = top(rdvs.map((r) => cabinetNom(r.cabinet) || r.cabinet), 6)
    const tranches = [['Moins d\'1 an', 0, 1], ['1 à 3 ans', 1, 4], ['4 à 7 ans', 4, 8], ['8 ans et plus', 8, 100]] as const
    const ans = fiches.map((f) => (f.naissance ? ageFrom(f.naissance) : '')).filter(Boolean).map((a) => { const m = /^(\d+) an/.exec(a); return m ? Number(m[1]) : 0 })
    const ages: [string, number][] = tranches.map(([l, a, b]) => [l, ans.filter((n) => n >= a && n < b).length] as [string, number]).filter((r) => r[1] > 0)
    const retard = listRappels(fiches, 30).filter((r) => r.etat === 'late').length
    const aVenir = listRappels(fiches, 30).filter((r) => r.etat !== 'late').length
    return { visitesParMois, rdvParMois, nouvellesFiches, rdv30, conf, ref, nouv, especes, motifs, vaccins, cab, ages, retard, aVenir, nbVisites: visites.length }
  }, [fiches, rdvs])
  if (loading) return <p className="text-brand-muted">Chargement…</p>
  if (error) return <ErrorBox message={error} onRetry={reload} />
  const traites = s.conf + s.ref
  return (
    <div className="animate-fade-in">
      <h1 className="mb-1 text-2xl font-extrabold md:text-3xl">Statistiques</h1>
      <p className="mb-6 text-brand-muted">Un aperçu de l'activité du cabinet, calculé à partir des fiches et des rendez-vous.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Fiches clients" value={fiches.length} hint={`${s.nouvellesFiches} nouvelle(s) en 30 jours`} />
        <Kpi label="Visites enregistrées" value={s.nbVisites} />
        <Kpi label="Demandes de rendez-vous (30 j)" value={s.rdv30} hint={`${s.nouv} à traiter`} />
        <Kpi label="Rendez-vous confirmés" value={traites ? `${Math.round((s.conf / traites) * 100)} %` : '—'} hint={traites ? `${s.conf} confirmé(s), ${s.ref} refusé(s)` : 'Aucune demande traitée'} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Columns title="Visites par mois" data={s.visitesParMois} unit="sur 12 mois" />
        <Columns title="Demandes de rendez-vous par mois" data={s.rdvParMois} unit="sur 12 mois" />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Rows title="Espèces suivies" rows={s.especes} empty="Pas encore de fiche." />
        <Rows title="Motifs de visite les plus fréquents" rows={s.motifs} empty="Pas encore de visite." />
        <Rows title="Vaccins les plus faits" rows={s.vaccins} empty="Pas encore de vaccin enregistré." />
        <Rows title="Âge des animaux" rows={s.ages} empty="Renseigne la date de naissance dans les fiches." />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Rows title="Rendez-vous par cabinet" rows={s.cab} empty="Pas encore de demande." />
        <section className="bg-white p-5">
          <h2 className="mb-3 font-extrabold">Rappels</h2>
          <p className="text-sm"><strong className="text-3xl tabular-nums">{s.retard}</strong> en retard · <strong className="text-3xl tabular-nums">{s.aVenir}</strong> à faire dans les 30 jours</p>
          <Link to="/admin/rappels" className="mt-3 inline-block text-sm font-bold text-brand hover:underline">Voir les rappels →</Link>
        </section>
      </div>
    </div>
  )
}
