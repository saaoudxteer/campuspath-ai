import io
from datetime import date, timedelta
from uuid import uuid4

from fastapi.testclient import TestClient
from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject

from app.main import app


def pdf_bytes(labelled_email=False):
    writer = PdfWriter()
    page = writer.add_blank_page(width=595, height=842)
    if labelled_email:
        font = DictionaryObject(
            {
                NameObject("/Type"): NameObject("/Font"),
                NameObject("/Subtype"): NameObject("/Type1"),
                NameObject("/BaseFont"): NameObject("/Helvetica"),
            }
        )
        page[NameObject("/Resources")] = DictionaryObject(
            {NameObject("/Font"): DictionaryObject({NameObject("/F1"): writer._add_object(font)})}
        )
        stream = DecodedStreamObject()
        stream.set_data(
            b"BT /F1 12 Tf 50 750 Td (FICTIONAL TEST DOCUMENT) Tj 0 -30 Td (Email: extraction@example.test) Tj ET"
        )
        page[NameObject("/Contents")] = writer._add_object(stream)
    writer.add_metadata({"/Title": f"CampusPath fictional test {uuid4()}"})
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()


def test_session_required(client):
    assert client.get("/api/state").status_code == 401


def test_csrf_rejects_foreign_origin(client):
    assert (
        client.post("/api/auth/demo", json={}, headers={"Origin": "https://untrusted.example"}).status_code
        == 403
    )


def test_demo_cookie_httponly_and_persists(client, demo):
    assert client.get("/api/state").json()["candidate"]["id"] == demo["candidate"]["id"]
    assert demo["candidate"]["is_demo"]
    assert all(p["is_mock"] for p in demo["programs"])


def test_register_real_profile_has_no_mock_programs(client):
    result = client.post(
        "/api/auth/register",
        json={"email": f"test-{uuid4()}@example.test", "password": "a-long-test-password"},
    )
    assert result.status_code == 201
    assert not result.json()["candidate"]["is_demo"]
    assert result.json()["programs"] == []
    assert "HttpOnly" in result.headers["set-cookie"]


def test_login_and_logout(client):
    email = f"test-{uuid4()}@example.test"
    client.post("/api/auth/register", json={"email": email, "password": "a-long-test-password"})
    client.post("/api/auth/logout", json={})
    assert client.get("/api/state").status_code == 401
    assert (
        client.post("/api/auth/login", json={"email": email, "password": "incorrect-but-long"}).status_code
        == 401
    )
    assert (
        client.post("/api/auth/login", json={"email": email, "password": "a-long-test-password"}).status_code
        == 200
    )


def test_profile_changes_invalidate_fact_verification(client, demo):
    r = client.put(
        "/api/profile",
        json={"values": {"first_name": "Test"}, "preferences": demo["candidate"]["preferences"]},
    )
    assert r.status_code == 200
    fact = next(f for f in r.json()["candidate"]["facts"] if f["key"] == "first_name")
    assert fact["status"] == "SELF_DECLARED"
    assert fact["document_id"] is None
    assert client.get("/api/state").json()["candidate"]["revision"] == 1


def test_invalid_grade_and_duplicate_rejected(client, demo):
    assert (
        client.post(
            "/api/grades", json={"subject": "Test", "value": 21, "scale": 20, "semester": 1}
        ).status_code
        == 422
    )
    g = demo["candidate"]["grades"][0].copy()
    del g["id"]
    assert client.post("/api/grades", json=g).status_code == 409


def test_non_finite_json_body_returns_422_not_500(client, demo):
    response = client.post(
        "/api/grades",
        content=b'{"subject": "Test", "value": NaN, "scale": 20, "semester": 1}',
        headers={"content-type": "application/json"},
    )
    assert response.status_code == 422
    assert "NaN" not in response.text


def test_no_materials_before_selection(client, demo):
    assert client.post("/api/artifacts", json={"kind": "cv"}).status_code == 409
    assert client.post("/api/artifacts", json={"kind": "motivation", "program_id": "p2"}).status_code == 409


