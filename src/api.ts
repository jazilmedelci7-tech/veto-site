import type { Fiche, FicheImage, Rdv } from "./data";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export const errMsg = (e: unknown) =>
  e instanceof Error ? e.message : "Une erreur est survenue.";

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
): Promise<T> {
  const isFile = body instanceof Blob;
  let res: Response;
  try {
    res = await fetch("/api" + url, {
      method,
      credentials: "same-origin",
      headers:
        body === undefined
          ? undefined
          : { "Content-Type": isFile ? body.type : "application/json" },
      body:
        body === undefined ? undefined : isFile ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "Impossible de joindre le serveur. Vérifie qu'il est bien lancé.",
    );
  }
  if (!res.ok) {
    let message = "Une erreur est survenue.";
    try {
      const d = await res.json();
      if (typeof d?.error === "string") message = d.error;
    } catch {
      /* réponse sans JSON */
    }
    throw new ApiError(res.status, message);
  }
  // Toujours lire la réponse, même vide (204) : sinon le navigateur la signale comme « abandonnée »
  if (res.status === 204) {
    await res.text();
    return undefined as T;
  }
  return (await res.json()) as T;
}

export type FicheInput = Omit<Fiche, "id" | "images">;
export interface ImageMeta {
  type: string;
  legende: string;
  date: string;
}
export interface RdvInput {
  nom: string;
  telephone: string;
  animal: string;
  cabinet: string;
  date: string;
  message: string;
  website?: string;
}

export const api = {
  me: () => request<{ ok: true }>("GET", "/auth/me"),
  login: (password: string) =>
    request<{ ok: true }>("POST", "/auth/login", { password }),
  logout: () => request<{ ok: true }>("POST", "/auth/logout"),
  fiches: () => request<Fiche[]>("GET", "/fiches"),
  createFiche: (f: FicheInput) => request<Fiche>("POST", "/fiches", f),
  updateFiche: (id: string, f: FicheInput) =>
    request<Fiche>("PUT", `/fiches/${id}`, f),
  deleteFiche: (id: string) => request<void>("DELETE", `/fiches/${id}`),
  uploadImage: (id: string, file: File, meta: ImageMeta) =>
    request<Fiche>(
      "POST",
      `/fiches/${id}/images?${new URLSearchParams({ ...meta })}`,
      file,
    ),
  updateImage: (
    id: string,
    imgId: string,
    patch: Partial<Pick<FicheImage, "type" | "legende" | "date">>,
  ) => request<Fiche>("PATCH", `/fiches/${id}/images/${imgId}`, patch),
  deleteImage: (id: string, imgId: string) =>
    request<Fiche>("DELETE", `/fiches/${id}/images/${imgId}`),
  rdvs: () => request<Rdv[]>("GET", "/rdvs"),
  setRdvStatut: (id: string, statut: Rdv["statut"]) =>
    request<Rdv>("PATCH", `/rdvs/${id}`, { statut }),
  deleteRdv: (id: string) => request<void>("DELETE", `/rdvs/${id}`),
  backupStatus: () => request<{ last: string | null }>("GET", "/backup-status"),
  createRdv: (r: RdvInput) => request<{ ok: true }>("POST", "/rdv", r),
};
