export const imageTypes = [
  "Radiographie",
  "Échographie",
  "Analyse",
  "Photo",
  "Autre",
];
export interface FicheImage {
  id: string;
  file: string;
  type: string;
  legende: string;
  date: string;
}
export interface Visite {
  id: string;
  date: string;
  motifs: string[];
  vaccins: string[];
  medicaments: string[];
  rappel: string;
  note: string;
}
export interface Fiche {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  animal: string;
  espece: string;
  precision: string;
  race: string;
  sexe: string;
  sterilise: string;
  ageAnimal: string;
  poids: string;
  robe: string;
  puce: string;
  tatouage: string;
  antecedents: string[];
  antecedentsNote: string;
  images: FicheImage[];
  visites: Visite[];
}
export interface Rdv {
  id: string;
  nom: string;
  telephone: string;
  animal: string;
  cabinet: string;
  date: string;
  message: string;
  statut: "nouvelle" | "confirmée" | "refusée";
  createdAt: string;
}

/** Identifiant local (clé des visites). crypto.randomUUID n'existe qu'en HTTPS/localhost, d'où le repli. */
export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Affiche une date JJ/MM/AAAA. Une date « AAAA-MM-JJ » est lue telle quelle (sans décalage de fuseau horaire). */
export const fmt = (d: string) => {
  if (!d) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m
    ? `${m[3]}/${m[2]}/${m[1]}`
    : new Date(d).toLocaleDateString("fr-FR");
};

const two = (n: number) => String(n).padStart(2, "0");
/** Date du jour au format AAAA-MM-JJ, à l'heure locale. */
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
};

/** Ajoute des jours ou des mois à une date AAAA-MM-JJ (le jour est ramené à la fin du mois si besoin). */
export function addToDate(
  date: string,
  add: { days?: number; months?: number },
) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || todayLocal())!;
  let y = +m[1],
    mo = +m[2] - 1 + (add.months ?? 0),
    d = +m[3];
  y += Math.floor(mo / 12);
  mo = ((mo % 12) + 12) % 12;
  d = Math.min(d, new Date(Date.UTC(y, mo + 1, 0)).getUTCDate());
  const r = new Date(Date.UTC(y, mo, d + (add.days ?? 0)));
  return `${r.getUTCFullYear()}-${two(r.getUTCMonth() + 1)}-${two(r.getUTCDate())}`;
}

/** Prochain rappel d'une fiche : celui de la dernière visite qui en contient un. */
export const nextRappel = (f: Fiche) =>
  [...f.visites]
    .filter((v) => v.rappel)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.rappel ?? "";

/** « late » : date dépassée, « soon » : dans les 30 jours, « ok » : plus tard. */
export function rappelState(date: string): "late" | "soon" | "ok" | "" {
  if (!date) return "";
  const today = todayLocal();
  if (date < today) return "late";
  return date <= addToDate(today, { days: 30 }) ? "soon" : "ok";
}

export interface RappelItem {
  fiche: Fiche;
  visite: Visite;
  date: string;
  jours: number;
  etat: "late" | "soon" | "ok";
}

/** Rappels à venir ou en retard (dernière visite qui en contient un, pour chaque fiche), du plus urgent au moins urgent. */
export function listRappels(fiches: Fiche[], maxJours = 30): RappelItem[] {
  const today = todayLocal();
  const num = (s: string) => {
    const [y = 0, m = 1, d = 1] = s.split("-").map(Number);
    return Math.round(Date.UTC(y, m - 1, d) / 86400000);
  };
  const out: RappelItem[] = [];
  for (const fiche of fiches) {
    const visite = [...fiche.visites]
      .filter((v) => v.rappel)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!visite) continue;
    const jours = num(visite.rappel) - num(today);
    if (jours > maxJours) continue;
    out.push({
      fiche,
      visite,
      date: visite.rappel,
      jours,
      etat: jours < 0 ? "late" : jours <= 30 ? "soon" : "ok",
    });
  }
  return out.sort((a, b) => a.jours - b.jours);
}
