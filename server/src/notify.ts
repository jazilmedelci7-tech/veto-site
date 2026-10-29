import { config } from "./config.js";
import { Fiche, Rdv, Setting } from "./models.js";

const two = (n: number) => String(n).padStart(2, "0");
const localDay = (d = new Date()) =>
  `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
const dayNumber = (s: string) => {
  const [y = 0, m = 1, d = 1] = s.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};
const fr = (s: string) => s.split("-").reverse().join("/");

export interface TelegramConf {
  token: string;
  chatId: string;
}

/** Réglage Telegram : d'abord celui enregistré depuis le site (page Notifications), sinon celui de server/.env. */
export async function telegramConf(): Promise<
  (TelegramConf & { source: "site" | "env" }) | null
> {
  const token = await getSetting("telegramToken"),
    chatId = await getSetting("telegramChatId");
  if (token && chatId) return { token, chatId, source: "site" };
  if (config.telegramToken && config.telegramChatId)
    return {
      token: config.telegramToken,
      chatId: config.telegramChatId,
      source: "env",
    };
  return null;
}
export const notificationsEnabled = async () => (await telegramConf()) !== null;

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

export async function sendTelegram(text: string, conf?: TelegramConf) {
  const c = conf ?? (await telegramConf());
  if (!c)
    throw new Error("Les notifications Telegram ne sont pas configurées.");
  const res = await fetch(`${config.telegramApi}/bot${c.token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: c.chatId, text }),
    signal: AbortSignal.timeout(15000),
  });
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

/** Envoie un fichier dans la conversation Telegram (limite de Telegram : 50 Mo). */
export async function sendTelegramFile(
  filename: string,
  content: Buffer,
  caption: string,
  conf?: TelegramConf,
) {
  const c = conf ?? (await telegramConf());
  if (!c)
    throw new Error("Les notifications Telegram ne sont pas configurées.");
  const form = new FormData();
  form.append("chat_id", c.chatId);
  form.append("caption", caption);
  form.append(
    "document",
    new Blob([new Uint8Array(content)], { type: "application/json" }),
    filename,
  );
  const res = await fetch(`${config.telegramApi}/bot${c.token}/sendDocument`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail =
        ((await res.json()) as { description?: string }).description ?? "";
    } catch {
      /* pas de JSON */
    }
    throw new Error(
      `Telegram a refusé le fichier (${res.status}) ${detail}`.trim(),
    );
  }
}

/** Envoie la sauvegarde des fiches et rendez-vous (sans les radios) dans Telegram. */
export async function envoyerSauvegarde(): Promise<void> {
  const [fiches, rdvs] = await Promise.all([
    Fiche.find().sort({ createdAt: 1 }),
    Rdv.find().sort({ createdAt: 1 }),
  ]);
  const now = new Date().toISOString();
  const buf = Buffer.from(JSON.stringify({ exportedAt: now, fiches, rdvs }));
  if (buf.length > 45 * 1024 * 1024) {
    await sendTelegram(
      "Sauvegarde automatique impossible : le fichier est trop gros pour Telegram. Télécharge-la à la main (boutons « Sauvegarde » du site).",
    );
    return;
  }
  await sendTelegramFile(
    `sauvegarde-veto-${now.slice(0, 10)}.json`,
    buf,
    `Sauvegarde automatique du ${fr(now.slice(0, 10))} : ${fiches.length} fiche(s). Garde ce fichier (ne le partage pas : il contient les données des clients). Les radios se sauvegardent à part, avec le bouton « Sauvegarde radios » du site.`,
  );
  await setSetting("backupTgLast", now);
}

async function getSetting(key: string) {
  return (await Setting.findOne({ key }))?.value;
}
async function setSetting(key: string, value: string) {
  await Setting.updateOne({ key }, { $set: { value } }, { upsert: true });
}

/** Enregistre le jeton et l'identifiant de discussion choisis par le vétérinaire (après un message de test réussi). */
export async function saveTelegram(c: TelegramConf) {
  await setSetting("telegramToken", c.token);
  await setSetting("telegramChatId", c.chatId);
}
export async function clearTelegram() {
  await Setting.deleteMany({
    key: { $in: ["telegramToken", "telegramChatId"] },
  });
}

/** Trouve l'identifiant du compte qui a écrit au bot (le vétérinaire doit lui avoir envoyé un message). */
export async function detectChatId(
  token: string,
): Promise<{ chatId: string; nom: string }> {
  const res = await fetch(`${config.telegramApi}/bot${token}/getUpdates`, {
    signal: AbortSignal.timeout(15000),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
    result?: {
      message?: {
        chat?: {
          id?: number;
          type?: string;
          first_name?: string;
          title?: string;
        };
      };
    }[];
  };
  if (!res.ok || !json.ok)
    throw new Error(
      res.status === 401 || res.status === 404
        ? "Jeton invalide : vérifie que tu as bien copié tout le jeton donné par BotFather."
        : `Telegram a refusé la demande (${res.status}) ${json.description ?? ""}`.trim(),
    );
  const chats = (json.result ?? [])
    .map((u) => u.message?.chat)
    .filter(
      (c): c is NonNullable<typeof c> =>
        !!c && typeof c.id === "number" && c.type === "private",
    );
  const last = chats[chats.length - 1];
  if (!last)
    throw new Error(
      "Aucun message trouvé. Ouvre ton bot dans Telegram, appuie sur « Démarrer », envoie « Bonjour », puis réessaie.",
    );
  return { chatId: String(last.id), nom: last.first_name ?? last.title ?? "" };
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
  let retryAt = 0;
  const tick = async () => {
    const now = new Date();
    if (now.getHours() < config.notifyHour || Date.now() < retryAt) return;
    try {
      if (!(await notificationsEnabled())) return; // pas (encore) configuré : on réessaie à la prochaine minute
      const day = localDay(now);
      // Sauvegarde automatique : une fois par semaine (le dimanche), envoyée dans Telegram
      if (now.getDay() === 0 && (await getSetting("backupTgDay")) !== day) {
        try {
          await envoyerSauvegarde();
          await setSetting("backupTgDay", day);
          console.log("Sauvegarde hebdomadaire envoyée sur Telegram.");
        } catch (e) {
          console.error(
            "Sauvegarde Telegram impossible :",
            e instanceof Error ? e.message : e,
          );
        }
      }
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
    `Notifications Telegram : vérification chaque jour à partir de ${config.notifyHour} h (si elles sont configurées dans le site), ${config.notifyDaysBefore} jour(s) avant la date du rappel.`,
  );
}
