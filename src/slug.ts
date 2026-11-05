/** « Radiographie & écho » → « radiographie-echo » : identifiant lisible d'un service dans l'adresse de la page. */
export const slug = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
