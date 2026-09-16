from datetime import date
from enum import StrEnum
from typing import Annotated, Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator


def uid() -> str:
    return str(uuid4())


class Schema(BaseModel):
    model_config = ConfigDict(
        extra="forbid", allow_inf_nan=False, use_enum_values=True, validate_default=True
    )


class EvidenceStatus(StrEnum):
    VERIFIED = "VERIFIED"
    SELF_DECLARED = "SELF_DECLARED"
    MISSING = "MISSING"
    INCONSISTENT = "INCONSISTENT"
    NEEDS_REVIEW = "NEEDS_REVIEW"


class Fact(Schema):
    id: str = Field(default_factory=uid)
    key: str
    label: str
    section: str
    value: str = Field(default="", max_length=3000)
    status: EvidenceStatus = EvidenceStatus.SELF_DECLARED
    document_id: str | None = None
    page: int | None = Field(default=None, ge=1)
    confidence: float | None = Field(default=None, ge=0, le=1)
    user_confirmed: bool = False

    @model_validator(mode="after")
    def verified_requires_evidence(self):
        if self.status == EvidenceStatus.VERIFIED and (not self.document_id or not self.user_confirmed):
            raise ValueError("Une information vérifiée exige une pièce et une confirmation explicite.")
        if not self.value.strip():
            self.status = EvidenceStatus.MISSING
        return self


class Grade(Schema):
    id: str = Field(default_factory=uid)
    subject: str = Field(min_length=1, max_length=100)
    value: float = Field(ge=0)
    scale: float = Field(default=20, gt=0, le=100)
    coefficient: float = Field(default=1, gt=0, le=100)
    semester: int = Field(ge=1, le=12)
    document_id: str | None = None
    user_confirmed: bool = False

    @model_validator(mode="after")
    def valid_grade(self):
        if self.value > self.scale:
            raise ValueError("La note dépasse le barème.")
        return self


class Education(Schema):
    id: str = Field(default_factory=uid)
    label: str = Field(min_length=1, max_length=150)
    institution: str = Field(min_length=1, max_length=150)
    start_year: int = Field(ge=1980, le=2100)
    end_year: int = Field(ge=1980, le=2100)
    level: str = Field(max_length=100)
    expected_semesters: list[int] = Field(default_factory=list)
    transcript_semesters: list[int] = Field(default_factory=list)
    explanation: str = Field(default="", max_length=3000)

    @model_validator(mode="after")
    def ordered_dates(self):
        if self.end_year < self.start_year:
            raise ValueError("La fin doit suivre le début.")
        if any(n < 1 or n > 12 for n in self.expected_semesters + self.transcript_semesters):
            raise ValueError("Numéro de semestre invalide.")
        return self


class Experience(Schema):
    id: str = Field(default_factory=uid)
    kind: Literal["project", "internship", "employment", "certification", "activity", "skill"]
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(max_length=3000)
    date_label: str = Field(default="", max_length=100)
    document_id: str | None = None
    user_confirmed: bool = False


class Preferences(Schema):
    goal: str = Field(default="", max_length=1000)
    interests: list[str] = Field(default_factory=list, max_length=20)
    cities: list[str] = Field(default_factory=list, max_length=20)
    annual_budget: float | None = Field(default=None, ge=0, le=1000000)
    style: Literal["practical", "theory", "balanced"] = "balanced"
    duration: Literal["short", "long", "open"] = "open"


class Document(Schema):
    id: str = Field(default_factory=uid)
    name: str
    kind: Literal["identity", "photo", "diploma", "transcript", "language", "cv", "certificate", "other"]
    mime: str = "application/pdf"
    size: int = 0
    status: Literal["NEEDS_REVIEW", "VERIFIED", "REJECTED"] = "NEEDS_REVIEW"
    uploaded_at: str
    is_mock: bool = False
    extraction: list[Fact] = Field(default_factory=list)
    processing_note: str = ""


class Claim(Schema):
    value: str | None = None
    status: Literal["CONFIRMED", "LIKELY", "UNCERTAIN", "CONTRADICTORY", "UNKNOWN"] = "UNKNOWN"
    source_url: str | None = None
    retrieved_at: str | None = None
    source_type: Literal["official", "correspondence", "mock", "unverified"] = "unverified"
    note: str = ""


class Institution(Schema):
    id: str
    name: str
    city: str
    campus: str
    connected_status: Literal["CONNECTED", "NON_CONNECTED", "UNKNOWN"] = "UNKNOWN"


