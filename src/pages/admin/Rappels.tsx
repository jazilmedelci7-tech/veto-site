import { Link } from "react-router-dom";
import { WhatsAppButton } from "../../components/Whatsappbutton";
import { fmt, listRappels, RappelItem } from "../../data";
import { useStore } from "../../store";
import { ErrorBox } from "../../ui";
import { rappelMessage } from "../../Whatsapp";

const quand = (j: number) =>
  j === 0 ? "Aujourd'hui" : j > 0 ? `Dans ${j} j` : `En retard de ${-j} j`;

function Section({
  title,
  items,
  tone,
}: {
  title: string;
  items: RappelItem[];
  tone: string;
}) {
  if (!items.length) return null;
  return (
    <section className="card mb-6 p-0">
      <h2 className={`px-4 py-3 text-base font-bold ${tone}`}>
        {title} ({items.length})
      </h2>
      <ul>
        {items.map(({ fiche: f, visite: v, date, jours }) => (
          <li
            key={f.id}
            className="grid gap-2 border-t border-brand-line px-4 py-3 text-sm md:grid-cols-[1.3fr_1.3fr_1fr_auto] md:items-center"
          >
            <span>
              <Link
                to={`/admin/fiches/${f.id}`}
                className="font-bold hover:underline"
              >
                {f.animal}
              </Link>
              <span className="block text-brand-muted">
                {`${f.nom} ${f.prenom}`.trim()}
                {f.telephone && ` · ${f.telephone}`}
              </span>
            </span>
            <span>
              {v.vaccins.length
                ? v.vaccins.join(", ")
                : v.motifs.join(", ") || "Rappel"}
            </span>
            <span>
              <b>{fmt(date)}</b>
              <span className="block text-brand-muted">{quand(jours)}</span>
            </span>
            <span className="flex gap-2">
              <WhatsAppButton tel={f.telephone} text={rappelMessage(f)} />
              <Link
                to={`/admin/fiches/${f.id}`}
                className="btn btn-ghost btn-sm"
              >
                Ouvrir
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Rappels() {
  const { fiches, loading, error, reload } = useStore();
  if (loading)
    return <p className="text-brand-muted">Chargement des rappels…</p>;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const all = listRappels(fiches, 30);
  const late = all.filter((r) => r.jours < 0);
  const week = all.filter((r) => r.jours >= 0 && r.jours <= 7);
  const month = all.filter((r) => r.jours > 7);
  return (
    <div className="animate-fade-in">
      <h1 className="mb-2 text-2xl font-extrabold md:text-3xl">
        Rappels à envoyer
      </h1>
      <p className="mb-6 text-brand-muted">
        Clique sur « WhatsApp » : le message s'ouvre déjà écrit dans WhatsApp,
        il reste à appuyer sur « Envoyer ».
      </p>
      {all.length === 0 && (
        <div className="card text-center text-brand-muted">
          Aucun rappel dans les 30 prochains jours.
        </div>
      )}
      <Section title="En retard" items={late} tone="text-red-700" />
      <Section title="Cette semaine" items={week} tone="text-amber-800" />
      <Section title="Dans le mois" items={month} tone="" />
    </div>
  );
}
