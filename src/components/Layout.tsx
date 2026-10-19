import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { api, ApiError } from "../api";
import { AdminStoreProvider, useStore } from "../store";
import { cabinets, telHref } from "../cabinets";
import { listRappels } from "../data";
import { ErrorBox, Reveal } from "../ui";

export function Logo({
  variant = "white",
  className = "",
}: {
  variant?: "white" | "blue";
  className?: string;
}) {
  return (
    <img
      src={`/logo-${variant}.png`}
      alt="Logo Docteur Vétérinaire"
      className={className}
    />
  );
}

export function Brand({ size = "h-12" }: { size?: string }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <Logo className={size} />
      <span className="leading-tight">
        <strong className="block text-lg md:text-xl">
          Docteur Vétérinaire
        </strong>
        <span className="text-[13px] opacity-85">Belcourt · Oued Romane</span>
      </span>
    </Link>
  );
}

export function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const links: [string, string][] = [
  ["/", "Accueil"],
  ["/services", "Services"],
  ["/a-propos", "À propos"],
  ["/galerie", "Galerie"],
  ["/contact", "Contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <header className="wrap flex flex-wrap items-center justify-between py-3 text-white md:py-4">
      <Brand size="h-11 md:h-14" />
      <button
        className="rounded-lg border border-white/50 px-4 py-2 font-bold md:hidden"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "Fermer" : "Menu"}
      </button>
      <nav
        className={`${open ? "flex animate-drop" : "hidden"} w-full flex-col gap-4 py-4 text-[15px] md:flex md:w-auto md:flex-row md:items-center md:gap-8 md:py-0`}
      >
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `border-b-2 pb-1 transition-colors ${isActive ? "border-white font-extrabold" : "border-transparent hover:border-white/60"}`
            }
          >
            {label}
          </NavLink>
        ))}
        <Link to="/contact" className="btn btn-white text-center">
          Prendre rendez-vous
        </Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand text-white">
      <div className="wrap grid gap-8 py-10 text-sm leading-8 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex items-start gap-4">
          <Logo className="h-20" />
          <div>
            <strong className="text-lg">Docteur Vétérinaire</strong>
            {cabinets.map((c) => (
              <div key={c.id} className="mt-2 leading-6">
                <strong>{c.court}</strong>
                <br />
                {c.adresse}
                <br />
                <a className="hover:underline" href={telHref(c.telephone)}>
                  {c.telephone}
                </a>
              </div>
            ))}
          </div>
        </div>
        <div>
          <strong>Pages</strong>
          {links.map(([to, l]) => (
            <Link key={to} to={to} className="block hover:underline">
              {l}
            </Link>
          ))}
        </div>
        <div>
          <strong>Horaires</strong>
          <br />
          Dim – Jeu : 9h – 17h
          <br />
          Samedi : 9h – 16h
          <br />
          Vendredi : fermé
          <Link to="/admin" className="block opacity-70 hover:opacity-100">
            Espace vétérinaire
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 10);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <>
      <div
        className={`sticky top-0 z-40 bg-brand transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-brand-dark/30" : ""}`}
      >
        <Header />
      </div>
      <div key={pathname} className="animate-fade-in">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

export function PageHero({ title, text }: { title: string; text: string }) {
  return (
    <div className="relative overflow-hidden bg-brand pb-12 text-white md:pb-14">
      <Logo className="pointer-events-none absolute -right-6 -top-10 h-56 animate-float opacity-15 md:h-72" />
      <div className="wrap relative pt-6">
        <h1 className="animate-fade-up text-3xl font-extrabold md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl animate-fade-up text-lg opacity-90 [animation-delay:150ms]">
          {text}
        </p>
      </div>
    </div>
  );
}

export function Cta() {
  return (
    <section className="wrap py-12 md:py-16">
      <Reveal>
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-brand p-8 text-white md:flex-row md:items-center md:p-10">
          <Logo className="pointer-events-none absolute -bottom-10 right-0 h-56 opacity-15 md:right-40" />
          <div className="relative">
            <h2 className="mb-2 text-2xl font-extrabold md:text-3xl">
              Un rendez-vous pour votre compagnon ?
            </h2>
            <p className="opacity-90">
              Belcourt : {cabinets[0].telephone} · Oued Romane :{" "}
              {cabinets[1].telephone}
            </p>
          </div>
          <Link to="/contact" className="btn btn-white relative">
            Prendre rendez-vous
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export function Card({
  badge,
  title,
  text,
  delay = 0,
}: {
  badge: string;
  title: string;
  text: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="card h-full transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand/10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-lg font-extrabold text-brand">
          {badge}
        </div>
        <h3 className="mb-2 text-lg font-bold">{title}</h3>
        <p className="leading-relaxed text-brand-muted">{text}</p>
      </div>
    </Reveal>
  );
}

function AdminShell() {
  const { rdvs, fiches } = useStore();
  const nav = useNavigate();
  const nouvelles = rdvs.filter((r) => r.statut === "nouvelle").length;
  const rappelsUrgents = listRappels(fiches, 7).length;
  const item = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-lg px-3.5 py-2.5 transition-colors md:py-3 ${isActive ? "bg-white/20 font-bold" : "hover:bg-white/10"}`;
  const quit = async () => {
    try {
      await api.logout();
    } catch {
      /* déjà déconnecté */
    }
    nav("/admin/login");
  };
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="bg-brand p-4 text-white md:sticky md:top-0 md:h-screen md:p-5">
        <Brand size="h-10 md:h-11" />
        <nav className="mt-4 flex flex-wrap gap-1.5 text-[15px] md:mt-8 md:flex-col md:flex-nowrap">
          <NavLink to="/admin" end className={item}>
            Fiches clients
          </NavLink>
          <NavLink to="/admin/rendez-vous" className={item}>
            Rendez-vous
            {nouvelles > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-brand">
                {nouvelles}
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/rappels" className={item}>
            Rappels
            {rappelsUrgents > 0 && (
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-brand">
                {rappelsUrgents}
              </span>
            )}
          </NavLink>
          <a
            href="/api/export"
            download
            className="whitespace-nowrap px-3.5 py-2.5 hover:underline md:py-3"
          >
            Télécharger une sauvegarde
          </a>
          <Link
            to="/"
            className="whitespace-nowrap px-3.5 py-2.5 hover:underline md:py-3"
          >
            Voir le site
          </Link>
          <button
            className="whitespace-nowrap px-3.5 py-2.5 text-left hover:underline md:py-3"
            onClick={quit}
          >
            Déconnexion
          </button>
        </nav>
      </aside>
      <main className="min-w-0 p-4 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  const [status, setStatus] = useState<"checking" | "in" | "out" | "down">(
    "checking",
  );
  const [msg, setMsg] = useState("");
  const check = () => {
    setStatus("checking");
    api
      .me()
      .then(() => setStatus("in"))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) setStatus("out");
        else {
          setMsg(e instanceof Error ? e.message : "Erreur");
          setStatus("down");
        }
      });
  };
  useEffect(check, []);
  if (status === "checking")
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-muted">
        Chargement…
      </div>
    );
  if (status === "out") return <Navigate to="/admin/login" replace />;
  if (status === "down")
    return (
      <div className="mx-auto max-w-md p-6">
        <ErrorBox message={msg} onRetry={check} />
      </div>
    );
  return (
    <AdminStoreProvider onUnauthorized={() => setStatus("out")}>
      <AdminShell />
    </AdminStoreProvider>
  );
}
