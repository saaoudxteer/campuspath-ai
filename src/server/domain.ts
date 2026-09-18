import type {
  Candidate,
  Program,
  Cycle,
  Diagnostic,
  Completeness,
  Match,
  MatchDimension,
  Pathway,
  Task,
  Audit,
  Grade,
} from "@/lib/schema";

export const CRITICAL_CLAIMS: Record<string, string> = {
  curriculum: "Programme pédagogique",
  prerequisites: "Prérequis",
  route: "Voie de candidature",
  deadline: "Date limite",
  language: "Exigences linguistiques",
  tuition: "Frais de scolarité",
  eligibility: "Éligibilité",
};

export const IDENTITY_KEYS = [
  "first_name",
  "last_name",
  "birth_date",
  "nationality",
  "residence",
];
export const CONTACT_KEYS = [
  "city",
  "address",
  "phone",
  "email",
  "academic_status",
];

export function now(): string {
  return new Date().toISOString();
}

export function factValue(c: Candidate, key: string): string {
  const f = c.facts.find(
    (fact) =>
      fact.key === key &&
      !["MISSING", "INCONSISTENT", "NEEDS_REVIEW"].includes(fact.status),
  );
  return f ? f.value : "";
}

export function weightedAverage(grades: Grade[]): number | null {
  const denominator = grades.reduce((acc, g) => acc + g.coefficient, 0);
  if (!denominator) return null;
  const numerator = grades.reduce(
    (acc, g) => acc + (g.value / g.scale) * 20 * g.coefficient,
    0,
  );
  return Math.round((numerator / denominator) * 100) / 100;
}

export function diagnose(c: Candidate): Diagnostic {
  const subjects: Record<string, number> = {};
  const semesters: Record<string, number> = {};

  const uniqueSubjects = Array.from(
    new Set<string>(c.grades.map((g) => g.subject)),
  ).sort();
  for (const s of uniqueSubjects) {
    const avg = weightedAverage(c.grades.filter((g) => g.subject === s));
    if (avg !== null) subjects[s] = avg;
  }

  const uniqueSemesters = Array.from(
    new Set<number>(c.grades.map((g) => g.semester)),
  ).sort((a: number, b: number) => a - b);
  for (const sem of uniqueSemesters) {
    const avg = weightedAverage(c.grades.filter((g) => g.semester === sem));
    if (avg !== null) semesters[String(sem)] = avg;
  }

  const orderedSubjects = Object.keys(subjects).sort(
    (a, b) => subjects[b] - subjects[a],
  );
  const semValues = Object.values(semesters);

  const warnings: string[] = [];
  if (!c.grades.length) {
    warnings.push("Ajoutez vos notes pour calculer votre diagnostic.");
  }
  if (
    c.grades.some(
      (g) =>
        !g.user_confirmed ||
        !c.documents.some(
          (d) =>
            d.id === g.document_id &&
            d.kind === "transcript" &&
            d.status === "VERIFIED",
        ),
    )
  ) {
    warnings.push(
      "Certaines notes sont déclarées et restent à vérifier sur pièce.",
    );
  }

  const seen = new Set<string>();
  for (const g of c.grades) {
    const key = `${g.subject.toLowerCase()}:${g.semester}`;
    if (seen.has(key)) {
      warnings.push(`Doublon possible : ${g.subject}, semestre ${g.semester}.`);
    }
    seen.add(key);
  }

  const progression =
    semValues.length >= 2
      ? Math.round((semValues[semValues.length - 1] - semValues[0]) * 100) / 100
      : null;

  return {
    average: weightedAverage(c.grades),
    subject_averages: subjects,
    semester_averages: semesters,
    strongest: orderedSubjects.slice(0, 2),
    weakest: [...orderedSubjects].reverse().slice(0, 2),
    progression,
    warnings,
    grade_count: c.grades.length,
  };
}

