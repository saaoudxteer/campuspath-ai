"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { ArrowRight, CheckCircle2, Info, LoaderCircle, X } from "lucide-react";
import type { Snapshot } from "@/lib/schema";
import { statusNames, type Locale, type View } from "@/lib/i18n";
export interface AppContextValue {
  data: Snapshot;
  locale: Locale;
  t: (fr: string, ary?: string) => string;
  busy: boolean;
  mutate: (
    path: string,
    body?: unknown,
    method?: string,
  ) => Promise<Snapshot | null>;
  go: (view: View, pid?: string) => void;
  notify: (message: string) => void;
  programId: string | null;
  setProgramId: (id: string | null) => void;
}
export const AppContext = createContext<AppContextValue | null>(null);
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("App context missing");
  return ctx;
}
export function Button({
  children,
  type = "button",
  variant = "",
  disabled = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  const ctx = useContext(AppContext);
  return (
    <button
      {...props}
      type={type}
      className={`button ${variant} ${className}`}
      disabled={disabled || ctx?.busy}
    >
      {children}
    </button>
  );
}
export function Badge({
  status,
  children,
}: {
  status?: string;
  children?: ReactNode;
}) {
  const ctx = useContext(AppContext);
  const value = status ? statusNames[status] : undefined;
  return (
    <span className={`badge ${value?.[2] ?? "gray"}`}>
      {children ?? value?.[ctx?.locale === "ary" ? 1 : 0] ?? status}
    </span>
  );
}
export function LinkButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="text-link" onClick={onClick}>
      {children}
      <ArrowRight size={16} />
    </button>
  );
}
export function Notice({
  children,
  kind = "info",
}: {
  children: ReactNode;
  kind?: "info" | "success" | "warning";
}) {
  return (
    <div className={`notice ${kind}`}>
      {kind === "success" ? <CheckCircle2 size={18} /> : <Info size={18} />}
      <div>{children}</div>
    </div>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel empty-state">
      <div className="empty-icon">
        <Info size={26} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useApp();
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          type="button"
          aria-label={t("Fermer", "Sedd")}
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Progress({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  return (
    <div
      className="progress-line"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading-state">
      <LoaderCircle className="spin" size={30} />
      <p>Préparation de votre espace…</p>
    </div>
  );
}
export function formatNumber(value: number | null, suffix = "") {
  return value === null
    ? "—"
    : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(
        value,
      ) + suffix;
}
