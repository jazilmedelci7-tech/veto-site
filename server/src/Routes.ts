import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import express, { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import type { z } from "zod";
import { config } from "./Config.js";
import {
  endSession,
  isAuthenticated,
  requireAuth,
  startSession,
} from "./Auth.js";
import { Admin, Fiche, Rdv, Setting } from "./Models.js";
import {
  ficheSchema,
  imageMetaSchema,
  imagePatchSchema,
  loginSchema,
  rdvCreateSchema,
  rdvStatutSchema,
} from "./Validation.js";

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
      res.status(503).json({
        error:
          "Aucun mot de passe n'est défini. Lance « npm run set-password » dans le dossier server.",
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
const removeImageFile = async (file: string) => {
  if (!FILE_RX.test(file)) return;
  try {
    await fs.promises.unlink(path.join(config.uploadsDir, file));
  } catch {
    /* déjà absent */
  }
};

router.get("/images/:file", (req, res) => {
  const file = String(req.params.file);
  if (!FILE_RX.test(file)) {
    res.status(404).json({ error: "Image introuvable" });
    return;
  }
  res.sendFile(
    file,
    {
      root: config.uploadsDir,
      dotfiles: "deny",
      headers: { "Cache-Control": "private, max-age=3600" },
    },
    (err) => {
      if (err && !res.headersSent)
        res.status(404).json({ error: "Image introuvable" });
    },
  );
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
      res.status(415).json({
        error: "Format d'image non pris en charge (JPG, PNG ou WebP).",
      });
      return;
    }
    const ext = detectImage(body);
    if (!ext) {
      res.status(415).json({
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
    await fs.promises.mkdir(config.uploadsDir, { recursive: true });
    await fs.promises.writeFile(path.join(config.uploadsDir, file), body, {
      flag: "wx",
    });
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

router.get("/backup-status", async (_req, res) => {
  const s = await Setting.findOne({ key: "lastBackup" });
  res.json({ last: s?.value ?? null });
});