class Program(Schema):
    id: str
    title: str
    institution: Institution
    degree_type: str
    academic_level: str
    category: str = "MASTER"
    tags: list[str]
    description: str
    color: str = "blue"
    claims: dict[str, Claim]
    relevant_subjects: list[str]
    minimum_grade: float | None = None
    is_mock: bool = True


class Cycle(Schema):
    id: str = "MA-EEF-reference-2026"
    label: str = "Cycle à confirmer"
    country: str = "MA"
    route: str = "EEF"
    max_choices: int = Field(default=7, ge=1, le=100)
    category_limits: dict[str, int] = Field(
        default_factory=lambda: {"L1": 3, "ENSA": 2, "BUT1": 3, "POLYTECH": 3}
    )
    motivation_limit: int = Field(default=2500, ge=100, le=20000)
    source_url: str = "https://www.maroc.campusfrance.org/3le-panier-de-formations-et-les-motivations"
    verified_at: str = "2026-09-11"
    deadline: date | None = None
    status: Literal["NEEDS_REVIEW", "CONFIRMED"] = "NEEDS_REVIEW"

    @model_validator(mode="after")
    def valid_limits(self):
        if any(v < 0 or v > self.max_choices for v in self.category_limits.values()):
            raise ValueError("Limites de catégorie invalides.")
        return self


class Question(Schema):
    id: str = Field(default_factory=uid)
    program_id: str
    claim_key: str
    question: str
    reason: str
    recipient: str | None = None
    subject: str
    email_draft: str
    status: Literal["DRAFT", "APPROVED", "SENT", "WAITING", "ANSWERED", "RESOLVED"] = "DRAFT"
    candidate_approval: bool = False
    created_at: str
    sent_at: str | None = None
    response: str = ""
    conclusion: str = ""


class Selection(Schema):
    program_id: str
    status: Literal[
        "RESEARCHING",
        "QUESTION_PENDING",
        "READY",
        "SELECTED",
        "APPLIED",
        "UNDER_REVIEW",
        "ADMITTED",
        "WAITLISTED",
        "REJECTED",
        "WITHDRAWN",
    ] = "RESEARCHING"
    rank: int = Field(default=1, ge=1, le=100)
    saved: bool = False
    selected: bool = False
    note: str = Field(default="", max_length=3000)
    updated_at: str = ""


class Task(Schema):
    id: str
    title: str
    detail: str
    priority: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    status: Literal["OPEN", "DONE"] = "OPEN"
    next_action: str
    route: str
    program_id: str | None = None
    document_id: str | None = None
    deadline: str | None = None
    warning_state: Literal["NORMAL", "SOON", "URGENT", "OVERDUE", "UNKNOWN"] = "UNKNOWN"


class Narrative(Schema):
    study_project: str = Field(default="", max_length=6000)
    professional_project: str = Field(default="", max_length=6000)
    approved: bool = False


class Assertion(Schema):
    text: str
    fact_ids: list[str] = Field(default_factory=list)
    program_fields: list[str] = Field(default_factory=list)


class Artifact(Schema):
    id: str = Field(default_factory=uid)
    kind: Literal["cv", "motivation"]
    program_id: str | None = None
    text: str
    assertions: list[Assertion] = Field(default_factory=list)
    source_revision: int
    approved: bool = False
    engine: str = "deterministic-demo"
    quality_warnings: list[str] = Field(default_factory=list)


class InterviewAnswer(Schema):
    question: str
    answer: str = Field(min_length=1, max_length=6000)


class InterviewFeedback(Schema):
    assessment: str
    strengths: list[str]
    improvements: list[str]
    follow_up: str
    engine: str = "guided-rubric"


OrientationId = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
]
OrientationSteps = Annotated[list[OrientationId], Field(max_length=30)]


class OrientationProfile(Schema):
    level: Literal["lycee", "bac", "bac2", "licence", "reorientation"] = "bac"
    interests: list[OrientationId] = Field(default_factory=list, max_length=12)
    priority: Literal["discover", "practical", "studies"] = "discover"
    mobility: Literal["local", "morocco", "abroad", "undecided"] = "undecided"

    @field_validator("interests")
    @classmethod
    def unique_interests(cls, values):
        if len(values) != len(set(values)):
            raise ValueError("Les centres d’intérêt doivent être uniques.")
        return values


