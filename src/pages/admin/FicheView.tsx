import { ReactNode, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { errMsg } from "../../api";
import { ImageViewer, imgUrl } from "../../components/Ficheimages";
import { Fiche, fmt, nextRappel, rappelState } from "../../data";
import { WhatsAppButton } from "../../components/Whatsappbutton";
import { useStore } from "../../store";
import { rappelMessage } from "../../Whatsapp";
import { Confirm, ErrorBox, useToast } from "../../ui";

export function RappelBadge({
  date,
  plain,
}: {
  date: string;
  plain?: boolean;
}) {
  const s = plain && date ? "ok" : rappelState(date);
  if (!s) return <span className="text-brand-muted">—</span>;
  const cls =
    s === "late"
      ? "bg-red-50 text-red-700"
      : s === "soon"
        ? "bg-amber-50 text-amber-800"
        : "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-sm font-semibold ${cls}`}
    >
      {fmt(date)}
      {s === "late" && " · en retard"}
    </span>
  );
}

const Table = ({
  title,
  rows,
}: {
  title: string;
  rows: [string, ReactNode][];
}) => (
  <section className="card">
    <h2 className="mb-2 text-base font-bold">{title}</h2>
    <table className="w-full text-sm">
      <tbody>
        {rows
          .filter(([, v]) => v !== "" && v != null)
          .map(([k, v]) => (
            <tr key={k} className="border-t border-brand-line first:border-0">
              <th
                scope="row"
                className="w-36 py-2 pr-3 text-left align-top font-semibold text-brand-muted"
              >
                {k}
              </th>
              <td className="py-2">{v}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </section>
);

const plain = (items: string[]) => items.join(", ");

export default function FicheView() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { fiches, loading, error, reload, deleteFiche } = useStore();
  const [all, setAll] = useState(false);
  const [ask, setAsk] = useState(false);
  const [view, setView] = useState<{ src: string; title: string } | null>(null);
  if (loading)
    return <p className="text-brand-muted">Chargement de la fiche…</p>;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const f: Fiche | undefined = fiches.find((x) => x.id === id);
  if (!f)
    return (
      <p>
        Fiche introuvable.{" "}
        <Link to="/admin" className="font-bold underline">
          Retour aux fiches
        </Link>
      </p>
    );

  const visites = [...f.visites].sort((a, b) => b.date.localeCompare(a.date));
  const shown = all ? visites : visites.slice(0, 5);
  const rappel = nextRappel(f);
  const lastRappelDate = [...f.visites]
    .filter((v) => v.rappel)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
  const remove = async () => {
    setAsk(false);
    try {
      await deleteFiche(f.id);
      toast("Fiche supprimée");
      nav("/admin");
    } catch (e) {
      toast(errMsg(e));
    }
  };
  const espece = f.espece === "Autre" && f.precision ? f.precision : f.espece;

  return (
    <div className="animate-fade-in">
      <Link to="/admin" className="text-sm text-brand-muted hover:underline">
        ← Retour aux fiches
      </Link>
      <div className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">{f.animal}</h1>
          <p className="mt-1 text-brand-muted">
            {[espece, f.race, f.robe, f.sexe].filter(Boolean).join(" · ")}
          </p>
          <p className="font-semibold">
            {f.nom} {f.prenom}
            {f.telephone && (
              <span className="font-normal text-brand-muted">
                {" "}
                · {f.telephone}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {rappel && (
            <WhatsAppButton
              tel={f.telephone}
              text={rappelMessage(f)}
              label="Rappel sur WhatsApp"
              className="py-2.5"
            />
          )}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setAsk(true)}
          >
            Supprimer
          </button>
          <Link
            to={`/admin/fiches/${f.id}/modifier`}
            className="btn btn-primary"
          >
            Modifier la fiche
          </Link>
        </div>
      </div>

      {rappel && rappelState(rappel) !== "ok" && (
        <div
          className={`mb-6 rounded-xl border p-4 text-sm font-semibold ${rappelState(rappel) === "late" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}
        >
          Prochain rappel : {fmt(rappel)}
          {rappelState(rappel) === "late" ? " (date dépassée)" : ""}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Table
          title="Client"
          rows={[
            ["Nom", `${f.nom} ${f.prenom}`.trim()],
            ["Âge", f.age ? `${f.age} ans` : ""],
            ["Téléphone", f.telephone],
            ["Adresse", f.adresse],
          ]}
        />
        <Table
          title="Animal"
          rows={[
            ["Nom", f.animal],
            ["Espèce", espece],
            ["Race", f.race],
            ["Robe", f.robe],
            ["Sexe", f.sexe],
            ["Stérilisé(e)", f.sterilise],
            ["Âge", f.ageAnimal],
            ["Poids", f.poids ? `${f.poids} kg` : ""],
            ["N° de puce", f.puce],
            ["N° de tatouage", f.tatouage],
            ["Prochain rappel", rappel ? <RappelBadge date={rappel} /> : ""],
          ]}
        />
      </div>

      {(f.antecedents.length > 0 || f.antecedentsNote) && (
        <section className="card mt-6">
          <h2 className="mb-2 text-base font-bold">Antécédents médicaux</h2>
          {f.antecedents.length > 0 && (
            <p className="text-sm">{plain(f.antecedents)}</p>
          )}
          {f.antecedentsNote && (
            <p className="mt-2 whitespace-pre-line text-sm text-brand-muted">
              {f.antecedentsNote}
            </p>
          )}
        </section>
      )}

      <section className="card mt-6 p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-3">
          <h2 className="text-base font-bold">Dernières visites</h2>
          <Link
            to={`/admin/fiches/${f.id}/modifier?nouvelle=1`}
            className="btn btn-ghost btn-sm"
          >
            + Ajouter une visite
          </Link>
        </div>
        {visites.length === 0 && (
          <p className="border-t border-brand-line p-4 text-sm text-brand-muted">
            Aucune visite enregistrée.
          </p>
        )}
        {visites.length > 0 && (
          <div className="hidden grid-cols-[100px_1.1fr_1.6fr_1.3fr_84px] gap-3 border-t border-brand-line bg-slate-50 px-4 py-2 text-[13px] font-semibold text-brand-muted md:grid">
            <span>Date</span>
            <span>Motif</span>
            <span>Détail</span>
            <span>Observations</span>
            <span />
          </div>
        )}
        <ul>
          {shown.map((v) => (
            <li
              key={v.id}
              className="grid gap-1 border-t border-brand-line px-4 py-3 text-sm md:grid-cols-[100px_1.1fr_1.6fr_1.3fr_84px] md:gap-3"
            >
              <span className="font-semibold">{fmt(v.date)}</span>
              <span>{v.motifs.length ? plain(v.motifs) : "—"}</span>
              <span className="grid gap-0.5">
                {v.vaccins.length > 0 && (
                  <span>
                    <b className="text-brand-muted">Vaccin :</b>{" "}
                    {plain(v.vaccins)}
                  </span>
                )}
                {v.medicaments.length > 0 && (
                  <span>
                    <b className="text-brand-muted">Médicaments :</b>{" "}
                    {plain(v.medicaments)}
                  </span>
                )}
                {v.rappel && (
                  <span>
                    <b className="text-brand-muted">Rappel :</b>{" "}
                    <RappelBadge
                      date={v.rappel}
                      plain={v.rappel !== rappel || v.date !== lastRappelDate}
                    />
                  </span>
                )}
                {!v.vaccins.length && !v.medicaments.length && !v.rappel && (
                  <span className="text-brand-muted">—</span>
                )}
              </span>
              <span className="whitespace-pre-line text-brand-muted">
                {v.note || "—"}
              </span>
              <Link
                to={`/admin/fiches/${f.id}/modifier?visite=${v.id}`}
                className="btn btn-ghost btn-sm mt-1 justify-self-start md:mt-0 md:justify-self-end"
              >
                Modifier
              </Link>
            </li>
          ))}
        </ul>
        {visites.length > 5 && (
          <div className="border-t border-brand-line p-3 text-center">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setAll(!all)}
            >
              {all
                ? "Voir moins"
                : `Voir toutes les visites (${visites.length})`}
            </button>
          </div>
        )}
      </section>

      {f.images.length > 0 && (
        <section className="card mt-6">
          <h2 className="mb-3 text-base font-bold">Radios et images</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {f.images.map((img) => (
              <button
                key={img.id}
                type="button"
                className="group text-left"
                onClick={() =>
                  setView({
                    src: imgUrl(img.file),
                    title: `${img.type} ${img.legende}`.trim(),
                  })
                }
                aria-label={`Agrandir : ${img.type} ${img.legende}`}
              >
                <span className="block aspect-[4/3] overflow-hidden rounded-lg bg-slate-900">
                  <img
                    src={imgUrl(img.file)}
                    alt={`${img.type} ${img.legende}`}
                    loading="lazy"
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="mt-1 block text-xs font-semibold">
                  {img.type}
                </span>
                <span className="block truncate text-xs text-brand-muted">
                  {[fmt(img.date), img.legende].filter(Boolean).join(" · ")}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {view && (
        <ImageViewer
          src={view.src}
          title={view.title || "Image"}
          onClose={() => setView(null)}
        />
      )}
      <Confirm
        open={ask}
        title="Supprimer cette fiche ?"
        text={`La fiche de ${f.nom} ${f.prenom} (${f.animal}) sera définitivement supprimée.`}
        onCancel={() => setAsk(false)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
