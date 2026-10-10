import { PageHero } from '../components/Layout'
import { Reveal } from '../ui'

export default function Gallery() {
  return (
    <>
      <PageHero title="Le cabinet en images" text="Découvrez notre espace d'accueil et de soins." />
      <section className="wrap grid gap-5 py-14 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Reveal key={n} delay={(n % 3) * 100}><div className="flex h-56 cursor-pointer items-center justify-center rounded-2xl bg-brand-soft text-sm text-brand-muted transition duration-300 hover:scale-[1.03] hover:shadow-xl md:h-60">Photo {n}</div></Reveal>
        ))}
      </section>
    </>
  )
}
