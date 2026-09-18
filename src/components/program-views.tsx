"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  GitCompareArrows,
  GraduationCap,
  HelpCircle,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Program, Question } from "@/lib/schema";
import { statusNames } from "@/lib/i18n";
import {
  Badge,
  Button,
  Empty,
  Field,
  Heading,
  LinkButton,
  Modal,
  Notice,
  SectionTitle,
  useApp,
} from "./ui";
export const claimLabels: Record<string, [string, string]> = {
  curriculum: ["Programme pédagogique", "محتوى التكوين"],
  prerequisites: ["Prérequis académiques", "شروط القراية"],
  route: ["Voie de candidature", "طريق الترشيح"],
  deadline: ["Date limite", "آخر أجل"],
  language: ["Niveau de français", "المستوى فالفرنسية"],
  tuition: ["Frais annuels (€)", "مصاريف العام (€)"],
  eligibility: ["Votre éligibilité", "واش كتستوفي الشروط؟"],
  degree: ["Diplôme requis", "الدبلوم المطلوب"],
  documents: ["Documents demandés", "الوثائق المطلوبة"],
  outcomes: ["Débouchés", "الآفاق المهنية"],
  instruction_language: ["Langue d’enseignement", "لغة القراية"],
  application_fee: ["Frais de candidature", "مصاريف الترشيح"],
  contact: ["Contact", "جهة الاتصال"],
  program_url: ["Page de la formation", "صفحة التكوين"],
  admission_url: ["Page des admissions", "صفحة القبول"],
};
function classificationLabel(
  classification: string,
  t: (fr: string, ary?: string) => string,
) {
  return classification === "SAFER"
    ? t("Bonne cohérence", "توافق مزيان")
    : classification === "TARGET"
      ? t("À explorer", "مسار خاصك تكتشفو")
      : classification === "AMBITIOUS"
        ? t("Possible avec remise à niveau", "ممكن مع تقوية المستوى")
        : classification === "INELIGIBLE"
          ? t("Point bloquant à vérifier", "خاصك تعاود تراجع")
          : t("À documenter", "خاصك تكمل المعلومات");
}
function dimensionLabel(
  score: number | null,
  t: (fr: string, ary?: string) => string,
) {
  if (score === null) return t("À préciser", "خاص توضيح");
  if (score >= 85) return t("Cohérent avec le profil", "مناسب للملف ديالك");
  if (score >= 65) return t("À explorer", "خاصك تكتشفو");
  return t("À renforcer", "خاصك تقوي المستوى");
}
export function ProgramsView() {
  const { data, t, go, programId } = useApp(),
    [search, setSearch] = useState(""),
    [city, setCity] = useState("all"),
    [filter, setFilter] = useState("all"),
    [compare, setCompare] = useState<string[]>([]),
    [showCompare, setShowCompare] = useState(false);
  const p = data.programs.find((p) => p.id === programId);
  if (p) return <ProgramDetail program={p} />;
  const filtered = data.programs.filter(
    (p) =>
      (
        p.title +
        " " +
        p.institution.name +
        " " +
        p.institution.city +
        " " +
        p.tags.join(" ")
      )
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) &&
      (city === "all" || p.institution.city === city) &&
      (filter === "all" ||
        (filter === "saved" &&
          data.candidate.selections.some(
            (s) => s.program_id === p.id && s.saved,
          )) ||
        data.matches.find((m) => m.program_id === p.id)?.classification ===
          filter),
  );
  return (
    <>
      <Heading
        eyebrow={t("DES CHOIX QUI ONT DU SENS", "اختيار على بينة")}
        title={t(
          "Trouvez votre prochaine formation.",
          "لقى التكوين الجاي ديالك.",
        )}
        description={t(
          "Comparez l’adéquation, les contenus et les points à clarifier avant de choisir.",
          "قارن التوافق والمحتوى والنقط اللي خاصنا نوضحو قبل الاختيار.",
        )}
        action={
          <Button onClick={() => go("applications")}>
            <Bookmark size={16} />
            {t("Ma sélection", "الاختيارات ديالي")}
          </Button>
        }
      />
      <div className="search-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            aria-label={t("Rechercher une formation", "نقلب على تكوين")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(
              "Formation, établissement, domaine…",
              "تكوين، مؤسسة، مجال…",
            )}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label={t("Effacer la recherche", "نمسح البحث")}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <select
          aria-label={t("Filtrer par ville", "نختار المدينة")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="all">{t("Toutes les villes", "جميع المدن")}</option>
          {[...new Set(data.programs.map((p) => p.institution.city))].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
        <span className="toolbar-icon">
          <SlidersHorizontal size={19} />
        </span>
      </div>
      <div className="filter-chips">
        {[
          ["all", "Toutes les formations", "جميع التكوينات"],
          ["saved", "Enregistrées", "اللي حفظتي"],
          ["SAFER", "Bonne cohérence", "توافق مزيان"],
          ["TARGET", "À explorer", "خاص الاكتشاف"],
          ["AMBITIOUS", "Avec remise à niveau", "مع تقوية المستوى"],
          ["UNASSESSED", "À évaluer", "خاص التقييم"],
        ].map(([id, fr, ary]) => (
          <button
            className={filter === id ? "active" : ""}
            onClick={() => setFilter(id)}
            key={id}
          >
            {t(fr, ary)}
          </button>
        ))}
      </div>
      <div className="results-meta">
        <span>
          {filtered.length}{" "}
          {t("formations à explorer", "تكوينات باش تقلب")}
        </span>
        <span>
          {t("Tri : pertinence du profil", "الترتيب: التوافق مع الملف")}
        </span>
      </div>
      {filtered.length === 0 ? (
        <Empty
          title={t(
            "Aucune formation dans cette vue",
            "ما كاين حتى تكوين هنا",
          )}
          description={
            data.candidate.is_demo
              ? t(
                  "Essayez une autre recherche ou retirez un filtre.",
                  "جرب بحث آخر ولا حيد التصفية.",
                )
              : t(
                  "Le catalogue de production est vide. Les formations fictives restent réservées à la démonstration.",
                  "دليل التكوينات المؤكدة مازال خاوي. التكوينات التجريبية غير فالعرض التجريبي.",
                )
          }
          action={
            data.candidate.is_demo ? (
              <Button
                onClick={() => {
                  setSearch("");
                  setCity("all");
                  setFilter("all");
                }}
              >
                {t("Réinitialiser les filtres", "نحيد التصفية")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="program-grid">
          {[...filtered]
            .sort(
              (a, b) =>
                (data.matches.find((m) => m.program_id === b.id)?.score ?? 0) -
                (data.matches.find((m) => m.program_id === a.id)?.score ?? 0),
            )
            .map((p) => (
              <ProgramCard
                key={p.id}
                p={p}
                checked={compare.includes(p.id)}
                onCompare={() =>
                  setCompare(
                    compare.includes(p.id)
                      ? compare.filter((id) => id !== p.id)
                      : compare.length < 3
                        ? [...compare, p.id]
                        : compare,
                  )
                }
              />
            ))}
        </div>
      )}
      <Notice>
        {t(
          "Les catégories décrivent la cohérence entre votre profil et les informations connues de la formation. Elles ne prédisent pas l’admission : ouvrez chaque fiche pour voir les prérequis et les points à vérifier.",
          "هاد الفئات كتبين التوافق بين الملف ديالك والمعلومات اللي عارفين على التكوين. ما كتضمنش القبول: حل كل بطاقة باش تشوف الشروط والنقط اللي خاصك تراجع.",
        )}
      </Notice>
      {compare.length > 0 && (
        <div className="comparison-bar">
          <GitCompareArrows size={19} />
          <strong>
            {compare.length}/3{" "}
            {t("formations à comparer", "تكوينات للمقارنة")}
          </strong>
          <Button
            variant="primary"
            disabled={compare.length < 2}
            onClick={() => setShowCompare(true)}
          >
            {t("Comparer", "نقارن")}
            <ArrowRight size={16} />
          </Button>
          <button
            className="icon-button"
            onClick={() => setCompare([])}
            aria-label={t("Vider la comparaison", "نحيد المقارنة")}
          >
            <X size={18} />
          </button>
        </div>
      )}
      {showCompare && (
        <Modal
          title={t("Comparer vos options", "نقارن الاختيارات")}
          onClose={() => setShowCompare(false)}
          wide
        >
          <div
            className="compare-grid"
            style={{
              gridTemplateColumns: `repeat(${compare.length},minmax(0,1fr))`,
            }}
          >
            {compare.map((id) => {
              const p = data.programs.find((p) => p.id === id)!,
                m = data.matches.find((m) => m.program_id === id)!;
              return (
                <div key={id}>
                  <span className={`program-logo ${p.color}`}>
                    <BookOpen size={22} />
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.institution.city}</p>
                  <strong className="fit-label fit-label-large">
                    {classificationLabel(m.classification, t)}
                  </strong>
                  <p className="compare-reason">
                    {m.strengths[0] ??
                      m.risks[0] ??
                      t("À préciser", "خاص توضيح")}
                  </p>
                  <dl>
                    <dt>{t("Budget annuel", "ميزانية العام")}</dt>
                    <dd>{p.claims.tuition.value ?? "—"} €</dd>
                    <dt>{t("Langue", "اللغة")}</dt>
                    <dd>{p.claims.language.value ?? "—"}</dd>
                    <dt>{t("Points bloquants", "النقط اللي خاصك تحل")}</dt>
                    <dd>{m.blockers.length}</dd>
                  </dl>
                  <p>{p.description}</p>
                  <Button
                    onClick={() => {
                      setShowCompare(false);
                      go("programs", p.id);
                    }}
                  >
                    {t("Voir la fiche", "نشوف البطاقة")}
                  </Button>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </>
  );
}
function ProgramCard({
  p,
  checked,
  onCompare,
}: {
  p: Program;
  checked: boolean;
  onCompare: () => void;
}) {
  const { data, t, mutate, go } = useApp(),
    m = data.matches.find((m) => m.program_id === p.id)!,
    s = data.candidate.selections.find((s) => s.program_id === p.id);
  return (
    <section className="panel program-card">
      <div className="panel-top">
        <span className={`program-logo ${p.color}`}>
          <GraduationCap size={23} />
        </span>
        <Badge status={m.classification} />
        <button
          className={`save-program ${s?.saved ? "saved" : ""}`}
          onClick={() =>
            mutate(`/programs/${p.id}/selection`, { action: "save" })
          }
          aria-label={t(
            s?.saved ? "Retirer des favoris" : "Enregistrer " + p.title,
            s?.saved ? "نحيد من المفضلة" : "نحفظ " + p.title,
          )}
          aria-pressed={s?.saved ?? false}
        >
          <Bookmark size={20} fill={s?.saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="program-school">{p.institution.name}</div>
      <button className="program-title" onClick={() => go("programs", p.id)}>
        <h2>{p.title}</h2>
      </button>
      <div className="program-meta">
        <span>
          <MapPin size={13} />
          {p.institution.city}
        </span>
        <span>{p.academic_level}</span>
        <span>
          {p.is_mock ? t("FICTIF", "تجريبي") : t("Catalogue", "الدليل")}
        </span>
      </div>
      <p className="program-description">{p.description}</p>
      <div className="fit-summary">
        <div>
          <span>{t("Adéquation du profil", "التوافق مع الملف")}</span>
          <strong className="fit-label fit-label-large">
            {classificationLabel(m.classification, t)}
          </strong>
        </div>
        <p>
          {t("Informations documentées", "المعلومات مسجلة")} : {m.coverage}% ·{" "}
          {m.blockers.length} {t("points à vérifier", "نقط خاصها مراجعة")}
        </p>
        <p className="program-match-reason">
          {m.strengths[0] ??
            m.risks[0] ??
            t(
              "Ouvrez la fiche pour comprendre les prérequis.",
              "حل البطاقة باش تفهم الشروط.",
            )}
        </p>
      </div>
      <div className="program-card-actions">
        <label className="check-field">
          <input type="checkbox" checked={checked} onChange={onCompare} />
          {t("Comparer", "نقارن")}
        </label>
        <LinkButton onClick={() => go("programs", p.id)}>
          {t("Voir la fiche", "نشوف البطاقة")}
        </LinkButton>
      </div>
    </section>
  );
}

function ProgramDetail({ program: p }: { program: Program }) {
  const { data, t, mutate, go } = useApp(),
    [select, setSelect] = useState(false),
    [question, setQuestion] = useState<Question | null>(null),
    [tab, setTab] = useState("research"),
    m = data.matches.find((m) => m.program_id === p.id)!,
    selection = data.candidate.selections.find((s) => s.program_id === p.id),
    qs = data.candidate.questions.filter((q) => q.program_id === p.id);
  return (
    <>
      <button className="back-link" onClick={() => go("programs")}>
        <ArrowLeft size={16} />
        {t("Toutes les formations", "جميع التكوينات")}
      </button>
      <div className="program-detail-heading">
        <span className={`program-logo large ${p.color}`}>
          <GraduationCap size={32} />
        </span>
        <div>
          <div className="eyebrow">{p.institution.name}</div>
          <h1>{p.title}</h1>
          <p>
            <MapPin size={14} />
            {p.institution.city} · {p.academic_level} ·{" "}
            {t("Enseignement en français", "القراية بالفرنسية")}
          </p>
        </div>
        <Button
          variant={selection?.selected ? "" : "primary"}
          onClick={() =>
            selection?.selected ? go("applications") : setSelect(true)
          }
        >
          {selection?.selected ? <Check size={16} /> : <Plus size={16} />}{" "}
          {t(
            selection?.selected ? "Dans ma sélection" : "Sélectionner",
            selection?.selected ? "فالاختيارات ديالي" : "نختارها",
          )}
        </Button>
      </div>
      {p.is_mock && (
        <Notice kind="warning">
          {t(
            "Fiche fictive de démonstration. Les critères, frais et dates ci-dessous ne décrivent aucune admission réelle.",
            "بطاقة تجريبية. الشروط والمصاريف والتواريخ هنا ما كتوصفش قبول حقيقي.",
          )}
        </Notice>
      )}
      <div className="tabs">
        {[
          ["research", "Fiche intelligence", "بطاقة المعلومات"],
          ["why", "Pourquoi ce choix ?", "علاش هاد الاختيار؟"],
          ["questions", `Questions (${qs.length})`, `أسئلة (${qs.length})`],
        ].map(([id, fr, ary]) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => setTab(id)}
          >
            {t(fr, ary)}
          </button>
        ))}
      </div>
      <div className="detail-grid">
        <div>
          {tab === "research" && (
            <section className="panel claims-panel">
              <SectionTitle
                title={t(
                  "Ce que nous savons. Ce qui reste à confirmer.",
                  "شنو عرفنا وشنو باقي خاصو تأكيد.",
                )}
              />
              {Object.entries(p.claims).map(([key, claim]) => (
                <div className="claim-row" key={key}>
                  <div className="panel-top">
                    <h3>{t(...(claimLabels[key] ?? [key, key]))}</h3>
                    <Badge status={claim.status} />
                  </div>
                  <p>
                    {claim.value ??
                      t(
                        "Information non disponible",
                        "المعلومة مازال ما كايناش",
                      )}
                  </p>
                  <div className="claim-source">
                    {claim.source_type === "mock" ? (
                      <span>{t("Source fictive", "دليل تجريبي")}</span>
                    ) : claim.source_url?.startsWith("https://") ? (
                      <a
                        href={claim.source_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("Consulter la source", "نشوف المصدر")}
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span>
                        {t(
                          "Correspondance du candidat",
                          "مراسلة المترشح",
                        )}
                      </span>
                    )}
                    {claim.retrieved_at && (
                      <span>
                        · {t("Revu le", "تراجع نهار")} {claim.retrieved_at}
                      </span>
                    )}
                  </div>
                  {claim.status !== "CONFIRMED" &&
                    [
                      "curriculum",
                      "prerequisites",
                      "route",
                      "deadline",
                      "language",
                      "tuition",
                      "eligibility",
                    ].includes(key) && (
                      <button
                        className="text-link"
                        onClick={async () => {
                          const result = await mutate(
                            `/programs/${p.id}/questions`,
                            { claim_key: key },
                          );
                          if (result) {
                            setQuestion(
                              result.candidate.questions.at(-1) ?? null,
                            );
                            setTab("questions");
                          }
                        }}
                      >
                        <HelpCircle size={14} />
                        {t(
                          "Préparer une demande de clarification",
                          "نوجد طلب توضيح",
                        )}
                      </button>
                    )}
                </div>
              ))}
            </section>
          )}
          {tab === "why" && (
            <>
              <section className="panel">
                <h2>{t("Une recommandation expliquée", "توصية مشروحة")}</h2>
                <p className="spaced-copy">
                  {t(
                    "Cette lecture s’appuie sur les dimensions renseignées. Une information inconnue reste à vérifier : elle n’est jamais considérée comme acquise.",
                    "هاد القراءة كتعتمد على المعلومات اللي كاينة. المعلومة اللي ما عرفناش كتبقى خاصها مراجعة، ما كنحسبوهاش واجدة.",
                  )}
                </p>
                {m.dimensions.map((d) => (
                  <div className="dimension" key={d.key}>
                    <div>
                      <strong>{t(d.label)}</strong>
                      <span>{dimensionLabel(d.score, t)}</span>
                    </div>
                    <p>{t(d.reason)}</p>
                  </div>
                ))}
              </section>
              <section className="panel why-summary">
                <h3>{t("Points forts", "نقط القوة")}</h3>
                <ul>
                  {m.strengths.map((s) => (
                    <li key={s}>{t(s)}</li>
                  ))}
                </ul>
                <h3>{t("Pourquoi rester prudent ?", "علاش خاص الانتباه؟")}</h3>
                <ul>
                  {m.risks.map((s) => (
                    <li key={s}>{t(s)}</li>
                  ))}
                </ul>
              </section>
            </>
          )}
          {tab === "questions" && (
            <>
              {qs.length === 0 ? (
                <Empty
                  title={t("Aucune question ouverte", "ما كاين حتى سؤال")}
                  description={t(
                    "Depuis la fiche, préparez une demande sur une exigence incertaine.",
                    "من البطاقة، وجد سؤال على شي شرط ما واضحش.",
                  )}
                  action={
                    <Button onClick={() => setTab("research")}>
                      {t("Revenir à la fiche", "نرجع للبطاقة")}
                    </Button>
                  }
                />
              ) : (
                <div className="stack">
                  {qs.map((q) => (
                    <section className="panel question-card" key={q.id}>
                      <div className="panel-top">
                        <HelpCircle size={21} />
                        <Badge status={q.status} />
                      </div>
                      <h3>{t(q.question)}</h3>
                      <p>{t(q.reason)}</p>
                      {q.status === "RESOLVED" && (
                        <Notice kind="success">{q.conclusion}</Notice>
                      )}
                      <Button onClick={() => setQuestion(q)}>
                        {t("Ouvrir la clarification", "نحل التوضيح")}
                        <ChevronRight size={15} />
                      </Button>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <aside className="detail-aside">
          <section className="panel score-panel">
            <span>{t("Adéquation du profil", "التوافق مع الملف")}</span>
            <div className="big-score fit-label-large">
              {classificationLabel(m.classification, t)}
            </div>
            <p>
              {t(
                "Une lecture des éléments déjà connus. Les prérequis et les informations manquantes restent à vérifier.",
                "قراءة للمعلومات اللي عارفين دابا. الشروط والمعلومات الناقصة خاصها مراجعة.",
              )}
            </p>
            <button className="text-link" onClick={() => setTab("why")}>
              {t("Comprendre cette cohérence", "نفهم هاد التوافق")}
              <ArrowRight size={15} />
            </button>
          </section>
          <section className="panel gate-panel">
            <div className="panel-top">
              <h3>{t("Avant de candidater", "قبل ما تدفع")}</h3>
              <ShieldCheck size={20} />
            </div>
            <Badge status={m.ready ? "READY" : "NEEDS_REVIEW"} />
            {m.blockers.length > 0 ? (
              <ul>
                {m.blockers.map((b) => (
                  <li key={b}>
                    <Clock3 size={14} />
                    <span>{t(b)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {t(
                  "Fiche documentée pour ce scénario. L’audit du dossier reste nécessaire.",
                  "البطاقة كاملة فهاد السيناريو. مازال خاص مراجعة الملف.",
                )}
              </p>
            )}
            <Button onClick={() => go("audit")}>
              {t("Vérifier mon dossier", "نراجع الملف ديالي")}
            </Button>
          </section>
          <Notice>
            {t(
              "Statut connecté : à vérifier. Une procédure parallèle peut être nécessaire.",
              "حالة الربط خاصها مراجعة. ممكن تحتاج إجراء آخر.",
            )}
          </Notice>
        </aside>
      </div>
      {select && (
        <SelectionModal program={p} onClose={() => setSelect(false)} />
      )}{" "}
      {question && (
        <QuestionModal
          question={
            data.candidate.questions.find((q) => q.id === question.id) ??
            question
          }
          onClose={() => setQuestion(null)}
        />
      )}
    </>
  );
}

function SelectionModal({
  program: p,
  onClose,
}: {
  program: Program;
  onClose: () => void;
}) {
  const { data, t, mutate } = useApp(),
    m = data.matches.find((m) => m.program_id === p.id)!;
  return (
    <Modal
      title={t("Confirmer votre choix", "أكد الاختيار ديالك")}
      onClose={onClose}
    >
      <h3>{p.title}</h3>
      <p className="spaced-copy">{p.institution.name}</p>
      <Notice kind={m.blockers.length ? "warning" : "info"}>
        {t(
          "Sélectionner prépare votre stratégie. Cela ne dépose aucune candidature et ne lève aucun point bloquant.",
          "الاختيار كيعاون توجد الخطة. ما كيدفع حتى ترشيح وما كيحل حتى مشكل بوحدو.",
        )}
      </Notice>
      {m.blockers.length > 0 && (
        <ul className="compact-list">
          {m.blockers.map((b) => (
            <li key={b}>{t(b)}</li>
          ))}
        </ul>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await mutate(`/programs/${p.id}/selection`, {
              action: "select",
              confirmed: true,
            })
          )
            onClose();
        }}
      >
        <label className="check-field">
          <input type="checkbox" required />
          {t(
            "Je choisis cette formation et j’ai lu les points à vérifier.",
            "ختاريت هاد التكوين وقريت النقط اللي خاصها مراجعة.",
          )}
        </label>
        <Button type="submit" variant="primary">
          <Check size={16} />
          {t("Ajouter à ma sélection", "نزيدو للاختيارات ديالي")}
        </Button>
      </form>
    </Modal>
  );
}
function QuestionModal({
  question: q,
  onClose,
}: {
  question: Question;
  onClose: () => void;
}) {
  const { t, mutate, notify } = useApp();
  const action =
    q.status === "DRAFT"
      ? "approve"
      : q.status === "APPROVED"
        ? "record_sent"
        : q.status === "SENT" || q.status === "WAITING"
          ? "answer"
          : q.status === "ANSWERED"
            ? "resolve"
            : null;
  const label =
    q.status === "DRAFT"
      ? t("Approuver le brouillon", "نوافق على المسودة")
      : q.status === "APPROVED"
        ? t("Enregistrer mon envoi manuel", "نسجل بلي سيفطت بيدي")
        : q.status === "ANSWERED"
          ? t("Confirmer la conclusion", "نأكد الخلاصة")
          : t("Enregistrer la réponse", "نسجل الجواب");
  return (
    <Modal
      title={t(
        "Clarification · suivi de la demande",
        "توضيح · تتبع الطلب",
      )}
      onClose={onClose}
      wide
    >
      <div className="panel-top">
        <Badge status={q.status} />
        <small>
          {t(
            "Aucun email envoyé par CampusPath",
            "CampusPath ما كيسيفط حتى بريد إلكتروني",
          )}
        </small>
      </div>
      <Field
        label={t(
          "Objet du message (français)",
          "موضوع الرسالة (بالفرنسية)",
        )}
      >
        <input value={q.subject} readOnly />
      </Field>
      <Field label={t("Brouillon en français", "مسودة بالفرنسية")}>
        <textarea value={q.email_draft} readOnly rows={10} />
      </Field>
      <div className="row-actions">
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                q.subject + "\n\n" + q.email_draft,
              );
              notify(
                t(
                  "Brouillon copié. Aucun email envoyé.",
                  "تنسخات المسودة. ما تسيفط حتى بريد إلكتروني.",
                ),
              );
            } catch {
              notify(
                t(
                  "Sélectionnez le texte pour le copier.",
                  "ختار النص باش تنسخو.",
                ),
              );
            }
          }}
        >
          <Copy size={16} />
          {t("Copier le brouillon", "ننسخ المسودة")}
        </Button>
        <span className="muted">
          {q.recipient ||
            t("Contact officiel à rechercher", "نقلب على جهة اتصال رسمية")}
        </span>
      </div>
      {q.response && (
        <Notice>
          <strong>{t("Réponse saisie", "الجواب اللي دخلتي")}</strong>
          <p className="preserve-lines">{q.response}</p>
        </Notice>
      )}
      {q.conclusion && <Notice kind="success">{q.conclusion}</Notice>}
      {action && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            await mutate(`/questions/${q.id}`, {
              action,
              confirmed: true,
              response: f.get("response") || "",
              conclusion: f.get("conclusion") || "",
              normalized_value: f.get("normalized") || "",
              recipient: f.get("recipient") || "",
            });
          }}
        >
          {action === "record_sent" && (
            <Field
              label={t(
                "Destinataire réel de votre envoi",
                "الجهة اللي سيفطتي ليها الرسالة بالفعل",
              )}
            >
              <input
                name="recipient"
                type="email"
                required
                defaultValue={q.recipient ?? ""}
              />
            </Field>
          )}
          {action === "answer" && (
            <Field
              label={t("Collez la réponse reçue", "لصق الجواب اللي وصلك")}
            >
              <textarea name="response" required rows={5} maxLength={10000} />
            </Field>
          )}
          {action === "resolve" && (
            <>
              <Field
                label={t(
                  "Conclusion appuyée par la réponse",
                  "الخلاصة على حساب الجواب",
                )}
              >
                <textarea
                  name="conclusion"
                  required
                  rows={3}
                  maxLength={3000}
                />
              </Field>
              {["eligibility", "deadline", "language"].includes(
                q.claim_key,
              ) && (
                <Field
                  label={t(
                    "Valeur confirmée à reporter dans la fiche",
                    "المعلومة المؤكدة اللي نديرو فالبطاقة",
                  )}
                >
                  {q.claim_key === "eligibility" ? (
                    <select name="normalized" required>
                      <option value="">
                        {t(
                          "Choisir une décision explicite",
                          "ختار قرار واضح",
                        )}
                      </option>
                      <option value="OUI">
                        {t("Conditions satisfaites", "الشروط متوفرة")}
                      </option>
                      <option value="NON">
                        {t(
                          "Conditions non satisfaites",
                          "الشروط ما متوفراش",
                        )}
                      </option>
                    </select>
                  ) : q.claim_key === "deadline" ? (
                    <input type="date" name="normalized" required />
                  ) : (
                    <select name="normalized" required>
                      {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  )}
                </Field>
              )}
            </>
          )}
          <label className="check-field">
            <input type="checkbox" required key={action} />
            {t(
              action === "record_sent"
                ? "Je confirme avoir envoyé ce message moi-même."
                : action === "resolve"
                  ? "J’ai vérifié que la réponse justifie cette conclusion."
                  : "J’ai relu ces informations et je confirme cette étape.",
              action === "record_sent"
                ? "كنأكد بلي أنا اللي سيفطت هاد الرسالة."
                : action === "resolve"
                  ? "راجعت بلي الجواب كيأكد هاد الخلاصة."
                  : "راجعت المعلومات وكنأكد هاد الخطوة.",
            )}
          </label>
          <Button variant="primary" type="submit">
            {label}
          </Button>
        </form>
      )}
    </Modal>
  );
}

export function ApplicationsView() {
  const { data, t, go, mutate } = useApp(),
    [select, setSelect] = useState<Program | null>(null),
    [track, setTrack] = useState<string | null>(null),
    selections = [...data.candidate.selections]
      .filter((s) => s.saved || s.selected)
      .sort((a, b) => a.rank - b.rank),
    selected = selections.filter((s) => s.selected),
    counts = { SAFER: 0, TARGET: 0, AMBITIOUS: 0, UNASSESSED: 0 };
  selected.forEach((s) => {
    const cls = data.matches.find(
      (m) => m.program_id === s.program_id,
    )?.classification;
    if (cls && cls in counts) counts[cls as keyof typeof counts]++;
  });
  return (
    <>
      <Heading
        eyebrow={t("VOUS AVEZ LE DERNIER MOT", "القرار ديالك")}
        title={t(
          "Une sélection réfléchie. Un cap clair.",
          "اختيارات مرتبة. وجهة واضحة.",
        )}
        description={t(
          "Hiérarchisez vos choix et suivez chaque étape de votre candidature.",
          "رتب الاختيارات ديالك وتبع كل مرحلة من الترشيح.",
        )}
        action={
          <Button onClick={() => go("programs")}>
            <Plus size={16} />
            {t("Explorer les formations", "نشوف التكوينات")}
          </Button>
        }
      />
      <div className="strategy-panel panel">
        <div>
          <h2>
            {selected.length} <small>/ {data.cycle.max_choices}</small>
          </h2>
          <p>{t("choix sélectionnés", "اختيارات مسجلة")}</p>
        </div>
        <div className="strategy-breakdown">
          {Object.entries(counts).map(([key, n]) => (
            <div key={key}>
              <strong>{n}</strong>
              <Badge status={key} />
            </div>
          ))}
        </div>
        <a
          href={data.cycle.source_url}
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          {t("Limites de la procédure", "حدود الإجراء")}
          <ArrowUpRight size={14} />
        </a>
      </div>
      <Notice>
        {t(
          selected.length < 2
            ? "Explorez plusieurs options pour diversifier votre stratégie. Aucune répartition fixe n’est imposée."
            : "Vérifiez la diversité des exigences et des parcours. Un bon équilibre dépend de vos priorités, pas d’un quota automatique.",
          selected.length < 2
            ? "شوف اختيارات متعددة باش تنوع الخطة. ما كايناش تقسيمة ثابتة."
            : "راجع تنوع الشروط والمسارات. التوازن حسب الأولويات ديالك.",
        )}
      </Notice>
      {selections.length === 0 ? (
        <Empty
          title={t(
            "Votre sélection commence par un premier choix.",
            "الاختيارات ديالك كتبدا بأول تكوين.",
          )}
          description={t(
            "Explorez les fiches puis enregistrez les formations qui vous intéressent.",
            "شوف البطاقات وحفظ التكوينات اللي عجبوك.",
          )}
          action={
            <Button variant="primary" onClick={() => go("programs")}>
              {t("Explorer le catalogue", "نشوف الدليل")}
              <ArrowRight size={16} />
            </Button>
          }
        />
      ) : (
        <div className="stack">
          {selections.map((s) => {
            const p = data.programs.find((p) => p.id === s.program_id)!,
              m = data.matches.find((m) => m.program_id === p.id)!;
            return (
              <section className="panel application-card" key={s.program_id}>
                <div className="application-top">
                  <Field label={t("Rang", "الرتبة")}>
                    <input
                      type="number"
                      defaultValue={s.rank}
                      min={1}
                      max={100}
                      aria-label={t("Rang de " + p.title, "الرتبة " + p.title)}
                      onBlur={(e) => {
                        if (Number(e.target.value) !== s.rank)
                          void mutate(`/programs/${p.id}/selection`, {
                            action: "rank",
                            rank: Number(e.target.value),
                          });
                      }}
                    />
                  </Field>
                  <span className={`program-logo ${p.color}`}>
                    <BookOpen size={22} />
                  </span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>
                      {p.institution.city} · {p.institution.name}
                    </p>
                  </div>
                  <Badge status={s.selected ? s.status : "RESEARCHING"} />
                </div>
                <div className="application-status">
                  <span>
                    <ShieldCheck size={16} />
                    {m.blockers.length
                      ? t(
                          `${m.blockers.length} points à résoudre`,
                          `${m.blockers.length} نقط خاصها تتحل`,
                        )
                      : t("Fiche de recherche complète", "البطاقة كاملة")}
                  </span>
                  <Badge status={m.classification} />
                  <span className="fit-label">
                    {classificationLabel(m.classification, t)}
                  </span>
                </div>
                <div className="application-actions">
                  <LinkButton onClick={() => go("programs", p.id)}>
                    {t("Revoir la fiche", "نراجع البطاقة")}
                  </LinkButton>
                  {!s.selected ? (
                    <Button variant="primary" onClick={() => setSelect(p)}>
                      {t("Confirmer ce choix", "نأكد الاختيار")}
                    </Button>
                  ) : (
                    <Button onClick={() => setTrack(p.id)}>
                      {t("Suivre la réponse", "نتبع الجواب")}
                    </Button>
                  )}
                  <button
                    className="text-link danger-link"
                    onClick={() => {
                      if (
                        window.confirm(
                          t(
                            "Retirer cette formation de votre sélection ?",
                            "نحيد هاد التكوين من الاختيارات؟",
                          ),
                        )
                      )
                        void mutate(`/programs/${p.id}/selection`, {
                          action: "remove",
                        });
                    }}
                  >
                    {t("Retirer", "نحيد")}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
      {selected.length > 0 && (
        <section className="panel next-material">
          <div>
            <h3>
              {t(
                "Vos choix donnent une direction à votre dossier.",
                "الاختيارات ديالك كتعطي وجهة للملف.",
              )}
            </h3>
            <p>
              {t(
                "Construisez maintenant votre CV et vos projets à partir des faits.",
                "وجد دابا السيرة الذاتية والمشاريع انطلاقا من المعلومات ديالك.",
              )}
            </p>
          </div>
          <Button variant="primary" onClick={() => go("cv")}>
            {t("Préparer mon CV", "نوجد السيرة الذاتية")}
            <ArrowRight size={16} />
          </Button>
        </section>
      )}
      {select && (
        <SelectionModal program={select} onClose={() => setSelect(null)} />
      )}{" "}
      {track && (
        <TrackingModal programId={track} onClose={() => setTrack(null)} />
      )}
    </>
  );
}
function TrackingModal({
  programId,
  onClose,
}: {
  programId: string;
  onClose: () => void;
}) {
  const { data, t, locale, mutate } = useApp(),
    s = data.candidate.selections.find((s) => s.program_id === programId)!,
    p = data.programs.find((p) => p.id === programId)!,
    transitions: Record<string, string[]> = {
      SELECTED: ["APPLIED", "WITHDRAWN"],
      APPLIED: [
        "UNDER_REVIEW",
        "ADMITTED",
        "WAITLISTED",
        "REJECTED",
        "WITHDRAWN",
      ],
      UNDER_REVIEW: ["ADMITTED", "WAITLISTED", "REJECTED", "WITHDRAWN"],
      WAITLISTED: ["ADMITTED", "REJECTED", "WITHDRAWN"],
    };
  return (
    <Modal
      title={t("Suivi de candidature", "تتبع الترشيح")}
      onClose={onClose}
    >
      <h3>{p.title}</h3>
      <p className="spaced-copy">
        {t("Statut actuel", "الحالة دابا")} : <Badge status={s.status} />
      </p>
      <Notice>
        {t(
          "Vous enregistrez une action ou une réponse reçue en dehors de CampusPath. Aucun dossier n’est transmis par cette application.",
          "كتسجل إجراء ولا جواب وقع خارج CampusPath. التطبيق ما كيسيفط حتى ملف.",
        )}
      </Notice>
      {transitions[s.status] ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (
              await mutate(`/programs/${p.id}/selection`, {
                action: "track",
                status: f.get("status"),
                note: f.get("note") || "",
                confirmed: true,
              })
            )
              onClose();
          }}
        >
          <Field label={t("Nouvel état constaté", "الحالة الجديدة اللي وقعات")}>
            <select name="status">
              {transitions[s.status].map((x) => (
                <option value={x} key={x}>
                  {statusNames[x]?.[locale === "fr" ? 0 : 1] ?? x}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={t(
              "Référence / réponse reçue",
              "المرجع / الجواب اللي وصل",
            )}
          >
            <textarea name="note" maxLength={3000} rows={3} />
          </Field>
          <label className="check-field">
            <input type="checkbox" required />
            {t(
              "Je confirme que cet événement a réellement eu lieu.",
              "كنأكد بلي هاد الحدث وقع بالفعل.",
            )}
          </label>
          <Button variant="primary" type="submit">
            {t("Enregistrer le suivi", "نسجل التتبع")}
          </Button>
        </form>
      ) : (
        <p>
          {t(
            "Ce choix a atteint un état final.",
            "هاد الاختيار وصل للحالة النهائية.",
          )}
        </p>
      )}
    </Modal>
  );
}
