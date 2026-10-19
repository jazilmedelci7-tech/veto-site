import { ChangeEvent, useEffect, useRef, useState } from "react";
import { errMsg } from "../api";
import { FicheImage, fmt, imageTypes, todayLocal } from "../data";
import { useStore } from "../store";
import { Confirm, useToast } from "../ui";

export interface Pending {
  key: string;
  file: File;
  type: string;
  legende: string;
  url: string;
}

const MAX = 15 * 1024 * 1024;
const OK = ["image/jpeg", "image/png", "image/webp"];
export const imgUrl = (file: string) => `/api/images/${file}`;
const today = todayLocal;

export function ImageViewer({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in flex-col items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <img
        src={src}
        alt={title}
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="btn btn-white"
        >
          Ouvrir en grand
        </a>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}

function SavedCard({
  img,
  onOpen,
  onPatch,
  onDelete,
}: {
  img: FicheImage;
  onOpen: () => void;
  onPatch: (p: Partial<FicheImage>) => void;
  onDelete: () => void;
}) {
  const [leg, setLeg] = useState(img.legende);
  return (
    <div className="animate-fade-up overflow-hidden rounded-xl border border-brand-line bg-white">
      <button
        type="button"
        className="block aspect-[4/3] w-full overflow-hidden bg-brand-dark"
        onClick={onOpen}
        aria-label={`Agrandir : ${img.type} ${img.legende}`}
      >
        <img
          src={imgUrl(img.file)}
          alt={`${img.type} ${img.legende}`}
          loading="lazy"
          className="h-full w-full object-contain transition duration-300 hover:scale-105"
        />
      </button>
      <div className="grid gap-2 p-3">
        <div className="grid gap-2">
          <select
            aria-label="Type d'image"
            className="input py-2 text-sm"
            value={img.type}
            onChange={(e) => onPatch({ type: e.target.value })}
          >
            {imageTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            aria-label="Date de l'image"
            type="date"
            className="input py-2 text-sm"
            value={img.date}
            onChange={(e) => onPatch({ date: e.target.value })}
          />
        </div>
        <input
          aria-label="Légende"
          className="input py-2 text-sm"
          placeholder="Légende (ex : patte avant gauche)"
          maxLength={200}
          value={leg}
          onChange={(e) => setLeg(e.target.value)}
          onBlur={() => {
            if (leg !== img.legende) onPatch({ legende: leg });
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-brand-muted">{fmt(img.date)}</span>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onDelete}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Radios, échographies et photos d'une fiche.
 * Fiche existante : l'image est envoyée tout de suite. Nouvelle fiche : elle est gardée en attente
 * puis envoyée au moment de l'enregistrement de la fiche.
 */
export function FicheImages({
  ficheId,
  images,
  setImages,
  pending,
  setPending,
}: {
  ficheId: string | null;
  images: FicheImage[];
  setImages: (i: FicheImage[]) => void;
  pending: Pending[];
  setPending: (fn: (p: Pending[]) => Pending[]) => void;
}) {
  const store = useStore();
  const toast = useToast();
  const [type, setType] = useState("Radiographie");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<{ src: string; title: string } | null>(null);
  const [del, setDel] = useState<FicheImage | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    for (const file of files) {
      if (!OK.includes(file.type)) {
        toast(`${file.name} : format non pris en charge (JPG, PNG ou WebP).`);
        continue;
      }
      if (file.size > MAX) {
        toast(`${file.name} : image trop lourde (15 Mo maximum).`);
        continue;
      }
      if (ficheId) {
        try {
          const saved = await store.uploadImage(ficheId, file, {
            type,
            legende: "",
            date: today(),
          });
          setImages(saved.images);
        } catch (err) {
          toast(errMsg(err));
        }
      } else {
        setPending((p) => [
          ...p,
          {
            key: `${file.name}-${file.size}-${Date.now()}-${p.length}`,
            file,
            type,
            legende: "",
            url: URL.createObjectURL(file),
          },
        ]);
      }
    }
    setBusy(false);
  };
  const patch = async (img: FicheImage, p: Partial<FicheImage>) => {
    if (!ficheId) return;
    const before = images;
    setImages(images.map((x) => (x.id === img.id ? { ...x, ...p } : x)));
    try {
      const saved = await store.updateImage(ficheId, img.id, p);
      setImages(saved.images);
    } catch (err) {
      setImages(before);
      toast(errMsg(err));
    }
  };
  const remove = async () => {
    const img = del;
    setDel(null);
    if (!img || !ficheId) return;
    try {
      const saved = await store.deleteImage(ficheId, img.id);
      setImages(saved.images);
      toast("Image supprimée");
    } catch (err) {
      toast(errMsg(err));
    }
  };
  const dropPending = (k: string) =>
    setPending((p) => {
      p.filter((x) => x.key === k).forEach((x) => URL.revokeObjectURL(x.url));
      return p.filter((x) => x.key !== k);
    });
  const upPending = (k: string, patch: Partial<Pending>) =>
    setPending((p) => p.map((x) => (x.key === k ? { ...x, ...patch } : x)));

  return (
    <section className="card mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Radios et images</h2>
          <p className="text-sm text-brand-muted">
            Radiographies, échographies, analyses ou photos de l'animal (JPG,
            PNG ou WebP).
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="label" htmlFor="imgtype">
              Type
            </label>
            <select
              id="imgtype"
              className="input py-2.5"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {imageTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={pick}
            aria-label="Choisir des images"
          />
          <button
            type="button"
            className="btn btn-primary disabled:opacity-60"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {busy ? "Envoi…" : "+ Ajouter une image"}
          </button>
        </div>
      </div>
      {images.length === 0 && pending.length === 0 && (
        <p className="text-brand-muted">Aucune image pour cet animal.</p>
      )}
      {!ficheId && pending.length > 0 && (
        <p className="mb-3 rounded-lg bg-brand-light p-3 text-sm">
          Ces images seront envoyées quand tu enregistreras la fiche.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((img) => (
          <SavedCard
            key={img.id}
            img={img}
            onOpen={() =>
              setView({
                src: imgUrl(img.file),
                title: `${img.type} ${img.legende}`.trim(),
              })
            }
            onPatch={(p) => void patch(img, p)}
            onDelete={() => setDel(img)}
          />
        ))}
        {pending.map((p) => (
          <div
            key={p.key}
            className="animate-fade-up overflow-hidden rounded-xl border border-dashed border-brand bg-white"
          >
            <button
              type="button"
              className="block aspect-[4/3] w-full overflow-hidden bg-brand-dark"
              onClick={() => setView({ src: p.url, title: p.file.name })}
            >
              <img
                src={p.url}
                alt={p.file.name}
                className="h-full w-full object-contain"
              />
            </button>
            <div className="grid gap-2 p-3">
              <select
                aria-label="Type d'image"
                className="input py-2 text-sm"
                value={p.type}
                onChange={(e) => upPending(p.key, { type: e.target.value })}
              >
                {imageTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                aria-label="Légende"
                className="input py-2 text-sm"
                placeholder="Légende (facultatif)"
                maxLength={200}
                value={p.legende}
                onChange={(e) => upPending(p.key, { legende: e.target.value })}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => dropPending(p.key)}
              >
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>
      {view && (
        <ImageViewer
          src={view.src}
          title={view.title || "Image"}
          onClose={() => setView(null)}
        />
      )}
      <Confirm
        open={!!del}
        title="Supprimer cette image ?"
        text="L'image sera définitivement supprimée de la fiche."
        onCancel={() => setDel(null)}
        onConfirm={() => void remove()}
      />
    </section>
  );
}
