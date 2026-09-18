"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  Compass,
  ExternalLink,
  FlaskConical,
  GitBranch,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Palette,
  Scale,
  Search,
  SlidersHorizontal,
  LoaderCircle,
  Wrench,
  X,
  BriefcaseBusiness,
} from "lucide-react";
import {
  orientationRoadmaps,
  ORIENTATION_REVIEWED_AT,
  type BiText,
  type OrientationRoadmap,
} from "@/lib/orientation-catalog";
import type { OrientationState } from "@/lib/schema";
import { Button, Empty, Modal, Notice, Progress, useApp } from "./ui";

const levels = [
  ["lycee", "Au lycée", "فالثانوي"],
  ["bac", "Après le bac", "من بعد الباك"],
  ["bac2", "Bac +2", "الباك +2"],
  ["licence", "Licence et plus", "الإجازة وفوق"],
  ["reorientation", "Me réorienter", "نبدل المسار"],
] as const;
const interests = [
  ["technologie", "La technologie", "التكنولوجيا"],
  ["logique", "Résoudre des problèmes", "نحل المشاكل"],
  ["construire", "Construire et fabriquer", "نبني ونصنع"],
  ["organiser", "Organiser et gérer", "ننظم ونسير"],
  ["aider", "Aider les autres", "نعاون الناس"],
  ["creer", "Imaginer et créer", "نتخيل ونبدع"],
  ["comprendre", "Comprendre et chercher", "نفهم ونقلب"],
  ["communiquer", "Échanger et convaincre", "نتواصل ونقنع"],
  ["terrain", "Apprendre sur le terrain", "نتعلم فالميدان"],
] as const;
const categories = [
  ["all", "Tous les domaines", "جميع المجالات"],
  ["tech", "Tech & ingénierie", "التقنية والهندسة"],
  ["business", "Commerce", "التجارة"],
  ["health", "Santé", "الصحة"],
  ["creative", "Création", "الإبداع"],
  ["science", "Sciences", "العلوم"],
  ["society", "Société", "المجتمع"],
] as const;
const domainIcons = {
  tech: Code2,
  business: BriefcaseBusiness,
  health: HeartPulse,
  creative: Palette,
  science: FlaskConical,
  society: Scale,
};
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLowerCase();

function RoadIcon({
  road,
  size = 22,
}: {
  road: OrientationRoadmap;
  size?: number;
}) {
  const Icon =
    road.id === "metiers"
      ? Wrench
      : road.id === "ingenierie"
        ? GitBranch
        : domainIcons[road.category];
  return <Icon size={size} aria-hidden="true" />;
}

