import { Link } from 'react-router-dom'
import { Cta, PageHero } from '../components/Layout'
import { services } from '../services'
import { slug } from '../slug'
import { Reveal } from '../ui'

export default function Services() {
  return (
    <>
      <PageHero title="Nos services" text="Des soins complets pour vos compagnons, avec un dossier numérique pour chaque animal." />
      <section className="wrap py-10 md:py-16">
        <ul>
          {services.map((s, i) => (
            <li key={s.title}>
              <Reveal>
                <article className="grid gap-4 border-b border-brand-line py-8 md:grid-cols-[4rem_minmax(0,1fr)_auto] md:gap-8 md:py-10">
                  <span className="text-sm font-bold tabular-nums text-brand-muted">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 className="mb-2 text-2xl font-extrabold md:text-3xl"><Link to={`/services/${slug(s.title)}`} className="hover:text-brand">{s.title}</Link></h2>
                    <p className="max-w-2xl leading-relaxed text-brand-muted">{s.text}</p>
                    <p className="mt-3 text-sm text-brand-dark/80">{s.points.join(' · ')}</p>
                    {s.image && <img src={s.image} alt={s.title} loading="lazy" className="mt-4 h-40 w-full max-w-md rounded-lg object-cover" />}
                  </div>
                  <div className="flex flex-wrap items-start gap-3 md:flex-col md:items-stretch">
                    <Link to={`/rendez-vous?service=${slug(s.title)}`} className="btn btn-primary text-center">Prendre rendez-vous</Link>
                    <Link to={`/services/${slug(s.title)}`} className="btn btn-ghost text-center">Voir le détail</Link>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
      <Cta />
    </>
  )
}
