"use client";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import type {
  DocumentRecord,
  Education,
  Fact,
  Grade,
  Preferences,
} from "@/lib/schema";
import { fieldDarija } from "@/lib/i18n";
import {
  Badge,
  Button,
  Empty,
  Field,
  formatNumber,
  Heading,
  LinkButton,
  Modal,
  Notice,
  Progress,
  SectionTitle,
  useApp,
} from "./ui";

export function ProfileView() {
  const { data, t, locale, mutate, go } = useApp(),
    c = data.candidate;
  const [tab, setTab] = useState("identity"),
    [values, setValues] = useState<Record<string, string>>(() =>
      Object.fromEntries(c.facts.map((f) => [f.key, f.value])),
    ),
    [prefs, setPrefs] = useState<Preferences>(c.preferences),
    [review, setReview] = useState<Fact | null>(null),
    [experience, setExperience] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutate("/profile", { values, preferences: prefs }, "PUT");
  };
  return (
    <>
      <Heading
        eyebrow={t("LE POINT DE DÉPART", "L BIDAYa")}
        title={t(
          "Un profil qui raconte votre parcours.",
          "Profil kay7ki masar dyalek.",
        )}
        description={t(
          "Vos informations restent liées à leurs justificatifs. Vous validez chaque changement.",
          "Ma3lomat dyalek katb9a merbouta b dalil. Nta lli kat2ekked taghyirat.",
        )}
      />
      <div className="profile-overview panel">
        <div className="large-avatar">
          <UserRound size={30} />
        </div>
        <div>
          <h2>
            {values.first_name || t("Votre prénom", "Smiya")} {values.last_name}
          </h2>
          <p>
            {values.academic_status ||
              t("Situation à compléter", "Khas t3emmer situation")}
          </p>
        </div>
        <div className="profile-completion">
          <span>
            {t("Profil renseigné", "Profil m3emmer")}
            <strong>{data.completeness.percent}%</strong>
          </span>
          <Progress percent={data.completeness.percent} />
        </div>
      </div>
      <div className="tabs">
        {[
          ["identity", "Identité & contact", "Ma3lomat chakhsiya"],
          ["goals", "Projet & préférences", "Projets w khtiyarat"],
          ["experiences", "Expériences", "Tajarob"],
          ["evidence", "Sources & vérification", "Dalil w moraja3a"],
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
      {(tab === "identity" || tab === "goals") && (
        <form onSubmit={save}>
          <section className="panel form-panel">
            {tab === "identity" ? (
              <>
                <SectionTitle
                  title={t("Vos informations personnelles", "Ma3lomat dyalek")}
                />
                <div className="form-grid">
                  {c.facts
                    .filter((f) => f.key !== "no_experience")
                    .map((f) => (
                      <Field
                        key={f.id}
                        label={
                          locale === "fr"
                            ? f.label
                            : (fieldDarija[f.key] ?? f.label)
                        }
                        hint={
                          f.status === "VERIFIED"
                            ? t(
                                "Une modification nécessite une nouvelle vérification.",
                                "Ila beddeltiha, khas moraja3a jdida.",
                              )
                            : undefined
                        }
                      >
                        {f.key.endsWith("_level") ? (
                          <select
                            value={values[f.key] ?? ""}
                            onChange={(e) =>
                              setValues({ ...values, [f.key]: e.target.value })
                            }
                          >
                            <option value="">
                              {t("À préciser", "Khas tawdi7")}
                            </option>
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={
                              f.key === "birth_date"
                                ? "date"
                                : f.key === "email"
                                  ? "email"
                                  : f.key === "phone"
                                    ? "tel"
                                    : "text"
                            }
                            value={values[f.key] ?? ""}
                            onChange={(e) =>
                              setValues({ ...values, [f.key]: e.target.value })
                            }
                            maxLength={f.key === "address" ? 500 : 150}
                            autoComplete={
                              f.key === "first_name"
                                ? "given-name"
                                : f.key === "last_name"
                                  ? "family-name"
                                  : "off"
                            }
                          />
                        )}
                      </Field>
                    ))}
                </div>
              </>
            ) : (
              <>
                <SectionTitle
                  title={t("Le projet qui vous anime", "Projet lli kay7emsek")}
                />
                <Field
                  label={t(
                    "Quel métier ou domaine vous intéresse ?",
                    "Ach men métier wlla domaine kay3ejbek?",
                  )}
                >
                  <input
                    value={prefs.goal}
                    onChange={(e) =>
                      setPrefs({ ...prefs, goal: e.target.value })
                    }
                    placeholder={t(
                      "Vous pouvez aussi indiquer : je ne sais pas encore.",
                      "T9der tgoul : mazal ma 3reftch.",
                    )}
                  />
                </Field>
                <div className="form-grid">
                  <Field
                    label={t(
                      "Matières et centres d’intérêt",
                      "Lmawad w domaines lli kay3ejbok",
                    )}
                    hint={t(
                      "Séparez les éléments par une virgule.",
                      "Ferre9 binathom b virgule.",
                    )}
                  >
                    <input
                      value={prefs.interests.join(", ")}
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          interests: e.target.value
                            .split(",")
                            .map((x) => x.trim()),
                        })
                      }
                    />
                  </Field>
                  <Field label={t("Villes acceptables", "Lmdoun lli ynasbok")}>
                    <input
                      value={prefs.cities.join(", ")}
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          cities: e.target.value
                            .split(",")
                            .map((x) => x.trim()),
                        })
                      }
                    />
                  </Field>
                  <Field
                    label={t(
                      "Budget annuel disponible (€)",
                      "Budget dyal l3am (€)",
                    )}
                    hint={t(
                      "Études et vie quotidienne. Les comparaisons de frais restent partielles.",
                      "9raya w lma3icha. Mou9arana dyal frais mazal na9sa.",
                    )}
                  >
                    <input
                      type="number"
                      min={0}
                      max={1000000}
                      value={prefs.annual_budget ?? ""}
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          annual_budget:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field
                    label={t(
                      "Votre façon d’apprendre",
                      "Kifach katfeddel t9ra",
                    )}
                  >
                    <select
                      value={prefs.style}
                      onChange={(e) =>
                        setPrefs({
                          ...prefs,
                          style: e.target.value as Preferences["style"],
                        })
                      }
                    >
                      <option value="practical">
                        {t("Pratique et projets", "Tatbi9 w projets")}
                      </option>
                      <option value="theory">
                        {t("Théorie et recherche", "Théorie w recherche")}
                      </option>
                      <option value="balanced">
                        {t("Un équilibre des deux", "Tawazon binathom")}
                      </option>
                    </select>
                  </Field>
                </div>
              </>
            )}
            <div className="form-actions">
              <p>
                {t(
                  "Les modifications sont enregistrées après validation.",
                  "Taghyirat katsajjel mlli kat2ekked.",
                )}
              </p>
              <Button variant="primary" type="submit">
                <Save size={16} />
                {t("Enregistrer mon profil", "Nsejjel profil dyali")}
              </Button>
            </div>
          </section>
        </form>
      )}
      {tab === "experiences" && (
        <>
          <SectionTitle
            title={t("Votre base d’expériences", "Tajarob dyalek")}
            description={t(
              "Projets, stages, emplois, compétences, certifications et activités.",
              "Projets, stages, khdma, compétences, certifications w activités.",
            )}
            action={
              <Button onClick={() => setExperience(true)}>
                <Plus size={16} />
                {t("Ajouter", "Zid")}
              </Button>
            }
          />
          {c.experiences.length === 0 ? (
            <Empty
              title={t(
                "Chaque parcours commence quelque part.",
                "Kol masar 3endo bidaya.",
              )}
              description={t(
                "Ajoutez vos projets ou déclarez simplement ne pas avoir encore d’expérience.",
                "Zid projets dyalek wlla sarr7 belli mazal ma 3endek expérience.",
              )}
              action={
                <Button
                  onClick={() =>
                    mutate(
                      "/profile",
                      {
                        values: {
                          no_experience: "Aucune expérience à déclarer",
                        },
                        preferences: prefs,
                      },
                      "PUT",
                    )
                  }
                >
                  {t(
                    "Aucune expérience à déclarer",
                    "Ma 3endi expérience nsarre7 biha",
                  )}
                </Button>
              }
            />
          ) : (
            <div className="stack">
              {c.experiences.map((e) => (
                <section className="panel experience-card" key={e.id}>
                  <span className="stat-icon">
                    <GraduationCap size={21} />
                  </span>
                  <div>
                    <div className="panel-top">
                      <h3>{e.title}</h3>
                      <Badge status="SELF_DECLARED" />
                    </div>
                    <p>{e.description}</p>
                    <small>{e.date_label}</small>
                  </div>
                </section>
              ))}
            </div>
          )}
          <Notice>
            {t(
              "Cette base alimente votre CV. Aucun savoir-faire ni résultat ne sera ajouté sans déclaration.",
              "Had lbase kat3emmer CV. Ma kanzido 7ta compétence bla ma tsarre7 biha.",
            )}
          </Notice>
        </>
      )}
      {tab === "evidence" && (
        <>
          <Notice>
            {t(
              "« Vérifié sur pièce » signifie que vous avez comparé l’information au document. L’authenticité du document n’est pas certifiée automatiquement.",
              "M2ekked b dalil kay3ni raja3ti lma3loma f document. L’app ma kat2ekkedch automatiquement belli document asli.",
            )}
          </Notice>
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>{t("Information", "Ma3loma")}</th>
                  <th>{t("Valeur", "Valeur")}</th>
                  <th>{t("Statut", "Statut")}</th>
                  <th>{t("Source", "Dalil")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {c.facts
                  .filter((f) => f.value || f.key !== "no_experience")
                  .map((f) => (
                    <tr key={f.id}>
                      <td>{locale === "fr" ? f.label : fieldDarija[f.key]}</td>
                      <td>{f.value || "—"}</td>
                      <td>
                        <Badge status={f.status} />
                      </td>
                      <td>
                        {c.documents.find((d) => d.id === f.document_id)
                          ?.name || t("Déclaration", "Déclaration")}
                        {f.page && <small> · p. {f.page}</small>}
                      </td>
                      <td>
                        <button
                          className="text-link"
                          onClick={() => setReview(f)}
                        >
                          {t("Vérifier", "Raje3")}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <Button onClick={() => go("documents")}>
            <Upload size={16} />
            {t("Ajouter un justificatif", "Zid dalil")}
          </Button>
        </>
      )}
      {review && <FactModal fact={review} onClose={() => setReview(null)} />}{" "}
      {experience && <ExperienceModal onClose={() => setExperience(false)} />}
    </>
  );
}
function FactModal({ fact, onClose }: { fact: Fact; onClose: () => void }) {
  const { t, data, mutate } = useApp();
  return (
    <Modal
      title={t("Vérifier une information", "Raje3 ma3loma")}
      onClose={onClose}
    >
      <Notice>
        {t(
          "Comparez la valeur actuelle à la pièce avant de confirmer.",
          "9aren lma3loma m3a document 9bel ta2kid.",
        )}
      </Notice>
      <p className="original-value">
        {fact.label} : <strong>{fact.value || "—"}</strong>
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            await mutate(`/facts/${fact.id}/review`, {
              value: String(f.get("value")),
              document_id: f.get("document_id") || null,
              page: f.get("page") ? Number(f.get("page")) : null,
              confirmed: f.get("confirmed") === "on",
              evidence_checked: f.get("checked") === "on",
            })
          )
            onClose();
        }}
      >
        <Field label={t("Valeur confirmée", "Ma3loma lm2ekkda")}>
          <input
            name="value"
            defaultValue={fact.value}
            required
            maxLength={3000}
          />
        </Field>
        <Field label={t("Document source", "Document dyal dalil")}>
          <select name="document_id" defaultValue={fact.document_id ?? ""}>
            <option value="">
              {t("Déclaration personnelle", "Déclaration dyali")}
            </option>
            {data.candidate.documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("Page (facultatif)", "Page (ikhtiyari)")}>
          <input
            name="page"
            type="number"
            min={1}
            defaultValue={fact.page ?? ""}
          />
        </Field>
        <label className="check-field">
          <input name="checked" type="checkbox" />
          {t(
            "J’ai comparé cette information au justificatif.",
            "9arent had lma3loma m3a document.",
          )}
        </label>
        <label className="check-field">
          <input name="confirmed" type="checkbox" required />
          {t(
            "Je confirme cette modification du profil.",
            "Kan2ekked had taghyir f profil.",
          )}
        </label>
        <div className="form-actions">
          <Button onClick={onClose}>{t("Annuler", "Lghi")}</Button>
          <Button type="submit" variant="primary">
            {t("Confirmer", "2ekked")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function ExperienceModal({ onClose }: { onClose: () => void }) {
  const { t, mutate } = useApp();
  return (
    <Modal title={t("Ajouter une expérience", "Zid tajriba")} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            await mutate("/experiences", {
              kind: f.get("kind"),
              title: f.get("title"),
              description: f.get("description"),
              date_label: f.get("date"),
              user_confirmed: true,
            })
          )
            onClose();
        }}
      >
        <Field label={t("Type", "Naw3")}>
          <select name="kind">
            {[
              ["project", "Projet"],
              ["internship", "Stage"],
              ["employment", "Emploi"],
              ["skill", "Compétence"],
              ["certification", "Certification"],
              ["activity", "Activité"],
            ].map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("Intitulé", "L3onwan")}>
          <input name="title" required maxLength={150} />
        </Field>
        <Field label={t("Période", "Lmodda")}>
          <input name="date" maxLength={100} />
        </Field>
        <Field label={t("Ce que vous avez réellement fait", "Ach derti b se7")}>
          <textarea name="description" required rows={4} maxLength={3000} />
        </Field>
        <label className="check-field">
          <input type="checkbox" required />
          {t(
            "Je confirme l’exactitude de ma déclaration.",
            "Kan2ekked belli déclaration dyali s7i7a.",
          )}
        </label>
        <Button type="submit" variant="primary">
          {t("Ajouter à mon profil", "Zid l profil dyali")}
        </Button>
      </form>
    </Modal>
  );
}

