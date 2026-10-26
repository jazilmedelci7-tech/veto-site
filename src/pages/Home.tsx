import { Link } from 'react-router-dom'
import { Card, Cta, Logo } from '../components/Layout'
import { CabinetCard } from '../components/CabinetCard'
import { cabinets } from '../cabinets'
import { services } from '../services'
import { site } from '../site'
import { Reveal } from '../ui'

const steps = [
  { badge: '1', title: 'Prenez rendez-vous', text: 'En ligne ou par téléphone, choisissez votre créneau.' },
  { badge: '2', title: 'Consultation', text: 'Votre animal est examiné et soigné au cabinet.' },
  { badge: '3', title: 'Suivi numérique', text: 'Sa fiche est mise à jour : historique, vaccins, notes.' },
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
            <div className="flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]"><Link to="/contact" className="btn btn-white">Prendre rendez-vous</Link><Link to="/services" className="btn btn-outline">Nos services</Link></div>
          </div>
          <div className="flex h-64 animate-fade-in items-center justify-center rounded-3xl bg-white/10 [animation-delay:300ms] md:h-[400px]"><Logo className="h-52 animate-float md:h-80" /></div>
        </div>
      </section>
      <div className={`wrap relative -mt-12 grid gap-5 ${cabinets.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {cabinets.map((c, i) => <CabinetCard key={c.id} c={c} delay={i * 100} />)}
      </div>
      <section className="wrap py-14 md:py-16">
        <Reveal><h2 className="mb-8 text-3xl font-extrabold">Nos services</h2></Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{services.slice(0, 4).map((s, i) => <Card key={s.title} badge={String(i + 1)} delay={i * 100} title={s.title} text={s.text} />)}</div>
      </section>
      <section className="bg-white py-14 md:py-16"><div className="wrap">
        <Reveal><h2 className="mb-8 text-3xl font-extrabold">Comment ça se passe</h2></Reveal>
        <div className="grid gap-5 md:grid-cols-3">{steps.map((s, i) => <Card key={s.title} delay={i * 120} {...s} />)}</div>
      </div></section>
      {site.avis.length > 0 && (
        <section className="wrap py-14 md:py-16">
          <Reveal><h2 className="mb-8 text-3xl font-extrabold">Ils nous font confiance</h2></Reveal>
          <div className="grid gap-5 md:grid-cols-3">{site.avis.map((a, n) => (
            <Reveal key={n} delay={n * 120} className="h-full"><div className="card h-full"><p className="mb-4 leading-relaxed">{a.texte}</p><strong className="text-sm">{a.auteur}</strong></div></Reveal>
          ))}</div>
        </section>
      )}
      <Cta />
    </>
  )
}