export function completeness(c: Candidate): Completeness {
  const present = (key: string) =>
    c.facts.some(
      (f) =>
        f.key === key &&
        f.value.trim() !== "" &&
        !["MISSING", "INCONSISTENT"].includes(f.status),
    );

  const requiredDocs = ["identity", "photo", "diploma", "transcript", "language"];
  const counts: [string, number, number][] = [
    [
      "Identité",
      IDENTITY_KEYS.filter((k) => present(k)).length,
      IDENTITY_KEYS.length,
    ],
    [
      "Coordonnées",
      CONTACT_KEYS.filter((k) => present(k)).length,
      CONTACT_KEYS.length,
    ],
    [
      "Documents",
      requiredDocs.filter((k) =>
        c.documents.some((d) => d.kind === k && d.status !== "REJECTED"),
      ).length,
      5,
    ],
    [
      "Parcours académique",
      (c.education.length ? 1 : 0) +
        (c.grades.length ? 1 : 0) +
        (c.education.length &&
        c.education.every((e) =>
          e.expected_semesters.every((s) => e.transcript_semesters.includes(s)),
        )
          ? 1
          : 0),
      3,
    ],
    [
      "Langues",
      (present("french_level") ? 1 : 0) +
        (present("english_level") ? 1 : 0) +
        (c.documents.some((d) => d.kind === "language" && d.status === "VERIFIED")
          ? 1
          : 0),
      3,
    ],
    [
      "Projet & expériences",
      (c.preferences.goal ? 1 : 0) +
        (c.preferences.interests.length ? 1 : 0) +
        (c.experiences.length || present("no_experience") ? 1 : 0),
      3,
    ],
  ];

  const complete = counts.reduce((acc, [, n]) => acc + n, 0);
  const total = counts.reduce((acc, [, , d]) => acc + d, 0);
  const populated = c.facts.filter((f) => f.value);
  const verified = populated.filter((f) => f.status === "VERIFIED").length;

  return {
    percent: Math.round((100 * complete) / total),
    verified_percent: populated.length
      ? Math.round((100 * verified) / populated.length)
      : 0,
    sections: counts.map(([label, n, d]) => ({
      label,
      complete: n,
      total: d,
      percent: Math.round((100 * n) / d),
    })),
  };
}

export function timelineTasks(c: Candidate): Task[] {
  const tasks: Task[] = [];
  const ordered = [...c.education].sort(
    (a, b) => a.start_year - b.start_year || a.end_year - b.end_year,
  );

  ordered.forEach((edu, index) => {
    const missing = edu.expected_semesters
      .filter((s) => !edu.transcript_semesters.includes(s))
      .sort((a, b) => a - b);

    for (const semester of missing) {
      tasks.push({
        id: `semester-${edu.id}-${semester}`,
        title: `Ajouter le relevé du semestre ${semester}`,
        detail: `${edu.label} : ce semestre n’a pas de relevé associé. Sans cette pièce, le parcours reste incomplet.`,
        priority: "CRITICAL",
        status: "TODO",
        next_action: "Ajouter mon relevé",
        route: "documents",
        program_id: null,
        document_id: null,
        deadline: null,
        warning_state: "NORMAL",
      });
    }

    if (
      index > 0 &&
      edu.start_year > ordered[index - 1].end_year &&
      !edu.explanation.trim()
    ) {
      tasks.push({
        id: `gap-${edu.id}`,
        title: "Expliquer une interruption de parcours",
        detail: `Période ${ordered[index - 1].end_year}–${edu.start_year} sans explication.`,
        priority: "HIGH",
        status: "TODO",
        next_action: "Compléter mon parcours",
        route: "academic",
        program_id: null,
        document_id: null,
        deadline: null,
        warning_state: "NORMAL",
      });
    }

    if (
      index > 0 &&
      edu.start_year < ordered[index - 1].end_year &&
      !edu.explanation.trim()
    ) {
      tasks.push({
        id: `overlap-${edu.id}`,
        title: "Vérifier des années qui se chevauchent",
        detail: `${edu.label} chevauche ${ordered[index - 1].label}. Documentez les études simultanées ou corrigez les dates.`,
        priority: "HIGH",
        status: "TODO",
        next_action: "Vérifier les dates",
        route: "academic",
        program_id: null,
        document_id: null,
        deadline: null,
        warning_state: "NORMAL",
      });
    }

    if (
      index > 0 &&
      edu.level === ordered[index - 1].level &&
      !edu.explanation.trim()
    ) {
      tasks.push({
        id: `repeat-${edu.id}`,
        title: "Préciser une année répétée",
        detail: `Deux années au niveau ${edu.level} : ajoutez une explication.`,
        priority: "HIGH",
        status: "TODO",
        next_action: "Expliquer cette année",
        route: "academic",
        program_id: null,
        document_id: null,
        deadline: null,
        warning_state: "NORMAL",
      });
    }
  });

  return tasks;
}

