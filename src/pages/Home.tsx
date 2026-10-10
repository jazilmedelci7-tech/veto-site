import { Link } from 'react-router-dom'
import { Card, Cta, Logo } from '../components/Layout'
import { services } from '../data'
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
            <p className="mb-3 animate-fade-up text-sm font-bold opacity-85">Annexe Oued Romane · Sur rendez-vous</p>
            <h1 className="animate-fade-up text-4xl font-extrabold leading-[1.08] [animation-delay:100ms] md:text-6xl">Des soins attentionnés pour vos compagnons</h1>
            <p className="mb-8 mt-5 max-w-md animate-fade-up text-lg leading-relaxed opacity-90 [animation-delay:200ms]">Consultations, vaccins, chirurgie et suivi médical. Chaque animal a un dossier complet pour un suivi sur la durée.</p>
            <div className="flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]"><Link to="/contact" className="btn btn-white">Prendre rendez-vous</Link><Link to="/services" className="btn btn-outline">Nos services</Link></div>
          </div>
          <div className="flex h-64 animate-fade-in items-center justify-center rounded-3xl bg-white/10 [animation-delay:300ms] md:h-[400px]"><Logo className="h-52 animate-float md:h-80" /></div>
        </div>
      </section>
      <div className="wrap relative -mt-12 grid gap-5 md:grid-cols-3">
        <Card badge="H" title="Horaires" text="[Horaires d'ouverture]" />
        <Card badge="A" title="Adresse" text="Annexe Oued Romane" delay={100} />
        <Card badge="T" title="Téléphone" text="0661 68 56 [..] · Sur rendez-vous" delay={200} />
      </div>
      <section className="wrap py-14 md:py-16">
        <Reveal><h2 className="mb-8 text-3xl font-extrabold">Nos services</h2></Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{services.slice(0, 4).map((s, i) => <Card key={s.title} badge={String(i + 1)} delay={i * 100} {...s} />)}</div>
      </section>
      <section className="bg-white py-14 md:py-16"><div className="wrap">
        <Reveal><h2 className="mb-8 text-3xl font-extrabold">Comment ça se passe</h2></Reveal>
        <div className="grid gap-5 md:grid-cols-3">{steps.map((s, i) => <Card key={s.title} delay={i * 120} {...s} />)}</div>
      </div></section>
      <section className="wrap py-14 md:py-16">
        <Reveal><h2 className="mb-8 text-3xl font-extrabold">Ils nous font confiance</h2></Reveal>
        <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((n) => (
          <Reveal key={n} delay={n * 120} className="h-full"><div className="card h-full"><p className="mb-4 leading-relaxed">[Avis du client]</p><strong className="text-sm">[Prénom N.] · [animal]</strong></div></Reveal>
        ))}</div>
      </section>
      <Cta />
    </>
  )
}
