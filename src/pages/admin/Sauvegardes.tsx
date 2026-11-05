import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errMsg } from '../../api'
import { fmt } from '../../data'
import { useToast } from '../../ui'

type Notif = Awaited<ReturnType<typeof api.notifStatus>>

const ago = (iso: string | null) => {
  if (!iso) return 'jamais'
  const j = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  return j <= 0 ? "aujourd'hui" : j === 1 ? 'hier' : `il y a ${j} jours`
}

export default function Sauvegardes() {
  const toast = useToast()
  const [last, setLast] = useState<string | null | undefined>(undefined)
  const [notif, setNotif] = useState<Notif | null>(null)
  const [busy, setBusy] = useState(false)
  const load = () => {
    api.backupStatus().then((r) => setLast(r.last)).catch(() => setLast(null))
    api.notifStatus().then(setNotif).catch(() => setNotif(null))
  }
  useEffect(load, [])
  const sendTg = async () => {
    setBusy(true)
    try { await api.notifBackup(); toast('Sauvegarde envoyée : regarde ton Telegram'); load() } catch (e) { toast(errMsg(e)) } finally { setBusy(false) }
  }
  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="mb-2 text-2xl font-extrabold md:text-3xl">Sauvegardes</h1>
      <p className="mb-8 text-brand-muted">Une copie de vos données, gardée en dehors du site : si un jour un problème arrive, tout peut être remis en place.</p>

      <section className="mb-8 border-t border-brand-dark/80 pt-5">
        <h2 className="mb-1 text-lg font-extrabold">Télécharger une copie</h2>
        <p className="mb-4 text-sm text-brand-muted">Dernière copie téléchargée : <strong>{last === undefined ? '…' : ago(last)}</strong>{last ? ` (${fmt(last.slice(0, 10))})` : ''}. À faire une fois par semaine, puis à garder sur votre ordinateur ou une clé USB.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <a href="/api/export" download onClick={() => setTimeout(load, 1500)} className="block border border-brand-line bg-white p-4 transition-colors hover:border-brand">
            <strong className="block">1. Les fiches</strong><span className="text-sm text-brand-muted">Clients, animaux, visites et rendez-vous (fichier .json)</span><span className="mt-3 block text-sm font-bold text-brand">Télécharger →</span>
          </a>
          <a href="/api/export-images" download className="block border border-brand-line bg-white p-4 transition-colors hover:border-brand">
            <strong className="block">2. Les radios et images</strong><span className="text-sm text-brand-muted">Toutes les images des fiches (fichier .ndjson, plus lourd)</span><span className="mt-3 block text-sm font-bold text-brand">Télécharger →</span>
          </a>
        </div>
        <p className="mt-3 text-sm text-brand-muted">Ces fichiers ne s'ouvrent pas à la main : ils servent à tout restaurer.</p>
      </section>

      <section className="border-t border-brand-dark/80 pt-5">
        <h2 className="mb-1 text-lg font-extrabold">Envoi automatique sur Telegram</h2>
        {notif?.configured ? (
          <>
            <p className="mb-4 text-sm text-brand-muted">Chaque dimanche, les fiches sont envoyées dans votre Telegram. Dernier envoi : <strong>{ago(notif.lastTelegramBackup)}</strong>. Les radios ne passent pas par Telegram (trop lourdes) : utilisez le bouton « Les radios » ci-dessus.</p>
            <button className="btn btn-primary btn-sm disabled:opacity-60" disabled={busy} onClick={sendTg}>{busy ? 'Envoi…' : 'Envoyer une sauvegarde maintenant'}</button>
          </>
        ) : (
          <p className="text-sm text-brand-muted">Non activé. <Link to="/admin/notifications" className="font-bold text-brand hover:underline">Configurer Telegram</Link> pour recevoir une copie des fiches chaque dimanche.</p>
        )}
      </section>
    </div>
  )
}
