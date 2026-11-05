import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHero } from '../components/Layout'
import { cabinets, telHref } from '../cabinets'
import { services } from '../services'
import { slug } from '../slug'

export default function ServiceDetail() {
  const { id } = useParams()
  const i = services.findIndex((s) => slug(s.title) === id)
  if (i < 0) return <Navigate to="/services" replace />
  const s = services[i]
  const others = services.filter((_, k) => k !== i)
  return (
    <>
      <PageHero title={s.title} text={s.text} />
      <section className="wrap grid gap-10 py-12 md:py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {s.image && <img src={s.image} alt={s.title} className="mb-8 max-h-96 w-full rounded-lg object-cover" />}
          <h2 className="mb-4 text-2xl font-extrabold">Ce que comprend ce soin</h2>
          <ul className="border-t border-brand-line">
            {s.points.map((p) => <li key={p} className="flex gap-3 border-b border-brand-line py-3.5"><span aria-hidden="true" className="font-bold text-brand">✓</span>{p}</li>)}
          </ul>
        </div>
        <aside className="h-fit border-l-4 border-brand bg-white p-6 lg:sticky lg:top-28">
          <h2 className="mb-2 text-xl font-extrabold">Un rendez-vous pour ce soin ?</h2>
          <p className="mb-5 text-brand-muted">Laissez votre demande : le cabinet vous confirme le jour.</p>
          <Link to={`/rendez-vous?service=${slug(s.title)}`} className="btn btn-primary block text-center">Prendre rendez-vous</Link>
          <p className="mt-5 text-sm text-brand-muted">Ou par téléphone :</p>
          {cabinets.map((c) => <p key={c.id} className="text-sm"><strong>{c.court}</strong> · <a className="font-bold text-brand hover:underline" href={telHref(c.telephone)}>{c.telephone}</a></p>)}
        </aside>
      </section>
      <section className="bg-white py-10"><div className="wrap">
        <h2 className="mb-4 text-lg font-extrabold">Nos autres services</h2>
        <div className="flex flex-wrap gap-2">{others.map((o) => <Link key={o.title} to={`/services/${slug(o.title)}`} className="rounded-full border border-brand-line px-4 py-2 text-sm hover:border-brand hover:text-brand">{o.title}</Link>)}</div>
      </div></section>
    </>
  )
}
