import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { randomUUID, timingSafeEqual } from "node:crypto";
import express, { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import type { z } from "zod";
import { config } from "./config.js";
import {
  endSession,
  isAuthenticated,
  requireAuth,
  startSession,
} from "./auth.js";
import { Admin, Fiche, ImageData, Rdv, Setting } from "./models.js";
import {
  clearTelegram,
  detectChatId,
  saveTelegram,
  sendTelegram,
  telegramConf,
} from "./notify.js";
import {
  changePasswordSchema,
  ficheSchema,
  imageMetaSchema,
  imagePatchSchema,
  loginSchema,
  rdvCreateSchema,
  rdvStatutSchema,
  setupSchema,
  telegramDetectSchema,
  telegramSchema,
} from "./validation.js";

export const router = Router();

const limitMsg = (error: string) => ({ error });
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMsg("Trop de tentatives. Réessaie dans quelques minutes."),
});
const rdvLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMsg(
    "Trop de demandes envoyées. Réessaie plus tard ou appelle le cabinet.",
  ),
});

const isId = (v: unknown): v is string =>
  typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const one = (v: unknown): string => (typeof v === "string" ? v : "");

function parse<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown,
  res: Response,
): z.infer<T> | null {
  const r = schema.safeParse(body);
  if (r.success) return r.data;
  res
    .status(400)
    .json({ error: r.error.issues[0]?.message ?? "Données invalides" });
  return null;
}

/* ---------- Connexion ---------- */
router.post(
  "/auth/login",
  loginLimiter,
  async (req: Request, res: Response) => {
    const data = parse(loginSchema, req.body, res);
    if (!data) return;
    const admin = await Admin.findOne();
    if (!admin) {
      res
        .status(503)
        .json({
          error:
            "Aucun mot de passe n'est défini. Ouvre la page de connexion pour le créer.",
        });
      return;
    }
    const ok = await bcrypt.compare(data.password, admin.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Mot de passe incorrect." });
      return;
    }
    startSession(res);
    res.json({ ok: true });
  },
);
// Le site demande s'il faut afficher « Créer mon mot de passe » (premier accès) ou « Se connecter »
router.get("/auth/status", async (_req, res) => {
  res.json({
    configured: !!(await Admin.exists({})),
    needsCode: !!config.setupCode,
  });
});
// Création du premier mot de passe, par le vétérinaire lui-même. Impossible dès qu'un mot de passe existe.
router.post(
  "/auth/setup",
  loginLimiter,
  async (req: Request, res: Response) => {
    const data = parse(setupSchema, req.body, res);
    if (!data) return;
    if (await Admin.exists({})) {
      res
        .status(409)
        .json({ error: "Un mot de passe est déjà défini. Connecte-toi." });
      return;
    }
    if (config.setupCode) {
      const a = Buffer.from(data.code ?? ""),
        b = Buffer.from(config.setupCode);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        res.status(403).json({ error: "Code d'activation incorrect." });
        return;
      }
    }
    await Admin.create({ passwordHash: await bcrypt.hash(data.password, 12) });
    startSession(res);
    res.status(201).json({ ok: true });
  },
);
router.post("/auth/logout", (_req, res) => {
  endSession(res);
  res.json({ ok: true });
});
router.get("/auth/me", (req, res) => {
  if (isAuthenticated(req)) {
    res.json({ ok: true });
    return;
  }
  res.status(401).json({ error: "Connexion requise" });
});

/* ---------- Demande de rendez-vous (publique) ---------- */
router.post("/rdv", rdvLimiter, async (req, res) => {
  const data = parse(rdvCreateSchema, req.body, res);
  if (!data) return;
  if (data.website) {
    res.status(201).json({ ok: true });
    return;
  } // robot : on fait semblant sans rien enregistrer
  const { website: _ignored, ...rdv } = data;
  await Rdv.create(rdv);
  res.status(201).json({ ok: true });
});

/* ---------- Tout le reste : réservé au vétérinaire ---------- */
router.use(requireAuth);

// Changer son mot de passe (il faut connaître l'ancien)
router.post(
  "/auth/change-password",
  loginLimiter,
  async (req: Request, res: Response) => {
    const data = parse(changePasswordSchema, req.body, res);
    if (!data) return;
    const admin = await Admin.findOne();
    if (!admin || !(await bcrypt.compare(data.current, admin.passwordHash))) {
      res.status(401).json({ error: "Mot de passe actuel incorrect." });
      return;
    }
    admin.passwordHash = await bcrypt.hash(data.password, 12);
    await admin.save();
    res.json({ ok: true });
  },
);

