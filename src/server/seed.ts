import type { Candidate, Program, Cycle } from "@/lib/schema";

export const PROFILE_FIELDS: [string, string, string][] = [
  ["first_name", "Prénom", "identity"],
  ["last_name", "Nom", "identity"],
  ["birth_date", "Date de naissance", "identity"],
  ["nationality", "Nationalité", "identity"],
  ["residence", "Pays de résidence", "identity"],
  ["city", "Ville", "contact"],
  ["address", "Adresse", "contact"],
  ["phone", "Téléphone", "contact"],
  ["email", "Email", "contact"],
  ["academic_status", "Situation actuelle", "contact"],
  ["french_level", "Niveau de français", "languages"],
  ["english_level", "Niveau d’anglais", "languages"],
  ["no_experience", "Aucune expérience à déclarer", "experience"],
];

export function emptyCandidate(candidateId: string, email: string): Candidate {
  return {
    id: candidateId,
    is_demo: false,
    orientation: {
      saved_roadmaps: [],
      explored_steps: {},
      profile: {
        level: "bac",
        interests: [],
        priority: "discover",
        mobility: "undecided",
      },
    },
    facts: PROFILE_FIELDS.map(([key, label, section]) => ({
      id: crypto.randomUUID(),
      key,
      label,
      section,
      value: key === "email" ? email : "",
      status: "SELF_DECLARED",
      document_id: null,
      page: null,
      confidence: null,
      user_confirmed: false,
    })),
    education: [],
    grades: [],
    experiences: [],
    preferences: {
      goal: "",
      interests: [],
      cities: [],
      annual_budget: null,
      style: "balanced",
      duration: "open",
    },
    documents: [],
    questions: [],
    selections: [],
    overrides: {},
    narrative: {
      study_project: "",
      professional_project: "",
      approved: false,
    },
    artifacts: [],
    completed_tasks: [],
    revision: 1,
    cycle: null,
  };
}

export function defaultCycle(): Cycle {
  return {
    id: "MA-EEF-reference-2026",
    label: "Cycle à confirmer",
    country: "MA",
    route: "EEF",
    max_choices: 7,
    category_limits: { L1: 3, ENSA: 2, BUT1: 3, POLYTECH: 3 },
    motivation_limit: 2500,
    source_url: "https://www.maroc.campusfrance.org/3le-panier-de-formations-et-les-motivations",
    verified_at: "2026-09-11",
    deadline: null,
    status: "NEEDS_REVIEW",
  };
}

export function demoCandidate(candidateId: string): Candidate {
  const c = emptyCandidate(candidateId, "imane@example.test");
  c.is_demo = true;
  const data: Record<string, string> = {
    first_name: "Imane",
    last_name: "Bennani",
    birth_date: "2004-04-18",
    nationality: "Marocaine",
    residence: "Maroc",
    city: "Rabat",
    address: "Adresse fictive — Rabat",
    phone: "+212 600 000 000",
    academic_status: "Licence 3 — Informatique",
    french_level: "B2",
    english_level: "B1",
  };

  for (const f of c.facts) {
    if (f.key in data) {
      f.value = data[f.key];
    }
    f.status = "SELF_DECLARED";
    if (["first_name", "last_name", "birth_date", "nationality"].includes(f.key)) {
      f.status = "VERIFIED";
      f.document_id = "demo-identity";
      f.user_confirmed = true;
    }
  }

  const now = new Date().toISOString();
  c.documents = [
    {
      id: "demo-identity",
      name: "Identité — exemple fictif.pdf",
      kind: "identity",
      mime: "application/pdf",
      size: 1024,
      status: "VERIFIED",
      uploaded_at: now,
      is_mock: true,
      extraction: [],
      processing_note: "Pièce illustrative, sans valeur administrative.",
    },
    {
      id: "demo-bac",
      name: "Baccalauréat — exemple fictif.pdf",
      kind: "diploma",
      mime: "application/pdf",
      size: 1024,
      status: "VERIFIED",
      uploaded_at: now,
      is_mock: true,
      extraction: [],
      processing_note: "",
    },
    {
      id: "demo-transcript",
      name: "Relevés S1–S3 — exemple fictif.pdf",
      kind: "transcript",
      mime: "application/pdf",
      size: 1024,
      status: "VERIFIED",
      uploaded_at: now,
      is_mock: true,
      extraction: [],
      processing_note: "",
    },
  ];

  c.education = [
    {
      id: "bac",
      label: "Baccalauréat sciences mathématiques",
      institution: "Lycée de démonstration · Rabat",
      start_year: 2021,
      end_year: 2022,
      level: "Bac",
      expected_semesters: [],
      transcript_semesters: [],
      explanation: "",
    },
    {
      id: "l1",
      label: "Licence 1 · Informatique",
      institution: "Université de démonstration · Rabat",
      start_year: 2022,
      end_year: 2023,
      level: "L1",
      expected_semesters: [1, 2],
      transcript_semesters: [1, 2],
      explanation: "",
    },
    {
      id: "l2",
      label: "Licence 2 · Informatique",
      institution: "Université de démonstration · Rabat",
      start_year: 2023,
      end_year: 2024,
      level: "L2",
      expected_semesters: [3, 4],
      transcript_semesters: [3],
      explanation: "",
    },
    {
      id: "l3",
      label: "Licence 3 · Informatique",
      institution: "Université de démonstration · Rabat",
      start_year: 2024,
      end_year: 2025,
      level: "L3",
      expected_semesters: [5, 6],
      transcript_semesters: [],
      explanation: "",
    },
  ];

  const gradeItems: [string, number, number, number][] = [
    ["Algorithmique", 16, 3, 1],
    ["Mathématiques", 15, 2, 1],
    ["Programmation", 16.5, 3, 2],
    ["Réseaux", 14.5, 2, 2],
    ["Algorithmique", 17, 3, 3],
    ["Bases de données", 15.5, 2, 3],
    ["Anglais", 12, 1, 3],
  ];

  c.grades = gradeItems.map(([subject, value, coefficient, semester]) => ({
    id: crypto.randomUUID(),
    subject,
    value,
    scale: 20,
    coefficient,
    semester,
    document_id: "demo-transcript",
    user_confirmed: true,
  }));

  c.preferences = {
    goal: "Ingénieure en cybersécurité",
    interests: ["informatique", "cybersécurité", "réseaux"],
    cities: ["Lyon", "Rennes", "Lille"],
    annual_budget: 10000,
    style: "practical",
    duration: "open",
  };

  c.experiences = [
    {
      id: crypto.randomUUID(),
      kind: "project",
      title: "Supervision d’un réseau local",
      description:
        "Projet universitaire de démonstration : configuration d’un réseau et suivi des journaux système.",
      date_label: "2024",
      document_id: null,
      user_confirmed: true,
    },
    {
      id: crypto.randomUUID(),
      kind: "skill",
      title: "Python, Linux, SQL",
      description: "Compétences déclarées dans le profil fictif.",
      date_label: "",
      document_id: null,
      user_confirmed: true,
    },
  ];

  return c;
}

