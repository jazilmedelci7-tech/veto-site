import { Cta, Logo, PageHero } from "../components/Layout";
import { Service, services } from "../Services";
import { Reveal } from "../ui";

const paths: Record<Service["icon"], string[]> = {
  consultation: [
    "M6 3v6a4 4 0 0 0 8 0V3",
    "M10 13v2a5 5 0 0 0 10 0v-1",
    "M20 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  ],
  vaccin: [
    "M18 2l4 4",
    "M17 7l3-3",
    "M19 9L8.7 19.3a2.1 2.1 0 0 1-3 0l-1-1a2.1 2.1 0 0 1 0-3L15 5",
    "M9 11l4 4",
    "M5 19l-3 3",
    "M14 4l6 6",
  ],
  chirurgie: ["M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"],
  radio: [
    "M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z",
  ],
  echo: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  imagerie: [
    "M3 7V5a2 2 0 0 1 2-2h2",
    "M17 3h2a2 2 0 0 1 2 2v2",
    "M21 17v2a2 2 0 0 1-2 2h-2",
    "M7 21H5a2 2 0 0 1-2-2v-2",
    "M7 12h10",
  ],
  dents: [
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
    "M8 14s1.5 2 4 2 4-2 4-2",
    "M9 9h.01",
    "M15 9h.01",
  ],
  identification: [
    "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
    "M7 7h.01",
  ],
  dossier: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M8 13h8",
    "M8 17h8",
  ],
};

function Icon({
  name,
  className,
}: {
  name: Service["icon"];
  className: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

function ServiceCard({ s, delay }: { s: Service; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-white transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand/10">
        <div className="relative aspect-[16/10] overflow-hidden bg-brand">
          {s.image ? (
            <img
              src={s.image}
              alt={s.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <>
              <Logo className="pointer-events-none absolute -bottom-6 -right-4 h-40 opacity-15 transition duration-500 group-hover:scale-110" />
              <div className="relative flex h-full items-center justify-center">
                <Icon
                  name={s.icon}
                  className="h-20 w-20 text-white transition duration-300 group-hover:scale-110"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h2 className="mb-1.5 text-xl font-extrabold">{s.title}</h2>
          <p className="mb-3 leading-relaxed text-brand-muted">{s.text}</p>
          <ul className="mt-auto grid gap-1.5 text-sm">
            {s.points.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Reveal>
  );
}

export default function Services() {
  return (
    <>
      <PageHero
        title="Nos services"
        text="Des soins complets pour chiens, chats et autres compagnons, avec radiographie, échographie et imagerie."
      />
      <section className="wrap grid gap-6 py-14 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        {services.map((s, i) => (
          <ServiceCard key={s.title} s={s} delay={(i % 3) * 100} />
        ))}
      </section>
      <Cta />
    </>
  );
}
