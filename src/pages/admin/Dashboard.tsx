import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fmt, nextRappel, rappelState } from "../../data";
import { RappelBadge } from "./FicheView";
import { WhatsAppButton } from "../../components/Whatsappbutton";
import { rappelMessage } from "../../Whatsapp";
import { api, errMsg } from "../../api";
import { useStore } from "../../store";
import { Confirm, ErrorBox, useToast } from "../../ui";

export default function Dashboard() {
  const { fiches, rdvs, loading, error, reload, deleteFiche } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [esp, setEsp] = useState("");
  const [del, setDel] = useState<string | null>(null);
  const [onlyRappels, setOnlyRappels] = useState(false);
  const [backup, setBackup] = useState<{ last: string | null } | null>(null);
  const loadBackup = () => {
    api
      .backupStatus()
      .then(setBackup)
      .catch(() => setBackup(null));
  };
  useEffect(loadBackup, []);
  const backupDays = backup?.last
    ? Math.floor((Date.now() - new Date(backup.last).getTime()) / 86400000)
    : null;
  const backupOld = backup !== null && (backupDays === null || backupDays >= 7);
  const especes = [...new Set(fiches.map((f) => f.espece).filter(Boolean))];
  const aRappeler = (f: (typeof fiches)[number]) => {
    const s = rappelState(nextRappel(f));
    return s === "late" || s === "soon";
  };
  const nbRappels = fiches.filter(aRappeler).length;
  const list = fiches
    .filter(
      (f) =>
        `${f.nom} ${f.prenom} ${f.animal} ${f.puce} ${f.tatouage}`
          .toLowerCase()
          .includes(q.toLowerCase()) &&
        (!esp || f.espece === esp) &&
        (!onlyRappels || aRappeler(f)),
    )
    .sort((a, b) =>
      onlyRappels ? nextRappel(a).localeCompare(nextRappel(b)) : 0,
    );
  const last = (v: { date: string }[]) =>
    v
      .map((x) => x.date)
      .sort()
      .reverse()[0] ?? "";
  const target = fiches.find((f) => f.id === del);
  if (loading)
    return <p className="text-brand-muted">Chargement des fiches…</p>;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold md:text-3xl">Fiches clients</h1>
        <Link to="/admin/fiches/nouvelle" className="btn btn-primary">
          + Nouvelle fiche
        </Link>
      </div>
      {backupOld && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
        >
          <p className="text-sm">
            <strong>
              {backupDays === null
                ? "Aucune sauvegarde faite pour l’instant."
                : `Dernière sauvegarde il y a ${backupDays} jours.`}
            </strong>{" "}
            Télécharge-la, puis copie-la sur une clé USB ou un disque externe
            (avec le dossier <code>server/uploads</code> pour les radios).
          </p>
          <a
            href="/api/export"
            download
            className="btn btn-primary btn-sm"
            onClick={() => setTimeout(loadBackup, 1500)}
          >
            Sauvegarder maintenant
          </a>
        </div>
      )}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-brand-muted">Fiches</p>
          <p className="text-3xl font-extrabold">{fiches.length}</p>
        </div>
        <Link
          to="/admin/rendez-vous"
          className="card transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm text-brand-muted">Rendez-vous à confirmer</p>
          <p className="text-3xl font-extrabold">
            {rdvs.filter((r) => r.statut === "nouvelle").length}
          </p>
        </Link>
        <button
          type="button"
          aria-pressed={onlyRappels}
          onClick={() => setOnlyRappels(!onlyRappels)}
          className={`card col-span-2 text-left transition hover:-translate-y-1 hover:shadow-lg md:col-span-1 ${onlyRappels ? "ring-2 ring-brand" : ""}`}
        >
          <p className="text-sm text-brand-muted">
            Rappels à faire (30 jours){onlyRappels && " · filtre actif"}
          </p>
          <p className="text-3xl font-extrabold">{nbRappels}</p>
        </button>
      </div>
      <div className="card p-0">
        <div className="grid gap-3 p-4 sm:grid-cols-[1fr_200px]">
          <div>
            <label className="label" htmlFor="q">
              Rechercher
            </label>
            <input
              id="q"
              className="input"
              placeholder="Client, animal, n° de puce ou de tatouage"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="esp">
              Espèce
            </label>
            <select
              id="esp"
              className="input"
              value={esp}
              onChange={(e) => setEsp(e.target.value)}
            >
              <option value="">Toutes</option>
              {especes.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="hidden grid-cols-[1.3fr_1fr_.7fr_.9fr_1.5fr_auto] gap-3 border-t border-brand-line px-4 py-3 text-[13px] text-brand-muted md:grid">
          <span>Client</span>
          <span>Animal</span>
          <span>Espèce</span>
          <span>Dernière visite</span>
          <span>Prochain rappel</span>
          <span className="w-[250px] text-right">Actions</span>
        </div>
        <ul>
          {list.map((f) => (
            <li
              key={f.id}
              className="grid gap-3 border-t border-brand-line px-4 py-3.5 transition-colors hover:bg-brand-light md:grid-cols-[1.3fr_1fr_.7fr_.9fr_1.5fr_auto] md:items-center"
            >
              <Link
                to={`/admin/fiches/${f.id}`}
                className="font-bold hover:underline"
              >
                {f.nom} {f.prenom}
              </Link>
              <span>
                <span className="text-brand-muted md:hidden">Animal : </span>
                {f.animal}
                {f.race && (
                  <span className="block text-sm text-brand-muted">
                    {f.race}
                  </span>
                )}
              </span>
              <span>
                <span className="text-brand-muted md:hidden">Espèce : </span>
                {f.espece || "—"}
              </span>
              <span>
                <span className="text-brand-muted md:hidden">
                  Dernière visite :{" "}
                </span>
                {fmt(last(f.visites))}
              </span>
              <span>
                <span className="text-brand-muted md:hidden">Rappel : </span>
                <RappelBadge date={nextRappel(f)} />
                {aRappeler(f) && (
                  <WhatsAppButton
                    tel={f.telephone}
                    text={rappelMessage(f)}
                    className="ml-2"
                  />
                )}
              </span>
              <div className="flex gap-2 md:w-[250px] md:justify-end">
                <Link
                  to={`/admin/fiches/${f.id}`}
                  className="btn btn-primary btn-sm flex-1 text-center md:flex-none"
                >
                  Ouvrir
                </Link>
                <Link
                  to={`/admin/fiches/${f.id}/modifier`}
                  className="btn btn-ghost btn-sm flex-1 text-center md:flex-none"
                >
                  Modifier
                </Link>
                <button
                  className="btn btn-danger btn-sm flex-1 md:flex-none"
                  onClick={() => setDel(f.id)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <p className="border-t border-brand-line p-6 text-center text-brand-muted">
            Aucune fiche trouvée.
          </p>
        )}
      </div>
      <Confirm
        open={!!target}
        title="Supprimer cette fiche ?"
        text={
          target
            ? `La fiche de ${target.nom} ${target.prenom} (${target.animal}) sera définitivement supprimée.`
            : ""
        }
        onCancel={() => setDel(null)}
        onConfirm={async () => {
          const id = del;
          setDel(null);
          if (!id) return;
          try {
            await deleteFiche(id);
            toast("Fiche supprimée");
          } catch (e) {
            toast(errMsg(e));
          }
        }}
      />
    </div>
  );
}
