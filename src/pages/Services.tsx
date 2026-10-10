import { Card, Cta, PageHero } from '../components/Layout'
import { services } from '../data'

export default function Services() {
  return (
    <>
      <PageHero title="Nos services" text="Des soins complets pour chiens, chats et autres compagnons." />
      <section className="wrap grid gap-5 py-14 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        {services.map((s, i) => <Card key={s.title} badge={String(i + 1)} delay={(i % 3) * 100} {...s} />)}
      </section>
      <Cta />
    </>
  )
}
