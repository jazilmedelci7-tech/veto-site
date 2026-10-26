import { cabinets, Cabinet, telHref } from '../cabinets'
import { Reveal } from '../ui'

export function Horaires({ c }: { c: Cabinet }) {
  return (
    <div>
      {c.horaires.map((h) => (
        <div key={h.jours} className="grid grid-cols-[150px_1fr] border-t border-brand-line py-2.5 text-sm"><strong>{h.jours}</strong><span className="text-brand-muted">{h.heures}</span></div>
      ))}
    </div>
  )
}

export function CabinetCard({ c, delay = 0 }: { c: Cabinet; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="card h-full transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand/10">
        <h3 className="mb-3 text-xl font-extrabold text-brand">{c.nom}</h3>
        <p className="mb-1 text-brand-muted">{c.adresse}</p>
        <p className="mb-4"><a className="font-bold text-brand hover:underline" href={telHref(c.telephone)}>{c.telephone}</a></p>
        <Horaires c={c} />
      </div>
    </Reveal>
  )
}

export function CabinetMap({ c }: { c: Cabinet }) {
  return (
    <div>
      <h3 className="mb-3 font-bold">{c.nom}</h3>
      <iframe
        title={`Carte – ${c.nom}`}
        className="h-64 w-full rounded-2xl border-0 md:h-72"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${encodeURIComponent(c.carte)}&output=embed`}
      />
    </div>
  )
}

