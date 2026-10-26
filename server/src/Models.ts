import mongoose, { Schema } from "mongoose";

const toJSON = {
  versionKey: false,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
};

const visiteSchema = new Schema(
  {
    id: { type: String, required: true },
    date: { type: String, default: "" },
    motifs: { type: [String], default: [] },
    vaccins: { type: [String], default: [] },
    medicaments: { type: [String], default: [] },
    rappel: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const imageSchema = new Schema(
  {
    id: { type: String, required: true },
    file: { type: String, required: true },
    type: { type: String, default: "Radiographie" },
    legende: { type: String, default: "" },
    date: { type: String, default: "" },
  },
  { _id: false },
);

const ficheSchema = new Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, default: "" },
    age: { type: String, default: "" },
    telephone: { type: String, default: "" },
    adresse: { type: String, default: "" },
    animal: { type: String, required: true },
    espece: { type: String, default: "" },
    precision: { type: String, default: "" },
    race: { type: String, default: "" },
    sexe: { type: String, default: "" },
    sterilise: { type: String, default: "" },
    ageAnimal: { type: String, default: "" },
    poids: { type: String, default: "" },
    robe: { type: String, default: "" },
    puce: { type: String, default: "" },
    tatouage: { type: String, default: "" },
    antecedents: { type: [String], default: [] },
    antecedentsNote: { type: String, default: "" },
    images: { type: [imageSchema], default: [] },
    visites: { type: [visiteSchema], default: [] },
  },
  { timestamps: true, toJSON },
);
ficheSchema.index({ nom: 1 });
ficheSchema.index({ animal: 1 });
ficheSchema.index({ updatedAt: -1 });

const rdvSchema = new Schema(
  {
    nom: { type: String, required: true },
    telephone: { type: String, required: true },
    animal: { type: String, required: true },
    cabinet: { type: String, maxlength: 40, default: "" },
    date: { type: String, default: "" },
    message: { type: String, default: "" },
    statut: {
      type: String,
      enum: ["nouvelle", "confirmée", "refusée"],
      default: "nouvelle",
    },
  },
  { timestamps: true, toJSON },
);
rdvSchema.index({ createdAt: -1 });

const adminSchema = new Schema(
  { passwordHash: { type: String, required: true } },
  { timestamps: true },
);
const settingSchema = new Schema({
  key: { type: String, unique: true, required: true },
  value: { type: String, required: true },
});

// Images stockées dans la base (le disque de l'hébergeur gratuit est effacé à chaque redémarrage). _id = nom de fichier.
const imageDataSchema = new Schema(
  {
    _id: { type: String, required: true },
    mime: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true },
);

export const Fiche = mongoose.model("Fiche", ficheSchema);
export const ImageData = mongoose.model("ImageData", imageDataSchema);
export const Rdv = mongoose.model("Rdv", rdvSchema);
export const Admin = mongoose.model("Admin", adminSchema);
export const Setting = mongoose.model("Setting", settingSchema);