class OrientationState(Schema):
    saved_roadmaps: list[OrientationId] = Field(default_factory=list, max_length=30)
    explored_steps: dict[OrientationId, OrientationSteps] = Field(default_factory=dict, max_length=30)
    profile: OrientationProfile = Field(default_factory=OrientationProfile)

    @field_validator("saved_roadmaps")
    @classmethod
    def unique_roadmaps(cls, values):
        if len(values) != len(set(values)):
            raise ValueError("Les parcours enregistrés doivent être uniques.")
        return values

    @field_validator("explored_steps", mode="before")
    @classmethod
    def unique_normalized_keys(cls, value):
        # Check before key normalization, which would otherwise silently merge two roadmaps.
        if isinstance(value, dict):
            normalized = [key.strip() if isinstance(key, str) else key for key in value]
            if len(normalized) != len(set(normalized)):
                raise ValueError("Les identifiants de parcours doivent être uniques.")
        return value

    @field_validator("explored_steps")
    @classmethod
    def unique_steps(cls, value):
        if any(len(steps) != len(set(steps)) for steps in value.values()):
            raise ValueError("Les étapes d’un parcours doivent être uniques.")
        return value


class Candidate(Schema):
    id: str
    is_demo: bool = False
    facts: list[Fact] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    grades: list[Grade] = Field(default_factory=list)
    experiences: list[Experience] = Field(default_factory=list)
    preferences: Preferences = Field(default_factory=Preferences)
    orientation: OrientationState = Field(default_factory=OrientationState)
    documents: list[Document] = Field(default_factory=list)
    questions: list[Question] = Field(default_factory=list)
    selections: list[Selection] = Field(default_factory=list)
    overrides: dict[str, dict[str, Claim]] = Field(default_factory=dict)
    narrative: Narrative = Field(default_factory=Narrative)
    artifacts: list[Artifact] = Field(default_factory=list)
    completed_tasks: list[str] = Field(default_factory=list)
    revision: int = 0
    cycle: Cycle | None = None


class SectionCompletion(Schema):
    label: str
    complete: int
    total: int
    percent: int


class Completeness(Schema):
    percent: int
    verified_percent: int
    sections: list[SectionCompletion]


class Diagnostic(Schema):
    average: float | None
    subject_averages: dict[str, float]
    semester_averages: dict[int, float]
    strongest: list[str]
    weakest: list[str]
    progression: float | None
    warnings: list[str]
    grade_count: int


class MatchDimension(Schema):
    key: str
    label: str
    weight: int
    score: int | None
    reason: str


class Match(Schema):
    program_id: str
    score: int | None
    coverage: int
    classification: Literal["SAFER", "TARGET", "AMBITIOUS", "UNASSESSED", "INELIGIBLE"]
    dimensions: list[MatchDimension]
    strengths: list[str]
    risks: list[str]
    ready: bool
    blockers: list[str]


class Pathway(Schema):
    id: str
    title: str
    steps: list[str]
    fit: str
    duration: str
    difficulty: str
    professionalization: str
    flexibility: str
    cost: str
    opportunities: list[str]
    risks: list[str]
    exits: list[str]


class Audit(Schema):
    state: Literal["BLOCKED", "NEEDS_REVIEW", "READY_DEMO", "READY"]
    critical: list[str]
    warnings: list[str]
    ready_items: list[str]


class Snapshot(Schema):
    candidate: Candidate
    programs: list[Program]
    completeness: Completeness
    diagnostic: Diagnostic
    matches: list[Match]
    pathways: list[Pathway]
    tasks: list[Task]
    audit: Audit
    cycle: Cycle


class AuthInput(Schema):
    email: str = Field(min_length=5, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(min_length=12, max_length=128)


class ProfileInput(Schema):
    values: dict[str, str]
    preferences: Preferences


class FactReview(Schema):
    value: str = Field(max_length=3000)
    document_id: str | None = None
    page: int | None = Field(default=None, ge=1)
    confirmed: bool
    evidence_checked: bool = False


class QuestionAction(Schema):
    action: Literal["approve", "record_sent", "waiting", "answer", "resolve"]
    confirmed: bool = False
    response: str = Field(default="", max_length=10000)
    conclusion: str = Field(default="", max_length=3000)
    normalized_value: str = Field(default="", max_length=3000)
    recipient: str = Field(default="", max_length=254)


class SelectInput(Schema):
    action: Literal["save", "select", "remove", "reject", "rank", "track"]
    confirmed: bool = False
    rank: int = Field(default=1, ge=1, le=100)
    status: Selection.__annotations__["status"] = "RESEARCHING"
    note: str = Field(default="", max_length=3000)
