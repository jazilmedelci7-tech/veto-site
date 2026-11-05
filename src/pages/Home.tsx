import { Link } from 'react-router-dom'
import { Cta, Logo } from '../components/Layout'
import { CabinetCard } from '../components/CabinetCard'
import { cabinets } from '../cabinets'
import { services } from '../services'
import { site } from '../site'
import { slug } from '../slug'
import { Reveal } from '../ui'

const steps = [
  { title: 'Prenez rendez-vous', text: 'En ligne ou par téléphone, vous choisissez le jour qui vous convient.' },
  { title: 'Consultation', text: 'Votre animal est examiné et soigné au cabinet.' },
  { title: 'Suivi numérique', text: 'Sa fiche est mise à jour : historique, vaccins, notes.' },
]

export default function Home() {
  return (
    <>
      <section className="bg-brand pb-20 text-white md:pb-24">
        <div className="wrap grid items-center gap-8 pt-8 md:grid-cols-[1.1fr_1fr] md:gap-12 md:pt-10">
          <div>
            <p className="mb-3 animate-fade-up text-sm font-bold opacity-85">{cabinets.map((c) => c.court).join(' · ')} · {site.ville}</p>
            <h1 className="animate-fade-up text-4xl font-extrabold leading-[1.08] [animation-delay:100ms] md:text-6xl">{site.accroche}</h1>
            <p className="mb-8 mt-5 max-w-md animate-fade-up text-lg leading-relaxed opacity-90 [animation-delay:200ms]">Consultations, vaccins, chirurgie et suivi médical. Chaque animal a un dossier complet pour un suivi sur la durée.</p>
            <div className="flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]"><Link to="/rendez-vous" className="btn btn-white">Prendre rendez-vous</Link><Link to="/services" className="btn btn-outline">Nos services</Link></div>
          </div>
          <div className="flex animate-fade-in justify-center [animation-delay:300ms]"><Logo className="h-48 opacity-95 md:h-80" /></div>
        </div>
      </section>
      <div className={`wrap relative -mt-12 grid gap-5 ${cabinets.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {cabinets.map((c, i) => <CabinetCard key={c.id} c={c} delay={i * 100} />)}
      </div>

      <section className="wrap py-14 md:py-20">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-brand-dark/80 pb-4">
            <h2 className="text-3xl font-extrabold md:text-4xl">Nos services</h2>
            <Link to="/services" className="text-sm font-bold text-brand hover:underline">Tout voir →</Link>
          </div>
        </Reveal>
        <ul>
          {services.slice(0, 5).map((s, i) => (
            <li key={s.title}>
              <Reveal delay={i * 60}>
                <Link to={`/services/${slug(s.title)}`} className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-b border-brand-line py-5 transition-colors hover:bg-white md:grid-cols-[4rem_minmax(0,18rem)_1fr_auto] md:gap-8 md:px-2">
                  <span className="text-sm font-bold tabular-nums text-brand-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xl font-extrabold transition-colors group-hover:text-brand md:text-2xl">{s.title}</span>
                  <span className="hidden text-brand-muted md:block">{s.text}</span>
                  <span aria-hidden="true" className="text-xl text-brand transition-transform group-hover:translate-x-1.5">→</span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white py-14 md:py-20"><div className="wrap">
        <Reveal><h2 className="mb-10 text-3xl font-extrabold md:text-4xl">Comment ça se passe</h2></Reveal>
        <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          <span aria-hidden="true" className="absolute left-[7px] top-2 hidden h-px bg-brand-line md:left-2 md:right-8 md:block" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative border-l-2 border-brand-line pl-6 md:border-l-0 md:pl-0 md:pt-10">
              <Reveal delay={i * 120}>
                <span aria-hidden="true" className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-brand md:left-0 md:top-0" />
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-muted">Étape {i + 1}</p>
                <h3 className="mb-2 text-xl font-extrabold">{s.title}</h3>
                <p className="max-w-xs leading-relaxed text-brand-muted">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div></section>

      {site.avis.length > 0 && (
        <section className="wrap py-14 md:py-20">
          <Reveal><h2 className="mb-8 text-3xl font-extrabold md:text-4xl">Ils nous font confiance</h2></Reveal>
          <div className="grid gap-10 md:grid-cols-3">{site.avis.map((a, n) => (
            <Reveal key={n} delay={n * 120}><blockquote className="border-l-2 border-brand pl-5"><p className="mb-3 leading-relaxed">« {a.texte} »</p><footer className="text-sm font-bold text-brand-muted">{a.auteur}</footer></blockquote></Reveal>
          ))}</div>
        </section>
      )}
      <Cta />
    </>
  )
}
