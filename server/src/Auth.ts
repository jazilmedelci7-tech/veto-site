import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./Config.js";
import { Setting } from "./Models.js";

export const COOKIE = "vet_session";
let secret: string | null = null;

/** Clé de signature : variable JWT_SECRET si définie, sinon une clé aléatoire générée une fois et gardée dans la base. */
export async function loadSecret(): Promise<void> {
  if (config.jwtSecretEnv) {
    secret = config.jwtSecretEnv;
    return;
  }
  const found = await Setting.findOne({ key: "jwtSecret" });
  if (found) {
    secret = found.value;
    return;
  }
  const fresh = crypto.randomBytes(48).toString("hex");
  try {
    await Setting.create({ key: "jwtSecret", value: fresh });
    secret = fresh;
  } catch {
    secret = (await Setting.findOne({ key: "jwtSecret" }))!.value; // créée entre-temps par un autre processus
  }
}

export function startSession(res: Response): void {
  if (!secret) throw new Error("Clé de session non chargée");
  const token = jwt.sign({ role: "admin" }, secret, {
    expiresIn: `${config.sessionHours}h`,
  });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: config.cookieSecure,
    maxAge: config.sessionHours * 3600 * 1000,
    path: "/",
  });
}
export const endSession = (res: Response) => {
  res.clearCookie(COOKIE, { path: "/" });
};

export function isAuthenticated(req: Request): boolean {
  const token = req.cookies?.[COOKIE];
  if (!token || typeof token !== "string" || !secret) return false;
  try {
    jwt.verify(token, secret, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (isAuthenticated(req)) {
    next();
    return;
  }
  res.status(401).json({ error: "Connexion requise" });
}