export function deadlineState(value: string | null, today?: Date): string {
  if (!value) return "UNKNOWN";
  const now = today || new Date();
  const d = new Date(value);
  if (isNaN(d.getTime())) return "UNKNOWN";
  const delta = Math.floor(
    (d.getTime() - new Date(now.toISOString().split("T")[0]).getTime()) /
      86400000,
  );
  if (delta < 0) return "OVERDUE";
  if (delta <= 3) return "URGENT";
  if (delta <= 14) return "SOON";
  return "NORMAL";
}

export function programBlockers(c: Candidate, p: Program): string[] {
  const blockers: string[] = [];
  for (const [key, label] of Object.entries(CRITICAL_CLAIMS)) {
    const claim = p.claims[key];
    if (
      !claim ||
      claim.status !== "CONFIRMED" ||
      !claim.value ||
      !claim.source_url ||
      !claim.retrieved_at
    ) {
      blockers.push(`${label} à confirmer`);
    } else if (
      !["official", "correspondence"].includes(claim.source_type) &&
      !c.is_demo
    ) {
      blockers.push(`${label} : source non admissible`);
    }
  }

  const eligibility = p.claims.eligibility;
  if (!eligibility || !["OUI", "NON"].includes(eligibility.value || "")) {
    blockers.push("Éligibilité : décision explicite manquante");
  } else if (eligibility.value === "NON") {
    blockers.push("Éligibilité non satisfaite");
  }

  const deadline = deadlineState(p.claims.deadline?.value ?? null);
  if (deadline === "UNKNOWN") blockers.push("Date limite exacte inconnue");
  if (deadline === "OVERDUE") blockers.push("Date limite dépassée");

  const levels: Record<string, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6,
  };
  const required = p.claims.language;
  if (required && required.status === "CONFIRMED") {
    const actual = levels[factValue(c, "french_level")] || 0;
    const reqLevel = levels[required.value || ""] || 0;
    if (!reqLevel || actual < reqLevel) {
      blockers.push("Prérequis de français non satisfait ou à clarifier");
    }
  }

  const french = c.facts.find((f) => f.key === "french_level");
  if (
    !french ||
    french.status !== "VERIFIED" ||
    !c.documents.some(
      (d) =>
        d.id === french.document_id &&
        d.kind === "language" &&
        d.status === "VERIFIED",
    )
  ) {
    blockers.push("Justificatif linguistique à vérifier");
  }

  if (c.questions.some((q) => q.program_id === p.id && q.status !== "RESOLVED")) {
    blockers.push("Question critique non résolue");
  }

  if (p.is_mock && !c.is_demo) {
    blockers.push("Formation de démonstration indisponible pour un dossier réel");
  }

  return blockers;
}

