import { PageHero } from "../components/Layout";
import { cabinets } from "../cabinets";
import { Reveal } from "../ui";

const box =
  "flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-brand-soft text-sm text-brand-muted transition duration-300 hover:scale-[1.03] hover:shadow-xl md:h-60";

export default function Gallery() {
  return (
    <>
      <PageHero
        title="Les cabinets en images"
        text="Découvrez nos espaces d'accueil et de soins."
      />
      {cabinets.map((c) => (
        <section key={c.id} className="wrap py-10 md:py-12">
          <Reveal>
            <h2 className="mb-6 text-2xl font-extrabold">{c.nom}</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.photos.length > 0
              ? c.photos.map((src, i) => (
                  <Reveal key={src} delay={(i % 3) * 100}>
                    <div className={box}>
                      <img
                        src={src}
                        alt={`${c.nom} – photo ${i + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Reveal>
                ))
              : [1, 2, 3].map((n) => (
                  <Reveal key={n} delay={(n % 3) * 100}>
                    <div className={box}>Photo à ajouter</div>
                  </Reveal>
                ))}
          </div>
        </section>
      ))}
    </>
  );
}
