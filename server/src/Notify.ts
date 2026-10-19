import { config } from "./Config.js";
import { Fiche, Setting } from "./Models.js";

const two = (n: number) => String(n).padStart(2, "0");
const localDay = (d = new Date()) =>
  `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
const dayNumber = (s: string) => {
  const [y = 0, m = 1, d = 1] = s.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};
const fr = (s: string) => s.split("-").reverse().join("/");

export const notificationsEnabled = () =>
  Boolean(config.telegramToken && config.telegramChatId);

export interface RappelDu {
  key: string;
  texte: string;
  jours: number;
}

/** Rappels (dernière visite qui en contient un, comme sur le site) arrivant dans les prochains jours ou déjà en retard. */
export async function rappelsProches(): Promise<RappelDu[]> {
  const today = localDay();
  const fiches = await Fiche.find()
    .select("nom prenom telephone animal visites")
    .limit(5000);
  const out: RappelDu[] = [];
  for (const f of fiches) {
    const v = [...f.visites]
      .filter((x) => x.rappel)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!v) continue;
    const jours = dayNumber(v.rappel) - dayNumber(today);
    if (jours > config.notifyDaysBefore || jours < -14) continue; // trop loin, ou très ancien
    const quoi = v.vaccins.length
      ? v.vaccins.map((x) => x.replace(/\s*\(.*\)/, "")).join(", ")
      : v.motifs.join(", ") || "rappel";
    const quand =
      jours === 0
        ? "aujourd'hui"
        : jours > 0
          ? `dans ${jours} j`
          : `en retard de ${-jours} j`;
    const tel = f.telephone ? ` · ${f.telephone}` : "";
    out.push({
      key: `${f.id}:${v.rappel}`,
      jours,
      texte: `• ${f.animal} (${`${f.nom} ${f.prenom}`.trim()}) : ${quoi}, le ${fr(v.rappel)} (${quand})${tel}`,
    });
  }
  return out.sort((a, b) => a.jours - b.jours);
}

export async function sendTelegram(text: string) {
  const res = await fetch(
    `${config.telegramApi}/bot${config.telegramToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: config.telegramChatId, text }),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!res.ok) {
    let detail = "";
    try {
      detail =
        ((await res.json()) as { description?: string }).description ?? "";
    } catch {
      /* pas de JSON */
    }
    throw new Error(
      `Telegram a refusé le message (${res.status}) ${detail}`.trim(),
    );
  }
}

async function getSetting(key: string) {
  return (await Setting.findOne({ key }))?.value;
}
async function setSetting(key: string, value: string) {
  await Setting.updateOne({ key }, { $set: { value } }, { upsert: true });
}

/** Envoie les rappels qui n'ont pas encore été signalés. Renvoie le nombre de rappels envoyés. */
export async function envoyerRappels(): Promise<number> {
  const deja = new Set<string>(
    JSON.parse((await getSetting("rappelsNotifies")) ?? "[]"),
  );
  const nouveaux = (await rappelsProches()).filter((r) => !deja.has(r.key));
  if (!nouveaux.length) return 0;
  const texte = `Rappels de vaccin à envoyer (${nouveaux.length})\n\n${nouveaux.map((r) => r.texte).join("\n")}\n\nOuvre l'espace vétérinaire, page « Rappels », pour les envoyer sur WhatsApp en un clic.`;
  await sendTelegram(texte.slice(0, 4000));
  nouveaux.forEach((r) => deja.add(r.key));
  await setSetting("rappelsNotifies", JSON.stringify([...deja].slice(-500)));
  return nouveaux.length;
}

/** Vérifie chaque minute : une fois par jour, à partir de l'heure choisie, signale les nouveaux rappels. */
export function startNotifier() {
  if (!notificationsEnabled()) return;
  let retryAt = 0;
  const tick = async () => {
    const now = new Date();
    if (now.getHours() < config.notifyHour || Date.now() < retryAt) return;
    try {
      const day = localDay(now);
      if ((await getSetting("notifyLastDay")) === day) return;
      const n = await envoyerRappels();
      await setSetting("notifyLastDay", day);
      if (n) console.log(`Notification Telegram envoyée : ${n} rappel(s).`);
    } catch (e) {
      retryAt = Date.now() + 30 * 60 * 1000;
      console.error(
        "Notification impossible, nouvel essai dans 30 min :",
        e instanceof Error ? e.message : e,
      );
    }
  };
  setInterval(() => void tick(), 60 * 1000);
  void tick();
  console.log(
    `Notifications Telegram activées : chaque jour à partir de ${config.notifyHour} h, ${config.notifyDaysBefore} jour(s) avant la date du rappel.`,
  );
}