export function match(
  c: Candidate,
  p: Program,
  diagnostic: Diagnostic,
): Match {
  const average = diagnostic.average;
  const academic =
    average === null ? null : Math.min(100, Math.round((average / 20) * 100));

  const eligible = p.claims.eligibility;
  const prerequisite =
    !eligible ||
    eligible.status !== "CONFIRMED" ||
    !["OUI", "NON"].includes(eligible.value || "")
      ? null
      : eligible.value === "NON"
        ? 0
        : 100;

  const languageClaim = p.claims.language;
  const levels: Record<string, number> = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6,
  };
  const actual = levels[factValue(c, "french_level")] || null;
  const required =
    languageClaim && languageClaim.status === "CONFIRMED"
      ? levels[languageClaim.value || ""] || null
      : null;
  const language =
    !actual || !required ? null : Math.min(100, Math.round((actual / required) * 100));

  const interests = [
    ...c.preferences.interests,
    c.preferences.goal,
  ]
    .join(" ")
    .toLowerCase();
  const career = !interests.trim()
    ? null
    : p.tags.some((tag) => interests.includes(tag.toLowerCase()))
      ? 100
      : 40;

  const geography = !c.preferences.cities.length
    ? null
    : c.preferences.cities.includes(p.institution.city)
      ? 100
      : 35;

  const tuition = p.claims.tuition;
  const cost =
    tuition && tuition.status === "CONFIRMED" && tuition.value
      ? parseFloat(tuition.value)
      : null;
  const budget =
    cost === null || c.preferences.annual_budget === null
      ? null
      : cost <= c.preferences.annual_budget
        ? 100
        : 0;

  const dimensions: MatchDimension[] = [
    {
      key: "academic",
      label: "Académique",
      weight: 30,
      score: academic,
      reason: "Moyenne pondérée ramenée sur 100 ; ce n’est pas une probabilité.",
    },
    {
      key: "prerequisite",
      label: "Prérequis",
      weight: 25,
      score: prerequisite,
      reason: "Éligibilité documentée dans la fiche formation.",
    },
    {
      key: "language",
      label: "Langue",
      weight: 15,
      score: language,
      reason: "Niveau déclaré comparé au niveau requis ; certificat à vérifier.",
    },
    {
      key: "career",
      label: "Projet",
      weight: 15,
      score: career,
      reason:
        "Correspondance explicite des centres d’intérêt avec les thèmes de la formation.",
    },
    {
      key: "geography",
      label: "Géographie",
      weight: 10,
      score: geography,
      reason: "Ville dans vos préférences géographiques.",
    },
    {
      key: "budget",
      label: "Budget",
      weight: 5,
      score: budget,
      reason:
        "Frais de scolarité uniquement ; logement et vie quotidienne non inclus.",
    },
  ];

  const known = dimensions.filter((d) => d.score !== null);
  const coverage = known.reduce((acc, d) => acc + d.weight, 0);
  const score = coverage
    ? Math.round(
        known.reduce((acc, d) => acc + (d.score ?? 0) * d.weight, 0) / coverage,
      )
    : null;

  const blockers = programBlockers(c, p);
  let classification: "SAFER" | "TARGET" | "AMBITIOUS" | "UNASSESSED" | "INELIGIBLE" =
    "UNASSESSED";

  if (prerequisite === 0) {
    classification = "INELIGIBLE";
  } else if (score !== null && prerequisite === 100 && average !== null) {
    classification =
      score >= 85 && !blockers.length
        ? "SAFER"
        : score >= 65
          ? "TARGET"
          : "AMBITIOUS";
  }

  const risks = [...blockers];
  if (language !== null && language < 100) {
    risks.push("Niveau de français inférieur au prérequis déclaré");
  }
  if (!c.documents.some((d) => d.kind === "language" && d.status === "VERIFIED")) {
    risks.push("Justificatif linguistique à vérifier");
  }
  risks.push(
    "Sélectivité réelle inconnue ; aucune chance d’admission calculée.",
  );

  return {
    program_id: p.id,
    score,
    coverage,
    classification,
    dimensions,
    strengths: known
      .filter((d) => (d.score ?? 0) >= 80)
      .map((d) => `${d.label} : adéquation favorable`),
    risks,
    ready: !blockers.length,
    blockers,
  };
}

