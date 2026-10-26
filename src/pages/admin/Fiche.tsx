import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { antecedentsMore, antecedentsOptions, especes, getEspece, medicamentsMore, medicamentsOptions, motifs, motifsMore, motifsRappel, motifsVaccin } from '../../animals'
import { errMsg } from '../../api'
import { FicheImages, Pending } from '../../components/FicheImages'
import { addToDate, Fiche, fmt, newId, todayLocal, Visite } from '../../data'
import { useStore } from '../../store'
import { Chips, Confirm, ErrorBox, MultiChips, TagPicker, useToast } from '../../ui'

const today = todayLocal
const blankVisite = (): Visite => ({ id: newId(), date: today(), motifs: [], vaccins: [], medicaments: [], rappel: '', note: '' })
const blank = (): Fiche => ({
  id: '', nom: '', prenom: '', age: '', telephone: '', adresse: '', animal: '', espece: '', precision: '', race: '',
  sexe: '', sterilise: '', ageAnimal: '', poids: '', robe: '', puce: '', tatouage: '',
  antecedents: [], antecedentsNote: '', images: [], visites: [blankVisite()],
})
/** Fiches enregistrées avant l'ajout de certains champs : on complète avec des valeurs vides. */
const isEmptyVisite = (v: Visite) => !v.motifs.length && !v.vaccins.length && !v.medicaments.length && !v.rappel && !v.note.trim()
const normalize = (f: Fiche): Fiche => ({ ...blank(), ...f, visites: (f.visites ?? []).map((v) => ({ ...v, medicaments: v.medicaments ?? [], rappel: v.rappel ?? '' })) })

function Field({ id, label, value, onChange, wide, required, type = 'text', ...rest }: { id: string; label: string; value: string; onChange: (v: string) => void; wide?: boolean; required?: boolean; type?: string } & Record<string, unknown>) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label className="label" htmlFor={id}>{label}{required && ' *'}</label>
      <input id={id} type={type} className="input" value={value} required={required} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  )
}
const Group = ({ title, children }: { title: string; children: React.ReactNode }) => <div className="sm:col-span-2"><p className="label">{title}</p>{children}</div>

export default function FichePage() {
  const { id } = useParams()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const { fiches, loading, error, reload } = useStore()
  if (loading) return <p className="text-brand-muted">Chargement de la fiche…</p>
  if (error) return <ErrorBox message={error} onRetry={reload} />
  const isNew = id === undefined || id === 'nouvelle'
  const existing = fiches.find((x) => x.id === id)
  if (!isNew && !existing) return <p>Fiche introuvable. <Link to="/admin" className="font-bold underline">Retour aux fiches</Link></p>
  const initial = isNew ? { ...blank(), ...((loc.state as Partial<Fiche> | null) ?? {}) } : normalize(structuredClone(existing!))
  // Fiche existante : on n'affiche pas les anciennes visites. On ouvre seulement une nouvelle visite (?nouvelle=1)
  // ou une ancienne visite à modifier (?visite=ID).
  let edit: string[] = []
  let created: string[] = []
  if (isNew) { edit = initial.visites.map((v) => v.id); created = edit }
  else if (sp.get('nouvelle')) { const nv = blankVisite(); initial.visites = [nv, ...initial.visites]; edit = [nv.id]; created = [nv.id] }
  else { const vid = sp.get('visite'); if (vid && initial.visites.some((v) => v.id === vid)) edit = [vid] }
  return <FicheForm key={`${id ?? 'nouvelle'}-${sp.toString()}`} isNew={isNew} initial={initial} initialEdit={edit} initialCreated={created} />
}