router.get("/fiches", async (req, res) => {
  const q = one(req.query.q).trim().slice(0, 80);
  const espece = one(req.query.espece).trim().slice(0, 40);
  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { nom: rx },
      { prenom: rx },
      { animal: rx },
      { puce: rx },
      { tatouage: rx },
    ];
  }
  if (espece) filter.espece = espece;
  const fiches = await Fiche.find(filter).sort({ updatedAt: -1 }).limit(2000);
  res.json(fiches);
});
router.get("/fiches/:id", async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: "Fiche introuvable" });
    return;
  }
  const f = await Fiche.findById(req.params.id);
  if (!f) {
    res.status(404).json({ error: "Fiche introuvable" });
    return;
  }
  res.json(f);
});
router.post("/fiches", async (req, res) => {
  const data = parse(ficheSchema, req.body, res);
  if (!data) return;
  res.status(201).json(await Fiche.create(data));
});
router.put("/fiches/:id", async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: "Fiche introuvable" });
    return;
  }
  const data = parse(ficheSchema, req.body, res);
  if (!data) return;
  const f = await Fiche.findByIdAndUpdate(
    req.params.id,
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!f) {
    res.status(404).json({ error: "Fiche introuvable" });
    return;
  }
  res.json(f);
});
router.delete("/fiches/:id", async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: "Fiche introuvable" });
    return;
  }
  const f = await Fiche.findByIdAndDelete(req.params.id);
  if (!f) {
    res.status(404).json({ error: "Fiche introuvable" });
    return;
  }
  await Promise.all(f.images.map((i) => removeImageFile(i.file)));
  res.status(204).end();
});

/* ---------- Images (radios, échographies, photos) d'une fiche ---------- */
const FILE_RX = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;
const MAX_IMAGES = 60;

function detectImage(b: Buffer): "jpg" | "png" | "webp" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return "jpg";
  if (
    b.length > 12 &&
    b
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "png";
  if (
    b.length > 12 &&
    b.subarray(0, 4).toString("latin1") === "RIFF" &&
    b.subarray(8, 12).toString("latin1") === "WEBP"
  )
    return "webp";
  return null;
}
const MIME = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;
const removeImageFile = async (file: string) => {
  if (!FILE_RX.test(file)) return;
  await ImageData.deleteOne({ _id: file });
  try {
    await fs.promises.unlink(path.join(config.uploadsDir, file));
  } catch {
    /* déjà absent ou stocké en base */
  }
};
// Lit une image : d'abord dans la base, sinon dans l'ancien dossier (anciennes radios)
async function readImage(file: string): Promise<Buffer | null> {
  const d = await ImageData.findById(file);
  if (d) return Buffer.from(d.data);
  try {
    return await fs.promises.readFile(path.join(config.uploadsDir, file));
  } catch {
    return null;
  }
}

router.get("/images/:file", async (req, res) => {
  const file = String(req.params.file);
  if (!FILE_RX.test(file)) {
    res.status(404).json({ error: "Image introuvable" });
    return;
  }
  const buf = await readImage(file);
  if (!buf) {
    res.status(404).json({ error: "Image introuvable" });
    return;
  }
  res.setHeader("Content-Type", MIME[file.split(".")[1] as keyof typeof MIME]);
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.send(buf);
});

router.post(
  "/fiches/:id/images",
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp"],
    limit: "15mb",
  }),
  async (req, res) => {
    if (!isId(req.params.id)) {
      res.status(404).json({ error: "Fiche introuvable" });
      return;
    }
    const body = req.body as unknown;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      res
        .status(415)
        .json({
          error: "Format d'image non pris en charge (JPG, PNG ou WebP).",
        });
      return;
    }
    const ext = detectImage(body);
    if (!ext) {
      res
        .status(415)
        .json({
          error: "Ce fichier n'est pas une image JPG, PNG ou WebP valide.",
        });
      return;
    }
    const meta = parse(
      imageMetaSchema,
      {
        type: one(req.query.type) || undefined,
        legende: one(req.query.legende),
        date: one(req.query.date),
      },
      res,
    );
    if (!meta) return;
    const existing = await Fiche.findById(req.params.id).select("images");
    if (!existing) {
      res.status(404).json({ error: "Fiche introuvable" });
      return;
    }
    if (existing.images.length >= MAX_IMAGES) {
      res
        .status(400)
        .json({ error: `Maximum ${MAX_IMAGES} images par fiche.` });
      return;
    }
    const file = `${randomUUID()}.${ext}`;
    await ImageData.create({ _id: file, mime: MIME[ext], data: body });
    const f = await Fiche.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { id: randomUUID(), file, ...meta } } },
      { new: true },
    );
    if (!f) {
      await removeImageFile(file);
      res.status(404).json({ error: "Fiche introuvable" });
      return;
    }
    res.status(201).json(f);
  },
);

router.patch("/fiches/:id/images/:imgId", async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: "Fiche introuvable" });
    return;
  }
  const data = parse(imagePatchSchema, req.body, res);
  if (!data) return;
  const imgId = String(req.params.imgId);
  const cur = await Fiche.findById(req.params.id).select("images");
  if (!cur || !cur.images.some((i) => i.id === imgId)) {
    res.status(404).json({ error: "Image introuvable" });
    return;
  }
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  );
  const images = cur.images.map((i) =>
    i.id === imgId ? { ...i.toObject(), ...clean } : i.toObject(),
  );
  res.json(
    await Fiche.findByIdAndUpdate(
      req.params.id,
      { $set: { images } },
      { new: true },
    ),
  );
});

