import { Cta, Logo, PageHero } from "../components/Layout";
import { Horaires } from "../components/CabinetCard";
import { cabinets } from "../cabinets";
import { Reveal } from "../ui";

export default function About() {
  return (
    <>
      <PageHero
        title="À propos du cabinet"
        text="Un vétérinaire à l'écoute, au service de vos animaux."
      />
      <section className="wrap grid items-center gap-8 py-14 md:grid-cols-2 md:gap-12 md:py-16">
        <Reveal>
          <div className="flex h-72 items-center justify-center rounded-2xl bg-brand-soft text-brand-muted md:h-80">
            Photo du vétérinaire
          </div>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="mb-4 text-3xl font-extrabold">[Nom du Docteur]</h2>
          <p className="leading-relaxed text-brand-muted">
            [Présentation, parcours et philosophie de soin du vétérinaire.]
          </p>
        </Reveal>
      </section>
      <section className="bg-white py-14 md:py-16">
        <div className="wrap flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <Reveal className="w-full max-w-xl">
            <div className="card">
              <h2 className="mb-4 text-2xl font-extrabold">Horaires</h2>
              {cabinets.map((c) => (
                <div key={c.id} className="mb-4">
                  <h3 className="mb-1 font-bold text-brand">{c.nom}</h3>
                  <Horaires c={c} />
                </div>
              ))}
            </div>
          </Reveal>
          <Logo variant="blue" className="hidden h-56 animate-float md:block" />
        </div>
      </section>
      <Cta />
    </>
  );
}
