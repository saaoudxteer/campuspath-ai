import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db";
import {
  PROFILE_FIELDS,
} from "@/server/seed";
import {
  CRITICAL_CLAIMS,
  factValue,
  now,
  programBlockers,
  audit,
  tasks,
} from "@/server/domain";
import {
  cvDraft,
  motivationDraft,
  interviewFeedback,
  extractDocument,
} from "@/server/ai";
import type {
  Candidate,
  Question,
  Education,
  Grade,
  Experience,
} from "@/lib/schema";

function getCandidateFromRequest(req: NextRequest): Candidate | null {
  const cookieToken = req.cookies.get("campuspath_session")?.value;
  const headerToken =
    req.headers.get("x-campuspath-session") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = cookieToken || headerToken;
  return db.getSessionUser(token);
}

function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
) {
  response.cookies.set("campuspath_session", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
  });
  response.headers.set("X-CampusPath-Session", token);
}

function err(message: string, status = 400) {
  return NextResponse.json({ detail: message }, { status });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await context.params;
  const path = "/" + slug.join("/");

  if (path === "/health") {
    return NextResponse.json({
      status: "ok",
      demo_mode: true,
      version: "0.1.0",
    });
  }

  if (path === "/state") {
    const c = getCandidateFromRequest(req);
    if (!c) {
      return err("Connectez-vous pour retrouver votre dossier.", 401);
    }
    return NextResponse.json(db.snapshot(c));
  }

  // /documents/{id}/download
  if (slug[0] === "documents" && slug[2] === "download") {
    const c = getCandidateFromRequest(req);
    if (!c) return err("Non autorisé.", 401);
    const docId = slug[1];
    const doc = db.documents.get(docId);
    if (!doc || doc.candidateId !== c.id) {
      return err("Document introuvable.", 404);
    }
    const ext =
      doc.mime === "application/pdf"
        ? "pdf"
        : doc.mime === "image/png"
          ? "png"
          : "jpg";
    return new NextResponse(new Uint8Array(doc.content), {
      headers: {
        "Content-Type": doc.mime,
        "Content-Disposition": `attachment; filename="document-${docId}.${ext}"`,
        "Content-Security-Policy": "sandbox",
      },
    });
  }

  return err("Route introuvable", 404);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await context.params;
  const path = "/" + slug.join("/");

  if (path === "/auth/demo") {
    const { candidate, token, expiresAt } = db.createDemo();
    const res = NextResponse.json(db.snapshot(candidate));
    setSessionCookie(res, token, expiresAt);
    return res;
  }

  if (path === "/auth/register") {
    const body = await req.json().catch(() => ({}));
    if (!body.email || !body.password) {
      return err("Email et mot de passe requis.", 422);
    }
    try {
      const { candidate, token, expiresAt } = db.registerUser(
        body.email,
        body.password,
      );
      const res = NextResponse.json(db.snapshot(candidate), { status: 201 });
      setSessionCookie(res, token, expiresAt);
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur de création";
      return err(msg, 409);
    }
  }

  if (path === "/auth/login") {
    const body = await req.json().catch(() => ({}));
    if (!body.email || !body.password) {
      return err("Email et mot de passe requis.", 422);
    }
    try {
      const { candidate, token, expiresAt } = db.loginUser(
        body.email,
        body.password,
      );
      const res = NextResponse.json(db.snapshot(candidate));
      setSessionCookie(res, token, expiresAt);
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Identifiants invalides";
      return err(msg, 401);
    }
  }

  if (path === "/auth/logout") {
    const cookieToken = req.cookies.get("campuspath_session")?.value;
    if (cookieToken) db.deleteSession(cookieToken);
    const res = NextResponse.json({ ok: true });
    res.cookies.delete("campuspath_session");
    return res;
  }

  // All endpoints below require active authentication
  const c = getCandidateFromRequest(req);
  if (!c) {
    return err("Connectez-vous pour retrouver votre dossier.", 401);
  }

  // POST /facts/{fact_id}/review
  if (slug[0] === "facts" && slug[2] === "review") {
    const factId = slug[1];
    const body = await req.json().catch(() => ({}));
    if (!body.confirmed) {
      return err(
        "Confirmez la modification après comparaison avec la source.",
        422,
      );
    }
    const f = c.facts.find((fact) => fact.id === factId);
    if (!f) return err("Information introuvable.", 404);
    if (body.evidence_checked && !body.document_id) {
      return err("Sélectionnez un justificatif.", 422);
    }
    if (
      body.document_id &&
      !c.documents.some(
        (d) => d.id === body.document_id && d.status !== "REJECTED",
      )
    ) {
      return err("Le justificatif doit appartenir à votre dossier.", 422);
    }

    f.value = body.value ?? f.value;
    f.document_id = body.document_id ?? null;
    f.page = body.page ?? null;
    f.user_confirmed = true;
    f.status = body.evidence_checked ? "VERIFIED" : "SELF_DECLARED";

    return NextResponse.json(db.persist(c, "fact.reviewed"));
  }

  // POST /documents
  if (path === "/documents") {
    if (c.documents.length >= 100) {
      return err("Limite de 100 documents atteinte.", 422);
    }
    const formData = await req.formData().catch(() => null);
    if (!formData) return err("Format invalide.", 422);
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string) || "other";
    if (!file) return err("Fichier requis.", 422);

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > 10 * 1024 * 1024) {
      return err("Fichier trop volumineux (10 Mo maximum).", 413);
    }

    let mime = file.type;
    if (!mime) {
      if (buffer.subarray(0, 4).toString() === "%PDF") mime = "application/pdf";
      else if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      )
        mime = "image/png";
      else if (buffer[0] === 0xff && buffer[1] === 0xd8) mime = "image/jpeg";
    }

    const docId = crypto.randomUUID();
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    if (
      Array.from(db.documents.values()).some(
        (d) => d.candidateId === c.id && d.sha256 === sha256,
      )
    ) {
      return err("Ce document est déjà dans votre dossier.", 409);
    }

    const textContent = buffer.toString("utf-8", 0, Math.min(buffer.length, 50000));
    const extraction = extractDocument(textContent, mime, docId);

    const doc = {
      id: docId,
      name: file.name.slice(0, 180) || "document",
      kind,
      mime,
      size: buffer.length,
      status: "NEEDS_REVIEW",
      uploaded_at: now(),
      is_mock: false,
      extraction: extraction.facts,
      processing_note: extraction.note,
    };

    c.documents.push(doc);
    db.documents.set(docId, {
      id: docId,
      candidateId: c.id,
      mime,
      content: buffer,
      sha256,
    });

    return NextResponse.json(db.persist(c, "document.uploaded"), {
      status: 201,
    });
  }

  // POST /documents/{id}/review
  if (slug[0] === "documents" && slug[2] === "review") {
    const docId = slug[1];
    const doc = c.documents.find((d) => d.id === docId);
    if (!doc) return err("Document introuvable.", 404);
    const body = await req.json().catch(() => ({}));
    if (!body.confirmed) {
      return err("Confirmez que vous avez relu la pièce.", 422);
    }
    if (body.education_id) {
      const edu = c.education.find((e) => e.id === body.education_id);
      if (
        !edu ||
        doc.kind !== "transcript" ||
        !edu.expected_semesters.includes(body.semester)
      ) {
        return err(
          "Choisissez une année et un semestre attendus pour ce relevé.",
          422,
        );
      }
      if (!edu.transcript_semesters.includes(body.semester)) {
        edu.transcript_semesters.push(body.semester);
        edu.transcript_semesters.sort((a, b) => a - b);
      }
    }
    doc.status = "VERIFIED";
    if (body.import_extraction && doc.extraction) {
      for (const extracted of doc.extraction) {
        const existing = c.facts.find((f) => f.key === extracted.key);
        if (existing) {
          existing.value = extracted.value;
          existing.document_id = doc.id;
          existing.page = extracted.page;
          existing.user_confirmed = true;
          existing.status = "VERIFIED";
        }
      }
    }
    return NextResponse.json(db.persist(c, "document.reviewed"));
  }

  // POST /education
  if (path === "/education") {
    const body = (await req.json().catch(() => ({}))) as Education;
    if (!body.id) body.id = crypto.randomUUID();
    const old = c.education.find((e) => e.id === body.id);
    body.transcript_semesters = old ? old.transcript_semesters : [];
    c.education = c.education.filter((e) => e.id !== body.id).concat([body]);
    return NextResponse.json(db.persist(c, "education.saved"));
  }

  // POST /grades
  if (path === "/grades") {
    const body = (await req.json().catch(() => ({}))) as Grade;
    if (!body.id) body.id = crypto.randomUUID();
    if (
      body.document_id &&
      !c.documents.some(
        (d) => d.id === body.document_id && d.status !== "REJECTED",
      )
    ) {
      return err("Le justificatif doit appartenir à votre dossier.", 422);
    }
    if (
      c.grades.some(
        (g) =>
          g.subject.toLowerCase() === body.subject.toLowerCase() &&
          g.semester === body.semester &&
          g.id !== body.id,
      )
    ) {
      return err(
        "Cette matière existe déjà pour ce semestre. Modifiez la note existante.",
        409,
      );
    }
    c.grades = c.grades.filter((g) => g.id !== body.id).concat([body]);
    return NextResponse.json(db.persist(c, "grade.saved"));
  }

  // POST /experiences
  if (path === "/experiences") {
    const body = (await req.json().catch(() => ({}))) as Experience;
    if (!body.id) body.id = crypto.randomUUID();
    if (
      body.document_id &&
      !c.documents.some(
        (d) => d.id === body.document_id && d.status !== "REJECTED",
      )
    ) {
      return err("Le justificatif doit appartenir à votre dossier.", 422);
    }
    c.experiences = c.experiences
      .filter((e) => e.id !== body.id)
      .concat([body]);
    return NextResponse.json(db.persist(c, "experience.saved"));
  }

  // POST /programs/{id}/questions
  if (slug[0] === "programs" && slug[2] === "questions") {
    const programId = slug[1];
    const p = db.getPrograms(c).find((prog) => prog.id === programId);
    if (!p) return err("Formation introuvable.", 404);
    const body = await req.json().catch(() => ({}));
    if (!CRITICAL_CLAIMS[body.claim_key]) {
      return err("Exigence inconnue.", 422);
    }
    if (
      c.questions.some(
        (q) =>
          q.program_id === programId &&
          q.claim_key === body.claim_key &&
          q.status !== "RESOLVED",
      )
    ) {
      return err("Une question ouverte existe déjà pour ce point.", 409);
    }

    const label = CRITICAL_CLAIMS[body.claim_key];
    const questionText = `Pouvez-vous confirmer : ${label.toLowerCase()} pour mon profil ?`;
    const subject = `Demande de clarification — ${p.title}`;
    const draft = `Madame, Monsieur,\n\nJe prépare une candidature à votre formation ${p.title}. Ma situation actuelle est la suivante : ${factValue(c, "academic_status") || "[situation à compléter]"}.\n\n${questionText}\n\nCe point n’est pas confirmé dans les informations dont je dispose. Pourriez-vous m’indiquer la règle applicable à ma situation et, si possible, la page officielle de référence ?\n\nJe vous remercie pour votre aide.\n\n${factValue(c, "first_name")} ${factValue(c, "last_name")}`;
    const contact = p.claims.contact;

    const newQ: Question = {
      id: crypto.randomUUID(),
      program_id: programId,
      claim_key: body.claim_key,
      question: questionText,
      reason: `${label} : information critique non résolue. L’absence de réponse peut modifier votre stratégie.`,
      recipient:
        contact && contact.status === "CONFIRMED" ? contact.value : null,
      subject,
      email_draft: draft,
      status: "DRAFT",
      candidate_approval: false,
      created_at: now(),
      sent_at: null,
      response: "",
      conclusion: "",
    };

    c.questions.push(newQ);
    return NextResponse.json(db.persist(c, "question.drafted"));
  }

  // POST /questions/{id}
  if (slug[0] === "questions" && slug.length === 2) {
    const questionId = slug[1];
    const q = c.questions.find((quest) => quest.id === questionId);
    if (!q) return err("Question introuvable.", 404);
    const body = await req.json().catch(() => ({}));

    const allowedTransitions: Record<string, { from: string[]; to: string }> = {
      approve: { from: ["DRAFT"], to: "APPROVED" },
      record_sent: { from: ["APPROVED"], to: "SENT" },
      waiting: { from: ["SENT"], to: "WAITING" },
      answer: { from: ["SENT", "WAITING"], to: "ANSWERED" },
      resolve: { from: ["ANSWERED"], to: "RESOLVED" },
    };

    const trans = allowedTransitions[body.action];
    if (!trans || !trans.from.includes(q.status) || !body.confirmed) {
      return err("Transition invalide ou confirmation manquante.", 409);
    }

    if (body.action === "approve") {
      q.candidate_approval = true;
    }
    if (body.action === "record_sent") {
      if (
        !body.recipient ||
        !body.recipient.includes("@") ||
        body.recipient.includes("\n") ||
        body.recipient.includes("\r")
      ) {
        return err("Indiquez le destinataire réel de votre envoi.", 422);
      }
      q.recipient = body.recipient;
      q.sent_at = now();
    }
    if (body.action === "answer") {
      if (!body.response?.trim()) {
        return err("Ajoutez la réponse reçue.", 422);
      }
      q.response = body.response;
    }
    if (body.action === "resolve") {
      if (!body.conclusion?.trim()) {
        return err(
          "Ajoutez une conclusion vérifiée à partir de la réponse.",
          422,
        );
      }
      q.conclusion = body.conclusion;
      const value = (body.normalized_value?.trim() || q.conclusion) as string;
      if (q.claim_key === "eligibility" && !["OUI", "NON"].includes(value)) {
        return err(
          "Sélectionnez une décision explicite : OUI ou NON. Si la réponse est incertaine, gardez la question ouverte.",
          422,
        );
      }
      if (q.claim_key === "language" && !["A1", "A2", "B1", "B2", "C1", "C2"].includes(value)) {
        return err("Saisissez le niveau CECRL confirmé.", 422);
      }

      if (!c.overrides) c.overrides = {};
      if (!c.overrides[q.program_id]) c.overrides[q.program_id] = {};
      c.overrides[q.program_id][q.claim_key] = {
        value,
        status: "CONFIRMED",
        source_url: `correspondence:${q.id}`,
        retrieved_at: new Date().toISOString().split("T")[0],
        source_type: "correspondence",
        note: "Réponse saisie et conclusion confirmée par le candidat ; authenticité non certifiée automatiquement.",
      };
    }

    q.status = trans.to as Question["status"];
    return NextResponse.json(db.persist(c, `question.${body.action}`));
  }

  // POST /programs/{id}/selection
  if (slug[0] === "programs" && slug[2] === "selection") {
    const programId = slug[1];
    const p = db.getPrograms(c).find((prog) => prog.id === programId);
    if (!p) return err("Formation introuvable.", 404);
    const body = await req.json().catch(() => ({}));
    let s = c.selections.find((sel) => sel.program_id === programId);
    if (!s) {
      s = {
        program_id: programId,
        status: "INTERESTED",
        rank: c.selections.length + 1,
        saved: false,
        selected: false,
        note: "",
        updated_at: now(),
      };
      c.selections.push(s);
    }

    if (body.action === "save") {
      s.saved = !s.saved;
    }
    if (body.action === "select") {
      if (!body.confirmed) return err("Confirmez votre choix de formation.", 422);
      const cycle = db.getCycle(c);
      const currentSelected = c.selections.filter(
        (x) => x.selected && x.program_id !== programId,
      );
      if (currentSelected.length >= cycle.max_choices) {
        return err(`Limite configurée : ${cycle.max_choices} choix.`, 409);
      }
      const selIds = new Set(currentSelected.map((x) => x.program_id));
      const sameCount = db
        .getPrograms(c)
        .filter((x) => x.category === p.category && selIds.has(x.id)).length;
      if (
        cycle.category_limits[p.category] &&
        sameCount >= cycle.category_limits[p.category]
      ) {
        return err(
          "Limite de choix atteinte pour cette catégorie.",
          409,
        );
      }
      if (p.claims.eligibility && p.claims.eligibility.value === "NON") {
        return err(
          "Éligibilité non satisfaite : résolvez ce point avant sélection.",
          409,
        );
      }
      s.selected = true;
      s.saved = true;
      s.status = "SELECTED";
    }
    if (["remove", "reject"].includes(body.action)) {
      s.selected = false;
      s.saved = false;
      s.status = body.action === "remove" ? "WITHDRAWN" : "REJECTED";
    }
    if (body.action === "rank") {
      s.rank = body.rank;
    }
    if (body.action === "track") {
      if (!body.confirmed || !s.selected) {
        return err("Sélection et confirmation explicite requises.", 409);
      }
      const allowed: Record<string, string[]> = {
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
      if (!allowed[s.status]?.includes(body.status)) {
        return err(
          "Ce changement ne suit pas l’état actuel de la candidature.",
          409,
        );
      }
      if (
        body.status === "APPLIED" &&
        (programBlockers(c, p).length ||
          audit(c, db.getPrograms(c), db.getCycle(c)).critical.length)
      ) {
        return err(
          "L’audit doit être résolu avant d’enregistrer un dépôt.",
          409,
        );
      }
      s.status = body.status;
      s.note = body.note || "";
      if (body.status === "WITHDRAWN") s.selected = false;
    }

    s.updated_at = now();
    const shouldInvalidate =
      ["select", "remove", "reject"].includes(body.action) ||
      (body.action === "track" && body.status === "WITHDRAWN");
    return NextResponse.json(
      db.persist(c, `selection.${body.action}`, shouldInvalidate),
    );
  }

  // POST /artifacts
  if (path === "/artifacts") {
    const body = await req.json().catch(() => ({}));
    const selected = c.selections.filter((s) => s.selected);
    if (!selected.length) {
      return err(
        "Sélectionnez vos formations avant de préparer vos documents.",
        409,
      );
    }
    if (
      !factValue(c, "first_name") ||
      !factValue(c, "last_name") ||
      !factValue(c, "academic_status")
    ) {
      return err(
        "Identité et situation académique à compléter ou vérifier avant génération.",
        409,
      );
    }

    let artifact;
    if (body.kind === "cv") {
      const focus = selected
        .map(
          (s) =>
            db.getPrograms(c).find((prog) => prog.id === s.program_id)?.title,
        )
        .filter(Boolean)
        .join(", ");
      artifact = cvDraft(c, focus);
    } else if (body.kind === "motivation") {
      if (!c.narrative.approved) {
        return err(
          "Validez votre projet d’études et votre projet professionnel.",
          409,
        );
      }
      if (!selected.some((s) => s.program_id === body.program_id)) {
        return err("Cette formation n’est pas sélectionnée.", 409);
      }
      const p = db.getPrograms(c).find((prog) => prog.id === body.program_id);
      if (!p) return err("Formation introuvable.", 404);
      const blockers = programBlockers(c, p);
      if (blockers.length) {
        return err(
          "Fiche formation incomplète : " + blockers.join("; "),
          409,
        );
      }
      artifact = motivationDraft(c, p, db.getCycle(c).motivation_limit);
    } else {
      return err("Type de document inconnu.", 422);
    }

    c.artifacts = c.artifacts
      .filter(
        (a) =>
          !(a.kind === artifact.kind && a.program_id === artifact.program_id),
      )
      .concat([artifact]);

    return NextResponse.json(db.persist(c, "artifact.generated", false));
  }

  // POST /artifacts/{id}/approve
  if (slug[0] === "artifacts" && slug[2] === "approve") {
    const artifactId = slug[1];
    const artifact = c.artifacts.find((a) => a.id === artifactId);
    if (!artifact) return err("Document introuvable.", 404);
    const body = await req.json().catch(() => ({}));
    if (!body.confirmed || artifact.source_revision !== c.revision) {
      return err(
        "Régénérez le document depuis les dernières informations puis confirmez sa relecture.",
        409,
      );
    }
    if (
      artifact.kind === "motivation" &&
      artifact.text.length > db.getCycle(c).motivation_limit
    ) {
      return err(
        "La motivation dépasse la limite configurée. Réduisez vos projets puis régénérez.",
        409,
      );
    }
    artifact.approved = true;
    return NextResponse.json(db.persist(c, "artifact.approved", false));
  }

  // POST /interview
  if (path === "/interview") {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json(interviewFeedback(body, c));
  }

  // POST /tasks/{id}/complete
  if (slug[0] === "tasks" && slug[2] === "complete") {
    const taskId = slug[1];
    const curTasks = tasks(c, db.getPrograms(c), db.getCycle(c));
    const targetTask = curTasks.find((t) => t.id === taskId);
    if (!targetTask || ["CRITICAL", "HIGH"].includes(targetTask.priority)) {
      return err(
        "Cette priorité se résout en corrigeant sa cause, pas en la masquant.",
        409,
      );
    }
    if (!c.completed_tasks.includes(taskId)) {
      c.completed_tasks.push(taskId);
    }
    return NextResponse.json(db.persist(c, "task.completed", false));
  }

  return err("Route introuvable", 404);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await context.params;
  const path = "/" + slug.join("/");

  const c = getCandidateFromRequest(req);
  if (!c) {
    return err("Connectez-vous pour retrouver votre dossier.", 401);
  }

  // PUT /profile
  if (path === "/profile") {
    const body = await req.json().catch(() => ({}));
    const allowed = new Set(PROFILE_FIELDS.map(([k]) => k));
    for (const key of Object.keys(body.values || {})) {
      if (!allowed.has(key)) return err("Champ de profil inconnu.", 422);
    }
    for (const [key, rawVal] of Object.entries(body.values || {})) {
      const val = String(rawVal);
      if (val.length > 3000) return err("Valeur trop longue.", 422);
      if (key === "birth_date" && val) {
        if (new Date(val) >= new Date()) {
          return err("Date de naissance invalide.", 422);
        }
      }
      let f = c.facts.find((fact) => fact.key === key);
      if (!f) {
        const item = PROFILE_FIELDS.find(([k]) => k === key);
        if (item) {
          f = {
            id: crypto.randomUUID(),
            key,
            label: item[1],
            section: item[2],
            value: "",
            status: "SELF_DECLARED",
            document_id: null,
            page: null,
            confidence: null,
            user_confirmed: true,
          };
          c.facts.push(f);
        }
      }
      if (f && f.value !== val.trim()) {
        f.value = val.trim();
        f.status = "SELF_DECLARED";
        f.document_id = null;
        f.user_confirmed = true;
      }
    }
    if (body.preferences) {
      c.preferences = body.preferences;
    }
    c.narrative.approved = false;
    return NextResponse.json(db.persist(c, "profile.updated"));
  }

  // PUT /orientation
  if (path === "/orientation") {
    const body = await req.json().catch(() => ({}));
    c.orientation = body;
    return NextResponse.json(db.persist(c, "orientation.updated", false));
  }

  // PUT /narrative
  if (path === "/narrative") {
    const body = await req.json().catch(() => ({}));
    if (!c.selections.some((s) => s.selected)) {
      return err(
        "Sélectionnez vos formations avant de construire le projet final.",
        409,
      );
    }
    if (
      body.approved &&
      ((body.study_project || "").trim().length < 30 ||
        (body.professional_project || "").trim().length < 30)
    ) {
      return err(
        "Développez chaque projet avant de le valider (30 caractères minimum).",
        422,
      );
    }
    c.narrative = body;
    return NextResponse.json(db.persist(c, "narrative.saved"));
  }

  // PUT /cycle
  if (path === "/cycle") {
    const body = await req.json().catch(() => ({}));
    c.cycle = body;
    return NextResponse.json(db.persist(c, "cycle.updated"));
  }

  return err("Route introuvable", 404);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const { slug = [] } = await context.params;
  const c = getCandidateFromRequest(req);
  if (!c) {
    return err("Connectez-vous pour retrouver votre dossier.", 401);
  }

  // DELETE /grades/{id}
  if (slug[0] === "grades" && slug.length === 2) {
    const gradeId = slug[1];
    c.grades = c.grades.filter((g) => g.id !== gradeId);
    return NextResponse.json(db.persist(c, "grade.deleted"));
  }

  return err("Route introuvable", 404);
}