router.delete("/fiches/:id/images/:imgId", async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: "Fiche introuvable" });
    return;
  }
  const imgId = String(req.params.imgId);
  const cur = await Fiche.findById(req.params.id).select("images");
  const img = cur?.images.find((i) => i.id === imgId);
  if (!cur || !img) {
    res.status(404).json({ error: "Image introuvable" });
    return;
  }
  const images = cur.images
    .filter((i) => i.id !== imgId)
    .map((i) => i.toObject());
  const f = await Fiche.findByIdAndUpdate(
    req.params.id,
    { $set: { images } },
    { new: true },
  );
  await removeImageFile(img.file);
  res.json(f);
});

router.get("/rdvs", async (_req, res) => {
  res.json(await Rdv.find().sort({ createdAt: -1 }).limit(2000));
});
router.patch("/rdvs/:id", async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: "Demande introuvable" });
    return;
  }
  const data = parse(rdvStatutSchema, req.body, res);
  if (!data) return;
  const r = await Rdv.findByIdAndUpdate(
    req.params.id,
    { $set: { statut: data.statut } },
    { new: true },
  );
  if (!r) {
    res.status(404).json({ error: "Demande introuvable" });
    return;
  }
  res.json(r);
});
router.delete("/rdvs/:id", async (req, res) => {
  if (!isId(req.params.id)) {
    res.status(404).json({ error: "Demande introuvable" });
    return;
  }
  const r = await Rdv.findByIdAndDelete(req.params.id);
  if (!r) {
    res.status(404).json({ error: "Demande introuvable" });
    return;
  }
  res.status(204).end();
});

/* ---------- Notifications Telegram (réglées par le vétérinaire) ---------- */
const notifLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMsg("Trop d'essais. Réessaie dans quelques minutes."),
});
router.get("/notifications", async (_req, res) => {
  const c = await telegramConf();
  res.json({
    configured: !!c,
    source: c?.source ?? null,
    hour: config.notifyHour,
    daysBefore: config.notifyDaysBefore,
  }); // le jeton n'est jamais renvoyé
});
router.post("/notifications/detect", notifLimiter, async (req, res) => {
  const data = parse(telegramDetectSchema, req.body, res);
  if (!data) return;
  try {
    res.json(await detectChatId(data.token));
  } catch (e) {
    res
      .status(400)
      .json({ error: e instanceof Error ? e.message : "Erreur Telegram" });
  }
});
router.put("/notifications", notifLimiter, async (req, res) => {
  const data = parse(telegramSchema, req.body, res);
  if (!data) return;
  try {
    await sendTelegram(
      "Les notifications du cabinet sont activées. Tu recevras ici les rappels de vaccin à envoyer.",
      data,
    );
  } catch (e) {
    res
      .status(400)
      .json({
        error: e instanceof Error ? e.message : "Telegram a refusé le message",
      });
    return;
  }
  await saveTelegram(data); // enregistré seulement si le message de test est bien arrivé
  res.json({ ok: true });
});
router.post("/notifications/test", notifLimiter, async (_req, res) => {
  try {
    await sendTelegram("Test : les notifications du cabinet fonctionnent.");
    res.json({ ok: true });
  } catch (e) {
    res
      .status(400)
      .json({
        error: e instanceof Error ? e.message : "Telegram a refusé le message",
      });
  }
});
router.delete("/notifications", async (_req, res) => {
  await clearTelegram();
  res.json({ ok: true });
});

/* ---------- Sauvegarde ---------- */
router.get("/export", async (_req, res) => {
  const [fiches, rdvs] = await Promise.all([
    Fiche.find().sort({ createdAt: 1 }),
    Rdv.find().sort({ createdAt: 1 }),
  ]);
  const now = new Date().toISOString();
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="sauvegarde-veto-${now.slice(0, 10)}.json"`,
  );
  await Setting.updateOne(
    { key: "lastBackup" },
    { $set: { value: now } },
    { upsert: true },
  );
  res.json({ exportedAt: now, fiches, rdvs });
});

// Sauvegarde des images : un fichier texte, une image par ligne (lu en continu pour ne pas saturer la mémoire)
router.get("/export-images", async (_req, res) => {
  const fiches = await Fiche.find().select("images");
  const files = fiches.flatMap((f) => f.images.map((i) => i.file));
  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="sauvegarde-images-${new Date().toISOString().slice(0, 10)}.ndjson"`,
  );
  for (const file of files) {
    const buf = await readImage(file);
    if (!buf) continue;
    if (
      !res.write(JSON.stringify({ file, data: buf.toString("base64") }) + "\n")
    )
      await new Promise((ok) => res.once("drain", ok));
  }
  res.end();
});

router.get("/backup-status", async (_req, res) => {
  const s = await Setting.findOne({ key: "lastBackup" });
  res.json({ last: s?.value ?? null });
});
