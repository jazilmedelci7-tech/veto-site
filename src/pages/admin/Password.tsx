import { FormEvent, useState } from 'react'
import { api, errMsg } from '../../api'
import { useToast } from '../../ui'

/** Le vétérinaire change lui-même son mot de passe (il doit connaître l'ancien). */
export default function Password() {
  const toast = useToast()
  const [cur, setCur] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    if (pw.length < 8) { setErr('Le nouveau mot de passe doit faire au moins 8 caractères.'); return }
    if (pw !== pw2) { setErr('Les deux nouveaux mots de passe ne sont pas identiques.'); return }
    setBusy(true)
    try { await api.changePassword(cur, pw); setCur(''); setPw(''); setPw2(''); toast('Mot de passe modifié') } catch (error) { setErr(errMsg(error)) } finally { setBusy(false) }
  }
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">Changer mon mot de passe</h1>
      <form onSubmit={submit} className="card grid max-w-md gap-4">
        <div><label className="label" htmlFor="cur">Mot de passe actuel</label><input id="cur" type="password" className="input" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" /></div>
        <div><label className="label" htmlFor="pw">Nouveau mot de passe (8 caractères minimum)</label><input id="pw" type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="pw2">Répétez le nouveau mot de passe</label><input id="pw2" type="password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
        {err && <p role="alert" className="font-bold text-red-700">{err}</p>}
        <button className="btn btn-primary disabled:opacity-60" disabled={busy || !cur || !pw}>{busy ? 'Un instant…' : 'Changer le mot de passe'}</button>
      </form>
    </div>
  )
}
