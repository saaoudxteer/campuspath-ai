import type {
  Candidate,
  Program,
  Artifact,
  Fact,
} from "@/lib/schema";
import { factValue } from "./domain";

export interface InterviewAnswerInput {
  question: string;
  answer: string;
}

export interface InterviewFeedbackOutput {
  assessment: string;
  strengths: string[];
  improvements: string[];
  follow_up: string;
}

export interface ExtractionResult {
  facts: Fact[];
  note: string;
}

export function extractDocument(
  contentStr: string,
  mime: string,
  documentId: string,
): ExtractionResult {
  if (mime !== "application/pdf") {
    return {
      facts: [],
      note: "Image reçue. OCR non connecté : renseignez et vérifiez les informations manuellement.",
    };
  }

  const emailMatch = contentStr.match(
    /(?:E-?mail|Courriel)\s*:\s*([^\s@]+@[^\s@]+\.[^\s@]+)/i,
  );
  if (emailMatch) {
    return {
      facts: [
        {
          id: crypto.randomUUID(),
          key: "email",
          label: "Email détecté",
          section: "contact",
          value: emailMatch[1].replace(/[.,;]+$/, ""),
          status: "NEEDS_REVIEW",
          document_id: documentId,
          page: 1,
          confidence: 0.8,
          user_confirmed: false,
        },
      ],
      note: "Lecture du texte PDF effectuée. Aucune information ne remplace votre profil sans confirmation.",
    };
  }

  return {
    facts: [],
    note: "Aucun champ reconnu avec certitude. Ajoutez les informations manuellement en citant cette pièce.",
  };
}

export function cvDraft(c: Candidate, focus: string): Artifact {
  const facts = c.facts.filter(
    (f) =>
      f.value &&
      !["MISSING", "INCONSISTENT", "NEEDS_REVIEW"].includes(f.status),
  );
  const name = `${factValue(c, "first_name")} ${factValue(c, "last_name")}`;
  const lines: string[] = [
    name.trim(),
    `${factValue(c, "email")} · ${factValue(c, "city")}`,
    `Candidature : ${focus}`,
    "",
    "FORMATION",
  ];

  const sortedEdu = [...c.education].sort(
    (a, b) => b.start_year - a.start_year,
  );
  for (const e of sortedEdu) {
    lines.push(`${e.start_year}–${e.end_year} | ${e.label} · ${e.institution}`);
  }

  lines.push("", "PROJETS, EXPÉRIENCES ET COMPÉTENCES");
  for (const e of c.experiences) {
    if (e.user_confirmed) {
      lines.push(`${e.title} — ${e.description}`);
    }
  }

  lines.push(
    "",
    "LANGUES",
    `Français : ${factValue(c, "french_level")} · Anglais : ${factValue(c, "english_level")}`,
  );

  const refs = [
    ...facts.map((f) => f.id),
    ...c.education.map((e) => e.id),
    ...c.experiences.filter((e) => e.user_confirmed).map((e) => e.id),
  ];

  return {
    id: crypto.randomUUID(),
    kind: "cv",
    program_id: null,
    text: lines.join("\n"),
    source_revision: c.revision,
    approved: false,
    engine: "deterministic",
    assertions: [
      {
        text: "Contenu issu des données du candidat",
        fact_ids: refs,
        program_fields: [],
      },
    ],
    quality_warnings: [
      "Relisez les déclarations et vérifiez les pièces exigées. Export texte MVP ; PDF à intégrer.",
    ],
  };
}

export function motivationDraft(
  c: Candidate,
  p: Program,
  limit: number,
): Artifact {
  const status = factValue(c, "academic_status");
  const curriculum = p.claims.curriculum?.value || "";
  const text = `Madame, Monsieur,\n\nActuellement en ${status}, je souhaite candidater à votre formation ${p.title}, au sein de ${p.institution.name}.\n\n${c.narrative.study_project}\n\nLe contenu de cette formation — ${curriculum} — correspond au parcours que je souhaite construire.\n\n${c.narrative.professional_project}\n\nJe vous remercie de l’attention portée à ma candidature.\n\n${factValue(c, "first_name")} ${factValue(c, "last_name")}`;

  const warnings = [
    "Brouillon à personnaliser et relire. Les projets sont vos déclarations ; ils ne sont pas vérifiés par une IA.",
  ];
  if (text.length > limit) {
    warnings.push(
      `Le texte dépasse la limite configurée de ${limit} caractères.`,
    );
  }

  const refs = c.facts
    .filter((f) =>
      ["academic_status", "first_name", "last_name"].includes(f.key),
    )
    .map((f) => f.id);

  return {
    id: crypto.randomUUID(),
    kind: "motivation",
    program_id: p.id,
    text,
    source_revision: c.revision,
    approved: false,
    engine: "deterministic",
    assertions: [
      { text: "Situation et identité", fact_ids: refs, program_fields: [] },
      {
        text: "Programme",
        fact_ids: [],
        program_fields: ["title", "institution.name", "curriculum"],
      },
      {
        text: "Projets déclarés par le candidat",
        fact_ids: ["narrative.study_project", "narrative.professional_project"],
        program_fields: [],
      },
    ],
    quality_warnings: warnings,
  };
}

export function interviewFeedback(
  answer: InterviewAnswerInput,
  c: Candidate,
): InterviewFeedbackOutput {
  const words = answer.answer.trim().split(/\s+/);
  const improvements: string[] = [];
  const strengths: string[] = [];

  if (words.length < 35) {
    improvements.push(
      "Développez un exemple concret de votre parcours, puis reliez-le au programme.",
    );
  } else {
    strengths.push(
      "Vous avez suffisamment développé votre réponse pour une première relecture.",
    );
  }

  if (
    c.preferences.goal &&
    !c.preferences.goal
      .split(/\s+/)
      .filter((w) => w.length > 5)
      .some((w) => answer.answer.toLowerCase().includes(w.toLowerCase()))
  ) {
    improvements.push(
      "Reliez explicitement cette réponse à votre objectif professionnel.",
    );
  }

  improvements.push(
    "Vérifiez chaque fait dans votre dossier ; cette grille ne juge ni l’expression orale ni la véracité.",
  );

  return {
    assessment: "Retour indicatif sur le texte, sans note d’admission.",
    strengths,
    improvements,
    follow_up:
      "Quel exemple précis de votre parcours justifie ce choix de formation ?",
  };
}
