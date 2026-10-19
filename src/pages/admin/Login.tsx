import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errMsg } from "../../api";
import { Logo } from "../../components/Layout";

export default function Login() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  // Déjà connecté : on va directement à l'espace vétérinaire
  useEffect(() => {
    api
      .me()
      .then(() => nav("/admin", { replace: true }))
      .catch(() => {});
  }, [nav]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.login(pw);
      nav("/admin");
    } catch (error) {
      setErr(errMsg(error));
      setBusy(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand p-4">
      <form
        onSubmit={submit}
        className="card w-full max-w-sm animate-pop text-center"
      >
        <Logo variant="blue" className="mx-auto mb-4 h-24" />
        <h1 className="mb-1 text-2xl font-extrabold">Espace vétérinaire</h1>
        <p className="mb-5 text-sm text-brand-muted">
          Accès réservé au cabinet.
        </p>
        <label className="label text-left" htmlFor="pw">
          Mot de passe
        </label>
        <input
          id="pw"
          type="password"
          className="input"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setErr("");
          }}
          autoFocus
          autoComplete="current-password"
        />
        {err && (
          <p role="alert" className="mt-2 text-sm font-bold text-red-700">
            {err}
          </p>
        )}
        <button
          className="btn btn-primary mt-5 w-full disabled:opacity-60"
          disabled={busy || !pw}
        >
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