export function pathways(c: Candidate): Pathway[] {
  if (!c.preferences.interests.length && !c.preferences.goal) {
    return [];
  }
  const goal = c.preferences.goal || "Objectif à préciser";
  const hasLicence = c.education.some(
    (e) =>
      e.level.toLowerCase().includes("licence") ||
      e.level.toLowerCase().includes("l3"),
  );

  return [
    {
      id: "university",
      title: "La voie universitaire",
      steps: [
        hasLicence ? "Licence" : "Bac",
        hasLicence ? "Master" : "Licence",
        goal,
      ],
      fit: "À explorer selon vos matières et prérequis",
      duration: "Master : généralement 2 ans après la licence",
      difficulty: "Approfondissement théorique et autonomie",
      professionalization: "Projets et stages selon la formation",
      flexibility: "Spécialisation progressive",
      cost: "À vérifier auprès de chaque établissement",
      opportunities: [goal],
      risks: [
        "Admission sur dossier",
        "Les passerelles ne sont jamais automatiques",
      ],
      exits: ["Poursuite d’études", "Emploi selon compétences et marché"],
    },
    {
      id: "applied",
      title: "La voie professionnalisante",
      steps: ["Diplôme actuel", "Formation appliquée", "Stage / projet", goal],
      fit: "Intéressante si vous privilégiez la pratique",
      duration: "Variable selon le niveau d’entrée confirmé",
      difficulty: "Rythme soutenu et projets pratiques",
      professionalization: "Forte si stages et projets sont confirmés",
      flexibility: "Passerelles à vérifier individuellement",
      cost: "Aucune estimation sans source",
      opportunities: [goal],
      risks: [
        "Conditions d’accès spécifiques",
        "Alternance et financement non garantis",
      ],
      exits: ["Emploi", "Poursuite sous conditions"],
    },
    {
      id: "engineering",
      title: "La voie ingénieur",
      steps: [
        "Diplôme actuel",
        "Admission sur titre / concours",
        "Cycle ingénieur",
        goal,
      ],
      fit: "À examiner selon les fondamentaux scientifiques",
      duration: "Dépend du niveau d’admission",
      difficulty: "Exigence scientifique et sélection à documenter",
      professionalization: "Projets, stages, spécialisation",
      flexibility: "Entrées et sorties soumises aux règles de l’école",
      cost: "Tarifs et statut public / privé à vérifier",
      opportunities: [goal],
      risks: [
        "Diplôme et prérequis à confirmer",
        "Aucune passerelle garantie",
      ],
      exits: ["Emploi", "Recherche sous conditions"],
    },
  ];
}

