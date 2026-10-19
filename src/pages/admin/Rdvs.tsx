import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fmt, Rdv } from "../../data";
import { errMsg } from "../../api";
import { cabinetNom } from "../../cabinets";
import { useStore } from "../../store";
import { WhatsAppButton } from "../../components/Whatsappbutton";
import { rdvMessage } from "../../Whatsapp";
import { Confirm, ErrorBox, useToast } from "../../ui";

const badge: Record<Rdv["statut"], string> = {
  nouvelle: "bg-brand text-white",
  confirmée: "bg-green-100 text-green-800",
  refusée: "bg-red-100 text-red-800",
};

export default function Rdvs() {
  const { rdvs, loading, error, reload, setRdvStatut, deleteRdv } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [del, setDel] = useState<string | null>(null);
  const act = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      toast(ok);
    } catch (e) {
      toast(errMsg(e));
    }
  };
  if (loading)
    return <p className="text-brand-muted">Chargement des demandes…</p>;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-extrabold md:text-3xl">
        Demandes de rendez-vous
      </h1>
      {rdvs.length === 0 && (
        <div className="card text-center text-brand-muted">
          Aucune demande pour le moment. Les demandes envoyées depuis la page
          Contact apparaissent ici.
        </div>
      )}
      <div className="grid gap-4">
        {rdvs.map((r) => (
          <article key={r.id} className="card animate-fade-up">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">
                  {r.nom} · {r.animal}
                </h2>
                <p className="text-sm text-brand-muted">
                  {r.telephone} ·{" "}
                  {cabinetNom(r.cabinet)
                    ? `cabinet ${cabinetNom(r.cabinet)} · `
                    : ""}
                  souhaité le {fmt(r.date)} · reçu le {fmt(r.createdAt)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${badge[r.statut]}`}
              >
                {r.statut}
              </span>
            </div>
            {r.message && <p className="mt-3 text-brand-muted">{r.message}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  act(
                    () => setRdvStatut(r.id, "confirmée"),
                    "Rendez-vous confirmé",
                  )
                }
              >
                Confirmer
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  act(() => setRdvStatut(r.id, "refusée"), "Rendez-vous refusé")
                }
              >
                Refuser
              </button>
              <WhatsAppButton
                tel={r.telephone}
                text={rdvMessage(r)}
                label={
                  r.statut === "confirmée"
                    ? "WhatsApp : confirmation"
                    : r.statut === "refusée"
                      ? "WhatsApp : décliner"
                      : "WhatsApp : accusé de réception"
                }
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  nav("/admin/fiches/nouvelle", {
                    state: {
                      nom: r.nom,
                      telephone: r.telephone,
                      animal: r.animal,
                    },
                  })
                }
              >
                Créer la fiche
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setDel(r.id)}
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>
      <Confirm
        open={!!del}
        title="Supprimer cette demande ?"
        text="La demande sera définitivement supprimée."
        onCancel={() => setDel(null)}
        onConfirm={() => {
          const id = del;
          setDel(null);
          if (id) void act(() => deleteRdv(id), "Demande supprimée");
        }}
      />
    </div>
  );
}
