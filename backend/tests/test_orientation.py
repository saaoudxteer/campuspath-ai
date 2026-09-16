import pytest
from fastapi.testclient import TestClient

from app.database import CandidateRow, SessionLocal
from app.main import app


def exploration():
    return {
        "saved_roadmaps": ["informatique", "sante"],
        "explored_steps": {"informatique": ["decouvrir", "essayer"]},
        "profile": {
            "level": "bac2",
            "interests": ["technologie", "sciences"],
            "priority": "practical",
            "mobility": "morocco",
        },
    }


def test_orientation_requires_authenticated_session(client):
    assert client.put("/api/orientation", json=exploration()).status_code == 401


def test_orientation_rejects_foreign_origin_without_mutation(client, demo):
    response = client.put(
        "/api/orientation", json=exploration(), headers={"Origin": "https://untrusted.example"}
    )
    assert response.status_code == 403
    assert client.get("/api/state").json()["candidate"]["orientation"] == demo["candidate"]["orientation"]


def test_orientation_persists_full_state_and_normalizes_ids(client, demo):
    payload = exploration()
    payload["saved_roadmaps"][0] = " informatique "
    payload["explored_steps"] = {" informatique ": [" decouvrir ", "essayer"]}
    payload["profile"]["interests"][0] = " technologie "
    response = client.put("/api/orientation", json=payload)
    assert response.status_code == 200, response.text
    assert response.json()["candidate"]["orientation"] == exploration()
    assert client.get("/api/state").json()["candidate"]["orientation"] == exploration()


def test_orientation_is_isolated_between_candidates(client, demo):
    assert client.put("/api/orientation", json=exploration()).status_code == 200
    with TestClient(app, headers={"Origin": "http://testserver"}) as other:
        second = other.post("/api/auth/demo", json={}).json()
        assert second["candidate"]["id"] != demo["candidate"]["id"]
        assert second["candidate"]["orientation"]["saved_roadmaps"] == []
        assert other.put("/api/orientation", json={"saved_roadmaps": ["commerce"]}).status_code == 200
        assert other.get("/api/state").json()["candidate"]["orientation"]["saved_roadmaps"] == ["commerce"]
    assert client.get("/api/state").json()["candidate"]["orientation"] == exploration()


def test_orientation_can_clear_progress_without_preserving_removed_entries(client, demo):
    assert client.put("/api/orientation", json=exploration()).status_code == 200
    response = client.put("/api/orientation", json={})
    assert response.status_code == 200
    assert response.json()["candidate"]["orientation"] == demo["candidate"]["orientation"]


def test_orientation_compatible_with_existing_candidate_records(client, demo):
    with SessionLocal() as db:
        row = db.get(CandidateRow, demo["candidate"]["id"])
        data = dict(row.data)
        data.pop("orientation")
        row.data = data
        db.commit()
    response = client.get("/api/state")
    assert response.status_code == 200
    assert response.json()["candidate"]["orientation"] == {
        "saved_roadmaps": [],
        "explored_steps": {},
        "profile": {"level": "bac", "interests": [], "priority": "discover", "mobility": "undecided"},
    }
    assert client.put("/api/orientation", json=exploration()).status_code == 200


def test_orientation_does_not_invalidate_admissions_revision_or_approvals(client, demo):
    assert (
        client.post("/api/programs/p2/selection", json={"action": "select", "confirmed": True}).status_code
        == 200
    )
    assert (
        client.put(
            "/api/narrative",
            json={
                "study_project": "Approfondir mes connaissances en informatique.",
                "professional_project": "Construire des logiciels utiles aux étudiants.",
                "approved": True,
            },
        ).status_code
        == 200
    )
    generated = client.post("/api/artifacts", json={"kind": "cv"})
    assert generated.status_code == 200
    artifact = generated.json()["candidate"]["artifacts"][0]
    approved = client.post(f"/api/artifacts/{artifact['id']}/approve", json={"confirmed": True})
    assert approved.status_code == 200
    before = approved.json()
    assert before["candidate"]["artifacts"][0]["approved"]
    assert before["candidate"]["narrative"]["approved"]
    response = client.put("/api/orientation", json=exploration())
    assert response.status_code == 200
    after = response.json()
    expected_candidate = before["candidate"] | {"orientation": exploration()}
    assert after["candidate"] == expected_candidate
    for key in ("audit", "completeness", "diagnostic", "matches", "tasks"):
        assert after[key] == before[key]


@pytest.mark.parametrize(
    "payload",
    [
        {"saved_roadmaps": ["informatique", " informatique "]},
        {"saved_roadmaps": ["../private"]},
        {"saved_roadmaps": ["<script>"]},
        {"saved_roadmaps": [""]},
        {"saved_roadmaps": ["a" * 81]},
        {"saved_roadmaps": [f"roadmap-{i}" for i in range(31)]},
        {"saved_roadmaps": [123]},
        {"explored_steps": {"informatique": ["decouvrir", " decouvrir "]}},
        {"explored_steps": {"informatique": [], " informatique ": ["decouvrir"]}},
        {"explored_steps": {"../private": []}},
        {"explored_steps": {"informatique": ["Bad-ID"]}},
        {"explored_steps": {f"roadmap-{i}": [] for i in range(31)}},
        {"explored_steps": {"informatique": [f"step-{i}" for i in range(31)]}},
        {"profile": {"level": "doctorat"}},
        {"profile": {"interests": ["sciences", " sciences "]}},
        {"profile": {"interests": [f"interest-{i}" for i in range(13)]}},
        {"profile": {"interests": ["Sciences Humaines"]}},
        {"profile": {"priority": "best-salary"}},
        {"profile": {"mobility": "anywhere"}},
        {"candidate_id": "someone-else"},
        {"profile": {"unknown": "ignored?"}},
    ],
)
def test_orientation_rejects_invalid_or_unknown_values_without_mutation(client, demo, payload):
    assert client.put("/api/orientation", json=exploration()).status_code == 200
    response = client.put("/api/orientation", json=payload)
    assert response.status_code == 422
    assert client.get("/api/state").json()["candidate"]["orientation"] == exploration()