export function tasks(
  c: Candidate,
  programs: Program[],
  cycle: Cycle,
): Task[] {
  const result: Task[] = timelineTasks(c);

  if (!c.education.length) {
    result.push({
      id: "education",
      title: "Reconstituer votre parcours",
      detail:
        "Ajoutez chaque année de formation, y compris les interruptions.",
      priority: "CRITICAL",
      status: "TODO",
      next_action: "Ajouter une année",
      route: "academic",
      program_id: null,
      document_id: null,
      deadline: null,
      warning_state: "NORMAL",
    });
  }

  const docKinds: [string, string][] = [
    ["identity", "pièce d’identité"],
    ["photo", "photo d’identité"],
    ["diploma", "diplôme"],
    ["language", "justificatif de langue"],
  ];
  for (const [kind, label] of docKinds) {
    if (!c.documents.some((d) => d.kind === kind && d.status !== "REJECTED")) {
      result.push({
        id: `doc-${kind}`,
        title: `Ajouter votre ${label}`,
        detail:
          "Pièce nécessaire à l’audit du dossier. Les exigences exactes dépendent de la procédure.",
        priority: "HIGH",
        status: "TODO",
        next_action: "Ajouter un document",
        route: "documents",
        program_id: null,
        document_id: null,
        deadline: null,
        warning_state: "NORMAL",
      });
    }
  }

  for (const f of c.facts) {
    if (f.key === "no_experience") continue;
    if (["MISSING", "INCONSISTENT", "NEEDS_REVIEW"].includes(f.status)) {
      result.push({
        id: `fact-${f.id}`,
        title: `Vérifier : ${f.label}`,
        detail:
          "Information manquante ou à revoir. Confirmez la valeur et sa source.",
        priority: "HIGH",
        status: "TODO",
        next_action: "Vérifier mon profil",
        route: "profile",
        program_id: null,
        document_id: null,
        deadline: null,
        warning_state: "NORMAL",
      });
    }
  }

  for (const q of c.questions) {
    if (q.status !== "RESOLVED") {
      let deadline: string | null = null;
      if (q.sent_at) {
        const sentDate = new Date(q.sent_at);
        deadline = new Date(sentDate.getTime() + 7 * 86400000)
          .toISOString()
          .split("T")[0];
      }
      result.push({
        id: `question-${q.id}`,
        title: q.question,
        detail: q.reason,
        priority: "HIGH",
        status: "TODO",
        next_action: "Examiner la question",
        route: "programs",
        program_id: q.program_id,
        document_id: null,
        deadline,
        warning_state: "NORMAL",
      });
    }
  }

  if (!c.selections.some((s) => s.selected)) {
    result.push({
      id: "select",
      title: "Construire votre sélection",
      detail:
        "Comparez les contenus, les contraintes et les points à confirmer avant de choisir.",
      priority: "MEDIUM",
      status: "TODO",
      next_action: "Explorer les formations",
      route: "programs",
      program_id: null,
      document_id: null,
      deadline: null,
      warning_state: "NORMAL",
    });
  }

  if (cycle.status !== "CONFIRMED") {
    result.push({
      id: "cycle",
      title: "Vérifier le calendrier officiel",
      detail:
        "Aucune date limite annuelle n’est supposée. Consultez le calendrier du cycle qui vous concerne.",
      priority: "HIGH",
      status: "TODO",
      next_action: "Voir les échéances",
      route: "tasks",
      program_id: null,
      document_id: null,
      deadline: null,
      warning_state: "NORMAL",
    });
  }

  if (cycle.deadline) {
    const state = deadlineState(cycle.deadline);
    result.push({
      id: "cycle-deadline",
      title: "Échéance du cycle de candidature",
      detail: cycle.label,
      priority: state === "OVERDUE" ? "CRITICAL" : "HIGH",
      status: "TODO",
      next_action: "Vérifier le calendrier",
      route: "tasks",
      program_id: null,
      document_id: null,
      deadline: cycle.deadline,
      warning_state: state,
    });
  }

  for (const p of programs) {
    if (!c.selections.some((s) => s.program_id === p.id && s.selected)) {
      continue;
    }
    const claim = p.claims.deadline;
    if (claim && claim.value && claim.status === "CONFIRMED") {
      const state = deadlineState(claim.value);
      result.push({
        id: `deadline-${p.id}`,
        title: `Échéance : ${p.title}`,
        detail: p.is_mock
          ? "Échéance illustrative"
          : "Date issue de la fiche formation.",
        priority: state === "OVERDUE" ? "CRITICAL" : "HIGH",
        status: "TODO",
        next_action: "Examiner la candidature",
        route: "applications",
        program_id: p.id,
        document_id: null,
        deadline: claim.value,
        warning_state: state,
      });
    }
  }

  for (const task of result) {
    if (
      ["MEDIUM", "LOW"].includes(task.priority) &&
      c.completed_tasks.includes(task.id)
    ) {
      task.status = "DONE";
    }
    if (task.deadline) {
      task.warning_state = deadlineState(task.deadline);
    }
  }

  const priorityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  return result.sort((a, b) => {
    const aDone = a.status === "DONE" ? 1 : 0;
    const bDone = b.status === "DONE" ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    const pDiff =
      (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    if (pDiff !== 0) return pDiff;
    return (a.deadline || "9999").localeCompare(b.deadline || "9999");
  });
}

export function audit(
  c: Candidate,
  programs: Program[],
  cycle: Cycle,
): Audit {
  const critical: string[] = [];
  const warnings: string[] = [];
  const ready: string[] = [];

  for (const key of [...IDENTITY_KEYS, ...CONTACT_KEYS]) {
    const f = c.facts.find((fact) => fact.key === key);
    if (!f || !f.value || ["MISSING", "INCONSISTENT"].includes(f.status)) {
      critical.push(`Information à compléter : ${f?.label || key}`);
    }
  }

  const docLabels: [string, string][] = [
    ["identity", "Identité"],
    ["photo", "Photo"],
    ["diploma", "Diplôme"],
    ["transcript", "Relevés"],
    ["language", "Langue"],
  ];
  for (const [kind, label] of docLabels) {
    if (c.documents.some((d) => d.kind === kind && d.status === "VERIFIED")) {
      ready.push(`${label} : pièce revue`);
    } else {
      critical.push(`${label} : pièce absente ou non vérifiée`);
    }
  }

  if (!c.education.length) {
    critical.push("Historique académique absent");
  }
  for (const t of timelineTasks(c)) {
    critical.push(t.title);
  }
  for (const w of diagnose(c).warnings) {
    critical.push(w);
  }

  const selected = programs.filter((p) =>
    c.selections.some((s) => s.program_id === p.id && s.selected),
  );

  if (selected.length > cycle.max_choices) {
    critical.push("Nombre de choix supérieur à la limite du cycle");
  }

  for (const [category, limit] of Object.entries(
    cycle.category_limits as Record<string, number>,
  )) {
    const count = selected.filter((p) => p.category === category).length;
    if (count > limit) {
      critical.push(
        `Nombre de choix supérieur à la limite de catégorie : ${category}`,
      );
    }
  }

  if (!selected.length) {
    critical.push("Aucune formation sélectionnée");
  }

  for (const p of selected) {
    for (const b of programBlockers(c, p)) {
      critical.push(`${p.title} : ${b}`);
    }
    if (
      !c.artifacts.some(
        (a) =>
          a.kind === "motivation" &&
          a.program_id === p.id &&
          a.approved &&
          a.source_revision === c.revision,
      )
    ) {
      critical.push(`${p.title} : motivation non validée`);
    }
  }

  if (
    !c.artifacts.some(
      (a) =>
        a.kind === "cv" && a.approved && a.source_revision === c.revision,
    )
  ) {
    critical.push("CV non validé ou à actualiser");
  }

  if (!c.narrative.approved) {
    critical.push("Projet d’études et professionnel à valider");
  }

  if (cycle.status !== "CONFIRMED") {
    critical.push(
      "Cycle et calendrier à confirmer auprès des sources officielles",
    );
  }

  if (!cycle.deadline || ["UNKNOWN", "OVERDUE"].includes(deadlineState(cycle.deadline))) {
    critical.push("Date limite du cycle absente ou dépassée");
  }

  if (
    c.questions.some(
      (q) =>
        q.status !== "RESOLVED" &&
        selected.some((p) => p.id === q.program_id),
    )
  ) {
    critical.push("Questions critiques non résolues");
  }

  if (
    c.facts.some((f) => ["NEEDS_REVIEW", "INCONSISTENT"].includes(f.status))
  ) {
    critical.push("Informations contradictoires ou non revues");
  }

  if (c.facts.some((f) => f.status === "SELF_DECLARED")) {
    warnings.push(
      "Des informations restent déclaratives. Vérifiez les justificatifs exigés.",
    );
  }

  if (c.is_demo) {
    warnings.push(
      "Données fictives : cet audit ne certifie aucune candidature réelle.",
    );
  }

  warnings.push(
    "L’entretien et le financement doivent être préparés avec les exigences du cycle.",
  );

  return {
    state: critical.length
      ? "BLOCKED"
      : c.is_demo
        ? "READY_DEMO"
        : "READY",
    critical: Array.from(new Set(critical)),
    warnings,
    ready_items: ready,
  };
}
