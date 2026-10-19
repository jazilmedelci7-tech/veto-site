import { cabinets } from "./cabinets";
import { motifsRappel } from "./animals";
import { Fiche, fmt, rappelState, Rdv } from "./data";

/** Numéro au format international sans « + » (213…), ou null s'il n'est pas utilisable. Algérie par défaut. */
export function waNumber(tel: string): string | null {
  let d = (tel ?? "").trim();
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  d = d.replace(/\D/g, "");
  if (d.startsWith("0")) d = "213" + d.slice(1);
  else if (/^[567]\d{8}$/.test(d)) d = "213" + d;
  return d.length >= 11 && d.length <= 15 ? d : null;
}

/** Lien WhatsApp qui ouvre la conversation avec le message déjà écrit. */
export function waLink(tel: string, text: string): string | null {
  const n = waNumber(tel);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

const contacts = () =>
  cabinets.map((c) => `${c.court} : ${c.telephone}`).join(" · ");

/** Message de rappel (vaccin, vermifuge…) pour la dernière visite qui contient un rappel. */
export function rappelMessage(f: Fiche): string {
  const v = [...f.visites]
    .filter((x) => x.rappel)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!v) return "";
  const quoi = v.vaccins.length
    ? v.vaccins.map((x) => x.replace(/\s*\(.*\)/, "")).join(", ")
    : v.motifs
        .filter((m) => motifsRappel.includes(m))
        .join(", ")
        .toLowerCase() || "rappel";
  const verbe = rappelState(v.rappel) === "late" ? "était prévu" : "est prévu";
  return `Bonjour ${`${f.prenom} ${f.nom}`.trim()}, ici le cabinet Docteur Vétérinaire.\nLe rappel (${quoi}) de ${f.animal} ${verbe} le ${fmt(v.rappel)}.\nPour prendre rendez-vous : ${contacts()}.\nÀ bientôt !`;
}

/** Message pour une demande de rendez-vous, selon son statut. */
export function rdvMessage(r: Rdv): string {
  const c = cabinets.find((x) => x.id === r.cabinet);
  // L'adresse n'est envoyée que si elle est complète (pas de texte entre crochets à confirmer)
  const lieu = c
    ? ` au cabinet ${c.court}${c.adresse.includes("[") ? "" : ` (${c.adresse})`}`
    : "";
  const date = r.date ? ` le ${fmt(r.date)}` : "";
  const hello = `Bonjour ${r.nom}, ici le cabinet Docteur Vétérinaire.`;
  if (r.statut === "confirmée") {
    const h = c
      ? `\nHoraires : ${c.horaires.map((x) => `${x.jours} ${x.heures}`).join(", ")}.`
      : "";
    return `${hello}\nVotre rendez-vous pour ${r.animal}${date}${lieu} est confirmé.${h}\nÀ bientôt !`;
  }
  if (r.statut === "refusée")
    return `${hello}\nNous ne pouvons pas vous recevoir pour ${r.animal}${date}. Appelez-nous pour trouver un autre créneau : ${contacts()}.`;
  return `${hello}\nNous avons bien reçu votre demande de rendez-vous pour ${r.animal}${date}${lieu}. Nous revenons vers vous très vite pour la confirmer.`;
}
