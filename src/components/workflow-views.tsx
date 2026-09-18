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
          "المعلومات كتولي الحكاية ديالك",
        )}
        title={
          kind === "cv"
            ? t(
                "Votre parcours. Le bon angle.",
                "المسار ديالك، بطريقة مناسبة.",
              )
            : t(
                "Une motivation qui vous ressemble.",
                "دوافع كتعبر عليك.",
              )
        }
        description={
          kind === "cv"
            ? t(
                "Un CV préparé depuis votre profil, adapté aux formations que vous avez choisies.",
                "سيرة ذاتية من الملف ديالك، مناسبة للتكوينات اللي ختاريتي.",
              )
            : t(
                "Un projet cohérent, puis un brouillon spécifique à chaque formation.",
                "مشروع منسجم، ومن بعد مسودة لكل تكوين.",
              )
        }
      />
      <Notice>
        {t(
          "Les documents officiels restent en français. Les brouillons de démonstration utilisent vos données et des modèles déterministes ; aucun service d’IA externe n’est connecté.",
          "الوثائق الرسمية كتبقى بالفرنسية. المسودات التجريبية كتستعمل المعلومات ديالك وقوالب ثابتة؛ ما كاينش ذكاء اصطناعي خارجي مربوط.",
        )}
      </Notice>
      {selected.length === 0 ? (
        <Empty
          title={t("Vos choix viennent d’abord.", "الاختيارات ديالك أولا.")}
          description={t(
            "Sélectionnez au moins une formation avant de préparer votre CV ou vos motivations.",
            "ختار تكوين واحد على الأقل قبل ما توجد السيرة الذاتية ورسائل الدوافع.",
          )}
          action={
            <Button variant="primary" onClick={() => go("programs")}>
              {t("Choisir mes formations", "نختار التكوينات")}
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
                      "الخيط اللي كيربط المسار ديالك",
                    )}
                  </h2>
                  <p>
                    {t(
                      "Passé → choix d’études → compétences → métier → projet à long terme",
                      "الماضي".replace("الماضي", "الماضي") +
                        " ← القراية ← المهارات ← المهنة ← مشروع المستقبل",
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
                    label={t("Mon projet d’études", "المشروع الدراسي ديالي")}
                    hint={t(
                      "Reliez vos acquis, vos choix et les compétences que vous souhaitez développer.",
                      "ربط اللي قريتي بالاختيارات والمهارات اللي بغيتي تطور.",
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
                    label={t("Mon projet professionnel", "المشروع المهني ديالي")}
                    hint={t(
                      "Expliquez le métier visé et les étapes réalistes pour y parvenir.",
                      "شرح الخدمة اللي بغيتي والخطوات الممكنة باش توصل ليها.",
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
                    "كنأكد هاد المشاريع كتصريحات ديالي.",
                  )}
                </label>
                <div className="form-actions">
                  <p>
                    {t(
                      "Un changement invalide les documents préparés à partir de l’ancienne version.",
                      "التغيير كيخلي الوثائق القديمة تحتاج مراجعة.",
                    )}
                  </p>
                  <Button type="submit" variant="primary">
                    <Save size={16} />
                    {t("Enregistrer mes projets", "نسجل المشاريع ديالي")}
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
                    ? t("Mon CV de candidature", "السيرة الذاتية للترشيح")
                    : t("Brouillon par formation", "مسودة لكل تكوين")
                }
                action={
                  kind === "motivation" ? (
                    <select
                      aria-label={t(
                        "Formation pour la motivation",
                        "التكوين المعني برسالة الدوافع",
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
                      {t("Version française", "النسخة الفرنسية")}
                    </span>
                  </div>
                  <pre className="print-artifact" lang="fr" dir="ltr">
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
                      {t("Exporter le texte", "نحمل النص")}
                    </Button>
                    <Button onClick={() => window.print()}>
                      <Printer size={16} />
                      {t("Imprimer / PDF", "نطبع / PDF")}
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
                      {t("Valider après relecture", "نأكد من بعد المراجعة")}
                    </Button>
                  </div>
                </section>
              ) : (
                <Empty
                  title={t(
                    "Votre brouillon apparaîtra ici.",
                    "المسودة ديالك غادي تبان هنا.",
                  )}
                  description={
                    kind === "cv"
                      ? t(
                          "Les études, projets, expériences et langues viennent de votre profil.",
                          "القراية والمشاريع والتجارب واللغات من الملف ديالك.",
                        )
                      : t(
                          "Validez vos projets et résolvez les exigences de la fiche formation pour continuer.",
                          "أكد المشاريع وحل النقط ديال بطاقة التكوين باش تكمل.",
                        )
                  }
                />
              )}
            </div>
            <aside>
              <SectionTitle title={t("Avant de générer", "قبل ما توجد")} />
              <section className="panel material-gates">
                <div className="gate-check">
                  <CheckCircle2 size={19} />
                  {t("Formations sélectionnées", "التكوينات المختارة")}
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
                        "المشاريع ديالك مؤكدة",
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
                        "البحث على التكوين كامل",
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
                    artifact ? "نعاود نوجد المسودة" : "نوجد المسودة",
                  )}
                </Button>
                {!canGenerate && (
                  <LinkButton onClick={() => go("programs", pid)}>
                    {t("Résoudre les points bloquants", "حل النقط اللي باقية")}
                  </LinkButton>
                )}
              </section>
              {artifact && (
                <section className="panel quality-panel">
                  <h3>{t("Contrôle qualité", "مراجعة الجودة")}</h3>
                  {kind === "motivation" && (
                    <div className="character-count">
                      <strong>{Array.from(artifact.text).length}</strong> /{" "}
                      {data.cycle.motivation_limit}{" "}
                      {t("caractères", "حرف")}
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
                        "نشوف أدلة المعلومات",
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
                  "المولد ما كيزيد حتى مهارة ولا تجربة ولا شرط. راجع كل تصريح قبل ما تستعملو.",
                )}
              </Notice>
            </aside>
          </div>
        </>
      )}
      {approval && (
        <Modal
          title={t("Valider ce document", "نأكد هاد الوثيقة")}
          onClose={() => setApproval(null)}
        >
          <Notice>
            {t(
              "Cette validation confirme votre relecture. Le document ne sera envoyé à aucun établissement.",
              "التأكيد كيعني راجعتي الوثيقة. ما غادي تتسيفط لحتى مؤسسة.",
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
                "راجعت المحتوى والأدلة وأكدت بلي كيعبر على المسار ديالي.",
              )}
            </label>
            <Button variant="primary" type="submit">
              {t("Valider", "نأكد")}
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
      "علاش بغيتي تقرا ففرنسا؟",
    ),
    program
      ? `Pourquoi avez-vous choisi ${program.title} ?`
      : t(
          "Quelle formation correspond à votre projet, et pourquoi ?",
          "أشنو هو التكوين المناسب للمشروع ديالك وعلاش؟",
        ),
    t(
      "Quel acquis de votre parcours vous prépare à cette formation ?",
      "أشنو فقرايتك وجدك لهاد التكوين؟",
    ),
    goal
      ? `Comment votre projet vous prépare-t-il au métier : ${goal} ?`
      : t(
          "Quel métier souhaitez-vous exercer après vos études ?",
          "شنو بغيتي تخدم من بعد القراية؟",
        ),
    t(
      "Comment comptez-vous financer vos études et votre séjour ?",
      "كيفاش غادي تخلص القراية والمعيشة؟",
    ),
    data.tasks.some((task) => task.id.startsWith("semester-"))
      ? t(
          "Comment expliquez-vous les relevés manquants dans votre dossier ?",
          "كيفاش كتفسر كشوف النقط الناقصة فالملف؟",
        )
      : t(
          "Quelle difficulté de votre parcours avez-vous surmontée ?",
          "أشنو هي الصعوبة فالمسار ديالك اللي قدرت تجاوزها؟",
        ),
  ];
  return (
    <>
      <Heading
        eyebrow={t(
          "EXPLIQUER VOS CHOIX AVEC CLARTÉ",
          "شرح الاختيارات بوضوح",
        )}
        title={t(
          "Votre projet, avec vos propres mots.",
          "المشروع ديالك، بكلامك نتا.",
        )}
        description={t(
          "Entraînez-vous à partir de votre dossier, une question à la fois.",
          "تدرب انطلاقا من الملف ديالك، سؤال بسؤال.",
        )}
      />
      <div className="interview-layout">
        <section className="panel interview-card">
          <div className="panel-top">
            <span className="badge blue-badge">
              <Mic size={14} />
              {t("Simulation écrite", "محاكاة بالكتابة")}
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
              "علاش هاد السؤال؟ كيربط معلومة من الملف بالمشروع ديالك. تقدر تجاوب، تقول مازال ما عرفت، ولا تدوز.",
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
            <Field label={t("Votre réponse", "الجواب ديالك")}>
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
                  "اللي كيعجبني فهاد المسار…",
                )}
              />
            </Field>
            <div className="interview-response-options">
              <button
                type="button"
                onClick={() => {
                  setAnswer(t("Je ne sais pas encore.", "مازال ما عرفت."));
                  setAnswerMode("unknown");
                }}
              >
                {t("Je ne sais pas encore", "مازال ما عرفت")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnswer(
                    t("Je préfère ne pas répondre.", "كنفضل ما نجاوبش."),
                  );
                  setAnswerMode("prefer");
                }}
              >
                {t("Je préfère ne pas répondre", "كنفضل ما نجاوبش")}
              </button>
              {answerMode !== "written" && (
                <span className="muted">
                  {t(
                    "Cette réponse sera conservée comme telle, sans hypothèse ajoutée.",
                    "هاد الجواب غادي يبقى كيفما هو، بلا تفسير زايد.",
                  )}
                </span>
              )}
            </div>
            <div className="form-actions">
              <span>
                {answer.trim().split(/\s+/).filter(Boolean).length}{" "}
                {t("mots", "كلمة")}
              </span>
              <Button
                variant="primary"
                type="submit"
                disabled={busy || !answer.trim()}
              >
                <Play size={15} />
                {t("Obtenir un retour", "نشوف المراجعة")}
              </Button>
            </div>
          </form>
          {error && <div className="error-box">{error}</div>}
          {feedback && (
            <div className="interview-feedback">
              <h3>
                {t("Votre retour de préparation", "مراجعة التحضير")}
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
                  "باش تزيد توضح".replace("توضح", "توضح"),
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
              {t("Précédent", "اللي قبل")}
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
                  ? "نعاود من الأول"
                  : "سؤال جديد",
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
              {t("Passer cette question", "ندوز هاد السؤال")}
            </Button>
          </div>
        </section>
        <aside>
          <section className="panel">
            <h3>
              {t("Les repères d’une bonne réponse", "نقط ديال جواب مزيان")}
            </h3>
            <div className="rubric-list">
              {[
                [
                  t("Clarté", "الوضوح"),
                  t(
                    "Une idée principale, puis un exemple.",
                    "فكرة رئيسية، ومن بعد مثال.",
                  ),
                ],
                [
                  t("Cohérence", "الانسجام"),
                  t(
                    "Un lien entre votre passé et votre projet.",
                    "ربط بين المسار السابق والمشروع ديالك.",
                  ),
                ],
                [
                  t("Précision", "الدقة"),
                  t(
                    "Des matières et des contenus vérifiés.",
                    "مواد ومحتوى مؤكدين.",
                  ),
                ],
                [
                  t("Authenticité", "الصدق"),
                  t(
                    "Vos propres raisons, dans vos mots.",
                    "الأسباب ديالك، بكلامك نتا.",
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
              {t("Relire mon projet", "نعاود نقرا المشروع")}
            </LinkButton>
          </section>
          <Notice>
            {t(
              "Grille indicative sur le texte. L’oral, la véracité et la qualité globale ne sont pas évalués automatiquement. Vos réponses ne sont pas conservées après avoir quitté cet écran.",
              "مراجعة تقريبية للنص. الشفوي وصحة المعلومات والجودة العامة ما كيتقيموش آليا. الأجوبة ما كتبقاش ملي كتخرج".replace(
                "كتخرج",
                "كتخرج",
              ) + " من هاد الصفحة.",
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
        eyebrow={t("UNE CHOSE À LA FOIS", "حاجة بحاجة")}
        title={t(
          "Aujourd’hui, avancez sur l’essentiel.",
          "اليوم، خدم على الضروري.",
        )}
        description={t(
          "Les priorités se mettent à jour avec votre dossier. Corriger la cause résout la tâche.",
          "الأولويات كتبدل مع الملف. ملي كتحل السبب، المهمة كتسالى.",
        )}
        action={
          <Button onClick={() => setCycle(true)}>
            <Clock3 size={16} />
            {t("Vérifier mon calendrier", "نراجع التواريخ")}
          </Button>
        }
      />
      <div className="filter-chips">
        {[
          ["all", "Toutes", "كلشي"],
          ["CRITICAL", "Critiques", "ضروري"],
          ["HIGH", "Prioritaires", "أولوية"],
          ["MEDIUM", "À explorer", "نكتشف"],
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
                aria-label={t("Marquer comme terminé", "نسجل بلي تسالات")}
              >
                <Check size={18} />
              </button>
            )}
          </section>
        ))}
      </div>
      {tasks.length === 0 && (
        <Empty
          title={t("Aucune priorité dans cette vue", "ما كاينة حتى أولوية هنا")}
          description={t(
            "Vos tâches évoluent avec les informations du dossier.",
            "المهام كتبدل مع المعلومات ديال الملف.",
          )}
        />
      )}
      <section className="panel source-reference">
        <ShieldCheck size={24} />
        <div>
          <h3>
            {t(
              "Le calendrier dépend de votre procédure.",
              "التواريخ حسب الإجراء ديالك.",
            )}
          </h3>
          <p>
            {t(
              "Consultez la source officielle avant de confirmer le cycle et les échéances.",
              "شوف المصدر الرسمي قبل تأكيد الدورة والآجال.",
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
              "تواريخ كامبوس فرانس المغرب",
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
        "نأكد دورة الترشيح",
      )}
      onClose={onClose}
    >
      <Notice kind="warning">
        {t(
          "Les dates ne sont jamais copiées d’une année à l’autre. Reportez uniquement l’échéance officielle de votre procédure.",
          "التواريخ ما كتنتقلش من عام لعام. سجل غير التاريخ الرسمي ديال الإجراء ديالك.",
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
          label={t("Intitulé officiel du cycle", "الاسم الرسمي للدورة")}
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
        <Field label={t("Date limite officielle", "آخر أجل رسمي")}>
          <input
            name="deadline"
            type="date"
            required
            defaultValue={data.cycle.deadline ?? ""}
          />
        </Field>
        <Field
          label={t("URL officielle Campus France", "الرابط الرسمي لكامبوس فرانس")}
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
            "راجعت بلي هاد الدورة والتاريخ كيناسبو الوضعية ديالي.",
          )}
        </label>
        <Button type="submit" variant="primary">
          {t("Enregistrer ma vérification", "نسجل المراجعة ديالي")}
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
          "حتى حاجة مهمة ما تفوت",
        )}
        title={t(
          "Votre dossier, passé en revue.",
          "الملف ديالك، تراجع كامل.",
        )}
        description={t(
          "Un état clair des pièces, du parcours, des choix et des documents de candidature.",
          "حالة واضحة للوثائق والمسار والاختيارات ووثائق الترشيح.",
        )}
        action={
          <Button onClick={() => go("tasks")}>
            <ClipboardCheck size={16} />
            {t("Voir mes priorités", "نشوف الأولويات")}
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
                  "مازال شي خطوات باش تكمل.".replace(
                    "تكمل",
                    "تكمل",
                  ),
                )
              : t("Les contrôles sont satisfaits.", "المراجعة دازت.")}
          </h2>
          <p>
            {t(
              "La complétude mesure le contenu renseigné. La préparation exige des pièces et des conditions vérifiées.",
              "نسبة الإكمال كتقيس المعلومات المعمرة. باش تكون واجد، خاص الوثائق والشروط يكونو مؤكدين.",
            )}
          </p>
        </div>
        <div className="audit-percentage">
          <strong>{data.completeness.percent}%</strong>
          <span>{t("dossier renseigné", "الملف معمر")}</span>
        </div>
      </section>
      <div className="audit-stat-grid">
        {[
          [
            audit.critical.length,
            t("Points bloquants", "نقط كتحبس الملف"),
            "red",
          ],
          [audit.warnings.length, t("Vigilances", "نقط الانتباه"), "amber"],
          [
            audit.ready_items.length,
            t("Éléments vérifiés", "حوايج مؤكدة"),
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
              "خاصها تتحل قبل الترشيح",
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
                "ما كاين حتى عائق فالقواعد المسجلة.",
              )}
            </p>
          )}
          <LinkButton onClick={() => go("tasks")}>
            {t("Passer à l’action", "نبدا نخدم")}
          </LinkButton>
        </section>
        <div className="stack">
          <section className="panel">
            <h2>
              <Clock3 size={20} />
              {t("À garder en tête", "خلي فبالك")}
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
              {t("Ce qui est déjà prêt", "شنو واجد")}
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
                  "أول الحوايج المؤكدة غادي يبانو هنا.",
                )}
              </p>
            )}
          </section>
        </div>
      </div>
      <Notice>
        {t(
          "Cet audit n’est ni une décision d’éligibilité officielle, ni une garantie d’admission. Le candidat reste responsable du dossier transmis sur la plateforme officielle.",
          "هاد المراجعة ماشي قرار رسمي بالقبول وما كتضمنوش. المترشح كيبقى مسؤول على الملف اللي غادي يتسيفط فالمنصة الرسمية.",
        )}
      </Notice>
    </>
  );
}