export function demoPrograms(): Program[] {
  const fixtures: [
    string,
    string,
    string,
    string,
    string[],
    string,
    string,
    boolean,
    number,
    number,
  ][] = [
    [
      "p1",
      "Master Cybersécurité",
      "Lyon",
      "Institut Rhône — Démo",
      ["cybersécurité", "réseaux"],
      "Réseaux sécurisés, cryptographie et gestion des incidents.",
      "blue",
      false,
      250,
      45,
    ],
    [
      "p2",
      "Master Informatique · Systèmes & réseaux",
      "Rennes",
      "Université Armorique — Démo",
      ["informatique", "réseaux"],
      "Systèmes distribués, administration des réseaux et projet de recherche.",
      "purple",
      true,
      250,
      60,
    ],
    [
      "p3",
      "Master Data & intelligence artificielle",
      "Lille",
      "Institut du Nord — Démo",
      ["data", "statistiques"],
      "Statistiques, apprentissage automatique et traitement des données.",
      "teal",
      false,
      450,
      75,
    ],
    [
      "p4",
      "Cycle ingénieur · Sécurité numérique",
      "Paris",
      "École Horizon — Démo",
      ["cybersécurité", "informatique"],
      "Architecture sécurisée, systèmes embarqués et projets d’ingénierie.",
      "orange",
      false,
      12000,
      90,
    ],
    [
      "p5",
      "Master Informatique appliquée",
      "Nantes",
      "Université Atlantique — Démo",
      ["informatique", "programmation"],
      "Génie logiciel, bases de données et projet de développement.",
      "blue",
      true,
      300,
      80,
    ],
    [
      "p6",
      "Master Réseaux & télécommunications",
      "Toulouse",
      "Institut Occitan — Démo",
      ["réseaux", "informatique"],
      "Infrastructure réseau, communications et services distribués.",
      "teal",
      false,
      400,
      70,
    ],
  ];

  const today = new Date();
  const todayIso = today.toISOString().split("T")[0];

  return fixtures.map(
    ([
      pid,
      title,
      city,
      school,
      tags,
      curriculum,
      color,
      complete,
      tuition,
      days,
    ]) => {
      const deadlineDate = new Date(today.getTime() + days * 86400000)
        .toISOString()
        .split("T")[0];

      const makeClaim = (val: string | null, confirmed = true) => ({
        value: val,
        status: confirmed ? ("CONFIRMED" as const) : ("UNCERTAIN" as const),
        source_url: `https://example.invalid/campuspath/${pid}`,
        retrieved_at: todayIso,
        source_type: "mock" as const,
        note: "Exemple fictif. Ne constitue pas une exigence d’admission réelle.",
      });

      return {
        id: pid,
        title,
        institution: {
          id: `i-${pid}`,
          name: school,
          city,
          campus: city,
          connected_status: "UNKNOWN",
        },
        degree_type: pid !== "p4" ? "Master" : "Diplôme d’ingénieur",
        academic_level: "Bac +5",
        category: "MASTER",
        tags,
        description: curriculum,
        color,
        relevant_subjects: tags,
        minimum_grade: null,
        is_mock: true,
        claims: {
          curriculum: makeClaim(curriculum),
          prerequisites: makeClaim(
            "Licence informatique ou diplôme équivalent à examiner",
            complete,
          ),
          route: makeClaim("EEF — scénario illustratif", complete),
          deadline: makeClaim(deadlineDate),
          language: makeClaim("B2"),
          tuition: makeClaim(String(tuition)),
          eligibility: makeClaim(complete ? "OUI" : "À confirmer", complete),
          degree: makeClaim("Licence ou diplôme équivalent"),
          documents: makeClaim(
            "Diplôme, relevés, CV, motivation et justificatif de langue",
          ),
          outcomes: makeClaim(
            "Métiers liés aux systèmes informatiques ; aucun emploi garanti",
          ),
          instruction_language: makeClaim("Français"),
          application_fee: makeClaim(null, false),
          contact: makeClaim(null, false),
          program_url: makeClaim(null, false),
          admission_url: makeClaim(null, false),
        },
      };
    },
  );
}
