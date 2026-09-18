"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Compass,
  FileCheck2,
  FileText,
  FolderOpen,
  GraduationCap,
  Languages,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Mic,
  Route,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { ApiError, bootstrap, getSnapshot, request } from "@/lib/api";
import { navigation, type Locale, type View } from "@/lib/i18n";
import type { Snapshot } from "@/lib/schema";
import { translateSystem } from "@/lib/system-i18n";
import { AppContext, Button, Field, Loading } from "@/components/ui";
import { Dashboard } from "@/components/dashboard";
import { OrientationView } from "@/components/orientation-view";
import { PublicHome } from "@/components/public-home";
import {
  ProfileView,
  DocumentsView,
  AcademicView,
  PathwaysView,
} from "@/components/profile-views";
import { ProgramsView, ApplicationsView } from "@/components/program-views";
import {
  MaterialsView,
  InterviewView,
  TasksView,
  AuditView,
} from "@/components/workflow-views";
const icons = [
  Compass,
  LayoutDashboard,
  UserRound,
  FolderOpen,
  GraduationCap,
  Route,
  Compass,
  BriefcaseBusiness,
  FileText,
  BookOpen,
  Mic,
  ListTodo,
  FileCheck2,
];
export default function Page() {
  const mutationInFlight = useRef(false);
  const [data, setData] = useState<Snapshot | null>(null),
    [locale, setLocale] = useState<Locale>("fr"),
    [view, setView] = useState<View>("orientation"),
    [programId, setProgramId] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [auth, setAuth] = useState(false),
    [demoAvailable, setDemoAvailable] = useState(false),
    [connectionFailed, setConnectionFailed] = useState(false),
    [authMode, setAuthMode] = useState<"register" | "login">("register");
  const t = useCallback(
    (fr: string, ary?: string) =>
      locale === "fr" ? fr : (ary ?? translateSystem(fr)),
    [locale],
  );
  const notify = useCallback((message: string) => setToast(message), []);
  const go = useCallback((next: View, pid?: string) => {
    setView(next);
    setProgramId(pid ?? null);
    window.location.hash = next + (pid ? "/" + pid : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  useEffect(() => {
    let cancelled = false;
    request("/health").then((health) => {
      if (!cancelled) setDemoAvailable((health as { demo_mode?: boolean }).demo_mode === true);
    }).catch(() => {});
    const read = () => {
      const [route, pid] = window.location.hash.slice(1).split("/");
      if (navigation.some((n) => n[0] === route)) setView(route as View);
      else if (!route) setView("orientation");
      setProgramId(pid ?? null);
    };
    bootstrap()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setAuth(false);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) setAuth(false);
        else {
          setConnectionFailed(true);
          setError(e instanceof Error ? e.message : "Connexion indisponible");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          try {
            if (localStorage.getItem("campuspath-locale") === "ary") setLocale("ary");
          } catch { /* Language switching works without browser storage. */ }
          read();
        }
      });
    window.addEventListener("hashchange", read);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", read);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale === "fr" ? "fr" : "ary-Arab";
    document.documentElement.dir = locale === "fr" ? "ltr" : "rtl";
  }, [locale]);
  const toggleLocale = () => {
    const next = locale === "fr" ? "ary" : "fr";
    setLocale(next);
    try { localStorage.setItem("campuspath-locale", next); } catch { /* Keep the current choice in memory. */ }
  };
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(id);
  }, [toast]);
  const mutate = useCallback(
    async (path: string, body?: unknown, method?: string) => {
      if (mutationInFlight.current) return null;
      mutationInFlight.current = true;
      setBusy(true);
      setError("");
      try {
        const result = await getSnapshot(path, body, method);
        setData(result);
        notify(t("Modifications enregistrées.", "تسجلو التغييرات."));
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
        return null;
      } finally {
        mutationInFlight.current = false;
        setBusy(false);
      }
    },
    [notify, t],
  );
  useEffect(() => {
    type Tool = {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    };
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: Tool,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool || !data) return;
    const controller = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: "read_admissions_readiness",
          description:
            "Read current candidate completeness, critical blockers and next actions. Does not submit or approve anything.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          execute: (input) => {
            if (
              !input ||
              typeof input !== "object" ||
              Object.keys(input).length
            )
              throw new Error("Expected an empty object");
            return {
              completeness: data.completeness,
              readiness: data.audit.state,
              blockers: data.audit.critical,
              nextActions: data.tasks.slice(0, 5),
            };
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => {});
    return () => controller.abort();
  }, [data]);
  const submitAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await mutate("/auth/" + authMode, {
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (result) {
      setAuth(false);
      go("orientation");
    }
  };
  const startDemo = async () => {
    const result = await mutate("/auth/demo", {});
    if (result) { setAuth(false); go("orientation"); }
  };
  if (loading) return <Loading locale={locale} />;
  if (!data && !auth && connectionFailed)
    return <main className="connection-recovery">
      <span className="recovery-brand">CampusPath</span>
      <div role="alert"><h1>{t("Ton espace est momentanément indisponible", "الفضاء ديالك ما خدامش دابا")}</h1><p>{t("La connexion n’a pas abouti. Tes données enregistrées restent conservées. Vérifie ta connexion, puis réessaie.", "الاتصال ما نجحش. المعلومات اللي تسجلو باقيين محفوظين. شوف الاتصال وعاود.")}</p></div>
      <Button onClick={() => window.location.reload()}>{t("Réessayer de charger mon espace", "نعاود نحل الفضاء ديالي")}</Button>
    </main>;
  if (!data && !auth) return <PublicHome t={t} locale={locale} toggleLocale={toggleLocale}
    onStart={(mode) => { setAuthMode(mode); setError(""); setAuth(true); }}
    onDemo={startDemo} demoAvailable={demoAvailable} busy={busy} error={t(error)} />;
  if (auth || !data)
    return (
      <div className="auth-page">
        <div className="auth-brand">
          <span className="brand-mark">
            P<span>•</span>
          </span>
          CampusPath AI
        </div>
        <section className="auth-panel">
          <button className="text-link" onClick={() => { setAuth(false); setError(""); }}>{t("Retour à l’accueil", "نرجع للرئيسية")}</button>
          <div className="eyebrow">{t("VOTRE PROJET, VOTRE PARCOURS", "المشروع ديالك، المسار ديالك")}</div>
          <h1>
            {t(
              "Votre prochain chapitre commence ici.",
              "المرحلة الجاية كتبدا هنا.",
            )}
          </h1>
          <p>
            {t(
              "Construisez un dossier clair et des choix qui vous ressemblent.",
              "وجد ملف واضح وختار مسار كيناسبك.",
            )}
          </p>
          <div className="tabs">
            <button
              className={authMode === "register" ? "selected" : ""}
              onClick={() => setAuthMode("register")}
            >
              {t("Créer mon compte", "نفتح حساب")}
            </button>
            <button
              className={authMode === "login" ? "selected" : ""}
              onClick={() => setAuthMode("login")}
            >
              {t("Me connecter", "ندخل")}
            </button>
          </div>
          <form onSubmit={submitAuth}>
            <Field label={t("Email", "البريد الإلكتروني")}>
              <input name="email" type="email" dir="ltr" required autoComplete="email" />
            </Field>
            <Field
              label={t(
                "Mot de passe · 12 caractères minimum",
                "كلمة السر · 12 حرف على الأقل",
              )}
            >
              <input
                name="password"
                type="password"
                minLength={12}
                maxLength={128}
                required
                autoComplete={
                  authMode === "register" ? "new-password" : "current-password"
                }
              />
            </Field>
            <Button type="submit" variant="primary" disabled={busy}>
              {t(
                busy ? "Connexion en cours…" : authMode === "register" ? "Créer mon dossier" : "Me connecter",
                busy ? "الدخول جاري…" : authMode === "register" ? "نفتح الملف" : "ندخل",
              )}
            </Button>
          </form>
          {error && (
            <div className="error-box" role="alert">
              {t(error)}
            </div>
          )}
          {demoAvailable && <button
            className="text-link auth-demo"
            disabled={busy}
            onClick={startDemo}
          >
            {t("Explorer avec un profil fictif", "نجرب بملف تجريبي")}
          </button>}
          {data && (
            <button className="text-link" onClick={() => setAuth(false)}>
              {t("Retour à mon espace", "نرجع للفضاء ديالي")}
            </button>
          )}
          <button className="language" onClick={toggleLocale}>
            <Languages size={16} />
            {locale === "fr" ? "الدارجة" : "Français"}
          </button>
        </section>
      </div>
    );
  const name =
      data.candidate.facts.find((f) => f.key === "first_name")?.value ||
      t("Bienvenue", "مرحبا"),
    surname =
      data.candidate.facts.find((f) => f.key === "last_name")?.value || "",
    navTitle = navigation.find((n) => n[0] === view)?.[locale === "fr" ? 1 : 2],
    selectedCount = data.candidate.selections.filter((s) => s.selected).length;
  return (
    <AppContext.Provider
      value={{
        data,
        locale,
        t,
        busy,
        mutate,
        go,
        notify,
        programId,
        setProgramId,
      }}
    >
      <div className="shell">
        <a className="skip-link" href="#main-content">
          {t("Aller au contenu", "دوز للمحتوى")}
        </a>
        <aside className="sidebar">
          <button
            className="brand"
            onClick={() => go("orientation")}
            aria-label="CampusPath AI"
          >
            <span className="brand-mark">
              P<span>•</span>
            </span>
            CampusPath<span className="brand-ai">AI</span>
          </button>
          <div className="workspace-label">
            {t("MON AVENIR, MES CHOIX", "مستقبلي، اختياري")}
          </div>
          <nav aria-label={t("Navigation principale", "التنقل الرئيسي")}>
            {navigation.map(([id, fr, ary], i) => {
              const Icon = icons[i];
              return (
                <button
                  key={id}
                  className={`nav-item ${view === id ? "active" : ""}`}
                  onClick={() => go(id)}
                  title={t(fr, ary)}
                  aria-current={view === id ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span>{t(fr, ary)}</span>
                  {id === "applications" && selectedCount > 0 && (
                    <b>{selectedCount}</b>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-note">
            <ShieldCheck size={21} />
            <strong>{t("Des choix éclairés.", "اختيار على بينة.")}</strong>
            <p>
              {t(
                "Explorez les possibles. Avancez à votre rythme.",
                "اكتشف الاختيارات وتقدم بالوتيرة ديالك.",
              )}
            </p>
          </div>
          <button
            className="account"
            onClick={() => {
              setAuthMode("register");
              setAuth(true);
            }}
            title={t("Créer ou changer de compte", "نبدل الحساب")}
          >
            <span className="avatar">
              {(name[0] + (surname[0] ?? "")).toUpperCase()}
            </span>
            <div>
              <strong>
                {name} {surname}
              </strong>
              <small>
                {data.candidate.is_demo
                  ? t("Profil de démonstration", "ملف تجريبي")
                  : t("Mon compte candidat", "الحساب ديالي")}
              </small>
            </div>
            <ChevronRight size={14} />
          </button>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <span>
              {t("Mon espace", "الفضاء ديالي")}
              <ChevronRight size={14} />
              <strong>{navTitle}</strong>
            </span>
            <div className="topbar-actions">
              <button
                className="language"
                onClick={toggleLocale}
                aria-label={t("Changer la langue", "نبدل اللغة")}
              >
                <Languages size={16} />
                {locale === "fr" ? "الدارجة" : "Français"}
                <ChevronRight size={12} />
              </button>
              <button
                className="icon-button notification"
                onClick={() => go("tasks")}
                aria-label={t("Voir mes priorités", "نشوف الأولويات")}
              >
                <Bell size={18} />
                {data.tasks.some((t) => t.priority === "CRITICAL") && <i />}
              </button>
              <button
                className="icon-button"
                aria-label={t("Se déconnecter", "نخرج")}
                onClick={async () => {
                  try {
                    await request("/auth/logout", {});
                    setData(null);
                    setAuth(false);
                    setError("");
                    setToast("");
                    window.location.hash = "";
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Erreur");
                  }
                }}
              >
                <LogOut size={17} />
              </button>
            </div>
          </header>
          <main id="main-content">
            {data.candidate.is_demo && (
              <div className="demo-strip">
                <span>{t("DÉMONSTRATION", "تجربة")}</span>
                {view === "orientation"
                  ? t(
                      "Vos essais sont enregistrés dans un dossier de démonstration",
                      "التجارب ديالك كتتسجل فملف تجريبي",
                    )
                  : t(
                      "Profil et formations fictifs · aucune candidature envoyée",
                      "الملف والتكوينات غير للتجربة · ما تسيفط حتى ترشيح",
                    )}
                <button onClick={() => setAuth(true)}>
                  {t("Créer mon dossier", "نفتح الملف ديالي")}
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
            {error && (
              <div className="error-box" role="alert">
                <span>{t(error)}</span>
                <button
                  onClick={() => setError("")}
                  aria-label={t("Fermer", "نسد")}
                >
                  <X size={17} />
                </button>
              </div>
            )}
            {view === "dashboard" && <Dashboard />}
            {view === "orientation" && <OrientationView />}
            {view === "profile" && <ProfileView />}
            {view === "documents" && <DocumentsView />}
            {view === "academic" && <AcademicView />}
            {view === "pathways" && <PathwaysView />}
            {view === "programs" && <ProgramsView />}
            {view === "applications" && <ApplicationsView />}
            {(view === "cv" || view === "motivations") && (
              <MaterialsView
                key={view}
                kind={view === "cv" ? "cv" : "motivation"}
              />
            )}
            {view === "interview" && <InterviewView />}
            {view === "tasks" && <TasksView />}
            {view === "audit" && <AuditView />}
            <footer className="page-footer">
              <ShieldCheck size={14} />
              {t(
                "Un outil indépendant de préparation · Non affilié à Campus France",
                "أداة مستقلة باش توجد الملف · ما تابعةش لكامبوس فرانس",
              )}
              <span>CampusPath AI</span>
            </footer>
          </main>
        </div>
        {toast && (
          <div className="toast" role="status">
            <Check size={18} />
            {toast}
            <button
              onClick={() => setToast("")}
              aria-label={t("Fermer", "نسد")}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
