import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Fiche, Visite } from '../../data'
import { newId, useStore } from '../../store'
import { Confirm, useToast } from '../../ui'

const today = () => new Date().toISOString().slice(0, 10)
const blank = (): Fiche => ({ id: newId(), nom: '', prenom: '', age: '', telephone: '', adresse: '', animal: '', espece: '', race: '', ageAnimal: '', visites: [] })

function Field({ id, label, value, onChange, wide, required }: { id: string; label: string; value: string; onChange: (v: string) => void; wide?: boolean; required?: boolean }) {
  return <div className={wide ? 'sm:col-span-2' : ''}><label className="label" htmlFor={id}>{label}{required && ' *'}</label><input id={id} className="input" value={value} required={required} onChange={(e) => onChange(e.target.value)} /></div>
}

export default function FichePage() {
  const { id } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const toast = useToast()
  const { fiches, saveFiche, deleteFiche } = useStore()
  const isNew = id === 'nouvelle'
  const existing = fiches.find((x) => x.id === id)
  const [f, setF] = useState<Fiche | null>(() => (isNew ? { ...blank(), ...((loc.state as Partial<Fiche> | null) ?? {}) } : existing ? structuredClone(existing) : null))
  const [ask, setAsk] = useState(false)
  if (!f) return <p>Fiche introuvable. <Link to="/admin" className="font-bold underline">Retour aux fiches</Link></p>
  const set = (k: keyof Fiche) => (v: string) => setF({ ...f, [k]: v })
  const upV = (vid: string, p: Partial<Visite>) => setF({ ...f, visites: f.visites.map((v) => (v.id === vid ? { ...v, ...p } : v)) })
  const submit = (e: FormEvent) => { e.preventDefault(); saveFiche(f); toast(isNew ? 'Fiche créée' : 'Fiche enregistrée'); nav('/admin') }
  return (
    <form onSubmit={submit} className="animate-fade-in">
      <Link to="/admin" className="text-sm text-brand-muted hover:underline">← Retour aux fiches</Link>
      <div className="mb-6 mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold md:text-3xl">{isNew ? 'Nouvelle fiche' : `${f.nom} ${f.prenom} · ${f.animal}`}</h1>
        <div className="flex flex-wrap gap-2.5">
          {!isNew && <button type="button" className="btn btn-danger" onClick={() => setAsk(true)}>Supprimer</button>}
          <Link to="/admin" className="btn btn-ghost">Annuler</Link><button className="btn btn-primary">Enregistrer</button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card"><h2 className="mb-4 text-lg font-bold">Client</h2><div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="nom" label="Nom" required value={f.nom} onChange={set('nom')} /><Field id="prenom" label="Prénom" value={f.prenom} onChange={set('prenom')} />
          <Field id="age" label="Âge" value={f.age} onChange={set('age')} /><Field id="tel" label="Téléphone" value={f.telephone} onChange={set('telephone')} />
          <Field id="adr" label="Adresse" wide value={f.adresse} onChange={set('adresse')} />
        </div></section>
        <section className="card"><h2 className="mb-4 text-lg font-bold">Animal</h2><div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="an" label="Nom" required value={f.animal} onChange={set('animal')} /><Field id="esp" label="Espèce" value={f.espece} onChange={set('espece')} />
          <Field id="race" label="Race" value={f.race} onChange={set('race')} /><Field id="aga" label="Âge" value={f.ageAnimal} onChange={set('ageAnimal')} />
        </div></section>
      </div>
      <section className="card mt-6">
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Historique médical</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF({ ...f, visites: [{ id: newId(), date: today(), note: '' }, ...f.visites] })}>+ Ajouter une visite</button></div>
        {f.visites.length === 0 && <p className="text-brand-muted">Aucune visite enregistrée.</p>}
        {f.visites.map((v, i) => (
          <div key={v.id} className={`grid animate-fade-up gap-3 py-3 sm:grid-cols-[160px_1fr_auto] ${i ? 'border-t border-brand-line' : ''}`}>
            <div><label className="label" htmlFor={`d${v.id}`}>Date</label><input id={`d${v.id}`} type="date" className="input" value={v.date} onChange={(e) => upV(v.id, { date: e.target.value })} /></div>
            <div><label className="label" htmlFor={`n${v.id}`}>Notes du vétérinaire</label><textarea id={`n${v.id}`} rows={2} className="input" value={v.note} onChange={(e) => upV(v.id, { note: e.target.value })} /></div>
            <div className="flex items-end"><button type="button" className="btn btn-danger btn-sm" onClick={() => setF({ ...f, visites: f.visites.filter((x) => x.id !== v.id) })}>Retirer</button></div>
          </div>
        ))}
      </section>
      <Confirm open={ask} title="Supprimer cette fiche ?" text={`La fiche de ${f.nom} ${f.prenom} (${f.animal}) sera définitivement supprimée.`}
        onCancel={() => setAsk(false)} onConfirm={() => { deleteFiche(f.id); toast('Fiche supprimée'); nav('/admin') }} />
    </form>
  )
}