export function DocumentsView() {
  const { data, t, mutate } = useApp(),
    [kind, setKind] = useState("transcript"),
    [file, setFile] = useState<File | null>(null),
    [review, setReview] = useState<DocumentRecord | null>(null),
    [filter, setFilter] = useState("all"),
    [drag, setDrag] = useState(false),
    input = useRef<HTMLInputElement>(null);
  const docs = data.candidate.documents.filter(
    (d) => filter === "all" || d.status === filter,
  );
  return (
    <>
      <Heading
        eyebrow={t("LES FAITS AVANT TOUT", "DALIL LLOWEL")}
        title={t(
          "Un document. Une source de confiance.",
          "Kol document, dalil f dossier.",
        )}
        description={t(
          "Ajoutez vos pièces, puis vérifiez les informations qui leur sont associées.",
          "Zid lwra9 dyalek, men be3d raje3 lma3lomat lli fihom.",
        )}
      />
      <div
        className={`upload-panel ${drag ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          setFile(e.dataTransfer.files[0] ?? null);
        }}
      >
        <span className="upload-icon">
          <Upload size={25} />
        </span>
        <div>
          <h3>
            {file
              ? file.name
              : t("Déposez votre document ici", "7ett document dyalek hna")}
          </h3>
          <p>
            {t(
              "PDF, JPEG ou PNG · 10 Mo maximum · stockage privé",
              "PDF, JPEG wlla PNG · 10 Mo maximum · stockage privé",
            )}
          </p>
        </div>
        <input
          ref={input}
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          aria-label={t("Choisir un fichier", "Khtar fichier")}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="file-picker"
        />
        <Button onClick={() => input.current?.click()}>
          {t("Choisir un fichier", "Khtar fichier")}
        </Button>
      </div>
      <div className="upload-controls">
        <Field label={t("Type de document", "Naw3 dyal document")}>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            {[
              ["transcript", "Relevé de notes", "Relevé de notes"],
              ["identity", "Pièce d’identité", "Wra9 lhowiya"],
              ["photo", "Photo d’identité", "Tsweera"],
              ["diploma", "Diplôme", "Diplôme"],
              ["language", "Certificat de langue", "Certificat logha"],
              ["cv", "CV", "CV"],
              ["certificate", "Certification", "Certification"],
              ["other", "Autre justificatif", "Dalil akhor"],
            ].map(([v, fr, ary]) => (
              <option value={v} key={v}>
                {t(fr, ary)}
              </option>
            ))}
          </select>
        </Field>
        <Button
          disabled={!file}
          variant="primary"
          onClick={async () => {
            if (!file) return;
            const f = new FormData();
            f.append("file", file);
            f.append("kind", kind);
            const result = await mutate("/documents", f);
            if (result) {
              setFile(null);
              if (input.current) input.current.value = "";
              setReview(result.candidate.documents.at(-1) ?? null);
            }
          }}
        >
          <Upload size={16} />
          {t("Ajouter au dossier", "Zid l dossier")}
        </Button>
      </div>
      <Notice>
        {t(
          "Lecture automatique limitée au texte PDF. Les scans demandent une saisie manuelle. Aucune extraction ne remplace silencieusement votre profil.",
          "L9raya l2otomatikiya mahdouda l texte PDF. Scans khas saisie manuelle. Ma kanbeddlo profil bla ta2kid dyalek.",
        )}
      </Notice>
      <SectionTitle
        title={t("Votre bibliothèque de justificatifs", "Lwra9 lli f dossier")}
        action={
          <select
            aria-label={t("Filtrer les documents", "Filtrer lwra9")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t("Tous les documents", "Ga3 lwra9")}</option>
            <option value="NEEDS_REVIEW">
              {t("À vérifier", "Khas moraja3a")}
            </option>
            <option value="VERIFIED">{t("Vérifiés", "M2ekkdin")}</option>
          </select>
        }
      />
      {docs.length === 0 ? (
        <Empty
          title={t("Aucun document dans cette vue", "Ma kayn 7ta document hna")}
          description={t(
            "Ajoutez votre première pièce ou changez le filtre.",
            "Zid awal document wlla beddel filtre.",
          )}
        />
      ) : (
        <div className="panel document-list">
          {docs.map((d) => (
            <div className="document-row" key={d.id}>
              <span className="document-icon">
                <FileText size={23} />
              </span>
              <div className="document-info">
                <strong>{d.name}</strong>
                <p>
                  {d.is_mock
                    ? t("Pièce fictive · démonstration", "Document tajribi")
                    : formatNumber(d.size / 1024) + " Ko"}{" "}
                  · {new Date(d.uploaded_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Badge status={d.status} />
              {!d.is_mock && (
                <a
                  href={`/api/documents/${d.id}/download`}
                  className="icon-button"
                  aria-label={t("Télécharger", "Télécharger")}
                >
                  <Download size={17} />
                </a>
              )}
              <Button onClick={() => setReview(d)}>
                {t("Vérifier", "Raje3")}
                <ChevronRight size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
      {review && (
        <DocumentModal
          doc={
            data.candidate.documents.find((d) => d.id === review.id) ?? review
          }
          onClose={() => setReview(null)}
        />
      )}
    </>
  );
}
function DocumentModal({
  doc,
  onClose,
}: {
  doc: DocumentRecord;
  onClose: () => void;
}) {
  const { data, t, mutate } = useApp(),
    [edu, setEdu] = useState("");
  return (
    <Modal
      title={t("Vérifier le document", "Raje3 document")}
      onClose={onClose}
      wide
    >
      <div className="document-review-title">
        <FileText size={28} />
        <div>
          <h3>{doc.name}</h3>
          <Badge status={doc.status} />
        </div>
      </div>
      <Notice>
        {doc.processing_note ||
          t(
            "Pièce de démonstration. Aucune valeur administrative.",
            "Document dyal tajriba, ma 3endoch valeur administrative.",
          )}
      </Notice>
      {!doc.is_mock && (
        <a className="button" href={`/api/documents/${doc.id}/download`}>
          <Download size={16} />
          {t("Ouvrir la pièce téléchargée", "Télécharger document bach traj3o")}
        </a>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            await mutate(`/documents/${doc.id}/review`, {
              confirmed: true,
              education_id: edu || null,
              semester: f.get("semester") ? Number(f.get("semester")) : null,
              import_extraction: f.get("import") === "on",
            })
          )
            onClose();
        }}
      >
        {doc.extraction.length > 0 && (
          <>
            <SectionTitle
              title={t("Comparer avant de remplacer", "9aren 9bel tabdil")}
            />
            {doc.extraction.map((f) => (
              <div className="extraction-compare" key={f.id}>
                <div>
                  <small>{t("Valeur actuelle", "Ma3loma daba")}</small>
                  <strong>
                    {data.candidate.facts.find((x) => x.key === f.key)?.value ||
                      "—"}
                  </strong>
                </div>
                <ArrowRight size={18} />
                <div>
                  <small>
                    {t("Valeur détectée", "Ma3loma lli t9rat")} · p. {f.page}
                  </small>
                  <strong>{f.value}</strong>
                </div>
              </div>
            ))}
            <label className="check-field">
              <input type="checkbox" name="import" />
              {t(
                "Remplacer les champs affichés par les valeurs extraites après vérification.",
                "Nbeddel had lchamps b lma3lomat lli t9rat mlli raja3thom.",
              )}
            </label>
          </>
        )}
        {doc.kind === "transcript" && (
          <div className="form-grid">
            <Field label={t("Associer à une année", "Rbet b 3am dyal 9raya")}>
              <select value={edu} onChange={(e) => setEdu(e.target.value)}>
                <option value="">
                  {t("Ne pas associer maintenant", "Machi daba")}
                </option>
                {data.candidate.education
                  .filter((e) => e.expected_semesters.length > 0)
                  .map((e) => (
                    <option value={e.id} key={e.id}>
                      {e.label}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label={t("Semestre justifié", "Semestre lli fih dalil")}>
              <select
                name="semester"
                disabled={!edu}
                required={!!edu}
                key={edu}
              >
                <option value="">{t("Choisir", "Khtar")}</option>
                {data.candidate.education
                  .find((e) => e.id === edu)
                  ?.expected_semesters.map((n) => (
                    <option value={n} key={n}>
                      S{n}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
        )}
        <label className="check-field">
          <input type="checkbox" required />
          {t(
            "J’ai lu cette pièce et vérifié les informations et associations ci-dessus.",
            "9rit document w raja3t lma3lomat w liens lli lfo9.",
          )}
        </label>
        <div className="form-actions">
          <Button onClick={onClose}>{t("Annuler", "Lghi")}</Button>
          <Button variant="primary" type="submit">
            <ShieldCheck size={16} />
            {t("Confirmer ma vérification", "2ekked lmoraja3a")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AcademicView() {
  const { data, t, mutate, go } = useApp(),
    [grade, setGrade] = useState<Grade | "new" | null>(null),
    [education, setEducation] = useState<Education | "new" | null>(null),
    diag = data.diagnostic;
  return (
    <>
      <Heading
        eyebrow={t("COMPRENDRE VOTRE PARCOURS", "FHEM MASAR DYALEK")}
        title={t(
          "Vos résultats, remis en perspective.",
          "Nnatayj dyalek f si9ha.",
        )}
        description={t(
          "Des calculs transparents pour identifier vos forces et les points à travailler.",
          "7ssabat wad7in bach t3ref no9at l9owa w fin khas tkhdem.",
        )}
        action={
          <Button variant="primary" onClick={() => setGrade("new")}>
            <Plus size={17} />
            {t("Ajouter une note", "Zid note")}
          </Button>
        }
      />
      <div className="stat-grid">
        <div className="panel metric">
          <span>{t("Moyenne pondérée", "Moyenne pondérée")}</span>
          <strong>
            {formatNumber(diag.average)}
            <small> / 20</small>
          </strong>
          <p>
            {diag.grade_count} {t("notes saisies", "notes msejlin")}
          </p>
        </div>
        <div className="panel metric">
          <span>
            {t("Progression entre semestres", "Ta9addom bin semestres")}
          </span>
          <strong>
            {diag.progression !== null && diag.progression > 0 ? "+" : ""}
            {formatNumber(diag.progression)}
            <small> {t("points", "points")}</small>
          </strong>
          <p>
            {t(
              "Premier et dernier semestre renseignés",
              "Awal w akher semestre m3emmer",
            )}
          </p>
        </div>
        <div className="panel metric">
          <span>{t("Matières fortes", "Lmawad lli 9wi fihom")}</span>
          <h3>{diag.strongest.join(" · ") || "—"}</h3>
          <p>
            {t(
              "D’après les moyennes disponibles",
              "3la 7sab moyennes lli kaynin",
            )}
          </p>
        </div>
      </div>
      {diag.warnings.map((w) => (
        <Notice key={w} kind="warning">
          {t(w)}
        </Notice>
      ))}
      <div className="two-columns">
        <section>
          <SectionTitle
            title={t("Votre chronologie académique", "Tarikh dyal 9raytek")}
            action={
              <Button onClick={() => setEducation("new")}>
                <Plus size={16} />
                {t("Une année", "3am")}
              </Button>
            }
          />
          <div className="panel timeline">
            {[...data.candidate.education]
              .sort((a, b) => a.start_year - b.start_year)
              .map((e) => (
                <div className="timeline-item" key={e.id}>
                  <div className="timeline-dot">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <small>
                      {e.start_year} / {e.end_year}
                    </small>
                    <h3>{e.label}</h3>
                    <p>{e.institution}</p>
                    {e.expected_semesters.map((s) => (
                      <span
                        className={`semester ${e.transcript_semesters.includes(s) ? "complete" : "missing"}`}
                        key={s}
                      >
                        {e.transcript_semesters.includes(s) ? (
                          <Check size={12} />
                        ) : (
                          <FileText size={12} />
                        )}
                        S{s}
                      </span>
                    ))}
                    {e.explanation && (
                      <p className="timeline-explanation">{e.explanation}</p>
                    )}
                    <button
                      className="text-link"
                      onClick={() => setEducation(e)}
                    >
                      {t("Modifier / expliquer", "Beddel / chre7")}
                    </button>
                  </div>
                </div>
              ))}
            {!data.candidate.education.length && (
              <p>
                {t(
                  "Ajoutez chaque année, même en cas d’interruption.",
                  "Zid kol 3am, 7ta ila kan twa9of.",
                )}
              </p>
            )}
          </div>
        </section>
        <section>
          <SectionTitle
            title={t("Vos matières en un regard", "Nadra 3la lmawad")}
          />
          <div className="panel subject-chart">
            {Object.entries(diag.subject_averages).map(([s, v]) => (
              <div key={s}>
                <div>
                  <span>{s}</span>
                  <strong>
                    {formatNumber(v)} <small>/20</small>
                  </strong>
                </div>
                <Progress percent={v * 5} label={s} />
              </div>
            ))}
            <Notice>
              {t(
                "Moyenne = somme des notes sur 20 × coefficients, divisée par la somme des coefficients.",
                "Moyenne = majmou3 notes 3la 20 × coefficients, m9soum 3la majmou3 coefficients.",
              )}
            </Notice>
            <LinkButton onClick={() => go("documents")}>
              {t("Compléter les relevés manquants", "Nkemmel relevés nna9sin")}
            </LinkButton>
          </div>
        </section>
      </div>
      <SectionTitle title={t("Notes et justificatifs", "Notes w dalil")} />
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              {[
                t("Matière", "Lmada"),
                t("Semestre", "Semestre"),
                t("Note", "Note"),
                t("Coefficient", "Coefficient"),
                t("Source", "Dalil"),
                "",
              ].map((x, i) => (
                <th key={i}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.candidate.grades.map((g) => (
              <tr key={g.id}>
                <td>
                  <strong>{g.subject}</strong>
                </td>
                <td>S{g.semester}</td>
                <td>
                  {formatNumber(g.value)} / {g.scale}
                </td>
                <td>{g.coefficient}</td>
                <td>
                  <Badge
                    status={
                      g.user_confirmed &&
                      data.candidate.documents.some(
                        (document) =>
                          document.id === g.document_id &&
                          document.kind === "transcript" &&
                          document.status === "VERIFIED",
                      )
                        ? "VERIFIED"
                        : "SELF_DECLARED"
                    }
                  />
                </td>
                <td>
                  <div className="row-actions">
                    <button className="text-link" onClick={() => setGrade(g)}>
                      {t("Modifier", "Beddel")}
                    </button>
                    <button
                      className="icon-button"
                      aria-label={t(
                        `Supprimer la note ${g.subject}`,
                        `7yed note ${g.subject}`,
                      )}
                      onClick={() => {
                        if (
                          window.confirm(
                            t(
                              "Supprimer cette note et recalculer le diagnostic ?",
                              "N7yed had note w n3awed l7ssab?",
                            ),
                          )
                        )
                          void mutate(`/grades/${g.id}`, undefined, "DELETE");
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {grade && (
        <GradeModal
          grade={grade === "new" ? undefined : grade}
          onClose={() => setGrade(null)}
        />
      )}{" "}
      {education && (
        <EducationModal
          education={education === "new" ? undefined : education}
          onClose={() => setEducation(null)}
        />
      )}
    </>
  );
}
function GradeModal({
  grade,
  onClose,
}: {
  grade?: Grade;
  onClose: () => void;
}) {
  const { data, t, mutate } = useApp();
  return (
    <Modal
      title={t(
        grade ? "Modifier une note" : "Ajouter une note",
        grade ? "Beddel note" : "Zid note",
      )}
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (
            await mutate("/grades", {
              ...(grade ? { id: grade.id } : {}),
              subject: f.get("subject"),
              value: Number(f.get("value")),
              scale: Number(f.get("scale")),
              coefficient: Number(f.get("coefficient")),
              semester: Number(f.get("semester")),
              document_id: f.get("document_id") || null,
              user_confirmed: f.get("confirmed") === "on",
            })
          )
            onClose();
        }}
      >
        <Field label={t("Matière", "Lmada")}>
          <input
            name="subject"
            required
            defaultValue={grade?.subject}
            maxLength={100}
          />
        </Field>
        <div className="form-grid">
          <Field label={t("Note obtenue", "Note lli jebti")}>
            <input
              name="value"
              type="number"
              step="0.01"
              min={0}
              required
              defaultValue={grade?.value}
            />
          </Field>
          <Field label={t("Barème", "Barème")}>
            <input
              name="scale"
              type="number"
              min={1}
              max={100}
              defaultValue={grade?.scale ?? 20}
              required
            />
          </Field>
          <Field label={t("Coefficient", "Coefficient")}>
            <input
              name="coefficient"
              type="number"
              min={0.01}
              max={100}
              step="0.01"
              defaultValue={grade?.coefficient ?? 1}
              required
            />
          </Field>
          <Field label={t("Semestre", "Semestre")}>
            <input
              name="semester"
              type="number"
              min={1}
              max={12}
              defaultValue={grade?.semester ?? 1}
              required
            />
          </Field>
        </div>
        <Field label={t("Relevé source", "Relevé dyal dalil")}>
          <select name="document_id" defaultValue={grade?.document_id ?? ""}>
            <option value="">
              {t("Déclaration sans pièce", "Déclaration bla document")}
            </option>
            {data.candidate.documents
              .filter((d) => d.kind === "transcript")
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </Field>
        <label className="check-field">
          <input
            name="confirmed"
            type="checkbox"
            defaultChecked={grade?.user_confirmed}
          />
          {t(
            "J’ai comparé cette note au relevé.",
            "9arent had note m3a relevé.",
          )}
        </label>
        <Button type="submit" variant="primary">
          {t("Enregistrer et recalculer", "Sejjel w 3awed l7ssab")}
        </Button>
      </form>
    </Modal>
  );
}
function EducationModal({
  education: e,
  onClose,
}: {
  education?: Education;
  onClose: () => void;
}) {
  const { t, mutate } = useApp();
  return (
    <Modal
      title={t("Une étape de votre parcours", "Khotwa f masar dyalek")}
      onClose={onClose}
    >
      <form
        onSubmit={async (ev) => {
          ev.preventDefault();
          const f = new FormData(ev.currentTarget);
          if (
            await mutate("/education", {
              ...(e ? { id: e.id } : {}),
              label: f.get("label"),
              institution: f.get("institution"),
              level: f.get("level"),
              start_year: Number(f.get("start")),
              end_year: Number(f.get("end")),
              expected_semesters: String(f.get("semesters") || "")
                .split(",")
                .filter((x) => x.trim())
                .map(Number),
              explanation: f.get("explanation") || "",
            })
          )
            onClose();
        }}
      >
        <Field label={t("Formation / diplôme", "Formation / diplôme")}>
          <input
            name="label"
            defaultValue={e?.label}
            required
            maxLength={150}
          />
        </Field>
        <Field label={t("Établissement", "Lmo2assasa")}>
          <input
            name="institution"
            defaultValue={e?.institution}
            required
            maxLength={150}
          />
        </Field>
        <div className="form-grid">
          <Field label={t("Année de début", "3am lbidaya")}>
            <input
              name="start"
              type="number"
              min={1980}
              max={2100}
              defaultValue={e?.start_year ?? 2025}
              required
            />
          </Field>
          <Field label={t("Année de fin", "3am nihaya")}>
            <input
              name="end"
              type="number"
              min={1980}
              max={2100}
              defaultValue={e?.end_year ?? 2026}
              required
            />
          </Field>
          <Field label={t("Niveau", "Niveau")}>
            <input
              name="level"
              defaultValue={e?.level}
              placeholder="Bac, L1, L2, L3…"
              required
              maxLength={100}
            />
          </Field>
          <Field
            label={t(
              "Semestres attendus (ex. 3,4)",
              "Semestres lli khas (ex. 3,4)",
            )}
          >
            <input
              name="semesters"
              defaultValue={e?.expected_semesters.join(",")}
              pattern="[0-9, ]*"
            />
          </Field>
        </div>
        <Field
          label={t(
            "Interruption, redoublement ou précision",
            "Twa9of, redoublement wlla tawdi7",
          )}
        >
          <textarea
            name="explanation"
            defaultValue={e?.explanation}
            maxLength={3000}
            rows={3}
          />
        </Field>
        <Button variant="primary" type="submit">
          {t("Enregistrer cette étape", "Sejjel had lkhotwa")}
        </Button>
      </form>
    </Modal>
  );
}

export function PathwaysView() {
  const { data, t, mutate, go } = useApp(),
    [interview, setInterview] = useState(false),
    [step, setStep] = useState(0),
    [prefs, setPrefs] = useState<Preferences>(data.candidate.preferences),
    [open, setOpen] = useState("university");
  const questions = [
    t("Qu’est-ce qui vous intéresse vraiment ?", "Ach lli kay3ejbek b se7?"),
    t("Comment aimez-vous apprendre ?", "Kifach katfeddel t9ra?"),
    t(
      "Quel horizon professionnel imaginez-vous ?",
      "Ach kattsawwer tkhdem men be3d?",
    ),
    t("Quelles sont vos contraintes ?", "Ach homa l9oyod dyalek?"),
  ];
  return (
    <>
      <Heading
        eyebrow={t(
          "PLUSIEURS ROUTES, VOTRE DIRECTION",
          "MASARAT MOKHTALFA, LWIJHA DYALEK",
        )}
        title={t(
          "Dessinez la suite de votre parcours.",
          "Rsem lli jay f masar dyalek.",
        )}
        description={t(
          "Explorez des possibilités. Chaque transition reste soumise aux conditions d’admission.",
          "Chouf l2imkaniyat. Kol transition khas chorot l9oboul.",
        )}
        action={
          <Button
            variant="primary"
            onClick={() => {
              setInterview(true);
              setStep(0);
            }}
          >
            <CompassIcon />
            {t("Préciser mon projet", "Nwadda7 projet dyali")}
          </Button>
        }
      />
      <Notice>
        {t(
          "Ces parcours sont des pistes de réflexion, pas des passerelles garanties. Coûts et débouchés doivent être vérifiés pour chaque formation.",
          "Had masarat ghir afkar, machi passerelles madmouna. Frais w afaq khas moraja3a l kol formation.",
        )}
      </Notice>
      {data.pathways.length === 0 ? (
        <Empty
          title={t("Commençons par vos envies.", "Nbdaw b chno bghiti.")}
          description={t(
            "Quatre questions pour identifier les parcours à explorer.",
            "Rb3a dyal as2ila bach n3erfo masarat lli n9ellbo 3lihom.",
          )}
          action={
            <Button onClick={() => setInterview(true)}>
              {t("Commencer", "Nbda")}
            </Button>
          }
        />
      ) : (
        <div className="stack">
          {data.pathways.map((p, i) => (
            <section
              className={`panel pathway-card ${open === p.id ? "expanded" : ""}`}
              key={p.id}
            >
              <button
                className="pathway-top"
                onClick={() => setOpen(open === p.id ? "" : p.id)}
                aria-expanded={open === p.id}
              >
                <span className="path-number">0{i + 1}</span>
                <div>
                  <h2>{t(p.title)}</h2>
                  <p>{t(p.fit)}</p>
                </div>
                <ChevronRight size={20} />
              </button>
              <div className="path-graph">
                {p.steps.map((s, j) => (
                  <div className="path-node-wrap" key={j}>
                    <div
                      className={`path-node ${j === 0 ? "start" : j === p.steps.length - 1 ? "end" : ""}`}
                    >
                      {j === 0 ? (
                        <GraduationCap size={20} />
                      ) : j === p.steps.length - 1 ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <span>{j + 1}</span>
                      )}
                      <strong>{t(s)}</strong>
                    </div>
                    {j < p.steps.length - 1 && (
                      <ArrowRight className="path-arrow" size={24} />
                    )}
                  </div>
                ))}
              </div>
              {open === p.id && (
                <div className="pathway-details">
                  <dl>
                    {[
                      [t("Durée", "Lmodda"), p.duration],
                      [t("Exigence", "S3ouba"), p.difficulty],
                      [
                        t("Professionnalisation", "Tatbi9 mihani"),
                        p.professionalization,
                      ],
                      [t("Flexibilité", "Flexibilité"), p.flexibility],
                      [t("Coût", "Takalif"), p.cost],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{t(v)}</dd>
                      </div>
                    ))}
                  </dl>
                  <div>
                    <h3>{t("Points de vigilance", "No9at khas l2intibah")}</h3>
                    <ul>
                      {p.risks.map((x) => (
                        <li key={x}>{t(x)}</li>
                      ))}
                    </ul>
                    <h3>
                      {t(
                        "Sorties possibles, sous conditions",
                        "Makharej momkina b chorot",
                      )}
                    </h3>
                    <p>{p.exits.map((x) => t(x)).join(" · ")}</p>
                    <LinkButton onClick={() => go("programs")}>
                      {t("Explorer les formations", "Nchouf les formations")}
                    </LinkButton>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
      {interview && (
        <Modal
          title={t("Trouver votre direction", "L9a lwijha dyalek")}
          onClose={() => setInterview(false)}
        >
          <div className="wizard-progress">
            <span>
              {t("Question", "Sou2al")} {step + 1}/4
            </span>
            <Progress percent={(step + 1) * 25} />
          </div>
          <h3 className="wizard-question">{questions[step]}</h3>
          {step === 0 && (
            <Field
              label={t(
                "Vos matières préférées, séparées par des virgules",
                "Lmawad lli kay3ejbok, ferre9 b virgule",
              )}
            >
              <input
                value={prefs.interests.join(",")}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    interests: e.target.value.split(",").map((x) => x.trim()),
                  })
                }
                placeholder="Informatique, mathématiques, économie…"
              />
            </Field>
          )}
          {step === 1 && (
            <div className="choice-options">
              {[
                [
                  "practical",
                  "Des projets et de la pratique",
                  "Projets w tatbi9",
                ],
                ["theory", "Comprendre la théorie", "Nfhem théorie"],
                ["balanced", "Un équilibre des deux", "Tawazon binathom"],
              ].map(([id, fr, ary]) => (
                <button
                  className={prefs.style === id ? "chosen" : ""}
                  onClick={() =>
                    setPrefs({ ...prefs, style: id as Preferences["style"] })
                  }
                  key={id}
                >
                  {t(fr, ary)}
                  {prefs.style === id && <Check size={17} />}
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <Field
              label={t(
                "Un métier, un domaine ou « à explorer »",
                "Métier, domaine wlla « mazal n9elleb »",
              )}
            >
              <input
                value={prefs.goal}
                onChange={(e) => setPrefs({ ...prefs, goal: e.target.value })}
              />
            </Field>
          )}
          {step === 3 && (
            <>
              <Field label={t("Villes acceptables", "Lmdoun lli ynasbok")}>
                <input
                  value={prefs.cities.join(",")}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      cities: e.target.value.split(",").map((x) => x.trim()),
                    })
                  }
                />
              </Field>
              <Field
                label={t(
                  "Budget annuel (€), si connu",
                  "Budget dyal l3am (€), ila 3refti",
                )}
              >
                <input
                  type="number"
                  min={0}
                  value={prefs.annual_budget ?? ""}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      annual_budget: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </Field>
            </>
          )}
          <div className="form-actions">
            <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
              {t("Précédent", "Lli 9bel")}
            </Button>
            {step < 3 ? (
              <Button variant="primary" onClick={() => setStep(step + 1)}>
                {t("Continuer", "Kemme l".replace("Kemme l", "Kemmel"))}
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={async () => {
                  if (
                    await mutate(
                      "/profile",
                      { values: {}, preferences: prefs },
                      "PUT",
                    )
                  )
                    setInterview(false);
                }}
              >
                {t("Voir mes pistes", "Nchouf l2afkar")}
              </Button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
function CompassIcon() {
  return <GraduationCap size={17} />;
}
