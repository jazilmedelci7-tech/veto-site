// Restaure une sauvegarde téléchargée depuis l'espace vétérinaire :  npm run restore -- chemin/vers/sauvegarde.json
import fs from "node:fs";
import mongoose from "mongoose";
import { config } from "./Config.js";
import { Fiche, Rdv } from "./Models.js";
import { ficheSchema } from "./Validation.js";

type Doc = Record<string, unknown> & { id?: string };

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Indique le fichier : npm run restore -- sauvegarde.json");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as {
    fiches?: Doc[];
    rdvs?: Doc[];
  };
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  let nf = 0,
    nr = 0;
  for (const f of data.fiches ?? []) {
    const id = String(f.id ?? "");
    const parsed = ficheSchema.safeParse(f);
    if (!/^[a-f0-9]{24}$/i.test(id) || !parsed.success) {
      console.warn("Fiche ignorée (invalide) :", f.nom ?? id);
      continue;
    }
    // Les images (métadonnées) sont conservées ; les fichiers eux-mêmes sont dans le dossier server/uploads
    const images = Array.isArray(f.images)
      ? (f.images as Doc[]).filter(
          (i) =>
            typeof i?.id === "string" &&
            typeof i?.file === "string" &&
            /^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(i.file as string),
        )
      : [];
    await Fiche.replaceOne(
      { _id: id },
      { _id: id, ...parsed.data, images },
      { upsert: true },
    );
    nf++;
  }
  for (const r of data.rdvs ?? []) {
    const id = String(r.id ?? "");
    if (!/^[a-f0-9]{24}$/i.test(id) || !r.nom || !r.telephone || !r.animal)
      continue;
    await Rdv.replaceOne(
      { _id: id },
      {
        _id: id,
        nom: r.nom,
        telephone: r.telephone,
        animal: r.animal,
        cabinet:
          r.cabinet === "belcourt" || r.cabinet === "oued-romane"
            ? r.cabinet
            : "",
        date: r.date ?? "",
        message: r.message ?? "",
        statut: r.statut ?? "nouvelle",
      },
      { upsert: true },
    );
    nr++;
  }
  console.log(`Restauré : ${nf} fiche(s), ${nr} demande(s) de rendez-vous.`);
  await mongoose.disconnect();
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
