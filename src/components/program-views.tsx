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
  curriculum: ["Programme pédagogique", "Contenu dyal formation"],
  prerequisites: ["Prérequis académiques", "Chorot dyal 9raya"],
  route: ["Voie de candidature", "Tri9 dyal candidature"],
  deadline: ["Date limite", "Akher ajal"],
  language: ["Niveau de français", "Niveau dyal français"],
  tuition: ["Frais annuels (€)", "Frais dyal l3am (€)"],
  eligibility: ["Votre éligibilité", "Wach katstejib l chorot?"],
  degree: ["Diplôme requis", "Diplôme lli khas"],
  documents: ["Documents demandés", "Lwra9 lli khas"],
  outcomes: ["Débouchés", "Afaq mihaniya"],
  instruction_language: ["Langue d’enseignement", "Logha dyal 9raya"],
  application_fee: ["Frais de candidature", "Frais candidature"],
  contact: ["Contact", "Contact"],
  program_url: ["Page de la formation", "Page dyal formation"],
  admission_url: ["Page des admissions", "Page dyal admissions"],
};
function classificationLabel(
  classification: string,
  t: (fr: string, ary?: string) => string,
) {
  return classification === "SAFER"
    ? t("Bonne cohérence", "Tnassob mzyan")
    : classification === "TARGET"
      ? t("À explorer", "Khas tktechef")
      : classification === "AMBITIOUS"
        ? t("Possible avec remise à niveau", "Momkin m3a ta2hil")
        : classification === "INELIGIBLE"
          ? t("Point bloquant à vérifier", "Khas t3awed tchecki")
          : t("À documenter", "Khas t3ammer lma3lomat");
}
function dimensionLabel(
  score: number | null,
  t: (fr: string, ary?: string) => string,
) {
  if (score === null) return t("À préciser", "Khas tawdi7");
  if (score >= 85) return t("Cohérent avec le profil", "Mnasb l profil");
  if (score >= 65) return t("À explorer", "Khas tktechef");
  return t("À renforcer", "Khas t9wi");
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
        eyebrow={t("DES CHOIX QUI ONT DU SENS", "KHTIYAR 3LA BAYNA")}
        title={t(
          "Trouvez votre prochaine formation.",
          "L9a formation lli jaya.",
        )}
        description={t(
          "Comparez l’adéquation, les contenus et les points à clarifier avant de choisir.",
          "9aren tnassob, contenu w no9at lli khas nwedd7o 9bel lkhtiyar.",
        )}
        action={
          <Button onClick={() => go("applications")}>
            <Bookmark size={16} />
            {t("Ma sélection", "Khtiyarat dyali")}
          </Button>
        }
      />
      <div className="search-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            aria-label={t("Rechercher une formation", "9elleb 3la formation")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(
              "Formation, établissement, domaine…",
              "Formation, mo2assasa, domaine…",
            )}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label={t("Effacer la recherche", "7yed recherche")}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <select
          aria-label={t("Filtrer par ville", "Khtar lmdina")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="all">{t("Toutes les villes", "Ga3 lmdoun")}</option>
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
          ["all", "Toutes les formations", "Ga3 formations"],
          ["saved", "Enregistrées", "Lli 7fedti"],
          ["SAFER", "Bonne cohérence", "Tnassob mzyan"],
          ["TARGET", "À explorer", "Khas tktechef"],
          ["AMBITIOUS", "Avec remise à niveau", "M3a ta2hil"],
          ["UNASSESSED", "À évaluer", "Khas ta9yim"],
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
          {t("formations à explorer", "formations bach t9elleb")}
        </span>
        <span>
          {t("Tri : pertinence du profil", "Tri : tnassob m3a profil")}
        </span>
      </div>
      {filtered.length === 0 ? (
        <Empty
          title={t(
            "Aucune formation dans cette vue",
            "Ma kayna 7ta formation hna",
          )}
          description={
            data.candidate.is_demo
              ? t(
                  "Essayez une autre recherche ou retirez un filtre.",
                  "Jerrab recherche okhra wlla 7yed filtre.",
                )
              : t(
                  "Le catalogue de production est vide. Les formations fictives restent réservées à la démonstration.",
                  "Catalogue lm2ekked mazal khawi. Formations tajribiya ghir f démo.",
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
                {t("Réinitialiser les filtres", "7yed les filtres")}
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
          "Had catégories kaybeyno tnassob bin profil dyalek w lma3lomat lli 3arfin 3la formation. Ma kaytwa33doch l9oboul : 7ell kol fiche bach tchouf chorot w no9at lli khas tchecki.",
        )}
      </Notice>
      {compare.length > 0 && (
        <div className="comparison-bar">
          <GitCompareArrows size={19} />
          <strong>
            {compare.length}/3{" "}
            {t("formations à comparer", "formations lmo9arana")}
          </strong>
          <Button
            variant="primary"
            disabled={compare.length < 2}
            onClick={() => setShowCompare(true)}
          >
            {t("Comparer", "9aren")}
            <ArrowRight size={16} />
          </Button>
          <button
            className="icon-button"
            onClick={() => setCompare([])}
            aria-label={t("Vider la comparaison", "7yed mo9arana")}
          >
            <X size={18} />
          </button>
        </div>
      )}
      {showCompare && (
        <Modal
          title={t("Comparer vos options", "9aren l2ikhtiyarat")}
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
                      t("À préciser", "Khas tawdi7")}
                  </p>
                  <dl>
                    <dt>{t("Budget annuel", "Budget l3am")}</dt>
                    <dd>{p.claims.tuition.value ?? "—"} €</dd>
                    <dt>{t("Langue", "Logha")}</dt>
                    <dd>{p.claims.language.value ?? "—"}</dd>
                    <dt>{t("Points bloquants", "No9at lli khas t7ell")}</dt>
                    <dd>{m.blockers.length}</dd>
                  </dl>
                  <p>{p.description}</p>
                  <Button
                    onClick={() => {
                      setShowCompare(false);
                      go("programs", p.id);
                    }}
                  >
                    {t("Voir la fiche", "Chouf fiche")}
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
            s?.saved ? "7yed mn favoris" : "7fed " + p.title,
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
          {p.is_mock ? t("FICTIF", "TAJRIBI") : t("Catalogue", "Catalogue")}
        </span>
      </div>
      <p className="program-description">{p.description}</p>
      <div className="fit-summary">
        <div>
          <span>{t("Adéquation du profil", "Tnassob m3a profil")}</span>
          <strong className="fit-label fit-label-large">
            {classificationLabel(m.classification, t)}
          </strong>
        </div>
        <p>
          {t("Informations documentées", "Ma3lomat m9eyda")} : {m.coverage}% ·{" "}
          {m.blockers.length} {t("points à vérifier", "no9at khas moraja3a")}
        </p>
        <p className="program-match-reason">
          {m.strengths[0] ??
            m.risks[0] ??
            t(
              "Ouvrez la fiche pour comprendre les prérequis.",
              "7ell fiche bach tfhem chorot.",
            )}
        </p>
      </div>
      <div className="program-card-actions">
        <label className="check-field">
          <input type="checkbox" checked={checked} onChange={onCompare} />
          {t("Comparer", "9aren")}
        </label>
        <LinkButton onClick={() => go("programs", p.id)}>
          {t("Voir la fiche", "Chouf fiche")}
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
        {t("Toutes les formations", "Ga3 formations")}
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
            {t("Enseignement en français", "9raya b français")}
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
            selection?.selected ? "F khtiyarat dyali" : "Nkhtarha",
          )}
        </Button>
      </div>
      {p.is_mock && (
        <Notice kind="warning">
          {t(
            "Fiche fictive de démonstration. Les critères, frais et dates ci-dessous ne décrivent aucune admission réelle.",
            "Fiche tajribiya. Chorot, frais w dates hna ma kaywassfouch chi admission 7a9i9iya.",
          )}
        </Notice>
      )}
      <div className="tabs">
        {[
          ["research", "Fiche intelligence", "Fiche intelligence"],
          ["why", "Pourquoi ce choix ?", "3lach had lkhtiyar?"],
          ["questions", `Questions (${qs.length})`, `As2ila (${qs.length})`],
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
                  "Chno 3refna w chno ba9i khas ta2kid.",
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
                        "Lma3loma mazal ma kaynach",
                      )}
                  </p>
                  <div className="claim-source">
                    {claim.source_type === "mock" ? (
                      <span>{t("Source fictive", "Dalil tajribi")}</span>
                    ) : claim.source_url?.startsWith("https://") ? (
                      <a
                        href={claim.source_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("Consulter la source", "Chouf source")}
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span>
                        {t(
                          "Correspondance du candidat",
                          "Correspondance dyal candidat",
                        )}
                      </span>
                    )}
                    {claim.retrieved_at && (
                      <span>
                        · {t("Revu le", "Traje3 f")} {claim.retrieved_at}
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
                          "Wejjed talab tawdi7",
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
                <h2>{t("Une recommandation expliquée", "Tawsiya mcher7a")}</h2>
                <p className="spaced-copy">
                  {t(
                    "Cette lecture s’appuie sur les dimensions renseignées. Une information inconnue reste à vérifier : elle n’est jamais considérée comme acquise.",
                    "Had lqra2a kat3tamed 3la lma3lomat lli kaynin. Lma3loma lli ma 3refnach katb9a khas tchecka : ma kan7sbohach mwejda.",
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
                <h3>{t("Points forts", "No9at l9owa")}</h3>
                <ul>
                  {m.strengths.map((s) => (
                    <li key={s}>{t(s)}</li>
                  ))}
                </ul>
                <h3>{t("Pourquoi rester prudent ?", "3lach khas l7der?")}</h3>
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
                  title={t("Aucune question ouverte", "Ma kayn 7ta sou2al")}
                  description={t(
                    "Depuis la fiche, préparez une demande sur une exigence incertaine.",
                    "Mn fiche, wejjed sou2al 3la chi chart ma wad7ch.",
                  )}
                  action={
                    <Button onClick={() => setTab("research")}>
                      {t("Revenir à la fiche", "Rje3 l fiche")}
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
                        {t("Ouvrir la clarification", "7ell tawdi7")}
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
            <span>{t("Adéquation du profil", "Tnassob m3a profil")}</span>
            <div className="big-score fit-label-large">
              {classificationLabel(m.classification, t)}
            </div>
            <p>
              {t(
                "Une lecture des éléments déjà connus. Les prérequis et les informations manquantes restent à vérifier.",
                "Qra2a dyal lma3lomat lli 3arfin daba. Chorot w lma3lomat nna9sa khas tchecka.",
              )}
            </p>
            <button className="text-link" onClick={() => setTab("why")}>
              {t("Comprendre cette cohérence", "Fhem had tnassob")}
              <ArrowRight size={15} />
            </button>
          </section>
          <section className="panel gate-panel">
            <div className="panel-top">
              <h3>{t("Avant de candidater", "9bel ma tdfe3")}</h3>
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
                  "Fiche kamla f had scénario. Mazal khas audit dossier.",
                )}
              </p>
            )}
            <Button onClick={() => go("audit")}>
              {t("Vérifier mon dossier", "Raje3 dossier dyali")}
            </Button>
          </section>
          <Notice>
            {t(
              "Statut connecté : à vérifier. Une procédure parallèle peut être nécessaire.",
              "Statut connecté khas moraja3a. Momkin khas procédure okhra.",
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
      title={t("Confirmer votre choix", "2ekked lkhtiyar dyalek")}
      onClose={onClose}
    >
      <h3>{p.title}</h3>
      <p className="spaced-copy">{p.institution.name}</p>
      <Notice kind={m.blockers.length ? "warning" : "info"}>
        {t(
          "Sélectionner prépare votre stratégie. Cela ne dépose aucune candidature et ne lève aucun point bloquant.",
          "Lkhtiyar kaywejjed stratégie. Ma kaydfe3 7ta candidature w ma kay7ell 7ta mochkil.",
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
            "Khtarit had formation w 9rit no9at lli khas moraja3a.",
          )}
        </label>
        <Button type="submit" variant="primary">
          <Check size={16} />
          {t("Ajouter à ma sélection", "Zid l khtiyarat dyali")}
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
      ? t("Approuver le brouillon", "Wafe9 3la moswadda")
      : q.status === "APPROVED"
        ? t("Enregistrer mon envoi manuel", "Sejjel belli sift b yeddi")
        : q.status === "ANSWERED"
          ? t("Confirmer la conclusion", "2ekked lkholassa")
          : t("Enregistrer la réponse", "Sejjel ljawab");
  return (
    <Modal
      title={t(
        "Clarification · suivi de la demande",
        "Tawdi7 · tatabbo3 talab",
      )}
      onClose={onClose}
      wide
    >
      <div className="panel-top">
        <Badge status={q.status} />
        <small>
          {t(
            "Aucun email envoyé par CampusPath",
            "CampusPath ma kaysift 7ta email",
          )}
        </small>
      </div>
      <Field
        label={t(
          "Objet du message (français)",
          "Objet dyal message (français)",
        )}
      >
        <input value={q.subject} readOnly />
      </Field>
      <Field label={t("Brouillon en français", "Moswadda b français")}>
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
                  "Tcopiat moswadda. Ma tsift 7ta email.",
                ),
              );
            } catch {
              notify(
                t(
                  "Sélectionnez le texte pour le copier.",
                  "Khtar texte bach tcopih.",
                ),
              );
            }
          }}
        >
          <Copy size={16} />
          {t("Copier le brouillon", "Copier moswadda")}
        </Button>
        <span className="muted">
          {q.recipient ||
            t("Contact officiel à rechercher", "9elleb 3la contact rasmi")}
        </span>
      </div>
      {q.response && (
        <Notice>
          <strong>{t("Réponse saisie", "Ljawab lli dkhelti")}</strong>
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
                "Lli sift lih message b se7",
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
              label={t("Collez la réponse reçue", "Lssa9 ljawab lli wselek")}
            >
              <textarea name="response" required rows={5} maxLength={10000} />
            </Field>
          )}
          {action === "resolve" && (
            <>
              <Field
                label={t(
                  "Conclusion appuyée par la réponse",
                  "Lkholassa 3la 7sab ljawab",
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
                    "Lma3loma lm2ekkda lli ndirou f fiche",
                  )}
                >
                  {q.claim_key === "eligibility" ? (
                    <select name="normalized" required>
                      <option value="">
                        {t(
                          "Choisir une décision explicite",
                          "Khtar 9arar wad7",
                        )}
                      </option>
                      <option value="OUI">
                        {t("Conditions satisfaites", "Chorot mtwefrin")}
                      </option>
                      <option value="NON">
                        {t(
                          "Conditions non satisfaites",
                          "Chorot ma mtwefrin-ch",
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
                ? "Kan2ekked belli ana lli sift had message."
                : action === "resolve"
                  ? "Raja3t belli ljawab kay2ekked had lkholassa."
                  : "Raja3t lma3lomat w kan2ekked had lkhotwa.",
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
        eyebrow={t("VOUS AVEZ LE DERNIER MOT", "L9ARAR DYALEK")}
        title={t(
          "Une sélection réfléchie. Un cap clair.",
          "Khtiyarat m9addin. Wijha wad7a.",
        )}
        description={t(
          "Hiérarchisez vos choix et suivez chaque étape de votre candidature.",
          "Retteb khtiyarat dyalek w tbe3 kol mar7ala dyal candidature.",
        )}
        action={
          <Button onClick={() => go("programs")}>
            <Plus size={16} />
            {t("Explorer les formations", "Chouf formations")}
          </Button>
        }
      />
      <div className="strategy-panel panel">
        <div>
          <h2>
            {selected.length} <small>/ {data.cycle.max_choices}</small>
          </h2>
          <p>{t("choix sélectionnés", "khtiyarat msejlin")}</p>
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
          {t("Limites de la procédure", "7odoud procédure")}
          <ArrowUpRight size={14} />
        </a>
      </div>
      <Notice>
        {t(
          selected.length < 2
            ? "Explorez plusieurs options pour diversifier votre stratégie. Aucune répartition fixe n’est imposée."
            : "Vérifiez la diversité des exigences et des parcours. Un bon équilibre dépend de vos priorités, pas d’un quota automatique.",
          selected.length < 2
            ? "Chouf plusieurs options bach tnawwe3 stratégie. Ma kaynach ta9sima tabta."
            : "Raje3 tanawwo3 chorot w masarat. Tawazon 3la 7sab l2awlawiyat dyalek.",
        )}
      </Notice>
      {selections.length === 0 ? (
        <Empty
          title={t(
            "Votre sélection commence par un premier choix.",
            "Khtiyarat dyalek katbda b awal formation.",
          )}
          description={t(
            "Explorez les fiches puis enregistrez les formations qui vous intéressent.",
            "Chouf fiches w 7fed formations lli 3ejbok.",
          )}
          action={
            <Button variant="primary" onClick={() => go("programs")}>
              {t("Explorer le catalogue", "Chouf catalogue")}
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
                  <Field label={t("Rang", "Rang")}>
                    <input
                      type="number"
                      defaultValue={s.rank}
                      min={1}
                      max={100}
                      aria-label={t("Rang de " + p.title, "Rang " + p.title)}
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
                          `${m.blockers.length} no9at khas t7ell`,
                        )
                      : t("Fiche de recherche complète", "Fiche kamla")}
                  </span>
                  <Badge status={m.classification} />
                  <span className="fit-label">
                    {classificationLabel(m.classification, t)}
                  </span>
                </div>
                <div className="application-actions">
                  <LinkButton onClick={() => go("programs", p.id)}>
                    {t("Revoir la fiche", "Raje3 fiche")}
                  </LinkButton>
                  {!s.selected ? (
                    <Button variant="primary" onClick={() => setSelect(p)}>
                      {t("Confirmer ce choix", "2ekked lkhtiyar")}
                    </Button>
                  ) : (
                    <Button onClick={() => setTrack(p.id)}>
                      {t("Suivre la réponse", "Tbe3 ljawab")}
                    </Button>
                  )}
                  <button
                    className="text-link danger-link"
                    onClick={() => {
                      if (
                        window.confirm(
                          t(
                            "Retirer cette formation de votre sélection ?",
                            "N7yed had formation mn lkhtiyarat?",
                          ),
                        )
                      )
                        void mutate(`/programs/${p.id}/selection`, {
                          action: "remove",
                        });
                    }}
                  >
                    {t("Retirer", "7yed")}
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
                "Khtiyarat dyalek kat3ti wijha l dossier.",
              )}
            </h3>
            <p>
              {t(
                "Construisez maintenant votre CV et vos projets à partir des faits.",
                "Wejjed daba CV w projets mn lma3lomat dyalek.",
              )}
            </p>
          </div>
          <Button variant="primary" onClick={() => go("cv")}>
            {t("Préparer mon CV", "Nwejjed CV")}
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
      title={t("Suivi de candidature", "Tatabbo3 candidature")}
      onClose={onClose}
    >
      <h3>{p.title}</h3>
      <p className="spaced-copy">
        {t("Statut actuel", "Statut daba")} : <Badge status={s.status} />
      </p>
      <Notice>
        {t(
          "Vous enregistrez une action ou une réponse reçue en dehors de CampusPath. Aucun dossier n’est transmis par cette application.",
          "Katsejjel action wlla jawab barra mn CampusPath. L’app ma katsift 7ta dossier.",
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
          <Field label={t("Nouvel état constaté", "Statut jdid lli w9e3")}>
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
              "Référence / ljawab lli wsel",
            )}
          >
            <textarea name="note" maxLength={3000} rows={3} />
          </Field>
          <label className="check-field">
            <input type="checkbox" required />
            {t(
              "Je confirme que cet événement a réellement eu lieu.",
              "Kan2ekked belli had l7adath w9e3 b se7.",
            )}
          </label>
          <Button variant="primary" type="submit">
            {t("Enregistrer le suivi", "Sejjel tatabbo3")}
          </Button>
        </form>
      ) : (
        <p>
          {t(
            "Ce choix a atteint un état final.",
            "Had lkhtiyar wsel l statut final.",
          )}
        </p>
      )}
    </Modal>
  );
}
