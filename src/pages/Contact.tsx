import { FormEvent, useState } from 'react'
import { PageHero } from '../components/Layout'
import { useStore } from '../store'
import { Reveal } from '../ui'

const empty = { nom: '', telephone: '', animal: '', date: '', message: '' }

export default function Contact() {
  const { addRdv } = useStore()
  const [sent, setSent] = useState(false)
  const [f, setF] = useState(empty)
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const submit = (e: FormEvent) => { e.preventDefault(); addRdv(f); setF(empty); setSent(true) }
  const fields = [['nom', 'Nom', 'text'], ['telephone', 'Téléphone', 'tel'], ['animal', 'Animal', 'text'], ['date', 'Date souhaitée', 'date']] as const
  return (
    <>
      <PageHero title="Contact et rendez-vous" text="Laissez votre demande, le cabinet vous confirme le créneau." />
      <section className="wrap grid gap-8 py-14 md:py-16 lg:grid-cols-[1.2fr_1fr]">
        <Reveal><form onSubmit={submit} className="card grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, type]) => <div key={id}><label className="label" htmlFor={id}>{label}</label><input id={id} type={type} className="input" required value={f[id]} onChange={set(id)} /></div>)}
          <div className="sm:col-span-2"><label className="label" htmlFor="message">Message</label><textarea id="message" rows={3} className="input" value={f.message} onChange={set('message')} /></div>
          <div className="sm:col-span-2"><button className="btn btn-primary w-full">Envoyer la demande</button>
            {sent && <p role="status" className="mt-3 animate-pop font-bold text-brand">Demande envoyée. Le cabinet vous répond pour confirmer le créneau.</p>}</div>
        </form></Reveal>
        <Reveal delay={150}><div className="card"><h3 className="mb-3 font-bold">Coordonnées</h3><p className="leading-8 text-brand-muted">Annexe Oued Romane<br />0661 68 56 [..]<br />[E-mail]<br />Sur rendez-vous</p></div></Reveal>
      </section>
      <section className="bg-white py-14 md:py-16"><div className="wrap"><Reveal><div className="flex h-64 items-center justify-center rounded-2xl bg-brand-soft text-brand-muted md:h-72">Carte Google Maps</div></Reveal></div></section>
    </>
  )
}
