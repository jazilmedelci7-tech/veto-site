import { FormEvent, useEffect, useState } from "react";
import { api, errMsg } from "../../api";
import { ErrorBox, useToast } from "../../ui";

/** Le vétérinaire branche lui-même Telegram : chaque matin, un message lui liste les rappels de vaccin à envoyer. */
export default function Notifications() {
  const toast = useToast();
  const [st, setSt] = useState<Awaited<
    ReturnType<typeof api.notifStatus>
  > | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [who, setWho] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const load = () => {
    setLoadErr("");
    api
      .notifStatus()
      .then(setSt)
      .catch((e) => setLoadErr(errMsg(e)));
  };
  useEffect(load, []);

  const run = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy("");
    }
  };
  const detect = () =>
    run("detect", async () => {
      const r = await api.notifDetect(token.trim());
      setChatId(r.chatId);
      setWho(r.nom);
    });
  const save = (e: FormEvent) => {
    e.preventDefault();
    void run("save", async () => {
      await api.notifSave(token.trim(), chatId.trim());
      setToken("");
      setChatId("");
      setWho("");
      toast("Notifications activées : regarde ton Telegram");
      load();
    });
  };
  const test = () =>
    run("test", async () => {
      await api.notifTest();
      toast("Message de test envoyé");
    });
  const off = () =>
    run("off", async () => {
      await api.notifOff();
      toast("Notifications désactivées");
      load();
    });

  if (loadErr) return <ErrorBox message={loadErr} onRetry={load} />;
  if (!st) return <p className="text-brand-muted">Chargement…</p>;
  return (
    <div className="animate-fade-in">
      <h1 className="mb-2 text-2xl font-extrabold md:text-3xl">
        Notifications Telegram
      </h1>
      <p className="mb-6 max-w-2xl text-brand-muted">
        Chaque matin (vers {st.hour} h), vous recevez sur Telegram la liste des
        rappels de vaccin à envoyer, avec le téléphone des clients. Il ne reste
        qu'à les envoyer sur WhatsApp en un clic depuis la page « Rappels ».
      </p>

      {st.configured && (
        <div className="card mb-6 max-w-2xl">
          <p className="mb-1 font-bold text-brand">✔ Notifications activées</p>
          <p className="mb-4 text-sm text-brand-muted">
            {st.source === "env"
              ? "Réglées par votre hébergeur."
              : "Message chaque jour tant que le site est en ligne."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn btn-primary btn-sm disabled:opacity-60"
              disabled={!!busy}
              onClick={test}
            >
              {busy === "test" ? "Envoi…" : "Envoyer un message de test"}
            </button>
            {st.source === "site" && (
              <button
                className="btn btn-danger btn-sm disabled:opacity-60"
                disabled={!!busy}
                onClick={off}
              >
                Désactiver
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={save} className="card grid max-w-2xl gap-4">
        <h2 className="text-lg font-bold">
          {st.configured
            ? "Changer de compte Telegram"
            : "Activer les notifications (5 minutes)"}
        </h2>
        <ol className="grid gap-2 text-sm leading-relaxed">
          <li>
            <b>1.</b> Dans Telegram, cherchez <b>@BotFather</b>, envoyez-lui{" "}
            <b>/newbot</b>, choisissez un nom pour votre bot, puis copiez le{" "}
            <b>jeton</b> qu'il vous donne.
          </li>
          <li>
            <b>2.</b> Collez le jeton ci-dessous.
          </li>
          <li>
            <b>3.</b> Ouvrez votre nouveau bot dans Telegram, appuyez sur{" "}
            <b>Démarrer</b> et envoyez-lui « Bonjour ».
          </li>
          <li>
            <b>4.</b> Cliquez sur « Trouver mon compte », puis sur « Enregistrer
            et tester ».
          </li>
        </ol>
        <div>
          <label className="label" htmlFor="token">
            Jeton du bot
          </label>
          <input
            id="token"
            className="input"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setErr("");
            }}
            placeholder="123456789:ABCdef…"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="label" htmlFor="chat">
              Votre identifiant Telegram{" "}
              {who && <span className="text-brand">({who})</span>}
            </label>
            <input
              id="chat"
              className="input"
              value={chatId}
              onChange={(e) => {
                setChatId(e.target.value);
                setErr("");
              }}
              placeholder="trouvé automatiquement"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            className="btn btn-ghost disabled:opacity-60"
            disabled={!token.trim() || !!busy}
            onClick={detect}
          >
            {busy === "detect" ? "Recherche…" : "Trouver mon compte"}
          </button>
        </div>
        {err && (
          <p role="alert" className="font-bold text-red-700">
            {err}
          </p>
        )}
        <button
          className="btn btn-primary disabled:opacity-60"
          disabled={!token.trim() || !chatId.trim() || !!busy}
        >
          {busy === "save" ? "Test en cours…" : "Enregistrer et tester"}
        </button>
      </form>
    </div>
  );
}
