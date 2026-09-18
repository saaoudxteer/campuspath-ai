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
      t("Bienvenue", "مرحبا"),
    selected = c.selections.filter((s) => s.selected),
    priorities = data.tasks.filter((t) => t.status === "OPEN").slice(0, 3),
    recommend = [...data.matches]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3);
  const matchLabel = (classification: string) =>
    classification === "SAFER"
      ? t("Bonne cohérence", "توافق مزيان")
      : classification === "TARGET"
        ? t("À explorer", "مسار خاصك تكتشفو")
        : classification === "AMBITIOUS"
          ? t("Possible avec remise à niveau", "ممكن مع تقوية المستوى")
          : classification === "INELIGIBLE"
            ? t("Point bloquant à vérifier", "خاصك تعاود تراجع")
            : t("À documenter", "خاصك تكمل المعلومات");
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {t("CHAQUE ÉTAPE COMPTE", "كل خطوة كتفرق")}
          </p>
          <h1>
            {t("Votre avenir prend forme,", "المستقبل ديالك كيبدا يبان،")} {name}
            <span className="blue">.</span>
          </h1>
          <p>
            {t(
              "Un dossier solide commence par une prochaine étape claire.",
              "ملف مزيان كيبدا بخطوة جاية واضحة.",
            )}
          </p>
        </div>
        <Button variant="primary" onClick={() => go("audit")}>
          {t("Voir mon dossier", "نشوف الملف ديالي")}
          <ArrowUpRight size={17} />
        </Button>
      </div>
      <div className="overview-grid">
        <section className="journey-card">
          <div className="card-kicker">{t("VOTRE CAP", "الوجهة ديالك")}</div>
          <h2>
            {t("Du Maroc à la France.", "من المغرب لفرنسا.")}
            <br />
            {t("Un parcours qui vous ressemble.", "مسار كيناسبك.")}
          </h2>
          <p>
            {c.preferences.goal ||
              t(
                "Votre projet reste à explorer",
                "مازال كنقلبو على المشروع ديالك",
              )}
            <span>•</span>
            {t("Rentrée à confirmer", "الدخول الدراسي خاصو تأكيد")}
          </p>
          <div className="journey-steps">
            <div className="done">
              <Check size={16} />
              <span>{t("Mon profil", "الملف الشخصي ديالي")}</span>
            </div>
            <i />
            <div className="current">
              2<span>{t("Mes formations", "التكوينات")}</span>
            </div>
            <i />
            <div>
              3<span>{t("Mon dossier", "الملف ديالي")}</span>
            </div>
            <i />
            <div>
              4<span>{t("Mon départ", "السفر ديالي")}</span>
            </div>
          </div>
          <LinkButton onClick={() => go("pathways")}>
            {t("Explorer mes parcours", "نشوف المسارات ديالي")}
          </LinkButton>
        </section>
        <section className="panel progress-panel">
          <div className="panel-top">
            <h3>{t("Votre dossier", "الملف ديالك")}</h3>
            <ShieldCheck size={20} />
          </div>
          <div
            className="progress-ring"
            style={{
              background: `conic-gradient(var(--blue) ${data.completeness.percent}%,#eaf0fb 0)`,
            }}
            aria-label={`${t("Complétude", "شحال كملتي")} ${data.completeness.percent}%`}
          >
            <span>
              {data.completeness.percent}
              <small>%</small>
            </span>
          </div>
          <strong>
            {t("Une base pour avancer", "بداية باش تزيد للقدام")}
          </strong>
          <p>
            {t(
              "Renseigné ne signifie pas encore vérifié.",
              "المعلومة المعمرة ماشي بالضرورة مؤكدة.",
            )}
          </p>
          <LinkButton onClick={() => go("audit")}>
            {t("Vérifier mon dossier", "نراجع الملف ديالي")}
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
            <p>{t("Documents vérifiés", "الوثائق المؤكدة")}</p>
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
            <p>{t("Moyenne pondérée", "المعدل بالمعاملات")}</p>
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
            <p>{t("Formations sélectionnées", "التكوينات اللي ختاريتي")}</p>
          </div>
          <ChevronRight size={16} />
        </button>
      </div>
      <SectionTitle
        title={t("Vos prochaines étapes", "شنو خاصك دير دابا")}
        description={t(
          "Concentrez-vous sur ce qui fait avancer votre candidature.",
          "ركز على اللي غادي يقدم الترشيح ديالك.",
        )}
        action={
          <LinkButton onClick={() => go("tasks")}>
            {t("Toutes mes priorités", "جميع الأولويات")}
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
            title={t("Des formations à explorer", "تكوينات باش تقلب")}
            description={t(
              "Adéquation du profil, sans probabilité d’admission.",
              "توافق مع الملف ديالك، ماشي احتمال القبول.",
            )}
            action={
              <LinkButton onClick={() => go("programs")}>
                {t("Tout voir", "نشوف كلشي")}
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
                      {t("Formation fictive", "تكوين تجريبي")}
                    </p>
                    <p className="program-row-reason">
                      {m.strengths[0] ??
                        m.risks[0] ??
                        t(
                          "Ouvrez la fiche pour comprendre les prérequis.",
                          "حل البطاقة باش تفهم الشروط.",
                        )}
                    </p>
                  </div>
                  <span className="fit-label">
                    {matchLabel(m.classification)}
                  </span>
                  <ChevronRight size={17} />
                </button>
              );
            })}
            {recommend.length === 0 && (
              <p>
                {t(
                  "Le catalogue vérifié sera connecté ici.",
                  "دليل التكوينات المؤكدة غادي يبان هنا.",
                )}
              </p>
            )}
          </div>
        </section>
        <section>
          <SectionTitle title={t("Votre progression", "التقدم ديالك")} />
          <div className="panel completion-list">
            {data.completeness.sections.slice(0, 4).map((s, i) => (
              <div key={s.label}>
                <div>
                  <span>
                    {t(
                      s.label,
                      ["المعلومات الشخصية", "معلومات الاتصال", "الوثائق", "القراية ديالي"][
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
              {t("Compléter mon profil", "نكمل الملف الشخصي ديالي")}
            </LinkButton>
          </div>
        </section>
      </div>
    </>
  );
}