export function OrientationView() {
  const { data, locale, t, go, programId, mutate, busy } = useApp();
  const state = data.candidate.orientation;
  const tx = (value: BiText) => value[locale];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [tab, setTab] = useState<"all" | "saved" | "suggested">("all");
  const [quiz, setQuiz] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const selected = orientationRoadmaps.find((road) => road.id === programId);
  const overlap = (road: OrientationRoadmap) =>
    road.interests.filter((interest) =>
      state.profile.interests.includes(interest),
    );
  const roads = orientationRoadmaps
    .filter((road) => {
      const haystack = [
        road.title.fr,
        road.title.ary,
        road.summary.fr,
        road.summary.ary,
        ...road.careers.flatMap((career) => [career.fr, career.ary]),
      ].join(" ");
      return (
        (category === "all" || road.category === category) &&
        (level === "all" || road.levels.some((entry) => entry === level)) &&
        normalize(haystack).includes(normalize(query.trim())) &&
        (tab !== "saved" || state.saved_roadmaps.includes(road.id)) &&
        (tab !== "suggested" || overlap(road).length > 0)
      );
    })
    .sort((a, b) =>
      tab === "suggested"
        ? overlap(b).length - overlap(a).length ||
          Number(b.levels.includes(state.profile.level)) -
            Number(a.levels.includes(state.profile.level))
        : 0,
    );
  const save = (next: OrientationState) => mutate("/orientation", next, "PUT");
  const toggleSaved = async (id: string) => {
    setSaveError(null);
    const result = await save({
      ...state,
      saved_roadmaps: state.saved_roadmaps.includes(id)
        ? state.saved_roadmaps.filter((item) => item !== id)
        : [...state.saved_roadmaps, id],
    });
    if (!result) setSaveError(id);
  };
  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setLevel("all");
  };
  const setMode = (next: typeof tab) => {
    setTab(next);
    resetFilters();
  };
  return (
    <div className="orientation">
      <div className="orient-save-status" role="status" aria-live="polite">
        {busy && (
          <>
            <LoaderCircle size={15} className="spin" />
            {t("Enregistrement en cours…", "كنسجلو التغييرات…")}
          </>
        )}
      </div>
      {programId ? (
        selected ? (
          <RoadmapDetail
            key={selected.id}
            road={selected}
            onSave={() => toggleSaved(selected.id)}
            saveError={saveError === selected.id}
          />
        ) : (
          <Empty
            title={t("Ce parcours n’existe pas", "هاد المسار ما كاينش")}
            description={t(
              "Retrouvez toutes les pistes dans le catalogue.",
              "رجع للائحة باش تشوف المسارات.",
            )}
            action={
              <Button onClick={() => go("orientation")}>
                {t("Voir les parcours", "شوف المسارات")}
              </Button>
            }
          />
        )
      ) : (
        <>
          <section className="orient-hero">
            <div className="orient-hero-copy">
              <span className="orient-kicker">
                {t(
                  "CAMPUSPATH / ORIENTATION AU MAROC",
                  "CampusPath / التوجيه فالمغرب",
                )}
              </span>
              <h1>
                {t("Comprendre tes options.", "فهم الاختيارات ديالك.")}
                <br />
                {t("Choisir ta voie.", "ختار الطريق ديالك.")}
              </h1>
              <p>
                {t(
                  "Des études aux métiers, explore les possibles au Maroc. Une carte, des étapes concrètes et la liberté de choisir ta voie.",
                  "من القراية للخدمة، اكتشف الاختيارات فالمغرب. خريطة وخطوات واضحة باش تختار الطريق ديالك.",
                )}
              </p>
              <div className="orient-hero-actions">
                <Button className="orient-yellow" onClick={() => setQuiz(true)}>
                  <Compass size={18} />
                  {t(
                    "Trouver mes premières pistes",
                    "نلقى المسارات اللي يعجبوني",
                  )}
                  <ArrowRight size={17} />
                </Button>
                <span>
                  {t(
                    "4 questions · sans bonne ou mauvaise réponse",
                    "4 أسئلة · ما كاين لا جواب صحيح لا غلط",
                  )}
                </span>
              </div>
            </div>
            <aside
              className="orient-start"
              aria-label={t("Par où commencer", "منين نبدا")}
            >
              <h2>{t("Par où commencer ?", "منين نبدا؟")}</h2>
              <p>
                {t(
                  "Choisis ce qui t’est utile aujourd’hui.",
                  "ختار اللي يقدر يعاونك اليوم.",
                )}
              </p>
              <div className="orient-start-links">
                <button onClick={() => setQuiz(true)}>
                  <span>01</span>
                  <strong>
                    {t("Faire le point sur mes envies", "نفهم شنو بغيت")}
                  </strong>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    setMode("all");
                    document
                      .getElementById("catalog-title")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span>02</span>
                  <strong>
                    {t("Explorer les parcours", "نكتشف المسارات")}
                  </strong>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    setMode("saved");
                    document
                      .getElementById("catalog-title")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span>03</span>
                  <strong>
                    {t("Reprendre mes favoris", "نرجع للمفضلة ديالي")} (
                    {state.saved_roadmaps.length})
                  </strong>
                  <ArrowRight size={16} />
                </button>
              </div>
            </aside>
          </section>
          <section className="orient-catalog" aria-labelledby="catalog-title">
            <div className="orient-section-heading">
              <div>
                <span className="orient-eyebrow">
                  {t("LE CHAMP DES POSSIBLES", "الاختيارات اللي قدامك")}
                </span>
                <h2 id="catalog-title">
                  {t(
                    "Quel chemin veux-tu explorer ?",
                    "أشنو هو الطريق اللي بغيتي تكتشف؟",
                  )}
                </h2>
              </div>
              <span className="orient-count" aria-live="polite">
                {roads.length} {t("parcours", "مسارات")}
              </span>
            </div>
            <div
              className="orient-tabs"
              role="group"
              aria-label={t("Afficher les parcours", "شوف المسارات")}
            >
              <button
                aria-pressed={tab === "all"}
                onClick={() => setMode("all")}
              >
                {t("Tous les parcours", "جميع المسارات")}
              </button>
              <button
                aria-pressed={tab === "suggested"}
                onClick={() =>
                  state.profile.interests.length
                    ? setMode("suggested")
                    : setQuiz(true)
                }
              >
                <Compass size={15} />
                {t("Mes pistes suggérées", "المسارات المقترحة ليا")}
              </button>
              <button
                aria-pressed={tab === "saved"}
                onClick={() => setMode("saved")}
              >
                <Bookmark size={15} />
                {t("Mes favoris", "المفضلة ديالي")}
                <span>{state.saved_roadmaps.length}</span>
              </button>
            </div>
            {tab === "suggested" && (
              <div className="orient-fit-note">
                <Lightbulb size={20} />
                <div>
                  <strong>
                    {t(
                      "Des points de départ, à explorer librement",
                      "نقط للبداية، اكتشفها بحرية",
                    )}
                  </strong>
                  <p>
                    {t(
                      "Ces pistes partagent tes centres d’intérêt. Elles sont classées par nombre d’intérêts communs, puis par niveau d’exploration. Ce n’est ni un test d’aptitude ni une décision d’admission.",
                      "هاد المسارات قريبة للاهتمامات ديالك. الترتيب حسب الاهتمامات المشتركة، ومن بعد المستوى الدراسي. هادا ماشي اختبار للقدرات ولا قرار بالقبول.",
                    )}
                  </p>
                  <button onClick={() => setQuiz(true)}>
                    {t("Modifier mes réponses", "نبدل الأجوبة ديالي")}
                  </button>
                </div>
              </div>
            )}
            <div className="orient-search-row">
              <label className="orient-search">
                <Search size={19} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(
                    "Un domaine, un métier…",
                    "مجال، شي خدمة…",
                  )}
                  aria-label={t("Rechercher un parcours", "قلب على مسار")}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label={t("Effacer la recherche", "مسح البحث")}
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
              <label className="orient-level">
                <SlidersHorizontal size={16} />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  aria-label={t("Niveau d’exploration", "المستوى اللي بغيتي تكتشف")}
                >
                  <option value="all">
                    {t("Tous les niveaux", "جميع المستويات")}
                  </option>
                  {levels.map(([id, fr, ary]) => (
                    <option key={id} value={id}>
                      {t(fr, ary)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div
              className="orient-filters"
              role="group"
              aria-label={t("Domaines", "المجالات")}
            >
              {categories.map(([id, fr, ary]) => (
                <button
                  key={id}
                  aria-pressed={category === id}
                  onClick={() => setCategory(id)}
                >
                  {t(fr, ary)}
                </button>
              ))}
            </div>
            <div className="orient-grid">
              {roads.map((road, index) => {
                const saved = state.saved_roadmaps.includes(road.id),
                  comparing = compare.includes(road.id),
                  explored = road.steps.filter((step) =>
                    state.explored_steps[road.id]?.includes(step.id),
                  ).length;
                return (
                  <article
                    className={`orient-card domain-${road.category}`}
                    key={road.id}
                  >
                    <span className="orient-card-index" aria-hidden="true">
                      {String(orientationRoadmaps.indexOf(road) + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <div className="orient-card-body">
                      <a
                        className="orient-card-link"
                        href={`#orientation/${road.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          go("orientation", road.id);
                        }}
                      >
                        <h3>
                          {tx(road.title)}
                          <ArrowRight size={18} />
                        </h3>
                        <p>{tx(road.summary)}</p>
                      </a>
                      {tab === "suggested" && (
                        <div className="orient-match">
                          <Compass size={13} />
                          {overlap(road)
                            .map((id) => {
                              const item = interests.find(
                                (interest) => interest[0] === id,
                              );
                              return item ? t(item[1], item[2]) : id;
                            })
                            .join(" · ")}
                        </div>
                      )}
                    </div>
                    <div className="orient-card-careers">
                      <small>
                        {t("MÉTIERS À DÉCOUVRIR", "خدمات باش تكتشف")}
                      </small>
                      {road.careers.slice(0, 2).map((career) => (
                        <span key={career.fr}>{tx(career)}</span>
                      ))}
                    </div>
                    <div className="orient-card-controls">
                      <button
                        className={`orient-bookmark ${saved ? "saved" : ""}`}
                        disabled={busy}
                        aria-pressed={saved}
                        aria-label={
                          t(
                            saved
                              ? "Retirer des favoris : "
                              : "Ajouter aux favoris : ",
                            saved ? "نحيد من المفضلة : " : "نزيد للمفضلة : ",
                          ) + tx(road.title)
                        }
                        onClick={() => toggleSaved(road.id)}
                      >
                        <Bookmark
                          size={17}
                          fill={saved ? "currentColor" : "none"}
                        />
                        {t(
                          saved ? "Enregistré" : "Garder",
                          saved ? "تسجل" : "نحفظ",
                        )}
                      </button>
                      <div className="orient-card-bottom">
                        <span>
                          <GitBranch size={14} />
                          {explored > 0
                            ? `${explored}/${road.steps.length} ${t("étapes explorées", "خطوات تكتاشفو")}`
                            : `${road.steps.length} ${t("étapes à explorer", "خطوات باش تكتشف")}`}
                        </span>
                        <label>
                          <input
                            type="checkbox"
                            checked={comparing}
                            disabled={!comparing && compare.length >= 3}
                            onChange={() =>
                              setCompare(
                                comparing
                                  ? compare.filter((id) => id !== road.id)
                                  : [...compare, road.id],
                              )
                            }
                            aria-label={
                              t("Comparer : ", "قارن : ") + tx(road.title)
                            }
                          />
                          {t("Comparer", "قارن")}
                        </label>
                      </div>
                      {saveError === road.id && (
                        <p className="orient-inline-error" role="alert">
                          {t(
                            "Non enregistré. Vérifie ta connexion et réessaie avec le bouton Garder.",
                            "ما تسجلش. شوف الاتصال وعاود بزر الحفظ.",
                          )}
                        </p>
                      )}
                    </div>
                    <div
                      className="orient-card-progress"
                      style={{
                        width: `${(explored / road.steps.length) * 100}%`,
                      }}
                    />
                    {tab === "suggested" && index === 0 && (
                      <span className="sr-only">
                        {t(
                          "Premier résultat par intérêts communs",
                          "أول النتائج حسب الاهتمامات",
                        )}
                      </span>
                    )}
                  </article>
                );
              })}
            </div>
            {!roads.length && (
              <Empty
                title={t(
                  tab === "saved" && !state.saved_roadmaps.length
                    ? "Tes prochaines pistes commencent ici"
                    : "Aucun parcours pour ces filtres",
                  tab === "saved" && !state.saved_roadmaps.length
                    ? "المسارات الجاية كتبدا هنا"
                    : "ما لقيناش مسار بهاد التصفية",
                )}
                description={t(
                  tab === "saved" && !state.saved_roadmaps.length
                    ? "Utilise le marque-page sur un parcours pour le retrouver ici."
                    : "Essaie un autre mot-clé ou affiche tous les domaines.",
                  tab === "saved" && !state.saved_roadmaps.length
                    ? "ضغط على علامة الحفظ باش تلقى المسار هنا."
                    : "جرب كلمة أخرى ولا شوف جميع المجالات.",
                )}
                action={
                  <Button onClick={() => setMode("all")}>
                    {t("Voir tous les parcours", "شوف جميع المسارات")}
                  </Button>
                }
              />
            )}
            <p className="orient-source-note">
              {t(
                "Les niveaux servent à explorer. Les conditions d’accès dépendent de chaque formation. Catalogue relu le",
                "المستويات غير باش تكتشف. شروط القبول كتبدل حسب التكوين. آخر مراجعة للدليل نهار",
              )}{" "}
              {new Date(
                ORIENTATION_REVIEWED_AT + "T12:00:00",
              ).toLocaleDateString("fr-FR")}
              .
            </p>
          </section>
          <section className="orient-next">
            <div className="orient-next-icon">
              <Compass size={26} />
            </div>
            <div>
              <h2>
                {t(
                  "Tu n’as pas encore de projet précis ?",
                  "مازال ما عندكش مشروع واضح؟",
                )}
              </h2>
              <p>
                {t(
                  "Commence par ce qui t’intéresse. Tu peux explorer plusieurs chemins et changer d’avis.",
                  "بدا بداكشي اللي كيعجبك. تقدر تكتشف كثر من طريق وتبدل الرأي ديالك.",
                )}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setQuiz(true)}>
              {t("Faire le point", "نفهم شنو بغيت")}
              <ArrowRight size={16} />
            </Button>
          </section>
          <button className="orient-france-link" onClick={() => go("pathways")}>
            <GraduationCap size={18} />
            <span>
              {t(
                "Tu envisages la France ? Retrouve aussi ton espace de préparation des candidatures.",
                "كتفكر تقرا ففرنسا؟ شوف الفضاء ديال تحضير الترشيحات.",
              )}
            </span>
            <ChevronRight size={18} />
          </button>
          {compare.length > 0 && (
            <div className="orient-compare-bar">
              <div>
                <GitBranch size={19} />
                <strong>
                  {compare.length}/3{" "}
                  {t("parcours sélectionnés", "مسارات مختارة")}
                </strong>
                <span>
                  {compare.length < 2
                    ? t(
                        "Choisis au moins 2 pistes",
                        "ختار جوج مسارات على الأقل",
                      )
                    : t(
                        "3 pistes maximum · décoche pour remplacer",
                        "3 مسارات كحد أقصى · حيد واحد باش تبدلو",
                      )}
                </span>
              </div>
              <Button
                disabled={compare.length < 2}
                className="orient-yellow"
                onClick={() => setComparing(true)}
              >
                {t("Comparer mes pistes", "نقارن المسارات")}
                <ArrowRight size={16} />
              </Button>
              <button
                aria-label={t("Vider la comparaison", "حيد المقارنة")}
                onClick={() => setCompare([])}
              >
                <X size={18} />
              </button>
            </div>
          )}
        </>
      )}
      {quiz && (
        <OrientationQuiz
          onClose={() => setQuiz(false)}
          onComplete={(hasInterests) => {
            setQuiz(false);
            setMode(hasInterests ? "suggested" : "all");
            go("orientation");
          }}
        />
      )}
      {comparing && (
        <Comparison
          roads={orientationRoadmaps.filter((road) =>
            compare.includes(road.id),
          )}
          onClose={() => setComparing(false)}
        />
      )}
    </div>
  );
}

function OrientationQuiz({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (hasInterests: boolean) => void;
}) {
  const { data, t, mutate, busy } = useApp();
  const [profile, setProfile] = useState(data.candidate.orientation.profile);
  const [step, setStep] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const changeStep = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => questionHeading.current?.focus());
  };
  const priorities = [
    [
      "discover",
      "Je veux découvrir mes options",
      "بغيت نكتشف الاختيارات ديالي",
    ],
    [
      "practical",
      "J’aime apprendre par la pratique",
      "كنبغي نتعلم بالتطبيق",
    ],
    [
      "studies",
      "Je me projette dans des études approfondies",
      "بغيت نعمق فالقراية",
    ],
  ] as const;
  const mobility = [
    ["undecided", "Je ne sais pas encore", "مازال ما عرفت"],
    ["local", "Rester près de chez moi", "نبقى قريب للدار"],
    ["morocco", "Bouger au Maroc", "نقرا فشي مدينة فالمغرب"],
    ["abroad", "Envisager l’étranger", "نفكر فالخارج"],
  ] as const;
  const titles = [
    t("Où en es-tu aujourd’hui ?", "فين وصلتي اليوم؟"),
    t("Qu’est-ce qui t’attire ?", "شنو كيعجبك؟"),
    t("Comment aimes-tu avancer ?", "كيفاش كتبغي تتقدم؟"),
    t("Où imagines-tu la suite ?", "فين كتفكر تدوز المرحلة الجاية؟"),
  ];
  const reasons = [
    t(
      "Cette réponse situe les parcours qui correspondent à ton moment d’études.",
      "هاد الجواب كيعاوننا نعرفو المسارات اللي كتناسب المرحلة ديالك.",
    ),
    t(
      "Tes centres d’intérêt donnent des pistes de départ, jamais une étiquette.",
      "الاهتمامات ديالك كتعطينا نقط للبداية، ما كتحطكش فشي تصنيف.",
    ),
    t(
      "Cela nous aide à proposer une prochaine étape qui te ressemble.",
      "هادشي كيعاوننا نقترحو خطوة جاية مناسبة ليك.",
    ),
    t(
      "La mobilité change les options à vérifier, sans fermer les autres chemins.",
      "إمكانية التنقل كتأثر على الاختيارات اللي خاصك تراجع، بلا ما تسد عليك المسارات الأخرى.",
    ),
  ];
  const finish = async () => {
    setSaveFailed(false);
    const saved = await mutate(
      "/orientation",
      { ...data.candidate.orientation, profile },
      "PUT",
    );
    if (saved) onComplete(profile.interests.length > 0);
    else setSaveFailed(true);
  };
  const advanceWithoutAnswer = () => {
    if (step < 3) changeStep(step + 1);
    else void finish();
  };
  return (
    <Modal
      title={t("Trouvons tes premières pistes", "نلقاو المسارات ديالك")}
      onClose={onClose}
    >
      <div className="orient-quiz">
        <div className="orient-quiz-progress">
          <span>
            {t("QUESTION", "السؤال")} 0{step + 1} / 04
          </span>
          <Progress
            percent={(step + 1) * 25}
            label={t("Progression du questionnaire", "التقدم فالأسئلة")}
          />
        </div>
        <h3 ref={questionHeading} tabIndex={-1}>
          {titles[step]}
        </h3>
        <p>{reasons[step]}</p>
        <div
          className={`orient-options ${step === 1 ? "multiple" : ""}`}
          role="group"
          aria-label={titles[step]}
        >
          {step === 0 &&
            levels.map(([id, fr, ary]) => (
              <button
                key={id}
                disabled={busy}
                aria-pressed={profile.level === id}
                onClick={() => setProfile({ ...profile, level: id })}
              >
                <GraduationCap size={20} />
                {t(fr, ary)}
                {profile.level === id ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>
            ))}
          {step === 1 &&
            interests.map(([id, fr, ary]) => (
              <button
                key={id}
                disabled={busy}
                aria-pressed={profile.interests.includes(id)}
                onClick={() =>
                  setProfile({
                    ...profile,
                    interests: profile.interests.includes(id)
                      ? profile.interests.filter((item) => item !== id)
                      : [...profile.interests, id],
                  })
                }
              >
                {t(fr, ary)}
                {profile.interests.includes(id) ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Circle size={18} />
                )}
              </button>
            ))}
          {step === 2 &&
            priorities.map(([id, fr, ary]) => (
              <button
                key={id}
                disabled={busy}
                aria-pressed={profile.priority === id}
                onClick={() => setProfile({ ...profile, priority: id })}
              >
                {t(fr, ary)}
                {profile.priority === id ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>
            ))}
          {step === 3 &&
            mobility.map(([id, fr, ary]) => (
              <button
                key={id}
                disabled={busy}
                aria-pressed={profile.mobility === id}
                onClick={() => setProfile({ ...profile, mobility: id })}
              >
                {t(fr, ary)}
                {profile.mobility === id ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>
            ))}
        </div>
        <div
          className="orient-question-actions"
          aria-label={t("Réponses sans choix", "اختيارات أخرى للجواب")}
        >
          <button type="button" disabled={busy} onClick={advanceWithoutAnswer}>
            {t("Je ne sais pas encore", "مازال ما عرفت")}
          </button>
          <button type="button" disabled={busy} onClick={advanceWithoutAnswer}>
            {t("Je préfère ne pas répondre", "كنفضل ما نجاوبش")}
          </button>
          <button type="button" disabled={busy} onClick={advanceWithoutAnswer}>
            {t("Passer", "دوز")}
          </button>
        </div>
        {saveFailed && (
          <p className="orient-inline-error" role="alert">
            {t(
              "Tes réponses n’ont pas pu être enregistrées. Elles restent ici : vérifie ta connexion puis réessaie.",
              "الأجوبة ما تسجلوش. باقيين هنا: شوف الاتصال وعاود.",
            )}
          </p>
        )}
        <div className="orient-save-status" role="status">
          {busy && (
            <>
              <LoaderCircle size={15} className="spin" />
              {t("Enregistrement de tes réponses…", "كنسجلو الأجوبة…")}
            </>
          )}
        </div>
        {step === 3 && (
          <p className="orient-small">
            {t(
              "Les pistes seront triées par intérêts communs, puis par niveau. Ton style d’apprentissage et ta mobilité servent à préparer les actions proposées dans chaque parcours.",
              "المسارات غادي يترتبو حسب الاهتمامات المشتركة، ومن بعد المستوى. طريقة التعلم وإمكانية التنقل كيعاونوك تحدد الخطوات ديال كل مسار.",
            )}
          </p>
        )}
        <div className="orient-quiz-actions">
          <Button
            variant="secondary"
            onClick={() => (step ? changeStep(step - 1) : onClose())}
          >
            {t(step ? "Retour" : "Plus tard", step ? "نرجع" : "من بعد")}
          </Button>
          <Button
            className="orient-yellow"
            onClick={async () => {
              if (step < 3) changeStep(step + 1);
              else await finish();
            }}
          >
            {t(
              step < 3 ? "Continuer" : "Découvrir mes pistes",
              step < 3 ? "نكمل" : "نكتشف المسارات",
            )}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function RoadmapDetail({
  road,
  onSave,
  saveError,
}: {
  road: OrientationRoadmap;
  onSave: () => void;
  saveError: boolean;
}) {
  const { data, locale, t, go, mutate } = useApp();
  const state = data.candidate.orientation,
    tx = (value: BiText) => value[locale];
  const explored = road.steps
    .filter((step) => state.explored_steps[road.id]?.includes(step.id))
    .map((step) => step.id);
  const [active, setActive] = useState(
    road.steps.find((step) => !explored.includes(step.id))?.id ??
      road.steps[0].id,
  );
  const inspector = useRef<HTMLElement>(null);
  const [progressFailed, setProgressFailed] = useState(false);
  const activeStep = road.steps.find((step) => step.id === active),
    activeBranch = road.branches.find((branch) => branch.id === active);
  const saved = state.saved_roadmaps.includes(road.id),
    complete = !!activeStep && explored.includes(activeStep.id);
  const selectNode = (id: string) => {
    setActive(id);
    if (window.matchMedia("(max-width: 1080px)").matches)
      requestAnimationFrame(() => {
        inspector.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        inspector.current?.focus({ preventScroll: true });
      });
  };
  const toggleStep = async () => {
    if (!activeStep) return;
    const next = complete
      ? explored.filter((id) => id !== activeStep.id)
      : [...explored, activeStep.id];
    setProgressFailed(false);
    const result = await mutate(
      "/orientation",
      {
        ...state,
        explored_steps: { ...state.explored_steps, [road.id]: next },
      },
      "PUT",
    );
    if (!result) setProgressFailed(true);
  };
  return (
    <>
      <div className="orient-detail-top">
        <button className="orient-back" onClick={() => go("orientation")}>
          <ArrowLeft size={16} />
          {t("Tous les parcours", "جميع المسارات")}
        </button>
        <Button variant="secondary" onClick={onSave} aria-pressed={saved}>
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          {t(
            saved ? "Parcours enregistré" : "Garder cette piste",
            saved ? "المسار تسجل" : "نحفظ هاد المسار",
          )}
        </Button>
      </div>
      {saveError && (
        <p className="orient-inline-error" role="alert">
          {t(
            "Le favori n’a pas été enregistré. Vérifie ta connexion et réessaie.",
            "المفضلة ما تسجلاتش. شوف الاتصال وعاود.",
          )}
        </p>
      )}
      <header className="orient-road-header">
        <span className={`orient-road-icon domain-${road.category}`}>
          <RoadIcon road={road} size={30} />
        </span>
        <div>
          <span className="orient-eyebrow">
            {t("TA CARTE D’EXPLORATION", "خريطة الاكتشاف ديالك")}
          </span>
          <h1>{tx(road.title)}</h1>
          <p>{tx(road.summary)}</p>
        </div>
      </header>
      <div className="orient-road-progress">
        <span>
          <CheckCircle2 size={18} />
          <strong>
            {explored.length}/{road.steps.length}
          </strong>{" "}
          {t("étapes explorées", "خطوات تكتاشفو")}
        </span>
        <Progress
          percent={(explored.length / road.steps.length) * 100}
          label={t("Étapes explorées", "خطوات تكتاشفو")}
        />
        <small>
          {t(
            "Un repère pour ta réflexion, pas une qualification.",
            "غير مؤشر باش تفكر، ماشي دبلوم.",
          )}
        </small>
      </div>
      <div className="orient-road-layout">
        <section
          className="orient-map"
          aria-label={t("Carte interactive du parcours", "خريطة المسار")}
        >
          <div className="orient-map-hint">
            <GitBranch size={16} />
            {t(
              "Clique sur une étape ou une voie pour l’explorer",
              "ضغط على شي خطوة ولا طريق باش تكتشفها",
            )}
          </div>
          <div className="orient-map-start">
            {t("TON POINT DE DÉPART", "نقطة البداية ديالك")}
          </div>
          <ol className="orient-nodes">
            {road.steps.map((step, index) => (
              <li key={step.id}>
                <button
                  className={`orient-node ${active === step.id ? "active" : ""} ${explored.includes(step.id) ? "explored" : ""}`}
                  onClick={() => selectNode(step.id)}
                  aria-pressed={active === step.id}
                  aria-controls="orientation-inspector"
                >
                  <span className="orient-node-index">
                    {explored.includes(step.id) ? (
                      <Check size={16} />
                    ) : (
                      `0${index + 1}`
                    )}
                  </span>
                  <span>
                    {tx(step.title)}
                    {explored.includes(step.id) && (
                      <small>{t("Explorée", "تكتاشفات")}</small>
                    )}
                  </span>
                  <ChevronRight size={16} />
                </button>
                {index === 1 && (
                  <div className="orient-branches">
                    <span className="orient-branch-label">
                      {t(
                        "PLUSIEURS VOIES POSSIBLES",
                        "كاينين بزاف ديال الطرق",
                      )}
                    </span>
                    <div>
                      {road.branches.map((branch) => (
                        <button
                          key={branch.id}
                          className={active === branch.id ? "active" : ""}
                          aria-pressed={active === branch.id}
                          aria-controls="orientation-inspector"
                          onClick={() => selectNode(branch.id)}
                        >
                          <GitBranch size={15} />
                          {tx(branch.title)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="orient-map-end">
            <span>
              <Compass size={20} />
            </span>
            {t(
              "Une décision éclairée. Ta prochaine étape.",
              "قرار على بينة. الخطوة الجاية ديالك.",
            )}
          </div>
          <div className="orient-map-legend">
            <span>
              <i />
              {t("À explorer", "باش تكتشف")}
            </span>
            <span>
              <i className="done" />
              {t("Explorée", "تكتاشفات")}
            </span>
            <span>
              <i className="branch" />
              {t("Voie possible", "طريق ممكنة")}
            </span>
          </div>
        </section>
        <aside
          id="orientation-inspector"
          ref={inspector}
          tabIndex={-1}
          className="orient-inspector"
          aria-label={t("Détail de la sélection", "تفاصيل الاختيار")}
        >
          <span className="orient-eyebrow">
            {activeStep
              ? `${t("ÉTAPE", "الخطوة")} ${road.steps.indexOf(activeStep) + 1} / ${road.steps.length}`
              : t("UNE VOIE À ENVISAGER", "طريق ممكنة")}
          </span>
          <h2>
            {activeStep
              ? tx(activeStep.title)
              : activeBranch
                ? tx(activeBranch.title)
                : ""}
          </h2>
          <p>
            {activeStep
              ? tx(activeStep.detail)
              : activeBranch
                ? tx(activeBranch.detail)
                : ""}
          </p>
          {activeStep && (
            <>
              <h3>{t("À toi de jouer", "دابا نوبتك")}</h3>
              <ul className="orient-action-list">
                {activeStep.actions.map((action) => (
                  <li key={action.fr}>
                    <span>
                      <ArrowRight size={14} />
                    </span>
                    {tx(action)}
                  </li>
                ))}
              </ul>
              {activeStep.resource && (
                <a
                  className="orient-resource"
                  href={activeStep.resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} />
                  <span>
                    {activeStep.resource.label}
                    <small>
                      {t(
                        "Consulter la source officielle",
                        "شوف المصدر الرسمي",
                      )}
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </a>
              )}
              <Button
                className={complete ? "orient-done-button" : "orient-yellow"}
                onClick={toggleStep}
                aria-pressed={complete}
              >
                <CheckCircle2 size={17} />
                {t(
                  complete ? "Explorée · annuler" : "Marquer comme explorée",
                  complete ? "تكتاشفات · نحيد العلامة" : "نعلم بلي تكتاشفات",
                )}
              </Button>
              {progressFailed && (
                <p className="orient-inline-error" role="alert">
                  {t(
                    "La progression n’a pas été enregistrée. Réessaie avec le bouton ci-dessus.",
                    "التقدم ما تسجلش. عاود بالزر اللي لفوق.",
                  )}
                </p>
              )}
              <p className="orient-small">
                {t(
                  "Coche cette étape après avoir examiné les actions. Tu peux revenir dessus à tout moment.",
                  "علم على هاد الخطوة ملي تشوف الإجراءات. تقدر ترجع ليها من بعد.",
                )}
              </p>
            </>
          )}
          {activeBranch && (
            <Notice>
              {t(
                "Les voies proposées sont des alternatives. Vérifie les diplômes requis, la sélection, les coûts et les dates auprès de l’établissement visé.",
                "هاد الطرق اختيارات مختلفة. تأكد من الدبلومات والانتقاء والثمن والتواريخ عند المؤسسة.",
              )}
            </Notice>
          )}
        </aside>
      </div>
      <div className="orient-facts">
        <section>
          <h2>
            <BriefcaseBusiness size={18} />
            {t("Des métiers à découvrir", "خدمات باش تكتشف")}
          </h2>
          <ul>
            {road.careers.map((career) => (
              <li key={career.fr}>{tx(career)}</li>
            ))}
          </ul>
          <p className="orient-small">
            {t(
              "Selon la spécialisation et les qualifications obtenues.",
              "حسب التخصص والدبلومات اللي خديتي.",
            )}
          </p>
        </section>
        <section>
          <h2>
            <Lightbulb size={18} />
            {t("Ce qui peut te plaire", "شنو يقدر يعجبك")}
          </h2>
          <ul>
            {road.strengths.map((strength) => (
              <li key={strength.fr}>{tx(strength)}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>
            <Compass size={18} />
            {t("À prendre en compte", "شنو خاصك تحسب ليه")}
          </h2>
          <ul>
            {road.watchouts.map((watchout) => (
              <li key={watchout.fr}>{tx(watchout)}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="orient-personal-plan">
        <h2>
          {t("Pour préparer ta prochaine décision", "باش توجد القرار الجاي")}
        </h2>
        <div>
          <span>01</span>
          <p>
            {t("Temps et budget : ", "الوقت والميزانية : ")}
            {tx(road.duration)} {tx(road.cost)}
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            {state.profile.priority === "practical"
              ? t(
                  "Ton envie de pratique : contacte un étudiant ou un professionnel et choisis une petite expérience concrète dans ce domaine.",
                  "بغيتي التطبيق: هضر مع طالب ولا مهني وختار تجربة صغيرة فهاد المجال.",
                )
              : state.profile.priority === "studies"
                ? t(
                    "Ton envie d’approfondir : compare les matières, les poursuites d’études et les prérequis de deux formations.",
                    "بغيتي تعمق: قارن المواد، وإمكانية تكمل القراية، وشروط جوج تكوينات.",
                  )
                : t(
                    "Pour mieux te connaître : essaie une activité du domaine et note ce qui te donne envie de continuer.",
                    "باش تعرف راسك: جرب شي نشاط فهاد المجال وكتب شنو عجبك.",
                  )}
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            {state.profile.mobility === "abroad"
              ? t(
                  "Si tu envisages l’étranger, vérifie aussi les langues, les équivalences, les démarches et le budget total. L’espace France peut t’aider à préparer ton dossier.",
                  "إلا كتفكر فالخارج، تأكد من اللغات ومعادلة الدبلومات والإجراءات والميزانية كاملة. فضاء فرنسا يقدر يعاونك توجد الملف.",
                )
              : state.profile.mobility === "local"
                ? t(
                    "Pour rester près de chez toi, repère deux établissements accessibles et vérifie le trajet, l’offre exacte et les modalités de présence.",
                    "باش تبقى قريب للدار، قلب على جوج مؤسسات وتأكد من الطريق والتكوين والحضور.",
                  )
                : t(
                    "Avant de choisir une ville, compare le logement, le transport et les aides possibles en plus des frais de formation.",
                    "قبل ما تختار المدينة، قارن السكن والنقل والمساعدات مع مصاريف التكوين.",
                  )}
          </p>
        </div>
      </section>
      <section className="orient-sources">
        <div>
          <h2>{t("Vérifie à la source", "تأكد من المصدر")}</h2>
          <p>
            {t("Catalogue relu le", "آخر مراجعة للدليل نهار")}{" "}
            {new Date(ORIENTATION_REVIEWED_AT + "T12:00:00").toLocaleDateString(
              "fr-FR",
            )}
            .{" "}
            {t(
              "Vérifie l’avis de l’année concernée avant toute démarche.",
              "تأكد من الإعلان ديال السنة اللي باغي تقرا فيها قبل أي إجراء.",
            )}
          </p>
        </div>
        <div>
          {road.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.label}
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function Comparison({
  roads,
  onClose,
}: {
  roads: OrientationRoadmap[];
  onClose: () => void;
}) {
  const { t, locale, go } = useApp(),
    tx = (value: BiText) => value[locale];
  const rows = [
    {
      label: t("Ce qu’on y explore", "شنو فيه"),
      content: (road: OrientationRoadmap) => tx(road.summary),
    },
    {
      label: t("Voies possibles", "الطرق الممكنة"),
      content: (road: OrientationRoadmap) =>
        road.branches.map((branch) => tx(branch.title)).join(" · "),
    },
    {
      label: t("Durée indicative", "المدة تقريبا"),
      content: (road: OrientationRoadmap) => tx(road.duration),
    },
    {
      label: t("Budget à prévoir", "الميزانية اللي خاصك"),
      content: (road: OrientationRoadmap) => tx(road.cost),
    },
    {
      label: t("Métiers à découvrir", "خدمات باش تكتشف"),
      content: (road: OrientationRoadmap) => road.careers.map(tx).join(" · "),
    },
    {
      label: t("Points d’attention", "شنو خاصك تحسب ليه"),
      content: (road: OrientationRoadmap) => road.watchouts.map(tx).join(" "),
    },
  ];
  return (
    <Modal
      title={t("Comparer mes pistes", "نقارن المسارات")}
      onClose={onClose}
      wide
    >
      <div className="orient-comparison">
        <p>
          {t(
            "Compare les compromis. Le bon parcours dépend de ce qui compte pour toi et des conditions d’accès réelles.",
            "قارن الاختيارات. المسار المناسب كيتعلق بداكشي اللي مهم عندك وبشروط القبول.",
          )}
        </p>
        <div className="orient-table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">{t("Mes critères", "المعايير ديالي")}</th>
                {roads.map((road) => (
                  <th scope="col" key={road.id}>
                    <RoadIcon road={road} />
                    <span>{tx(road.title)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {roads.map((road) => (
                    <td key={road.id}>{row.content(road)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">{t("Prochaine étape", "الخطوة الجاية")}</th>
                {roads.map((road) => (
                  <td key={road.id}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onClose();
                        go("orientation", road.id);
                      }}
                    >
                      {t("Explorer", "نكتشف")}
                      <ArrowRight size={14} />
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="orient-small">
          {t(
            "Les durées sont des repères. Consulte les liens officiels de chaque carte pour les modalités exactes.",
            "المدة غير مؤشر. شوف المصادر الرسمية فكل خريطة باش تعرف التفاصيل.",
          )}
        </p>
      </div>
    </Modal>
  );
}
