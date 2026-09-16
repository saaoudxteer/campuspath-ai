from datetime import date, timedelta

import pytest
from pydantic import ValidationError

from app import domain
from app.schemas import Candidate, Claim, Cycle, Document, Education, Fact, Grade, Selection
from app.seed import demo_candidate, demo_programs


def test_weighted_average_normalizes_scales():
    grades = [
        Grade(subject="A", value=80, scale=100, coefficient=3, semester=1),
        Grade(subject="B", value=12, coefficient=1, semester=1),
    ]
    assert domain.weighted_average(grades) == 15


def test_no_grades_is_unknown_not_zero():
    assert domain.weighted_average([]) is None
    assert domain.diagnose(Candidate(id="test")).average is None


def test_zero_grade_is_real_data():
    assert domain.weighted_average([Grade(subject="A", value=0, semester=1)]) == 0


@pytest.mark.parametrize(
    "kwargs",
    [
        {"value": 21},
        {"value": -1},
        {"value": float("nan")},
        {"value": 1, "scale": 0},
        {"value": 1, "coefficient": 0},
    ],
)
def test_invalid_grades_rejected(kwargs):
    with pytest.raises(ValidationError):
        Grade(subject="A", semester=1, **kwargs)


def test_verified_fact_requires_source_and_confirmation():
    with pytest.raises(ValidationError):
        Fact(key="name", label="Name", section="identity", value="Test", status="VERIFIED")


def test_extraction_confidence_does_not_verify():
    f = Fact(key="name", label="Name", section="identity", value="Test", confidence=1, document_id="doc")
    assert f.status == "SELF_DECLARED"


def test_missing_year_creates_remediation():
    c = Candidate(
        id="test",
        education=[
            Education(label="Bac", institution="School", level="Bac", start_year=2021, end_year=2022),
            Education(label="L1", institution="Uni", level="L1", start_year=2023, end_year=2024),
        ],
    )
    assert any(t.id.startswith("gap-") for t in domain.timeline_tasks(c))
    c.education[1].explanation = "Une année de préparation documentée."
    assert not any(t.id.startswith("gap-") for t in domain.timeline_tasks(c))


def test_missing_semesters_not_satisfied_by_other_semesters():
    c = demo_candidate("test")
    assert {t.id for t in domain.timeline_tasks(c)} >= {"semester-l2-4", "semester-l3-5", "semester-l3-6"}


def test_overlapping_years_detected():
    c = Candidate(
        id="test",
        education=[
            Education(label="A", institution="A", level="A", start_year=2021, end_year=2023),
            Education(label="B", institution="B", level="B", start_year=2022, end_year=2024),
        ],
    )
    assert any(t.id.startswith("overlap-") for t in domain.timeline_tasks(c))


def test_unverified_document_does_not_verify_grade():
    c = demo_candidate("test")
    c.grades[0].document_id = "demo-identity"
    assert any("notes sont déclarées" in s for s in domain.diagnose(c).warnings)


def test_completeness_distinct_from_verification():
    c = demo_candidate("test")
    result = domain.completeness(c)
    assert result.percent > result.verified_percent
    assert domain.audit(c, demo_programs(), Cycle()).state == "BLOCKED"


@pytest.mark.parametrize(
    "day,state", [(-1, "OVERDUE"), (0, "URGENT"), (3, "URGENT"), (4, "SOON"), (14, "SOON"), (15, "NORMAL")]
)
def test_deadline_boundaries(day, state):
    today = date(2026, 9, 11)
    assert domain.deadline_state((today + timedelta(days=day)).isoformat(), today) == state


def test_unknown_deadline_is_not_normal():
    assert domain.deadline_state(None) == "UNKNOWN"
    assert domain.deadline_state("Novembre, date à définir") == "UNKNOWN"


def language_ready(c):
    c.documents.append(
        Document(
            id="language", name="language.pdf", kind="language", status="VERIFIED", uploaded_at=domain.now()
        )
    )
    french = next(f for f in c.facts if f.key == "french_level")
    french.document_id, french.status, french.user_confirmed = "language", "VERIFIED", True