def test_selection_requires_candidate_confirmation(client, demo):
    assert client.post("/api/programs/p2/selection", json={"action": "select"}).status_code == 422
    r = client.post("/api/programs/p2/selection", json={"action": "select", "confirmed": True})
    assert r.status_code == 200
    assert r.json()["candidate"]["selections"][0]["status"] == "SELECTED"
    assert not next(m for m in r.json()["matches"] if m["program_id"] == "p2")["ready"]


def test_cv_approval_invalidated_on_grade_change(client, demo):
    client.post("/api/programs/p2/selection", json={"action": "select", "confirmed": True})
    r = client.post("/api/artifacts", json={"kind": "cv"})
    assert r.status_code == 200
    artifact = r.json()["candidate"]["artifacts"][0]
    r = client.post(f"/api/artifacts/{artifact['id']}/approve", json={"confirmed": True})
    assert r.json()["candidate"]["artifacts"][0]["approved"]
    r = client.post("/api/grades", json={"subject": "New subject", "value": 10, "semester": 4})
    assert not r.json()["candidate"]["artifacts"][0]["approved"]
    assert (
        client.post(f"/api/artifacts/{artifact['id']}/approve", json={"confirmed": True}).status_code == 409
    )


def test_upload_review_and_private_download(client, demo):
    r = client.post(
        "/api/documents",
        data={"kind": "language"},
        files={"file": ("test.pdf", pdf_bytes(), "application/pdf")},
    )
    assert r.status_code == 201, r.text
    doc = r.json()["candidate"]["documents"][-1]
    assert doc["status"] == "NEEDS_REVIEW"
    assert client.get(f"/api/documents/{doc['id']}/download").status_code == 200
    assert client.post(f"/api/documents/{doc['id']}/review", json={"confirmed": False}).status_code == 422
    assert client.post(f"/api/documents/{doc['id']}/review", json={"confirmed": True}).status_code == 200
    with TestClient(app, headers={"Origin": "http://testserver"}) as other:
        other.post("/api/auth/demo", json={})
        assert other.get(f"/api/documents/{doc['id']}/download").status_code == 404
        assert (
            other.post(
                "/api/grades", json={"subject": "Test", "value": 12, "semester": 1, "document_id": doc["id"]}
            ).status_code
            == 422
        )


def test_wrong_magic_and_duplicate_upload_rejected(client, demo):
    assert (
        client.post(
            "/api/documents",
            data={"kind": "transcript"},
            files={"file": ("fake.pdf", b"<script>not pdf</script>", "application/pdf")},
        ).status_code
        == 415
    )
    content = pdf_bytes()
    assert (
        client.post(
            "/api/documents",
            data={"kind": "transcript"},
            files={"file": ("a.pdf", content, "application/pdf")},
        ).status_code
        == 201
    )
    assert (
        client.post(
            "/api/documents",
            data={"kind": "transcript"},
            files={"file": ("b.pdf", content, "application/pdf")},
        ).status_code
        == 409
    )


def test_question_cannot_skip_to_sent(client, demo):
    r = client.post("/api/programs/p1/questions", json={"claim_key": "eligibility"})
    q = r.json()["candidate"]["questions"][0]
    assert q["status"] == "DRAFT"
    assert (
        client.post(
            f"/api/questions/{q['id']}",
            json={"action": "record_sent", "confirmed": True, "recipient": "admissions@example.test"},
        ).status_code
        == 409
    )
    assert client.post("/api/programs/p1/questions", json={"claim_key": "eligibility"}).status_code == 409


