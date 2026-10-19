import { waLink } from "../Whatsapp";

/** Ouvre WhatsApp (application ou WhatsApp Web) avec le message prêt : il reste à appuyer sur « Envoyer ». */
export function WhatsAppButton({
  tel,
  text,
  label = "WhatsApp",
  className = "",
}: {
  tel: string;
  text: string;
  label?: string;
  className?: string;
}) {
  const href = text ? waLink(tel, text) : null;
  const base =
    "btn btn-sm border border-green-600 bg-white text-green-700 hover:bg-green-50";
  if (!href)
    return (
      <span
        title={
          text ? "Numéro de téléphone manquant ou invalide" : "Rien à envoyer"
        }
        className={`${base} cursor-not-allowed opacity-50 ${className}`}
        aria-disabled="true"
      >
        {label}
      </span>
    );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${className}`}
    >
      {label}
    </a>
  );
}
