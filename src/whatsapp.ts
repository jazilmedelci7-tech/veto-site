import { cabinets } from './cabinets'
import { site } from './site'
import { Fiche, fmt, rappelsActifs, RappelActif, rappelState, Rdv } from './data'

/** Numéro au format international sans « + », ou null s'il n'est pas utilisable. Le pays vient du réglage indicatifPays du client. */
export function waNumber(tel: string): string | null {
  let d = (tel ?? '').trim()
  if (d.startsWith('+')) d = d.slice(1)
  else if (d.startsWith('00')) d = d.slice(2)
  d = d.replace(/\D/g, '')
  const ind = site.indicatifPays
  if (d.startsWith('0')) d = ind + d.slice(1)
  else if (!d.startsWith(ind) && d.length <= 9) d = ind + d
  return d.length >= 11 && d.length <= 15 ? d : null
}

/** Lien WhatsApp qui ouvre la conversation avec le message déjà écrit. */
export function waLink(tel: string, text: string): string | null {
  const n = waNumber(tel)
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null
}

const qui = site.signature ?? site.nom
const contacts = () => cabinets.map((c) => `${c.court} : ${c.telephone}`).join(' · ')

/** Message de rappel : pour un rappel précis, ou pour tous les rappels à faire de la fiche s'il y en a plusieurs. */
export function rappelMessage(f: Fiche, un?: RappelActif): string {
  const items = un ? [un] : rappelsActifs(f)
  if (!items.length) return ''
  const debut = `Bonjour ${`${f.prenom} ${f.nom}`.trim()}, ici ${qui}.`
  const fin = `Pour prendre rendez-vous : ${contacts()}.\nÀ bientôt !`
  if (items.length === 1) {
    const x = items[0]!
    const verbe = rappelState(x.date) === 'late' ? 'était prévu' : 'est prévu'
    return `${debut}\nLe rappel (${x.libelle}) de ${f.animal} ${verbe} le ${fmt(x.date)}.\n${fin}`
  }
  return `${debut}\nVoici les rappels de ${f.animal} :\n${items.map((x) => `• ${x.libelle} : le ${fmt(x.date)}`).join('\n')}\n${fin}`
}

/** Message pour une demande de rendez-vous, selon son statut. */
export function rdvMessage(r: Rdv): string {
  const c = cabinets.find((x) => x.id === r.cabinet)
  // L'adresse n'est envoyée que si elle est complète (pas de texte entre crochets à confirmer)
  const lieu = c ? ` au cabinet${cabinets.length > 1 ? ` ${c.court}` : ''}${c.adresse.includes('[') ? '' : ` (${c.adresse})`}` : ''
  const date = r.date ? ` le ${fmt(r.date)}` : ''
  const hello = `Bonjour ${r.nom}, ici ${qui}.`
  if (r.statut === 'confirmée') {
    const h = c ? `\nHoraires : ${c.horaires.map((x) => `${x.jours} ${x.heures}`).join(', ')}.` : ''
    return `${hello}\nVotre rendez-vous pour ${r.animal}${date}${lieu} est confirmé.${h}\nÀ bientôt !`
  }
  if (r.statut === 'refusée') return `${hello}\nNous ne pouvons pas vous recevoir pour ${r.animal}${date}. Appelez-nous pour trouver un autre créneau : ${contacts()}.`
  return `${hello}\nNous avons bien reçu votre demande de rendez-vous pour ${r.animal}${date}${lieu}. Nous revenons vers vous très vite pour la confirmer.`
}