def test_uncertain_eligibility_cannot_get_safest_classification():
    c = demo_candidate("test")
    result = domain.match(c, demo_programs()[0], domain.diagnose(c))
    assert result.classification == "UNASSESSED"
    assert not result.ready


def test_free_form_negative_eligibility_never_becomes_pass():
    c = demo_candidate("test")
    language_ready(c)
    p = demo_programs()[1]
    p.claims["eligibility"].value = "Non, ce diplôme ne satisfait pas le prérequis."
    result = domain.match(c, p, domain.diagnose(c))
    assert result.classification == "UNASSESSED"
    assert not result.ready


def test_ineligible_does_not_become_ambitious():
    c = demo_candidate("test")
    p = demo_programs()[1]
    p.claims["eligibility"].value = "NON"
    result = domain.match(c, p, domain.diagnose(c))
    assert result.classification == "INELIGIBLE"
    assert not result.ready


def test_confirmed_but_unparseable_deadline_blocks():
    c = demo_candidate("test")
    language_ready(c)
    p = demo_programs()[1]
    p.claims["deadline"].value = "Fin novembre"
    assert "Date limite exacte inconnue" in domain.program_blockers(c, p)


def test_insufficient_language_is_hard_blocker():
    c = demo_candidate("test")
    language_ready(c)
    next(f for f in c.facts if f.key == "french_level").value = "A1"
    assert any("français non satisfait" in b for b in domain.program_blockers(c, demo_programs()[1]))


def test_valid_demo_program_can_be_ready_with_language_piece():
    c = demo_candidate("test")
    language_ready(c)
    assert not domain.program_blockers(c, demo_programs()[1])


def test_real_candidate_cannot_use_demo_sources():
    c = demo_candidate("test")
    c.is_demo = False
    assert any("démonstration" in b for b in domain.program_blockers(c, demo_programs()[1]))


def test_cycle_overdue_always_blocks_and_creates_task():
    c = demo_candidate("test")
    cycle = Cycle(label="Test cycle", deadline=date.today() - timedelta(days=1), status="CONFIRMED")
    assert "Date limite du cycle absente ou dépassée" in domain.audit(c, demo_programs(), cycle).critical
    assert (
        next(t for t in domain.tasks(c, demo_programs(), cycle) if t.id == "cycle-deadline").warning_state
        == "OVERDUE"
    )


@pytest.mark.parametrize(
    "kwargs", [{"max_choices": -1}, {"motivation_limit": -100}, {"category_limits": {"L1": -1}}]
)
def test_invalid_cycle_limits_fail(kwargs):
    with pytest.raises(ValidationError):
        Cycle(**kwargs)


def test_claim_missing_source_blocks_despite_confirmed():
    c = demo_candidate("test")
    p = demo_programs()[1]
    p.claims["route"] = Claim(value="EEF", status="CONFIRMED")
    assert "Voie de candidature à confirmer" in domain.program_blockers(c, p)


def test_reviewed_language_piece_requires_link_to_language_fact():
    c = demo_candidate("test")
    c.documents.append(
        Document(
            id="language",
            name="certificate.pdf",
            kind="language",
            status="VERIFIED",
            uploaded_at=domain.now(),
        )
    )
    assert "Justificatif linguistique à vérifier" in domain.program_blockers(c, demo_programs()[1])


def test_audit_rechecks_total_and_category_limits():
    c = demo_candidate("test")
    programs = demo_programs()
    c.selections = [Selection(program_id=p.id, selected=True) for p in programs[:2]]
    cycle = Cycle(max_choices=1, category_limits={"MASTER": 1})
    critical = domain.audit(c, programs, cycle).critical
    assert "Nombre de choix supérieur à la limite du cycle" in critical
    assert "Nombre de choix supérieur à la limite de catégorie : MASTER" in critical


@pytest.mark.parametrize("status", ["MISSING", "NEEDS_REVIEW", "INCONSISTENT"])
def test_unsafe_fact_values_are_not_used_by_materials(status):
    c = demo_candidate("test")
    first_name = next(f for f in c.facts if f.key == "first_name")
    first_name.status = status
    assert domain.fact_value(c, "first_name") == ""
