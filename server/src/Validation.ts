import { z } from "zod";

// Messages en français pour les cas non prévus (champ absent, mauvais type…)
z.setErrorMap((issue, ctx) => {
  if (issue.code === "invalid_type")
    return {
      message:
        issue.received === "undefined"
          ? "Champ obligatoire"
          : "Données invalides",
    };
  return { message: ctx.defaultError };
});

const required = (msg: string, max: number, min = 1) =>
  z
    .string({ required_error: msg, invalid_type_error: msg })
    .trim()
    .min(min, msg)
    .max(max);

const str = (max: number) => z.string().trim().max(max).default("");
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")
  .or(z.literal(""))
  .default("");

const visite = z.object({
  id: z.string().trim().min(1).max(40),
  date: day,
  motifs: z.array(z.string().trim().max(60)).max(30).default([]),
  vaccins: z.array(z.string().trim().max(100)).max(30).default([]),
  medicaments: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
  rappel: day,
  note: str(2000),
});

export const ficheSchema = z.object({
  nom: required("Le nom du client est obligatoire", 80),
  prenom: str(80),
  age: str(10),
  telephone: str(30),
  adresse: str(200),
  animal: required("Le nom de l'animal est obligatoire", 80),
  espece: str(40),
  precision: str(80),
  race: str(80),
  sexe: str(10),
  sterilise: str(10),
  ageAnimal: str(30),
  poids: str(10),
  robe: str(60),
  puce: str(25),
  tatouage: str(25),
  antecedents: z.array(z.string().trim().min(1).max(100)).max(40).default([]),
  antecedentsNote: str(3000),
  visites: z.array(visite).max(500).default([]),
});

export const rdvCreateSchema = z.object({
  nom: required("Le nom est obligatoire", 80),
  telephone: required("Numéro de téléphone invalide", 30, 5),
  animal: required("Le nom de l'animal est obligatoire", 80),
  cabinet: z.enum(["belcourt", "oued-romane"], {
    message: "Choisis un cabinet",
  }),
  date: day,
  message: str(1000),
  website: z.string().max(200).optional(), // champ piège anti-robots : doit rester vide
});

export const rdvStatutSchema = z.object({
  statut: z.enum(["nouvelle", "confirmée", "refusée"]),
});
export const loginSchema = z.object({ password: z.string().min(1).max(200) });
export const passwordPolicy = z
  .string()
  .min(8, "Le mot de passe doit faire au moins 8 caractères")
  .max(200);

export const IMAGE_TYPES = [
  "Radiographie",
  "Échographie",
  "Analyse",
  "Photo",
  "Autre",
] as const;
export const imageMetaSchema = z.object({
  type: z.enum(IMAGE_TYPES).default("Radiographie"),
  legende: str(200),
  date: day,
});
export const imagePatchSchema = z.object({
  type: z.enum(IMAGE_TYPES).optional(),
  legende: z.string().trim().max(200).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")
    .or(z.literal(""))
    .optional(),
});
