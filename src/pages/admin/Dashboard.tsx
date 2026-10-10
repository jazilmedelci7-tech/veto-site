import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fmt } from '../../data'
import { useStore } from '../../store'
import { Confirm, useToast } from '../../ui'

export default function Dashboard() {
  const { fiches, rdvs, deleteFiche } = useStore()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [esp, setEsp] = useState('')
  const [del, setDel] = useState<string | null>(null)
  const especes = [...new Set(fiches.map((f) => f.espece).filter(Boolean))]
  const list = fiches.filter((f) => `${f.nom} ${f.prenom} ${f.animal}`.toLowerCase().includes(q.toLowerCase()) && (!esp || f.espece === esp))
  const last = (v: { date: string }[]) => v.map((x) => x.date).sort().reverse()[0] ?? ''
  const target = fiches.find((f) => f.id === del)
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold md:text-3xl">Fiches clients</h1><Link to="/admin/fiches/nouvelle" className="btn btn-primary">+ Nouvelle fiche</Link></div>
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="card"><p className="text-sm text-brand-muted">Fiches</p><p className="text-3xl font-extrabold">{fiches.length}</p></div>
        <Link to="/admin/rendez-vous" className="card transition hover:-translate-y-1 hover:shadow-lg"><p className="text-sm text-brand-muted">Rendez-vous à confirmer</p><p className="text-3xl font-extrabold">{rdvs.filter((r) => r.statut === 'nouvelle').length}</p></Link>
      </div>
      <div className="card p-0">
        <div className="grid gap-3 p-4 sm:grid-cols-[1fr_200px]">
          <div><label className="label" htmlFor="q">Rechercher</label><input id="q" className="input" placeholder="Nom du client ou de l'animal" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div><label className="label" htmlFor="esp">Espèce</label><select id="esp" className="input" value={esp} onChange={(e) => setEsp(e.target.value)}><option value="">Toutes</option>{especes.map((x) => <option key={x}>{x}</option>)}</select></div>
        </div>
        <div className="hidden grid-cols-[1.4fr_1fr_.8fr_1fr_auto] gap-3 border-t border-brand-line px-4 py-3 text-[13px] text-brand-muted md:grid"><span>Client</span><span>Animal</span><span>Espèce</span><span>Dernière visite</span><span className="w-[190px] text-right">Actions</span></div>
        <ul>{list.map((f) => (
          <li key={f.id} className="grid gap-3 border-t border-brand-line px-4 py-3.5 transition-colors hover:bg-brand-light md:grid-cols-[1.4fr_1fr_.8fr_1fr_auto] md:items-center">
            <Link to={`/admin/fiches/${f.id}`} className="font-bold hover:underline">{f.nom} {f.prenom}</Link>
            <span><span className="text-brand-muted md:hidden">Animal : </span>{f.animal}</span>
            <span><span className="text-brand-muted md:hidden">Espèce : </span>{f.espece || '—'}</span>
            <span><span className="text-brand-muted md:hidden">Dernière visite : </span>{fmt(last(f.visites))}</span>
            <div className="flex gap-2 md:w-[190px] md:justify-end"><Link to={`/admin/fiches/${f.id}`} className="btn btn-ghost btn-sm flex-1 text-center md:flex-none">Modifier</Link><button className="btn btn-danger btn-sm flex-1 md:flex-none" onClick={() => setDel(f.id)}>Supprimer</button></div>
          </li>
        ))}</ul>
        {list.length === 0 && <p className="border-t border-brand-line p-6 text-center text-brand-muted">Aucune fiche trouvée.</p>}
      </div>
      <Confirm open={!!target} title="Supprimer cette fiche ?" text={target ? `La fiche de ${target.nom} ${target.prenom} (${target.animal}) sera définitivement supprimée.` : ''}
        onCancel={() => setDel(null)} onConfirm={() => { if (del) deleteFiche(del); setDel(null); toast('Fiche supprimée') }} />
    </div>
  )
}