def test_question_negative_resolution_is_ineligible(client, demo):
    q = client.post("/api/programs/p1/questions", json={"claim_key": "eligibility"}).json()["candidate"][
        "questions"
    ][0]
    url = f"/api/questions/{q['id']}"
    approved = client.post(url, json={"action": "approve", "confirmed": True}).json()["candidate"][
        "questions"
    ][0]
    assert approved["status"] == "APPROVED" and approved["sent_at"] is None
    assert client.post(url, json={"action": "record_sent", "confirmed": True}).status_code == 422
    assert (
        client.post(
            url, json={"action": "record_sent", "confirmed": True, "recipient": "admissions@example.test"}
        ).status_code
        == 200
    )
    assert (
        client.post(
            url,
            json={
                "action": "answer",
                "confirmed": True,
                "response": "Votre diplôme ne satisfait pas les conditions.",
            },
        ).status_code
        == 200
    )
    assert (
        client.post(
            url, json={"action": "resolve", "confirmed": True, "conclusion": "Non, diplôme non éligible."}
        ).status_code
        == 422
    )
    r = client.post(
        url,
        json={
            "action": "resolve",
            "confirmed": True,
            "conclusion": "Non, diplôme non éligible.",
            "normalized_value": "NON",
        },
    )
    assert r.status_code == 200
    assert next(m for m in r.json()["matches"] if m["program_id"] == "p1")["classification"] == "INELIGIBLE"
    assert (
        client.post("/api/programs/p1/selection", json={"action": "select", "confirmed": True}).status_code
        == 409
    )


def test_motivation_requires_narrative_and_research(client, demo):
    client.post("/api/programs/p2/selection", json={"action": "select", "confirmed": True})
    assert client.post("/api/artifacts", json={"kind": "motivation", "program_id": "p2"}).status_code == 409
    client.put(
        "/api/narrative",
        json={
            "study_project": "Je souhaite approfondir les systèmes et réseaux étudiés pendant ma licence.",
            "professional_project": "Je souhaite construire un projet professionnel en cybersécurité après ce master.",
            "approved": True,
        },
    )
    assert client.post("/api/artifacts", json={"kind": "motivation", "program_id": "p2"}).status_code == 409
    r = client.post(
        "/api/documents",
        data={"kind": "language"},
        files={"file": ("language.pdf", pdf_bytes(), "application/pdf")},
    )
    doc = r.json()["candidate"]["documents"][-1]
    client.post(f"/api/documents/{doc['id']}/review", json={"confirmed": True})
    french = next(f for f in demo["candidate"]["facts"] if f["key"] == "french_level")
    client.post(
        f"/api/facts/{french['id']}/review",
        json={"value": "B2", "document_id": doc["id"], "confirmed": True, "evidence_checked": True},
    )
    client.put("/api/narrative", json=approved_narrative())
    r = client.post("/api/artifacts", json={"kind": "motivation", "program_id": "p2"})
    assert r.status_code == 200, r.text
    artifact = next(a for a in r.json()["candidate"]["artifacts"] if a["kind"] == "motivation")
    assert "Master Informatique" in artifact["text"]
    assert artifact["assertions"] and len(artifact["text"]) <= 2500


def test_critical_task_cannot_be_dismissed(client, demo):
    critical = next(t for t in demo["tasks"] if t["priority"] == "CRITICAL")
    assert client.post(f"/api/tasks/{critical['id']}/complete", json={}).status_code == 409


def approved_narrative():
    return {
        "study_project": "Je souhaite approfondir les systèmes et réseaux étudiés pendant ma licence.",
        "professional_project": "Je souhaite construire un projet professionnel en cybersécurité après ce master.",
        "approved": True,
    }


def test_candidate_cannot_change_procedure_limits(client, demo):
    cycle = {**demo["cycle"], "max_choices": 100}
    assert client.put("/api/cycle", json=cycle).status_code == 422
    assert client.get("/api/state").json()["cycle"]["max_choices"] == 7


