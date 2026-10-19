import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${on ? "in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const ToastCtx = createContext<(m: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 animate-pop rounded-xl bg-brand-dark px-5 py-3 font-bold text-white shadow-xl"
        >
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function Confirm({
  open,
  title,
  text,
  label = "Supprimer",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  text: string;
  label?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-brand-dark/50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card w-full max-w-md animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-xl font-extrabold">{title}</h2>
        <p className="mb-6 text-brand-muted">{text}</p>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="button"
            className="btn bg-red-700 text-white"
            onClick={onConfirm}
          >
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
    on
      ? "border-brand bg-brand text-white"
      : "border-brand-line bg-white text-brand-dark hover:border-brand hover:bg-brand-light"
  }`;

/** Choix unique : un clic sélectionne, un second clic désélectionne. */
export function Chips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          className={chip(value === o)}
          onClick={() => onChange(value === o ? "" : o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Choix multiple : on coche autant d'options que nécessaire. Les valeurs hors liste restent visibles et retirables. */
export function MultiChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  const extras = value.filter((v) => !options.includes(v));
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {[...options, ...extras].map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value.includes(o)}
          className={chip(value.includes(o))}
          onClick={() => toggle(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/**
 * Choix rapide (pastilles) + saisie libre avec suggestions, comme pour les races.
 * Tape un texte puis Entrée (ou « Ajouter ») pour ajouter une information en plus.
 */
export function TagPicker({
  label,
  options,
  more = [],
  value,
  onChange,
  placeholder,
  sharedList,
}: {
  label: string;
  options: string[];
  more?: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  sharedList?: string;
}) {
  const ownId = useId();
  const listId = sharedList ?? ownId;
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim().slice(0, 120);
    setText("");
    if (!t || value.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    onChange([...value, t]);
  };
  const custom = value.filter((v) => !options.includes(v));
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value.includes(o)}
            className={chip(value.includes(o))}
            onClick={() => toggle(o)}
          >
            {o}
          </button>
        ))}
        {custom.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed="true"
            title="Cliquer pour retirer"
            className={chip(true)}
            onClick={() => onChange(value.filter((x) => x !== c))}
          >
            {c} ×
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="input"
          list={listId}
          value={text}
          placeholder={placeholder ?? "Écrire une autre information…"}
          aria-label={`${label} : ajouter une information`}
          autoComplete="off"
          maxLength={120}
          onChange={(e) => setText(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        {!sharedList && (
          <datalist id={listId}>
            {[...options, ...more]
              .filter((o) => !value.includes(o))
              .map((o) => (
                <option key={o} value={o} />
              ))}
          </datalist>
        )}
        <button
          type="button"
          className="btn btn-ghost whitespace-nowrap"
          onClick={add}
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

export function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="card border-red-200 bg-red-50">
      <p className="mb-3 font-bold text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onRetry}
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
