import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, errMsg } from '../../api'
import { Logo } from '../../components/Layout'

export default function Login() {
  const nav = useNavigate()
  const [status, setStatus] = useState<{ configured: boolean; needsCode: boolean } | null>(null)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  // Déjà connecté : on va directement à l'espace vétérinaire
  useEffect(() => { api.me().then(() => nav('/admin', { replace: true })).catch(() => {}) }, [nav])
  // Premier accès (aucun mot de passe) : le vétérinaire crée le sien. Sinon : connexion normale.
  useEffect(() => { api.authStatus().then(setStatus).catch((e) => setErr(errMsg(e))) }, [])
  const creation = status !== null && !status.configured

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    if (creation) {
      if (pw.length < 8) { setErr('Le mot de passe doit faire au moins 8 caractères.'); return }
      if (pw !== pw2) { setErr('Les deux mots de passe ne sont pas identiques.'); return }
    }
    setBusy(true)
    try { if (creation) await api.setupPassword(pw, code); else await api.login(pw); nav('/admin') } catch (error) { setErr(errMsg(error)); setBusy(false) }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand p-4">
      <form onSubmit={submit} className="card w-full max-w-sm animate-pop text-center">
        <Logo variant="blue" className="mx-auto mb-4 h-24" />
        <h1 className="mb-1 text-2xl font-extrabold">{creation ? 'Créer votre mot de passe' : 'Espace vétérinaire'}</h1>
        <p className="mb-5 text-sm text-brand-muted">{creation ? 'Première connexion : choisissez le mot de passe qui protégera vos fiches. Notez-le bien.' : 'Accès réservé au cabinet.'}</p>
        {creation && status?.needsCode && (<>
          <label className="label text-left" htmlFor="code">Code d'activation (fourni avec votre site)</label>
          <input id="code" className="input mb-3" value={code} onChange={(e) => { setCode(e.target.value); setErr('') }} autoComplete="off" />
        </>)}
        <label className="label text-left" htmlFor="pw">{creation ? 'Nouveau mot de passe (8 caractères minimum)' : 'Mot de passe'}</label>
        <input id="pw" type="password" className="input" value={pw} onChange={(e) => { setPw(e.target.value); setErr('') }} autoFocus autoComplete={creation ? 'new-password' : 'current-password'} />
        {creation && (<>
          <label className="label mt-3 text-left" htmlFor="pw2">Répétez le mot de passe</label>
          <input id="pw2" type="password" className="input" value={pw2} onChange={(e) => { setPw2(e.target.value); setErr('') }} autoComplete="new-password" />
        </>)}
        {err && <p role="alert" className="mt-2 text-sm font-bold text-red-700">{err}</p>}
        <button className="btn btn-primary mt-5 w-full disabled:opacity-60" disabled={busy || !pw || status === null || (creation && status.needsCode && !code)}>{busy ? 'Un instant…' : creation ? 'Créer mon mot de passe' : 'Se connecter'}</button>
      </form>
    </div>
  )
}
