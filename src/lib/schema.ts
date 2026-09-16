import { z } from "zod";
export const factSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  section: z.string(),
  value: z.string(),
  status: z.enum([
    "VERIFIED",
    "SELF_DECLARED",
    "MISSING",
    "INCONSISTENT",
    "NEEDS_REVIEW",
  ]),
  document_id: z.string().nullable(),
  page: z.number().nullable(),
  confidence: z.number().nullable(),
  user_confirmed: z.boolean(),
});
const gradeSchema = z.object({
  id: z.string(),
  subject: z.string(),
  value: z.number(),
  scale: z.number().positive(),
  coefficient: z.number().positive(),
  semester: z.number(),
  document_id: z.string().nullable(),
  user_confirmed: z.boolean(),
});
const educationSchema = z.object({
  id: z.string(),
  label: z.string(),
  institution: z.string(),
  start_year: z.number(),
  end_year: z.number(),
  level: z.string(),
  expected_semesters: z.array(z.number()),
  transcript_semesters: z.array(z.number()),
  explanation: z.string(),
});
const experienceSchema = z.object({
  id: z.string(),
  kind: z.enum([
    "project",
    "internship",
    "employment",
    "certification",
    "activity",
    "skill",
  ]),
  title: z.string(),
  description: z.string(),
  date_label: z.string(),
  document_id: z.string().nullable(),
  user_confirmed: z.boolean(),
});
const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.string(),
  mime: z.string(),
  size: z.number(),
  status: z.string(),
  uploaded_at: z.string(),
  is_mock: z.boolean(),
  extraction: z.array(factSchema),
  processing_note: z.string(),
});
const claimSchema = z.object({
  value: z.string().nullable(),
  status: z.enum([
    "CONFIRMED",
    "LIKELY",
    "UNCERTAIN",
    "CONTRADICTORY",
    "UNKNOWN",
  ]),
  source_url: z.string().nullable(),
  retrieved_at: z.string().nullable(),
  source_type: z.enum(["official", "correspondence", "mock", "unverified"]),
  note: z.string(),
});
const programSchema = z.object({
  id: z.string(),
  title: z.string(),
  institution: z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
    campus: z.string(),
    connected_status: z.string(),
  }),
  degree_type: z.string(),
  academic_level: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
  color: z.string(),
  claims: z.record(z.string(), claimSchema),
  relevant_subjects: z.array(z.string()),
  minimum_grade: z.number().nullable(),
  is_mock: z.boolean(),
});
const questionSchema = z.object({
  id: z.string(),
  program_id: z.string(),
  claim_key: z.string(),
  question: z.string(),
  reason: z.string(),
  recipient: z.string().nullable(),
  subject: z.string(),
  email_draft: z.string(),
  status: z.enum([
    "DRAFT",
    "APPROVED",
    "SENT",
    "WAITING",
    "ANSWERED",
    "RESOLVED",
  ]),
  candidate_approval: z.boolean(),
  created_at: z.string(),
  sent_at: z.string().nullable(),
  response: z.string(),
  conclusion: z.string(),
});
const preferencesSchema = z.object({
  goal: z.string(),
  interests: z.array(z.string()),
  cities: z.array(z.string()),
  annual_budget: z.number().nullable(),
  style: z.enum(["practical", "theory", "balanced"]),
  duration: z.enum(["short", "long", "open"]),
});
const artifactSchema = z.object({
  id: z.string(),
  kind: z.enum(["cv", "motivation"]),
  program_id: z.string().nullable(),
  text: z.string(),
  assertions: z.array(
    z.object({
      text: z.string(),
      fact_ids: z.array(z.string()),
      program_fields: z.array(z.string()),
    }),
  ),
  source_revision: z.number(),
  approved: z.boolean(),
  engine: z.string(),
  quality_warnings: z.array(z.string()),
});
const cycleSchema = z.object({
  id: z.string(),
  label: z.string(),
  country: z.string(),
  route: z.string(),
  max_choices: z.number(),
  category_limits: z.record(z.string(), z.number()),
  motivation_limit: z.number(),
  source_url: z.string(),
  verified_at: z.string(),
  deadline: z.string().nullable(),
  status: z.enum(["NEEDS_REVIEW", "CONFIRMED"]),
});
export const orientationSchema = z.object({
  saved_roadmaps: z.array(z.string()).default([]),
  explored_steps: z.record(z.string(), z.array(z.string())).default({}),
  profile: z.object({
    level: z.enum(["lycee", "bac", "bac2", "licence", "reorientation"]).default("bac"),
    interests: z.array(z.string()).default([]),
    priority: z.enum(["discover", "practical", "studies"]).default("discover"),
    mobility: z.enum(["local", "morocco", "abroad", "undecided"]).default("undecided"),
  }).default({level: "bac", interests: [], priority: "discover", mobility: "undecided"}),
});
export type OrientationState = z.infer<typeof orientationSchema>;
const candidateSchema = z.object({
  orientation: orientationSchema.default({saved_roadmaps: [], explored_steps: {}, profile: {level: "bac", interests: [], priority: "discover", mobility: "undecided"}}),
  id: z.string(),
  is_demo: z.boolean(),
  facts: z.array(factSchema),
  education: z.array(educationSchema),
  grades: z.array(gradeSchema),
  experiences: z.array(experienceSchema),
  preferences: preferencesSchema,
  documents: z.array(documentSchema),
  questions: z.array(questionSchema),
  selections: z.array(
    z.object({
      program_id: z.string(),
      status: z.string(),
      rank: z.number(),
      saved: z.boolean(),
      selected: z.boolean(),
      note: z.string(),
      updated_at: z.string(),
    }),
  ),
  overrides: z.record(z.string(), z.record(z.string(), claimSchema)),
  narrative: z.object({
    study_project: z.string(),
    professional_project: z.string(),
    approved: z.boolean(),
  }),
  artifacts: z.array(artifactSchema),
  completed_tasks: z.array(z.string()),
  revision: z.number(),
  cycle: cycleSchema.nullable(),
});
const matchSchema = z.object({
  program_id: z.string(),
  score: z.number().nullable(),
  coverage: z.number(),
  classification: z.enum([
    "SAFER",
    "TARGET",
    "AMBITIOUS",
    "UNASSESSED",
    "INELIGIBLE",
  ]),
  dimensions: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      weight: z.number(),
      score: z.number().nullable(),
      reason: z.string(),
    }),
  ),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  ready: z.boolean(),
  blockers: z.array(z.string()),
});
const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  status: z.string(),
  next_action: z.string(),
  route: z.string(),
  program_id: z.string().nullable(),
  document_id: z.string().nullable(),
  deadline: z.string().nullable(),
  warning_state: z.string(),
});
const pathwaySchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(z.string()),
  fit: z.string(),
  duration: z.string(),
  difficulty: z.string(),
  professionalization: z.string(),
  flexibility: z.string(),
  cost: z.string(),
  opportunities: z.array(z.string()),
  risks: z.array(z.string()),
  exits: z.array(z.string()),
});
export const snapshotSchema = z.object({
  candidate: candidateSchema,
  programs: z.array(programSchema),
  completeness: z.object({
    percent: z.number(),
    verified_percent: z.number(),
    sections: z.array(
      z.object({
        label: z.string(),
        complete: z.number(),
        total: z.number(),
        percent: z.number(),
      }),
    ),
  }),
  diagnostic: z.object({
    average: z.number().nullable(),
    subject_averages: z.record(z.string(), z.number()),
    semester_averages: z.record(z.string(), z.number()),
    strongest: z.array(z.string()),
    weakest: z.array(z.string()),
    progression: z.number().nullable(),
    warnings: z.array(z.string()),
    grade_count: z.number(),
  }),
  matches: z.array(matchSchema),
  pathways: z.array(pathwaySchema),
  tasks: z.array(taskSchema),
  audit: z.object({
    state: z.string(),
    critical: z.array(z.string()),
    warnings: z.array(z.string()),
    ready_items: z.array(z.string()),
  }),
  cycle: cycleSchema,
});
export type Snapshot = z.infer<typeof snapshotSchema>;
export type Fact = z.infer<typeof factSchema>;
export type Program = z.infer<typeof programSchema>;
export type DocumentRecord = z.infer<typeof documentSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Grade = z.infer<typeof gradeSchema>;
export type Match = z.infer<typeof matchSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Artifact = z.infer<typeof artifactSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type Task = z.infer<typeof taskSchema>;
