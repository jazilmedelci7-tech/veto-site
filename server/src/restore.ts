// Restaure une sauvegarde téléchargée depuis l'espace vétérinaire :  npm run restore -- sauvegarde.json [sauvegarde-images.ndjson]
import fs from "node:fs";
import mongoose from "mongoose";
import { config } from "./config.js";
import readline from "node:readline";
import { Fiche, ImageData, Rdv } from "./models.js";
import { ficheSchema } from "./validation.js";

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
          typeof r.cabinet === "string" && /^[a-z0-9-]{1,40}$/.test(r.cabinet)
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
  let ni = 0;
  const imgFile = process.argv[3];
  if (imgFile) {
    const rl = readline.createInterface({
      input: fs.createReadStream(imgFile),
      crlfDelay: Infinity,
    });
    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const { file, data } = JSON.parse(line) as {
          file: string;
          data: string;
        };
        if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(file)) continue;
        const ext = file.split(".")[1] as "jpg" | "png" | "webp";
        await ImageData.replaceOne(
          { _id: file },
          {
            _id: file,
            mime: { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[
              ext
            ],
            data: Buffer.from(data, "base64"),
          },
          { upsert: true },
        );
        ni++;
      } catch {
        console.warn("Ligne image ignorée");
      }
    }
  }
  console.log(
    `Restauré : ${nf} fiche(s), ${nr} demande(s) de rendez-vous, ${ni} image(s).`,
  );
  await mongoose.disconnect();
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
