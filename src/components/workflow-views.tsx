"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  Mic,
  Play,
  Printer,
  Save,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { z } from "zod";
import { request } from "@/lib/api";
import type { Artifact } from "@/lib/schema";
import type { View } from "@/lib/i18n";
import {
  Badge,
  Button,
  Empty,
  Field,
  Heading,
  LinkButton,
  Modal,
  Notice,
  Progress,
  SectionTitle,
  useApp,
} from "./ui";
export function MaterialsView({ kind }: { kind: "cv" | "motivation" }) {
  const { data, t, go, mutate } = useApp(),
    c = data.candidate,
    selected = c.selections.filter((s) => s.selected),
    [pid, setPid] = useState(selected[0]?.program_id ?? ""),
    [narrative, setNarrative] = useState(c.narrative),
    [approval, setApproval] = useState<Artifact | null>(null);
  const artifact = c.artifacts.find(
      (a) => a.kind === kind && (kind === "cv" || a.program_id === pid),
    ),
    m = data.matches.find((m) => m.program_id === pid),
    canGenerate =
      selected.length > 0 &&
      (kind === "cv" || (c.narrative.approved && !!m?.ready));
  return (
    <>
      <Heading
        eyebrow={t(
          "LES FAITS DEVIENNENT VOTRE HISTOIRE",
          "LMA3LOMAT KATWELLI 7KAYTEK",
        )}
        title={
          kind === "cv"
            ? t(
                "Votre parcours. Le bon angle.",
                "Masar dyalek. B tari9a mnasba.",
              )
            : t(
                "Une motivation qui vous ressemble.",
                "Motivation kat3ebber 3lik.",
              )
        }
        description={
          kind === "cv"
            ? t(
                "Un CV préparé depuis votre profil, adapté aux formations que vous avez choisies.",
                "CV mn profil dyalek, mnasb l formations lli khtariti.",
              )
            : t(
                "Un projet cohérent, puis un brouillon spécifique à chaque formation.",
                "Projet mtanass9, men be3d moswadda l kol formation.",
              )
        }
      />
      <Notice>
        {t(
          "Les documents officiels restent en français. Les brouillons de démonstration utilisent vos données et des modèles déterministes ; aucun service d’IA externe n’est connecté.",
          "Documents officiels kayb9aw b français. Moswaddat démo katsta3mel ma3lomat dyalek w modèles déterministes ; ma kaynach IA externe connectée.",
        )}
      </Notice>
      {selected.length === 0 ? (
        <Empty
          title={t("Vos choix viennent d’abord.", "Khtiyarat dyalek lowwel.")}
          description={t(
            "Sélectionnez au moins une formation avant de préparer votre CV ou vos motivations.",
            "Khtar formation 3la l2a9al 9bel ma twejjed CV w motivations.",
          )}
          action={
            <Button variant="primary" onClick={() => go("programs")}>
              {t("Choisir mes formations", "Nkhtar formations")}
              <ArrowRight size={16} />
            </Button>
          }
        />
      ) : (
        <>
          {kind === "motivation" && (
            <section className="panel narrative-panel">
              <div className="panel-top">
                <div>
                  <h2>
                    {t(
                      "Votre fil conducteur",
                      "Lkhet lli kayrbet masar dyalek",
                    )}
                  </h2>
                  <p>
                    {t(
                      "Passé → choix d’études → compétences → métier → projet à long terme",
                      "Lmad i".replace("Lmad i", "Lmadi") +
                        " → 9raya → compétences → métier → projet lmosta9bal",
                    )}
                  </p>
                </div>
                <Badge status={c.narrative.approved ? "APPROVED" : "DRAFT"} />
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  await mutate(
                    "/narrative",
                    { ...narrative, approved: f.get("approved") === "on" },
                    "PUT",
                  );
                }}
              >
                <div className="form-grid">
                  <Field
                    label={t("Mon projet d’études", "Projet dyal 9rayti")}
                    hint={t(
                      "Reliez vos acquis, vos choix et les compétences que vous souhaitez développer.",
                      "Rbet lli 9riti, lkhtiyarat w compétences lli bghiti twesse3.",
                    )}
                  >
                    <textarea
                      rows={6}
                      value={narrative.study_project}
                      minLength={30}
                      maxLength={6000}
                      onChange={(e) =>
                        setNarrative({
                          ...narrative,
                          study_project: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>
                  <Field
                    label={t("Mon projet professionnel", "Projet mihani dyali")}
                    hint={t(
                      "Expliquez le métier visé et les étapes réalistes pour y parvenir.",
                      "Chre7 métier lli bghiti w lkhotwat lmomkina bach twsel lih.",
                    )}
                  >
                    <textarea
                      rows={6}
                      value={narrative.professional_project}
                      minLength={30}
                      maxLength={6000}
                      onChange={(e) =>
                        setNarrative({
                          ...narrative,
                          professional_project: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>
                </div>
                <label className="check-field">
                  <input name="approved" type="checkbox" />
                  {t(
                    "Je valide ces projets comme mes déclarations de référence.",
                    "Kan2ekked had projets ka déclarations dyali.",
                  )}
                </label>
                <div className="form-actions">
                  <p>
                    {t(
                      "Un changement invalide les documents préparés à partir de l’ancienne version.",
                      "Taghyir kaykhelli documents l9dam khas ytraj3o.",
                    )}
                  </p>
                  <Button type="submit" variant="primary">
                    <Save size={16} />
                    {t("Enregistrer mes projets", "Sejjel projets dyali")}
                  </Button>
                </div>
              </form>
            </section>
          )}
          <div className="material-workspace">
            <div>
              <SectionTitle
                title={
                  kind === "cv"
                    ? t("Mon CV de candidature", "CV dyal candidature")
                    : t("Brouillon par formation", "Moswadda l kol formation")
                }
                action={
                  kind === "motivation" ? (
                    <select
                      aria-label={t(
                        "Formation pour la motivation",
                        "Formation dyal motivation",
                      )}
                      value={pid}
                      onChange={(e) => setPid(e.target.value)}
                    >
                      {selected.map((s) => (
                        <option key={s.program_id} value={s.program_id}>
                          {
                            data.programs.find((p) => p.id === s.program_id)
                              ?.title
                          }
                        </option>
                      ))}
                    </select>
                  ) : undefined
                }
              />
              {artifact ? (
                <section className="panel artifact-paper">
                  <div className="panel-top no-print">
                    <Badge
                      status={
                        artifact.source_revision !== c.revision
                          ? "NEEDS_REVIEW"
                          : artifact.approved
                            ? "APPROVED"
                            : "DRAFT"
                      }
                    />
                    <span className="muted">
                      {t("Version française", "Version française")}
                    </span>
                  </div>
                  <pre className="print-artifact" lang="fr">
                    {artifact.text}
                  </pre>
                  <div className="artifact-actions no-print">
                    <Button
                      onClick={() => {
                        const url = URL.createObjectURL(
                          new Blob([artifact.text], {
                            type: "text/plain;charset=utf-8",
                          }),
                        );
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `CampusPath-${kind}-${artifact.program_id ?? "profil"}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={16} />
                      {t("Exporter le texte", "Télécharger texte")}
                    </Button>
                    <Button onClick={() => window.print()}>
                      <Printer size={16} />
                      {t("Imprimer / PDF", "Imprimer / PDF")}
                    </Button>
                    <Button
                      variant="primary"
                      disabled={
                        artifact.approved ||
                        artifact.source_revision !== c.revision
                      }
                      onClick={() => setApproval(artifact)}
                    >
                      <Check size={16} />
                      {t("Valider après relecture", "2ekked men be3d moraja3a")}
                    </Button>
                  </div>
                </section>
              ) : (
                <Empty
                  title={t(
                    "Votre brouillon apparaîtra ici.",
                    "Moswadda dyalek ghadi tban hna.",
                  )}
                  description={
                    kind === "cv"
                      ? t(
                          "Les études, projets, expériences et langues viennent de votre profil.",
                          "9raya, projets, tajarob w loghat mn profil dyalek.",
                        )
                      : t(
                          "Validez vos projets et résolvez les exigences de la fiche formation pour continuer.",
                          "2ekked projets w 7ell no9at fiche formation bach tkemmel.",
                        )
                  }
                />
              )}
            </div>
            <aside>
              <SectionTitle title={t("Avant de générer", "9bel ma twejjed")} />
              <section className="panel material-gates">
                <div className="gate-check">
                  <CheckCircle2 size={19} />
                  {t("Formations sélectionnées", "Formations mkhtarin")}
                </div>
                {kind === "motivation" && (
                  <>
                    <div
                      className={`gate-check ${c.narrative.approved ? "" : "pending"}`}
                    >
                      {c.narrative.approved ? (
                        <CheckCircle2 size={19} />
                      ) : (
                        <Clock3 size={19} />
                      )}{" "}
                      {t(
                        "Projets personnels validés",
                        "Projets dyalek m2ekkdin",
                      )}
                    </div>
                    <div className={`gate-check ${m?.ready ? "" : "pending"}`}>
                      {m?.ready ? (
                        <CheckCircle2 size={19} />
                      ) : (
                        <Clock3 size={19} />
                      )}{" "}
                      {t(
                        "Recherche formation complète",
                        "Recherche dyal formation kamla",
                      )}
                    </div>
                    {m?.blockers.map((b) => (
                      <p className="small-blocker" key={b}>
                        {t(b)}
                      </p>
                    ))}
                  </>
                )}
                <Button
                  variant="primary"
                  disabled={!canGenerate}
                  onClick={() =>
                    mutate("/artifacts", {
                      kind,
                      program_id: kind === "motivation" ? pid : null,
                    })
                  }
                >
                  <Sparkles size={16} />
                  {t(
                    artifact
                      ? "Régénérer le brouillon"
                      : "Préparer le brouillon",
                    artifact ? "3awed wejjed moswadda" : "Wejjed moswadda",
                  )}
                </Button>
                {!canGenerate && (
                  <LinkButton onClick={() => go("programs", pid)}>
                    {t("Résoudre les points bloquants", "7ell no9at lli ba9in")}
                  </LinkButton>
                )}
              </section>
              {artifact && (
                <section className="panel quality-panel">
                  <h3>{t("Contrôle qualité", "Moraja3at ljawda")}</h3>
                  {kind === "motivation" && (
                    <div className="character-count">
                      <strong>{Array.from(artifact.text).length}</strong> /{" "}
                      {data.cycle.motivation_limit}{" "}
                      {t("caractères", "caractères")}
                      <Progress
                        percent={Math.min(
                          100,
                          (Array.from(artifact.text).length /
                            data.cycle.motivation_limit) *
                            100,
                        )}
                      />
                    </div>
                  )}
                  {artifact.quality_warnings.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                  <details>
                    <summary>
                      {t(
                        "Voir les références des assertions",
                        "Chouf dalil dyal lma3lomat",
                      )}
                    </summary>
                    {artifact.assertions.map((a, i) => (
                      <div className="assertion" key={i}>
                        <strong>{a.text}</strong>
                        <p>
                          {a.fact_ids
                            .map(
                              (id) =>
                                c.facts.find((f) => f.id === id)?.label ||
                                c.education.find((e) => e.id === id)?.label ||
                                c.experiences.find((e) => e.id === id)?.title ||
                                (id.startsWith("narrative")
                                  ? "Projet validé par le candidat"
                                  : id),
                            )
                            .join(" · ")}
                        </p>
                        {a.program_fields.length > 0 && (
                          <p>{a.program_fields.join(" · ")}</p>
                        )}
                      </div>
                    ))}
                  </details>
                </section>
              )}
              <Notice>
                {t(
                  "Aucune compétence, expérience ou exigence n’est ajoutée par le générateur. Relisez chaque déclaration avant de l’utiliser.",
                  "Générateur ma kayzid 7ta compétence, expérience wlla chart. Raje3 kol déclaration 9bel ma tsta3melha.",
                )}
              </Notice>
            </aside>
          </div>
        </>
      )}
      {approval && (
        <Modal
          title={t("Valider ce document", "2ekked had document")}
          onClose={() => setApproval(null)}
        >
          <Notice>
            {t(
              "Cette validation confirme votre relecture. Le document ne sera envoyé à aucun établissement.",
              "Ta2kid kay3ni raja3ti document. Ma ghadi ytsift l 7ta mo2assasa.",
            )}
          </Notice>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await mutate(`/artifacts/${approval.id}/approve`, {
                  confirmed: true,
                })
              )
                setApproval(null);
            }}
          >
            <label className="check-field">
              <input required type="checkbox" />
              {t(
                "J’ai relu le contenu, vérifié ses sources et confirmé qu’il reflète mon parcours.",
                "Raja3t contenu w dalil w 2ekkedt belli kay3ebber 3la masar dyali.",
              )}
            </label>
            <Button variant="primary" type="submit">
              {t("Valider", "2ekked")}
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}

const feedbackSchema = z.object({
  assessment: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  follow_up: z.string(),
  engine: z.string(),
});
export function InterviewView() {
  const { data, t, go } = useApp(),
    [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(""),
    [answerMode, setAnswerMode] = useState<"written" | "unknown" | "prefer">(
      "written",
    ),
    [busy, setBusy] = useState(false),
    [feedback, setFeedback] = useState<z.infer<typeof feedbackSchema> | null>(
      null,
    ),
    [error, setError] = useState("");
  const selected = data.candidate.selections.find((s) => s.selected),
    program = data.programs.find((p) => p.id === selected?.program_id),
    goal = data.candidate.preferences.goal;
  const questions = [
    t(
      "Pourquoi souhaitez-vous étudier en France ?",
      "3lach bghiti t9ra f Fransa?",
    ),
    program
      ? `Pourquoi avez-vous choisi ${program.title} ?`
      : t(
          "Quelle formation correspond à votre projet, et pourquoi ?",
          "Ach men formation mnasba l projet dyalek w 3lach?",
        ),
    t(
      "Quel acquis de votre parcours vous prépare à cette formation ?",
      "Ach men 7aja f 9raytek wejdatek l had formation?",
    ),
    goal
      ? `Comment votre projet vous prépare-t-il au métier : ${goal} ?`
      : t(
          "Quel métier souhaitez-vous exercer après vos études ?",
          "Ach bghiti tkhdem men be3d l9raya?",
        ),
    t(
      "Comment comptez-vous financer vos études et votre séjour ?",
      "Kifach ghadi tkhalles 9raytek w lma3icha?",
    ),
    data.tasks.some((task) => task.id.startsWith("semester-"))
      ? t(
          "Comment expliquez-vous les relevés manquants dans votre dossier ?",
          "Kifach katfesser relevés nna9sin f dossier?",
        )
      : t(
          "Quelle difficulté de votre parcours avez-vous surmontée ?",
          "Ach men s3ouba f masar dyalek 9derti tjawezha?",
        ),
  ];
  return (
    <>
      <Heading
        eyebrow={t(
          "EXPLIQUER VOS CHOIX AVEC CLARTÉ",
          "CHRE7 KHTIYARAT B WODO7",
        )}
        title={t(
          "Votre projet, avec vos propres mots.",
          "Projet dyalek, b klamek nta.",
        )}
        description={t(
          "Entraînez-vous à partir de votre dossier, une question à la fois.",
          "Tderreb mn dossier dyalek, sou2al b sou2al.",
        )}
      />
      <div className="interview-layout">
        <section className="panel interview-card">
          <div className="panel-top">
            <span className="badge blue-badge">
              <Mic size={14} />
              {t("Simulation écrite", "Simulation b lktaba")}
            </span>
            <span className="muted">
              {index + 1} / {questions.length}
            </span>
          </div>
          <Progress percent={((index + 1) / questions.length) * 100} />
          <span className="interview-icon">
            <Mic size={29} />
          </span>
          <h2>{questions[index]}</h2>
          <p>
            {t(
              "Pourquoi cette question ? Elle relie une information de votre dossier à votre projet. Vous pouvez répondre, dire que vous ne savez pas encore ou passer.",
              "3lach had sou2al ? Kayrbet ma3loma mn dossier dyalek b projet dyalek. T9der tjawb, tgol mazal ma 3reftch, wla tdouz.",
            )}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                setFeedback(
                  feedbackSchema.parse(
                    await request("/interview", {
                      question: questions[index],
                      answer,
                    }),
                  ),
                );
              } catch (e) {
                setError(e instanceof Error ? e.message : "Erreur");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label={t("Votre réponse", "Ljawab dyalek")}>
              <textarea
                rows={7}
                maxLength={6000}
                required
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setAnswerMode("written");
                }}
                placeholder={t(
                  "Ce qui m’intéresse dans ce parcours…",
                  "Lli kay3jebni f had masar…",
                )}
              />
            </Field>
            <div className="interview-response-options">
              <button
                type="button"
                onClick={() => {
                  setAnswer(t("Je ne sais pas encore.", "Mazal ma 3reftch."));
                  setAnswerMode("unknown");
                }}
              >
                {t("Je ne sais pas encore", "Mazal ma 3reftch")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnswer(
                    t("Je préfère ne pas répondre.", "Kanfdal ma njawbech."),
                  );
                  setAnswerMode("prefer");
                }}
              >
                {t("Je préfère ne pas répondre", "Kanfdal ma njawbech")}
              </button>
              {answerMode !== "written" && (
                <span className="muted">
                  {t(
                    "Cette réponse sera conservée comme telle, sans hypothèse ajoutée.",
                    "Had ljawab ghadi yb9a kima howa, bla chi tafsir zayed.",
                  )}
                </span>
              )}
            </div>
            <div className="form-actions">
              <span>
                {answer.trim().split(/\s+/).filter(Boolean).length}{" "}
                {t("mots", "kelma")}
              </span>
              <Button
                variant="primary"
                type="submit"
                disabled={busy || !answer.trim()}
              >
                <Play size={15} />
                {t("Obtenir un retour", "Nchouf moraja3a")}
              </Button>
            </div>
          </form>
          {error && <div className="error-box">{error}</div>}
          {feedback && (
            <div className="interview-feedback">
              <h3>
                {t("Votre retour de préparation", "Moraja3a dyal ta7dir")}
              </h3>
              <p>{t(feedback.assessment)}</p>
              {feedback.strengths.map((s) => (
                <Notice key={s} kind="success">
                  {t(s)}
                </Notice>
              ))}
              {feedback.improvements.map((s) => (
                <Notice key={s}>{t(s)}</Notice>
              ))}
              <h3>
                {t(
                  "Pour aller plus loin",
                  "Bach tzid twa d d a7".replace("twa d d a7", "twadda7"),
                )}
              </h3>
              <p>{t(feedback.follow_up)}</p>
            </div>
          )}
          <div className="form-actions">
            <Button
              disabled={index === 0}
              onClick={() => {
                setIndex(index - 1);
                setAnswer("");
                setFeedback(null);
              }}
            >
              {t("Précédent", "Lli 9bel")}
            </Button>
            <Button
              onClick={() => {
                setIndex((index + 1) % questions.length);
                setAnswer("");
                setAnswerMode("written");
                setFeedback(null);
              }}
            >
              {t(
                index === questions.length - 1
                  ? "Recommencer"
                  : "Question suivante",
                index === questions.length - 1
                  ? "3awed mn lowwel"
                  : "Sou2al jdid",
              )}
              <ArrowRight size={16} />
            </Button>
            <Button
              onClick={() => {
                setIndex((index + 1) % questions.length);
                setAnswer("");
                setAnswerMode("written");
                setFeedback(null);
              }}
            >
              {t("Passer cette question", "Douz had sou2al")}
            </Button>
          </div>
        </section>
        <aside>
          <section className="panel">
            <h3>
              {t("Les repères d’une bonne réponse", "No9at dyal jawab mzyan")}
            </h3>
            <div className="rubric-list">
              {[
                [
                  t("Clarté", "Wodo7"),
                  t(
                    "Une idée principale, puis un exemple.",
                    "Fikra ra2issiya, men be3d exemple.",
                  ),
                ],
                [
                  t("Cohérence", "Tnassob"),
                  t(
                    "Un lien entre votre passé et votre projet.",
                    "Rabet bin lmadi dyalek w projet.",
                  ),
                ],
                [
                  t("Précision", "Di99a"),
                  t(
                    "Des matières et des contenus vérifiés.",
                    "Mawad w contenu m2ekkdin.",
                  ),
                ],
                [
                  t("Authenticité", "Ssid9"),
                  t(
                    "Vos propres raisons, dans vos mots.",
                    "L2asbab dyalek, b klamek nta.",
                  ),
                ],
              ].map(([h, p]) => (
                <div key={h}>
                  <CheckCircle2 size={17} />
                  <div>
                    <strong>{h}</strong>
                    <p>{p}</p>
                  </div>
                </div>
              ))}
            </div>
            <LinkButton onClick={() => go("motivations")}>
              {t("Relire mon projet", "N3awed n9ra projet")}
            </LinkButton>
          </section>
          <Notice>
            {t(
              "Grille indicative sur le texte. L’oral, la véracité et la qualité globale ne sont pas évalués automatiquement. Vos réponses ne sont pas conservées après avoir quitté cet écran.",
              "Grille ghir 3la texte. L’oral w ssi7a w ljawda ma kayt9eymoch automatiquement. Ljawab ma kayb9ach mlli tk h roj".replace(
                "tk h roj",
                "tkhroj",
              ) + " mn had page.",
            )}
          </Notice>
        </aside>
      </div>
    </>
  );
}

export function TasksView() {
  const { data, t, go, mutate } = useApp(),
    [filter, setFilter] = useState("all"),
    [cycle, setCycle] = useState(false),
    tasks = data.tasks.filter(
      (task) => filter === "all" || task.priority === filter,
    );
  return (
    <>
      <Heading
        eyebrow={t("UNE CHOSE À LA FOIS", "7AJA B 7AJA")}
        title={t(
          "Aujourd’hui, avancez sur l’essentiel.",
          "Lyom, khdem 3la darori.",
        )}
        description={t(
          "Les priorités se mettent à jour avec votre dossier. Corriger la cause résout la tâche.",
          "L2awlawiyat kaytbeddlo m3a dossier. Mlli kat7ell sabab, tâche kattsala.",
        )}
        action={
          <Button onClick={() => setCycle(true)}>
            <Clock3 size={16} />
            {t("Vérifier mon calendrier", "Nraja3 calendrier")}
          </Button>
        }
      />
      <div className="filter-chips">
        {[
          ["all", "Toutes", "Kolchi"],
          ["CRITICAL", "Critiques", "Darori"],
          ["HIGH", "Prioritaires", "Mosta3jil"],
          ["MEDIUM", "À explorer", "N9ellbo"],
        ].map(([id, fr, ary]) => (
          <button
            key={id}
            className={filter === id ? "active" : ""}
            onClick={() => setFilter(id)}
          >
            {t(fr, ary)}{" "}
            <span>
              {id === "all"
                ? data.tasks.length
                : data.tasks.filter((task) => task.priority === id).length}
            </span>
          </button>
        ))}
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <section
            className={`panel task-row ${task.status === "DONE" ? "done" : ""}`}
            key={task.id}
          >
            <div className={`task-priority ${task.priority.toLowerCase()}`}>
              {task.status === "DONE" ? (
                <Check size={18} />
              ) : task.priority === "CRITICAL" ? (
                <TriangleAlert size={19} />
              ) : (
                <Clock3 size={19} />
              )}
            </div>
            <div className="task-content">
              <div className="panel-top">
                <h3>{t(task.title)}</h3>
                <Badge status={task.priority} />
              </div>
              <p>{t(task.detail)}</p>
              {task.deadline && (
                <div className="task-deadline">
                  <Clock3 size={14} />
                  {task.deadline}
                  <Badge status={task.warning_state} />
                </div>
              )}
            </div>
            <Button
              onClick={() =>
                task.id === "cycle" || task.id === "cycle-deadline"
                  ? setCycle(true)
                  : go(task.route as View, task.program_id ?? undefined)
              }
            >
              {t(task.next_action)}
              <ArrowRight size={15} />
            </Button>
            {task.priority === "MEDIUM" && task.status !== "DONE" && (
              <button
                className="icon-button"
                onClick={() => mutate(`/tasks/${task.id}/complete`, {})}
                aria-label={t("Marquer comme terminé", "Sejjel belli tsala")}
              >
                <Check size={18} />
              </button>
            )}
          </section>
        ))}
      </div>
      {tasks.length === 0 && (
        <Empty
          title={t("Aucune priorité dans cette vue", "Ma kaynach priorité hna")}
          description={t(
            "Vos tâches évoluent avec les informations du dossier.",
            "Tâches kaytbeddlo m3a lma3lomat dyal dossier.",
          )}
        />
      )}
      <section className="panel source-reference">
        <ShieldCheck size={24} />
        <div>
          <h3>
            {t(
              "Le calendrier dépend de votre procédure.",
              "Calendrier 3la 7sab procédure dyalek.",
            )}
          </h3>
          <p>
            {t(
              "Consultez la source officielle avant de confirmer le cycle et les échéances.",
              "Chouf source rasmi 9bel ta2kid cycle w deadlines.",
            )}
          </p>
          <a
            className="text-link"
            href="https://www.maroc.campusfrance.org/calendrier-de-la-procedure-de-candidature-20262027"
            target="_blank"
            rel="noreferrer"
          >
            {t(
              "Calendrier Campus France Maroc",
              "Calendrier Campus France Maroc",
            )}
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      {cycle && <CycleModal onClose={() => setCycle(false)} />}
    </>
  );
}
function CycleModal({ onClose }: { onClose: () => void }) {
  const { data, t, mutate } = useApp();
  return (
    <Modal
      title={t(
        "Confirmer mon cycle de candidature",
        "2ekked cycle dyal candidature",
      )}
      onClose={onClose}
    >
      <Notice kind="warning">
        {t(
          "Les dates ne sont jamais copiées d’une année à l’autre. Reportez uniquement l’échéance officielle de votre procédure.",
          "Dates ma kaytn9louch mn 3am l 3am. Sejjel ghir date rasmiya dyal procédure dyalek.",
        )}
      </Notice>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            await mutate(
              "/cycle",
              {
                ...data.cycle,
                label: f.get("label"),
                deadline: f.get("deadline"),
                source_url: f.get("source"),
                verified_at: new Date().toISOString().slice(0, 10),
                status: "CONFIRMED",
              },
              "PUT",
            )
          )
            onClose();
        }}
      >
        <Field
          label={t("Intitulé officiel du cycle", "Smiya rasmiya dyal cycle")}
        >
          <input
            name="label"
            required
            defaultValue={
              data.cycle.label === "Cycle à confirmer" ? "" : data.cycle.label
            }
            placeholder="Ex. cycle et procédure correspondant à votre situation"
          />
        </Field>
        <Field label={t("Date limite officielle", "Akher ajal rasmi")}>
          <input
            name="deadline"
            type="date"
            required
            defaultValue={data.cycle.deadline ?? ""}
          />
        </Field>
        <Field
          label={t("URL officielle Campus France", "Lien rasmi Campus France")}
        >
          <input
            name="source"
            type="url"
            required
            defaultValue="https://www.maroc.campusfrance.org/calendrier-de-la-procedure-de-candidature-20262027"
          />
        </Field>
        <label className="check-field">
          <input required type="checkbox" />
          {t(
            "J’ai vérifié que ce cycle et cette échéance s’appliquent à ma situation.",
            "Raja3t belli had cycle w date kaynasbo situation dyali.",
          )}
        </label>
        <Button type="submit" variant="primary">
          {t("Enregistrer ma vérification", "Sejjel moraja3ti")}
        </Button>
      </form>
    </Modal>
  );
}

export function AuditView() {
  const { data, t, go } = useApp(),
    audit = data.audit;
  return (
    <>
      <Heading
        eyebrow={t(
          "RIEN D’IMPORTANT NE PASSE INAPERÇU",
          "7TA 7AJA MOHIMMA MA TFOUT",
        )}
        title={t(
          "Votre dossier, passé en revue.",
          "Dossier dyalek, traje3 kamel.",
        )}
        description={t(
          "Un état clair des pièces, du parcours, des choix et des documents de candidature.",
          "7ala wad7a dyal lwra9, masar, khtiyarat w documents candidature.",
        )}
        action={
          <Button onClick={() => go("tasks")}>
            <ClipboardCheck size={16} />
            {t("Voir mes priorités", "Chouf l2awlawiyat")}
          </Button>
        }
      />
      <section
        className={`audit-hero ${audit.critical.length ? "blocked" : "ready"}`}
      >
        <span className="audit-symbol">
          {audit.critical.length ? (
            <ShieldCheck size={38} />
          ) : (
            <CheckCircle2 size={38} />
          )}
        </span>
        <div>
          <Badge status={audit.state} />
          <h2>
            {audit.critical.length
              ? t(
                  "Une dernière ligne droite à préparer.",
                  "Mazal chi khotwat bach tk e mmel.".replace(
                    "tk e mmel",
                    "tkemmel",
                  ),
                )
              : t("Les contrôles sont satisfaits.", "Lmoraja3a dazet.")}
          </h2>
          <p>
            {t(
              "La complétude mesure le contenu renseigné. La préparation exige des pièces et des conditions vérifiées.",
              "Ch7al kammelti kay9iss ma3lomat m3emrin. Bach twjed, khas lwra9 w chorot m2ekkdin.",
            )}
          </p>
        </div>
        <div className="audit-percentage">
          <strong>{data.completeness.percent}%</strong>
          <span>{t("dossier renseigné", "dossier m3emmer")}</span>
        </div>
      </section>
      <div className="audit-stat-grid">
        {[
          [
            audit.critical.length,
            t("Points bloquants", "No9at kay7ebso dossier"),
            "red",
          ],
          [audit.warnings.length, t("Vigilances", "No9at l2intibah"), "amber"],
          [
            audit.ready_items.length,
            t("Éléments vérifiés", "7wayej m2ekkda"),
            "green",
          ],
        ].map(([n, l, color]) => (
          <div className="panel" key={String(l)}>
            <span className={`audit-count ${color}`}>{n}</span>
            <h3>{l}</h3>
          </div>
        ))}
      </div>
      <div className="audit-columns">
        <section className="panel">
          <h2>
            <TriangleAlert size={21} />
            {t(
              "À résoudre avant toute candidature",
              "Khas t7ell 9bel candidature",
            )}
          </h2>
          <ul className="audit-list">
            {audit.critical.map((x, i) => (
              <li key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{t(x)}</p>
              </li>
            ))}
          </ul>
          {audit.critical.length === 0 && (
            <p>
              {t(
                "Aucun blocage détecté par les règles configurées.",
                "Ma kayn 7ta blocage f règles lli msejlin.",
              )}
            </p>
          )}
          <LinkButton onClick={() => go("tasks")}>
            {t("Passer à l’action", "Nbda nkhdem")}
          </LinkButton>
        </section>
        <div className="stack">
          <section className="panel">
            <h2>
              <Clock3 size={20} />
              {t("À garder en tête", "Khelli f balek")}
            </h2>
            <ul className="audit-warning-list">
              {audit.warnings.map((w) => (
                <li key={w}>{t(w)}</li>
              ))}
            </ul>
          </section>
          <section className="panel">
            <h2>
              <CheckCircle2 size={20} />
              {t("Ce qui est déjà prêt", "Chno wajed")}
            </h2>
            <ul className="ready-list">
              {audit.ready_items.map((x) => (
                <li key={x}>
                  <Check size={16} />
                  {t(x)}
                </li>
              ))}
            </ul>
            {audit.ready_items.length === 0 && (
              <p>
                {t(
                  "Les premiers éléments validés apparaîtront ici.",
                  "Awal 7wayej m2ekkda ghadi ybano hna.",
                )}
              </p>
            )}
          </section>
        </div>
      </div>
      <Notice>
        {t(
          "Cet audit n’est ni une décision d’éligibilité officielle, ni une garantie d’admission. Le candidat reste responsable du dossier transmis sur la plateforme officielle.",
          "Had audit machi 9arar rasmi dyal l9oboul w ma kaydmench admission. Candidat kayb9a mas2oul 3la dossier lli ghadi ytsift f plateforme rasmiya.",
        )}
      </Notice>
    </>
  );
}