function FicheForm({ isNew, initial, initialEdit, initialCreated }: { isNew: boolean; initial: Fiche; initialEdit: string[]; initialCreated: string[] }) {
  const nav = useNavigate()
  const toast = useToast()
  const { saveFiche, deleteFiche, uploadImage } = useStore()
  const [f, setF] = useState<Fiche>(initial)
  const [ask, setAsk] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pending, setPending] = useState<Pending[]>([])
  const [autreRobe, setAutreRobe] = useState(false)
  const [editIds, setEditIds] = useState<string[]>(initialEdit)
  const [newIds, setNewIds] = useState<string[]>(initialCreated)

  const esp = getEspece(f.espece)
  const set = (k: 'nom' | 'prenom' | 'age' | 'telephone' | 'adresse' | 'animal' | 'precision' | 'race' | 'sexe' | 'sterilise' | 'ageAnimal' | 'poids' | 'robe' | 'puce' | 'tatouage' | 'antecedentsNote') => (v: string) => setF({ ...f, [k]: v })
  const setEspece = (nom: string) => {
    const e = getEspece(nom)
    if (nom !== f.espece) setAutreRobe(false)
    const raceOk = !e || e.races.length === 0 || e.races.includes(f.race)
    setF({
      ...f, espece: nom, race: raceOk ? f.race : '', robe: nom === f.espece ? f.robe : '',
      visites: f.visites.map((v) => (editIds.includes(v.id) ? { ...v, vaccins: v.vaccins.filter((x) => e?.vaccins.includes(x)) } : v)),
    })
  }
  const upV = (vid: string, p: Partial<Visite>) => setF({ ...f, visites: f.visites.map((v) => (v.id === vid ? { ...v, ...p } : v)) })
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      // Une nouvelle visite laissée vide n'est pas enregistrée
      const visites = f.visites.filter((v) => !(newIds.includes(v.id) && isEmptyVisite(v)))
      const saved = await saveFiche({ ...f, visites }, isNew)
      let failed = 0
      for (const p of pending) {
        try { await uploadImage(saved.id, p.file, { type: p.type, legende: p.legende, date: today() }) } catch { failed++ }
      }
      pending.forEach((p) => URL.revokeObjectURL(p.url))
      if (failed) { toast(`Fiche créée, mais ${failed} image(s) n'ont pas pu être envoyées. Ajoute-les depuis la fiche.`); nav(`/admin/fiches/${saved.id}/modifier`) } else { toast(isNew ? 'Fiche créée' : 'Fiche enregistrée'); nav(`/admin/fiches/${saved.id}`) }
    } catch (err) { toast(errMsg(err)); setSaving(false) }
  }
  const remove = async () => { setAsk(false); try { await deleteFiche(f.id); toast('Fiche supprimée'); nav('/admin') } catch (err) { toast(errMsg(err)) } }
  const showVaccins = (v: Visite) => v.motifs.some((m) => motifsVaccin.includes(m)) && (esp?.vaccins.length ?? 0) > 0
  const showRappel = (v: Visite) => v.motifs.some((m) => motifsRappel.includes(m))

  return (
    <form onSubmit={submit} className="animate-fade-in">
      <Link to={isNew ? '/admin' : `/admin/fiches/${f.id}`} className="text-sm text-brand-muted hover:underline">{isNew ? '← Retour aux fiches' : '← Retour à la fiche'}</Link>
      <div className="mb-6 mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold md:text-3xl">{isNew ? 'Nouvelle fiche' : `${f.nom} ${f.prenom} · ${f.animal}`}</h1>
        <div className="flex flex-wrap gap-2.5">
          {!isNew && <button type="button" className="btn btn-danger" onClick={() => setAsk(true)}>Supprimer</button>}
          <Link to={isNew ? '/admin' : `/admin/fiches/${f.id}`} className="btn btn-ghost">Annuler</Link><button className="btn btn-primary disabled:opacity-60" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="card"><h2 className="mb-4 text-lg font-bold">Client</h2><div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="nom" label="Nom" required autoFocus={isNew} value={f.nom} onChange={set('nom')} />
          <Field id="prenom" label="Prénom" value={f.prenom} onChange={set('prenom')} />
          <Field id="age" label="Âge" inputMode="numeric" value={f.age} onChange={set('age')} />
          <Field id="tel" label="Téléphone" type="tel" value={f.telephone} onChange={set('telephone')} />
          <Field id="adr" label="Adresse" wide value={f.adresse} onChange={set('adresse')} />
        </div></section>

        <section className="card"><h2 className="mb-4 text-lg font-bold">Animal</h2><div className="grid gap-4 sm:grid-cols-2">
          <Field id="an" label="Nom de l'animal" required wide value={f.animal} onChange={set('animal')} />
          <Group title="Espèce"><Chips label="Espèce" options={especes.map((e) => e.nom)} value={f.espece} onChange={setEspece} /></Group>
          {f.espece === 'Autre' && <Field id="prec" label="Précisez l'espèce" wide value={f.precision} onChange={set('precision')} />}
          <div className="sm:col-span-2">
            <label className="label" htmlFor="race">Race {esp && esp.races.length > 0 && <span className="text-brand-muted">(choisis dans la liste ou écris)</span>}</label>
            <input id="race" className="input" list="races" value={f.race} onChange={(e) => set('race')(e.target.value)} placeholder={esp?.races.length ? 'Commence à écrire…' : 'Facultatif'} autoComplete="off" />
            <datalist id="races">{esp?.races.map((r) => <option key={r} value={r} />)}</datalist>
          </div>
          {esp && esp.robes.length > 0 && (
            <Group title="Robe (couleur du poil)">
              <Chips label="Robe" options={esp.robes} value={autreRobe || (f.robe !== '' && !esp.robes.includes(f.robe)) ? 'Autre' : f.robe}
                onChange={(v) => { if (v === 'Autre') { setAutreRobe(true); set('robe')('') } else if (v === '') { setAutreRobe(false); set('robe')('') } else { setAutreRobe(false); set('robe')(v) } }} />
              {(autreRobe || (f.robe !== '' && !esp.robes.includes(f.robe))) && <input aria-label="Précisez la robe" className="input mt-3 animate-fade-up" placeholder="Décris la robe…" maxLength={60} value={f.robe} onChange={(e) => set('robe')(e.target.value)} />}
            </Group>
          )}
          <div><p className="label">Sexe</p><Chips label="Sexe" options={['Mâle', 'Femelle']} value={f.sexe} onChange={set('sexe')} /></div>
          <div><p className="label">Stérilisé(e)</p><Chips label="Stérilisé" options={['Oui', 'Non']} value={f.sterilise} onChange={set('sterilise')} /></div>
          <Field id="aga" label="Âge (ex : 3 ans, 8 mois)" value={f.ageAnimal} onChange={set('ageAnimal')} />
          <Field id="poids" label="Poids (kg)" inputMode="decimal" value={f.poids} onChange={set('poids')} />
          <Field id="puce" label="N° de puce électronique" inputMode="numeric" maxLength={25} placeholder="15 chiffres" value={f.puce} onChange={set('puce')} />
          <Field id="tatouage" label="N° de tatouage" maxLength={25} value={f.tatouage} onChange={set('tatouage')} />
        </div></section>
      </div>

      <section className="card mt-6 border-brand/40 ring-1 ring-brand/10">
        <h2 className="mb-1 text-lg font-bold">Antécédents médicaux</h2>
        <p className="mb-4 text-sm text-brand-muted">Choisis ce qui correspond, ou écris une autre information.</p>
        <TagPicker label="Antécédents" options={antecedentsOptions} more={antecedentsMore} sharedList="dl-ant" value={f.antecedents} onChange={(a) => setF({ ...f, antecedents: a })} placeholder="Autre antécédent (écrire puis Entrée)…" />
        <div className="mt-4"><label className="label" htmlFor="antnote">Précisions (facultatif)</label>
          <textarea id="antnote" rows={3} className="input" maxLength={3000} placeholder="Détails, dates, résultats d'examens…" value={f.antecedentsNote} onChange={(e) => set('antecedentsNote')(e.target.value)} /></div>
      </section>

      <FicheImages ficheId={isNew ? null : f.id} images={f.images} setImages={(images) => setF((p) => ({ ...p, images }))} pending={pending} setPending={setPending} />

      <section className="card mt-6">
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{!isNew && editIds.length === 1 && !newIds.length ? 'Modifier la visite' : 'Visite'}</h2>
          {<button type="button" className="btn btn-ghost btn-sm" onClick={() => { const nv = blankVisite(); setF({ ...f, visites: [nv, ...f.visites] }); setEditIds([nv.id, ...editIds]); setNewIds([nv.id, ...newIds]) }}>+ Ajouter une visite</button>}</div>
        {!isNew && editIds.length === 0 && <p className="text-brand-muted">Clique sur « + Ajouter une visite » pour en saisir une nouvelle. Pour corriger une ancienne visite, ouvre la fiche et utilise le bouton « Modifier » sur sa ligne. <Link to={`/admin/fiches/${f.id}`} className="font-bold underline">Voir les visites</Link></p>}
        {f.visites.filter((v) => editIds.includes(v.id)).map((v, i) => (
          <div key={v.id} className={`animate-fade-up py-4 ${i ? 'border-t border-brand-line' : ''}`}>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div><label className="label" htmlFor={`d${v.id}`}>{newIds.includes(v.id) ? 'Nouvelle visite · date' : `Visite du ${fmt(v.date)} · date`}</label><input id={`d${v.id}`} type="date" className="input w-auto" value={v.date} onChange={(e) => upV(v.id, { date: e.target.value })} /></div>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => { setF({ ...f, visites: f.visites.filter((x) => x.id !== v.id) }); setEditIds(editIds.filter((x) => x !== v.id)) }}>{newIds.includes(v.id) ? 'Retirer cette visite' : 'Supprimer cette visite'}</button>
            </div>
            <p className="label">Motif(s) / diagnostic</p>
            <TagPicker label="Motifs de la visite" options={motifs} more={motifsMore} sharedList="dl-motifs" placeholder="Écrire un motif ou une maladie…" value={v.motifs} onChange={(m) => upV(v.id, { motifs: m, vaccins: m.some((x) => motifsVaccin.includes(x)) ? v.vaccins : [], rappel: m.some((x) => motifsRappel.includes(x)) ? v.rappel : '' })} />
            {showVaccins(v) && <div className="mt-3 animate-fade-up"><p className="label">Vaccin(s) effectué(s)</p><MultiChips label="Vaccins" options={esp!.vaccins} value={v.vaccins} onChange={(x) => upV(v.id, { vaccins: x })} /></div>}
            {showRappel(v) && (
              <div className="mt-3 animate-fade-up">
                <label className="label" htmlFor={`r${v.id}`}>Prochain rappel (facultatif)</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input id={`r${v.id}`} type="date" className="input w-auto" value={v.rappel} onChange={(e) => upV(v.id, { rappel: e.target.value })} />
                  {([['3 semaines', { days: 21 }], ['1 mois', { months: 1 }], ['6 mois', { months: 6 }], ['1 an', { months: 12 }]] as const).map(([l, add]) => (
                    <button key={l} type="button" className="btn btn-ghost btn-sm" onClick={() => upV(v.id, { rappel: addToDate(v.date || today(), add) })}>+ {l}</button>
                  ))}
                  {v.rappel && <button type="button" className="btn btn-ghost btn-sm" onClick={() => upV(v.id, { rappel: '' })}>Effacer</button>}
                </div>
              </div>
            )}
            <div className="mt-3"><p className="label">Médicaments prescrits</p>
              <TagPicker label="Médicaments prescrits" options={medicamentsOptions} more={medicamentsMore} sharedList="dl-meds" value={v.medicaments} onChange={(m) => upV(v.id, { medicaments: m })} placeholder="Nom et dose, ex : Amoxicilline 250 mg, 2×/jour, 7 jours" /></div>
            <div className="mt-3"><label className="label" htmlFor={`n${v.id}`}>Observations / diagnostic (facultatif)</label><textarea id={`n${v.id}`} rows={2} className="input" value={v.note} onChange={(e) => upV(v.id, { note: e.target.value })} /></div>
          </div>
        ))}
      </section>

      <datalist id="dl-motifs">{[...motifs, ...motifsMore].map((o) => <option key={o} value={o} />)}</datalist>
      <datalist id="dl-meds">{[...medicamentsOptions, ...medicamentsMore].map((o) => <option key={o} value={o} />)}</datalist>
      <datalist id="dl-ant">{[...antecedentsOptions, ...antecedentsMore].map((o) => <option key={o} value={o} />)}</datalist>

      <Confirm open={ask} title="Supprimer cette fiche ?" text={`La fiche de ${f.nom} ${f.prenom} (${f.animal}) sera définitivement supprimée.`}
        onCancel={() => setAsk(false)} onConfirm={remove} />
    </form>
  )
}
