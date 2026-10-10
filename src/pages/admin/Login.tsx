import { FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isAuth, login } from '../../auth'
import { Logo } from '../../components/Layout'

export default function Login() {
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  if (isAuth()) return <Navigate to="/admin" replace />
  const submit = (e: FormEvent) => { e.preventDefault(); if (login(pw)) nav('/admin'); else setErr(true) }
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand p-4">
      <form onSubmit={submit} className="card w-full max-w-sm animate-pop text-center">
        <Logo variant="blue" className="mx-auto mb-4 h-24" />
        <h1 className="mb-1 text-2xl font-extrabold">Espace vétérinaire</h1>
        <p className="mb-5 text-sm text-brand-muted">Accès réservé au cabinet.</p>
        <label className="label text-left" htmlFor="pw">Mot de passe</label>
        <input id="pw" type="password" className="input" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false) }} autoFocus />
        {err && <p role="alert" className="mt-2 text-sm font-bold text-red-700">Mot de passe incorrect.</p>}
        <button className="btn btn-primary mt-5 w-full">Se connecter</button>
      </form>
    </div>
  )
}
