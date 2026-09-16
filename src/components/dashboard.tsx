"use client";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Button,
  formatNumber,
  LinkButton,
  Progress,
  SectionTitle,
  useApp,
} from "./ui";
import type { View } from "@/lib/i18n";
export function Dashboard() {
  const { data, t, go } = useApp(),
    c = data.candidate,
    name =
      c.facts.find((f) => f.key === "first_name")?.value ||
      t("Bienvenue", "Mer7ba"),
    selected = c.selections.filter((s) => s.selected),
    priorities = data.tasks.filter((t) => t.status === "OPEN").slice(0, 3),
    recommend = [...data.matches]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {t("CHAQUE ÉTAPE COMPTE", "KOL KHOTWA KAT7SEB")}
          </p>
          <h1>
            {t("Votre avenir prend forme,", "Most9belek kaybda yban,")} {name}
            <span className="blue">.</span>
          </h1>
          <p>
            {t(
              "Un dossier solide commence par une prochaine étape claire.",
              "Dossier mzyan kaybda b khotwa jaya wad7a.",
            )}
          </p>
        </div>
        <Button variant="primary" onClick={() => go("audit")}>
          {t("Voir mon dossier", "Chouf dossier dyali")}
          <ArrowUpRight size={17} />
        </Button>
      </div>
      <div className="overview-grid">
        <section className="journey-card">
          <div className="card-kicker">{t("VOTRE CAP", "LWIJHA DYALEK")}</div>
          <h2>
            {t("Du Maroc à la France.", "Mn lmaghrib l Fransa.")}
            <br />
            {t("Un parcours qui vous ressemble.", "Masar lli ynasbek.")}
          </h2>
          <p>
            {c.preferences.goal ||
              t(
                "Votre projet reste à explorer",
                "Mazal n9ellbo 3la projet dyalek",
              )}
            <span>•</span>
            {t("Rentrée à confirmer", "Rentrée khas ta2kid")}
          </p>
          <div className="journey-steps">
            <div className="done">
              <Check size={16} />
              <span>{t("Mon profil", "Profil dyali")}</span>
            </div>
            <i />
            <div className="current">
              2<span>{t("Mes formations", "Les formations")}</span>
            </div>
            <i />
            <div>
              3<span>{t("Mon dossier", "Dossier dyali")}</span>
            </div>
            <i />
            <div>
              4<span>{t("Mon départ", "Safar dyali")}</span>
            </div>
          </div>
          <LinkButton onClick={() => go("pathways")}>
            {t("Explorer mes parcours", "Nchouf masarat dyali")}
          </LinkButton>
        </section>
        <section className="panel progress-panel">
          <div className="panel-top">
            <h3>{t("Votre dossier", "Dossier dyalek")}</h3>
            <ShieldCheck size={20} />
          </div>
          <div
            className="progress-ring"
            style={{
              background: `conic-gradient(var(--blue) ${data.completeness.percent}%,#eaf0fb 0)`,
            }}
            aria-label={`${t("Complétude", "Ch7al kammelti")} ${data.completeness.percent}%`}
          >
            <span>
              {data.completeness.percent}
              <small>%</small>
            </span>
          </div>
          <strong>
            {t("Une base pour avancer", "Bidaya bach tzid l9ddam")}
          </strong>
          <p>
            {t(
              "Renseigné ne signifie pas encore vérifié.",
              "M3emmer ma kay3nich m2ekked.",
            )}
          </p>
          <LinkButton onClick={() => go("audit")}>
            {t("Vérifier mon dossier", "Nraja3 dossier dyali")}
          </LinkButton>
        </section>
      </div>
      <div className="stat-grid">
        <button className="mini-stat" onClick={() => go("documents")}>
          <span className="stat-icon">
            <FileCheck2 size={20} />
          </span>
          <div>
            <strong>
              {c.documents.filter((d) => d.status === "VERIFIED").length}
              <small> / {c.documents.length}</small>
            </strong>
            <p>{t("Documents vérifiés", "Lwra9 lm2ekkda")}</p>
          </div>
          <ChevronRight size={16} />
        </button>
        <button className="mini-stat" onClick={() => go("academic")}>
          <span className="stat-icon teal">
            <GraduationCap size={21} />
          </span>
          <div>
            <strong>
              {formatNumber(data.diagnostic.average)}
              <small> / 20</small>
            </strong>
            <p>{t("Moyenne pondérée", "Moyenne pondérée")}</p>
          </div>
          <ChevronRight size={16} />
        </button>
        <button className="mini-stat" onClick={() => go("applications")}>
          <span className="stat-icon purple">
            <Compass size={20} />
          </span>
          <div>
            <strong>
              {selected.length}
              <small> / {data.cycle.max_choices}</small>
            </strong>
            <p>{t("Formations sélectionnées", "Formations lli khtariti")}</p>
          </div>
          <ChevronRight size={16} />
        </button>
      </div>
      <SectionTitle
        title={t("Vos prochaines étapes", "Ach khassek dir daba")}
        description={t(
          "Concentrez-vous sur ce qui fait avancer votre candidature.",
          "Rekkez 3la lli ghadi y9ddem candidature dyalek.",
        )}
        action={
          <LinkButton onClick={() => go("tasks")}>
            {t("Toutes mes priorités", "Ga3 l2awlawiyat")}
          </LinkButton>
        }
      />
      <div className="priority-grid">
        {priorities.map((task, i) => (
          <section className="panel priority-card" key={task.id}>
            <div className="panel-top">
              <span className="step-number">0{i + 1}</span>
              <Badge status={task.priority} />
            </div>
            <h3>{t(task.title)}</h3>
            <p>{t(task.detail)}</p>
            <LinkButton
              onClick={() =>
                go(task.route as View, task.program_id ?? undefined)
              }
            >
              {t(task.next_action)}
            </LinkButton>
          </section>
        ))}
      </div>
      <div className="dashboard-bottom">
        <section>
          <SectionTitle
            title={t("Des formations à explorer", "Formations bach t9elleb")}
            description={t(
              "Adéquation du profil, sans probabilité d’admission.",
              "Tnassob m3a profil, machi chance dyal l9oboul.",
            )}
            action={
              <LinkButton onClick={() => go("programs")}>
                {t("Tout voir", "Chouf kolchi")}
              </LinkButton>
            }
          />
          <div className="panel program-list">
            {recommend.map((m) => {
              const p = data.programs.find((p) => p.id === m.program_id)!;
              return (
                <button
                  className="program-row"
                  onClick={() => go("programs", p.id)}
                  key={p.id}
                >
                  <span className={`program-logo ${p.color}`}>
                    <BookOpen size={20} />
                  </span>
                  <div>
                    <strong>{p.title}</strong>
                    <p>
                      {p.institution.city} ·{" "}
                      {t("Formation fictive", "Formation tajribiya")}
                    </p>
                  </div>
                  <span className="fit-number">
                    {m.score ?? "—"}
                    <small>/100</small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              );
            })}
            {recommend.length === 0 && (
              <p>
                {t(
                  "Le catalogue vérifié sera connecté ici.",
                  "Catalogue lm2ekked ghadi yban hna.",
                )}
              </p>
            )}
          </div>
        </section>
        <section>
          <SectionTitle title={t("Votre progression", "Ta9addom dyalek")} />
          <div className="panel completion-list">
            {data.completeness.sections.slice(0, 4).map((s, i) => (
              <div key={s.label}>
                <div>
                  <span>
                    {t(
                      s.label,
                      ["Ma3lomat chakhsiya", "Coordonnées", "Lwra9", "9rayti"][
                        i
                      ],
                    )}
                  </span>
                  <strong>{s.percent}%</strong>
                </div>
                <Progress percent={s.percent} label={s.label} />
              </div>
            ))}
            <LinkButton onClick={() => go("profile")}>
              {t("Compléter mon profil", "Nkemmel profil dyali")}
            </LinkButton>
          </div>
        </section>
      </div>
    </>
  );
}
