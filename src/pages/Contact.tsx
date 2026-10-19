import { FormEvent, useState } from "react";
import { PageHero } from "../components/Layout";
import { api, errMsg } from "../api";
import { cabinets, telHref } from "../cabinets";
import { CabinetMap, Horaires } from "../components/CabinetCard";
import { Reveal } from "../ui";

const empty = {
  nom: "",
  telephone: "",
  animal: "",
  cabinet: "",
  date: "",
  message: "",
};

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [f, setF] = useState(empty);
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setSent(false);
    try {
      await api.createRdv({ ...f, website: trap });
      setF(empty);
      setSent(true);
    } catch (error) {
      setErr(errMsg(error));
    } finally {
      setBusy(false);
    }
  };
  const fields = [
    ["nom", "Nom", "text"],
    ["telephone", "Téléphone", "tel"],
    ["animal", "Animal", "text"],
    ["date", "Date souhaitée", "date"],
  ] as const;
  return (
    <>
      <PageHero
        title="Contact et rendez-vous"
        text="Laissez votre demande, le cabinet vous confirme le créneau."
      />
      <section className="wrap grid gap-8 py-14 md:py-16 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <form onSubmit={submit} className="card grid gap-4 sm:grid-cols-2">
            {fields.map(([id, label, type]) => (
              <div key={id}>
                <label className="label" htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  className="input"
                  required
                  value={f[id]}
                  onChange={set(id)}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="label" htmlFor="cabinet">
                Cabinet souhaité
              </label>
              <select
                id="cabinet"
                className="input"
                required
                value={f.cabinet}
                onChange={set("cabinet")}
              >
                <option value="">Choisir un cabinet…</option>
                {cabinets.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                rows={3}
                className="input"
                value={f.message}
                onChange={set("message")}
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            >
              <label>
                Ne pas remplir
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  name="website"
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                />
              </label>
            </div>
            <div className="sm:col-span-2">
              <button
                className="btn btn-primary w-full disabled:opacity-60"
                disabled={busy}
              >
                {busy ? "Envoi…" : "Envoyer la demande"}
              </button>
              {err && (
                <p role="alert" className="mt-3 font-bold text-red-700">
                  {err}
                </p>
              )}
              {sent && (
                <p
                  role="status"
                  className="mt-3 animate-pop font-bold text-brand"
                >
                  Demande envoyée. Le cabinet vous répond pour confirmer le
                  créneau.
                </p>
              )}
            </div>
          </form>
        </Reveal>
        <div className="grid gap-5">
          {cabinets.map((c, i) => (
            <Reveal key={c.id} delay={150 + i * 100}>
              <div className="card">
                <h3 className="mb-2 font-bold text-brand">{c.nom}</h3>
                <p className="text-brand-muted">{c.adresse}</p>
                <p className="mb-3">
                  <a
                    className="font-bold text-brand hover:underline"
                    href={telHref(c.telephone)}
                  >
                    {c.telephone}
                  </a>
                </p>
                <Horaires c={c} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-white py-14 md:py-16">
        <div className="wrap">
          <Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {cabinets.map((c) => (
                <CabinetMap key={c.id} c={c} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
