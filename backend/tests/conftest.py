import os
from pathlib import Path
from uuid import uuid4

import pytest

test_root = Path(__file__).resolve().parents[1] / "data"
test_root.mkdir(exist_ok=True)
test_database = test_root / f"test-{uuid4()}.db"
os.environ["DATABASE_URL"] = f"sqlite:///{test_database}"
os.environ["DEMO_MODE"] = "true"

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app, rate_windows  # noqa: E402
from app.database import engine  # noqa: E402


@pytest.fixture
def client():
    rate_windows.clear()
    with TestClient(app, headers={"Origin": "http://testserver"}) as client:
        yield client


@pytest.fixture
def demo(client):
    response = client.post("/api/auth/demo", json={})
    assert response.status_code == 200, response.text
    return response.json()


@pytest.fixture(autouse=True, scope="session")
def cleanup_test_database():
    yield
    engine.dispose()
    if test_database.resolve().is_relative_to(test_root.resolve()):
        test_database.unlink(missing_ok=True)
