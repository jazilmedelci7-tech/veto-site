import { Link } from 'react-router-dom'
import { PageHero } from '../components/Layout'
import { cabinets, telHref } from '../cabinets'
import { CabinetMap, Horaires } from '../components/CabinetCard'
import { Reveal } from '../ui'

export default function Contact() {
  return (
    <>
      <PageHero title="Contact" text="Où nous trouver, quand nous appeler." />
      <section className="wrap py-12 md:py-16">
        <div className={`grid gap-12 ${cabinets.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {cabinets.map((c, i) => (
            <Reveal key={c.id} delay={i * 100}>
              <h2 className="mb-1 text-2xl font-extrabold">{c.nom}</h2>
              <p className="text-brand-muted">{c.adresse}</p>
              <p className="mb-1 mt-3"><a className="text-lg font-bold text-brand hover:underline" href={telHref(c.telephone)}>{c.telephone}</a></p>
              {c.email && <p className="mb-3"><a className="text-brand-muted hover:underline" href={`mailto:${c.email}`}>{c.email}</a></p>}
              <div className="mt-4"><Horaires c={c} /></div>
              <div className="mt-6"><CabinetMap c={c} /></div>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-brand-dark/80 pt-8 md:flex-row md:items-center">
          <p className="text-xl font-extrabold">Besoin d'un rendez-vous ?</p>
          <Link to="/rendez-vous" className="btn btn-primary">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  )
}
