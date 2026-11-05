import { FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHero } from '../components/Layout'
import { api, errMsg } from '../api'
import { cabinets, telHref } from '../cabinets'
import { todayLocal } from '../data'
import { services } from '../services'
import { slug } from '../slug'
import { Reveal } from '../ui'

const empty = { nom: '', telephone: '', animal: '', cabinet: '', date: '', motif: '', message: '' }

export default function Rendezvous() {
  const [params] = useSearchParams()
  const fromService = services.find((s) => slug(s.title) === params.get('service'))?.title ?? ''
  const [sent, setSent] = useState(false)
  const [f, setF] = useState({ ...empty, motif: fromService })
  const [trap, setTrap] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { motif, message, ...rest } = f
    const texte = [motif && `Motif : ${motif}`, message].filter(Boolean).join('\n')
    try { await api.createRdv({ ...rest, message: texte, cabinet: f.cabinet || cabinets[0].id, website: trap }); setF(empty); setSent(true) } catch (error) { setErr(errMsg(error)) } finally { setBusy(false) }
  }
  const fields = [['nom', 'Votre nom', 'text'], ['telephone', 'Téléphone', 'tel'], ['animal', 'Nom de l\'animal', 'text']] as const
  return (
    <>
      <PageHero title="Prendre rendez-vous" text="Remplissez la demande, le cabinet vous rappelle pour confirmer le jour." />
      <section className="wrap grid gap-10 py-12 md:py-16 lg:grid-cols-[1.4fr_1fr]">
        {sent ? (
          <div role="status" className="animate-pop border-l-4 border-brand bg-white p-8">
            <h2 className="mb-2 text-2xl font-extrabold">Demande envoyée</h2>
            <p className="mb-6 text-brand-muted">Le cabinet vous contacte pour confirmer le créneau.</p>
            <div className="flex flex-wrap gap-3"><Link to="/" className="btn btn-primary">Retour à l'accueil</Link><button className="btn btn-ghost" onClick={() => setSent(false)}>Faire une autre demande</button></div>
          </div>
        ) : (
          <Reveal><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            {fields.map(([id, label, type]) => <div key={id}><label className="label" htmlFor={id}>{label}</label><input id={id} type={type} className="input" required value={f[id]} onChange={set(id)} /></div>)}
            <div><label className="label" htmlFor="date">Jour souhaité</label><input id="date" type="date" min={todayLocal()} className="input" required value={f.date} onChange={set('date')} /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="motif">Pour quel soin ?</label>
              <select id="motif" className="input" value={f.motif} onChange={set('motif')}>
                <option value="">Je ne sais pas / autre</option>
                {services.map((s) => <option key={s.title} value={s.title}>{s.title}</option>)}
              </select></div>
            {cabinets.length > 1 && <div className="sm:col-span-2"><label className="label" htmlFor="cabinet">Cabinet souhaité</label>
              <select id="cabinet" className="input" required value={f.cabinet} onChange={set('cabinet')}>
                <option value="">Choisir un cabinet…</option>
                {cabinets.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select></div>}
            <div className="sm:col-span-2"><label className="label" htmlFor="message">Message (facultatif)</label><textarea id="message" rows={3} className="input" value={f.message} onChange={set('message')} /></div>
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Ne pas remplir<input tabIndex={-1} autoComplete="off" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} /></label></div>
            <div className="sm:col-span-2"><button className="btn btn-primary w-full disabled:opacity-60" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer la demande'}</button>
              {err && <p role="alert" className="mt-3 font-bold text-red-700">{err}</p>}</div>
          </form></Reveal>
        )}
        <aside className="h-fit border-l-4 border-brand bg-white p-6">
          <h2 className="mb-3 text-xl font-extrabold">Plutôt par téléphone ?</h2>
          {cabinets.map((c) => <div key={c.id} className="mb-4"><strong>{c.nom}</strong><p className="text-sm text-brand-muted">{c.adresse}</p><a className="font-bold text-brand hover:underline" href={telHref(c.telephone)}>{c.telephone}</a></div>)}
          <Link to="/contact" className="text-sm font-bold text-brand hover:underline">Adresses, horaires et plan →</Link>
        </aside>
      </section>
    </>
  )
}