def test_extraction_requires_separate_confirmation_to_replace_profile(client, demo):
    def email(state):
        return next(f for f in state["candidate"]["facts"] if f["key"] == "email")

    result = client.post(
        "/api/documents",
        data={"kind": "other"},
        files={"file": ("fictional.pdf", pdf_bytes(labelled_email=True), "application/pdf")},
    )
    assert result.status_code == 201
    doc = result.json()["candidate"]["documents"][-1]
    assert doc["extraction"][0]["status"] == "NEEDS_REVIEW"
    assert email(result.json())["value"] == "imane@example.test"
    reviewed = client.post(f"/api/documents/{doc['id']}/review", json={"confirmed": True})
    assert email(reviewed.json())["value"] == "imane@example.test"
    imported = client.post(
        f"/api/documents/{doc['id']}/review", json={"confirmed": True, "import_extraction": True}
    )
    assert email(imported.json())["value"] == "extraction@example.test"
    assert email(imported.json())["document_id"] == doc["id"]
    assert email(imported.json())["status"] == "VERIFIED"


def test_withdrawal_releases_choice_and_invalidates_materials(client, demo):
    client.post("/api/programs/p2/selection", json={"action": "select", "confirmed": True})
    client.put("/api/narrative", json=approved_narrative())
    state = client.post("/api/artifacts", json={"kind": "cv"}).json()
    artifact = state["candidate"]["artifacts"][0]
    client.post(f"/api/artifacts/{artifact['id']}/approve", json={"confirmed": True})
    result = client.post(
        "/api/programs/p2/selection", json={"action": "track", "status": "WITHDRAWN", "confirmed": True}
    )
    assert result.status_code == 200
    c = result.json()["candidate"]
    assert not c["selections"][0]["selected"]
    assert not c["narrative"]["approved"] and not c["artifacts"][0]["approved"]


def test_full_reviewed_demo_can_pass_audit_and_record_submission(client, demo):
    client.post("/api/programs/p2/selection", json={"action": "select", "confirmed": True})
    for kind in ("photo", "language"):
        result = client.post(
            "/api/documents",
            data={"kind": kind},
            files={"file": (f"{kind}.pdf", pdf_bytes(), "application/pdf")},
        )
        assert result.status_code == 201, result.text
        doc = result.json()["candidate"]["documents"][-1]
        assert client.post(f"/api/documents/{doc['id']}/review", json={"confirmed": True}).status_code == 200
        if kind == "language":
            french = next(f for f in demo["candidate"]["facts"] if f["key"] == "french_level")
            assert (
                client.post(
                    f"/api/facts/{french['id']}/review",
                    json={
                        "value": "B2",
                        "document_id": doc["id"],
                        "confirmed": True,
                        "evidence_checked": True,
                    },
                ).status_code
                == 200
            )
    for education_id, semester in (("l2", 4), ("l3", 5), ("l3", 6)):
        assert (
            client.post(
                "/api/documents/demo-transcript/review",
                json={"confirmed": True, "education_id": education_id, "semester": semester},
            ).status_code
            == 200
        )
    cycle = {
        **demo["cycle"],
        "label": "Cycle de test fictif",
        "deadline": (date.today() + timedelta(days=90)).isoformat(),
        "status": "CONFIRMED",
    }
    assert client.put("/api/cycle", json=cycle).status_code == 200
    assert client.put("/api/narrative", json=approved_narrative()).status_code == 200
    for kind in ("cv", "motivation"):
        result = client.post(
            "/api/artifacts", json={"kind": kind, "program_id": "p2" if kind == "motivation" else None}
        )
        assert result.status_code == 200, result.text
        artifact = next(a for a in result.json()["candidate"]["artifacts"] if a["kind"] == kind)
        assert (
            client.post(f"/api/artifacts/{artifact['id']}/approve", json={"confirmed": True}).status_code
            == 200
        )
    state = client.get("/api/state").json()
    assert state["audit"]["state"] == "READY_DEMO", state["audit"]
    tracked = client.post(
        "/api/programs/p2/selection", json={"action": "track", "status": "APPLIED", "confirmed": True}
    )
    assert tracked.status_code == 200, tracked.text
    assert tracked.json()["candidate"]["selections"][0]["status"] == "APPLIED"
