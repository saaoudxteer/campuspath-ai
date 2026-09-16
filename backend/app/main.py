import hashlib
import hmac
import os
import secrets
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
from typing import Annotated
from urllib.parse import urlparse

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import StaleDataError

from . import ai, domain
from .database import (
    DEMO_MODE,
    AuditEventRow,
    CandidateRow,
    CycleRow,
    DocumentRow,
    ProgramRow,
    SessionLocal,
    SessionRow,
    UserRow,
    initialize,
)
from .schemas import (
    AuthInput,
    Candidate,
    Claim,
    Cycle,
    Document,
    Education,
    Experience,
    FactReview,
    Grade,
    InterviewAnswer,
    InterviewFeedback,
    Narrative,
    OrientationState,
    ProfileInput,
    Program,
    Question,
    QuestionAction,
    Schema,
    SelectInput,
    Selection,
    Snapshot,
    uid,
)
from .seed import PROFILE_FIELDS, demo_candidate, empty_candidate
from .storage import storage

ALLOWED_ORIGINS = set(
    os.getenv("ALLOWED_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000,http://testserver").split(",")
)
rate_windows: dict[str, deque] = defaultdict(deque)


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize()
    if not DEMO_MODE:
        storage()  # Fail closed instead of silently writing production documents locally.
    yield


app = FastAPI(title="CampusPath AI", version="0.1.0", lifespan=lifespan)


@app.middleware("http")
async def request_guard(request: Request, call_next):
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        origin = request.headers.get("origin")
        if origin not in ALLOWED_ORIGINS:
            return JSONResponse(status_code=403, content={"detail": "Origine de la requête non autorisée."})
        if int(request.headers.get("content-length", "0") or "0") > 11 * 1024 * 1024:
            return JSONResponse(
                status_code=413, content={"detail": "Fichier trop volumineux (10 Mo maximum)."}
            )
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.exception_handler(StaleDataError)
async def stale_handler(request: Request, exc: StaleDataError):
    return JSONResponse(
        status_code=409,
        content={"detail": "Votre dossier a changé dans une autre fenêtre. Rechargez avant de réessayer."},
    )


@app.exception_handler(RequestValidationError)
@app.exception_handler(ValidationError)
async def validation_handler(request: Request, exc: ValidationError | RequestValidationError):
    # A single French message; never echo the raw body (a NaN in it would crash the default JSON handler).
    return JSONResponse(
        status_code=422, content={"detail": "Données invalides. Vérifiez les champs et justificatifs."}
    )


def database():
    with SessionLocal() as db:
        yield db


DB = Annotated[Session, Depends(database)]


def current_candidate(request: Request, db: DB) -> CandidateRow:
    token = request.cookies.get("campuspath_session", "")
    session = db.get(SessionRow, hashlib.sha256(token.encode()).hexdigest()) if token else None
    if not session or datetime.fromisoformat(session.expires_at) <= datetime.now(timezone.utc):
        raise HTTPException(401, "Connectez-vous pour retrouver votre dossier.")
    row = db.get(CandidateRow, session.user_id)
    if not row:
        raise HTTPException(401, "Session inconnue.")
    return row


Current = Annotated[CandidateRow, Depends(current_candidate)]


def issue_session(response: Response, request: Request, db: Session, user_id: str):
    old_token = request.cookies.get("campuspath_session")
    old = db.get(SessionRow, hashlib.sha256(old_token.encode()).hexdigest()) if old_token else None
    if old:
        db.delete(old)
    token = secrets.token_urlsafe(48)
    db.add(
        SessionRow(
            token_hash=hashlib.sha256(token.encode()).hexdigest(),
            user_id=user_id,
            expires_at=(datetime.now(timezone.utc) + timedelta(hours=12)).isoformat(),
        )
    )
    db.commit()
    response.set_cookie(
        "campuspath_session",
        token,
        max_age=43200,
        httponly=True,
        secure=not DEMO_MODE,
        samesite="lax",
        path="/",
    )


def password_hash(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    hashed = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()
    return f"scrypt${salt}${hashed}"


def auth_limit(request: Request):
    key = request.client.host if request.client else "unknown"
    queue = rate_windows[key]
    current_time = time.monotonic()
    while queue and queue[0] < current_time - 60:
        queue.popleft()
    if len(queue) >= 20:
        raise HTTPException(429, "Trop de tentatives. Réessayez dans une minute.")
    queue.append(current_time)


def candidate(row: CandidateRow) -> Candidate:
    return Candidate.model_validate(row.data)


def get_programs(db: Session, c: Candidate) -> list[Program]:
    rows = db.scalars(select(ProgramRow).where(ProgramRow.is_mock == c.is_demo)).all()
    programs = [Program.model_validate(row.data) for row in rows]
    for p in programs:
        p.claims.update(c.overrides.get(p.id, {}))
    return programs


def get_cycle(db: Session, c: Candidate) -> Cycle:
    if c.cycle:
        return c.cycle
    row = db.get(CycleRow, "MA-EEF-reference-2026")
    return Cycle.model_validate(row.data) if row else Cycle()


def snapshot(db: Session, c: Candidate) -> Snapshot:
    programs = get_programs(db, c)
    diagnostic = domain.diagnose(c)
    cycle = get_cycle(db, c)
    return Snapshot(
        candidate=c,
        programs=programs,
        completeness=domain.completeness(c),
        diagnostic=diagnostic,
        matches=[domain.match(c, p, diagnostic) for p in programs],
        pathways=domain.pathways(c),
        tasks=domain.tasks(c, programs, cycle),
        audit=domain.audit(c, programs, cycle),
        cycle=cycle,
    )


def persist(db: Session, row: CandidateRow, c: Candidate, action: str, invalidate=True) -> Snapshot:
    if invalidate:
        c.revision += 1
        if action != "narrative.saved":
            c.narrative.approved = False
        for a in c.artifacts:
            a.approved = False
    # Revalidate mutations: assignment alone does not run Pydantic validators.
    c = Candidate.model_validate(c.model_dump())
    row.data = c.model_dump(mode="json")
    db.add(AuditEventRow(id=uid(), candidate_id=c.id, action=action, at=domain.now(), revision=c.revision))
    db.commit()
    return snapshot(db, c)


def find_program(db: Session, c: Candidate, pid: str) -> Program:
    p = next((p for p in get_programs(db, c) if p.id == pid), None)
    if not p:
        raise HTTPException(404, "Formation introuvable.")
    return p


def owned_document(c: Candidate, document_id: str | None):
    if document_id and not any(d.id == document_id and d.status != "REJECTED" for d in c.documents):
        raise HTTPException(422, "Le justificatif doit appartenir à votre dossier.")


@app.get("/api/health")
def health():
    return {"status": "ok", "demo_mode": DEMO_MODE, "version": "0.1.0"}


@app.post("/api/auth/demo", response_model=Snapshot)
def demo(request: Request, response: Response, db: DB):
    if not DEMO_MODE:
        raise HTTPException(404, "Démonstration désactivée.")
    auth_limit(request)
    cid = uid()
    c = demo_candidate(cid)
    db.add(UserRow(id=cid, email=f"{cid}@demo.invalid", password_hash="disabled", is_demo=True))
    db.flush()
    db.add(CandidateRow(id=cid, data=c.model_dump(mode="json")))
    db.commit()
    issue_session(response, request, db, cid)
    return snapshot(db, c)


@app.post("/api/auth/register", response_model=Snapshot, status_code=201)
def register(body: AuthInput, request: Request, response: Response, db: DB):
    auth_limit(request)
    email = body.email.strip().lower()
    cid = uid()
    c = empty_candidate(cid, email)
    try:
        db.add(UserRow(id=cid, email=email, password_hash=password_hash(body.password), is_demo=False))
        db.flush()
        db.add(CandidateRow(id=cid, data=c.model_dump(mode="json")))
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Ce compte ne peut pas être créé. Essayez de vous connecter.") from None
    issue_session(response, request, db, cid)
    return snapshot(db, c)


@app.post("/api/auth/login", response_model=Snapshot)
def login(body: AuthInput, request: Request, response: Response, db: DB):
    auth_limit(request)
    user = db.scalar(
        select(UserRow).where(UserRow.email == body.email.strip().lower(), UserRow.is_demo.is_(False))
    )
    if user:
        _, salt, _ = user.password_hash.split("$")
        valid = hmac.compare_digest(password_hash(body.password, salt), user.password_hash)
    else:
        password_hash(body.password)  # Same expensive operation for unknown accounts.
        valid = False
    if not valid:
        raise HTTPException(401, "Email ou mot de passe incorrect.")
    issue_session(response, request, db, user.id)
    return snapshot(db, candidate(db.get(CandidateRow, user.id)))


@app.post("/api/auth/logout")
def logout(request: Request, response: Response, db: DB):
    token = request.cookies.get("campuspath_session", "")
    session = db.get(SessionRow, hashlib.sha256(token.encode()).hexdigest())
    if session:
        db.delete(session)
        db.commit()
    response.delete_cookie("campuspath_session", path="/")
    return {"ok": True}


@app.get("/api/state", response_model=Snapshot)
def state(row: Current, db: DB):
    return snapshot(db, candidate(row))


@app.put("/api/profile", response_model=Snapshot)
def update_profile(body: ProfileInput, row: Current, db: DB):
    c = candidate(row)
    allowed = {key for key, _, _ in PROFILE_FIELDS}
    if set(body.values) - allowed:
        raise HTTPException(422, "Champ de profil inconnu.")
    for key, value in body.values.items():
        if len(value) > 3000:
            raise HTTPException(422, "Valeur trop longue.")
        if key == "birth_date" and value:
            try:
                if date.fromisoformat(value) >= date.today():
                    raise ValueError()
            except ValueError:
                raise HTTPException(422, "Date de naissance invalide.") from None
        f = next((f for f in c.facts if f.key == key), None)
        if not f:
            from .schemas import Fact

            _, label, section = next(entry for entry in PROFILE_FIELDS if entry[0] == key)
            f = Fact(key=key, label=label, section=section)
            c.facts.append(f)
        if f.value != value.strip():
            f.value, f.status, f.document_id, f.user_confirmed = value.strip(), "SELF_DECLARED", None, True
    c.preferences = body.preferences
    c.narrative.approved = False
    return persist(db, row, c, "profile.updated")


@app.put("/api/orientation", response_model=Snapshot)
def update_orientation(body: OrientationState, row: Current, db: DB):
    c = candidate(row)
    c.orientation = body
    return persist(db, row, c, "orientation.updated", invalidate=False)


@app.post("/api/facts/{fact_id}/review", response_model=Snapshot)
def review_fact(fact_id: str, body: FactReview, row: Current, db: DB):
    if not body.confirmed:
        raise HTTPException(422, "Confirmez la modification après comparaison avec la source.")
    c = candidate(row)
    owned_document(c, body.document_id)
    f = next((f for f in c.facts if f.id == fact_id), None)
    if not f:
        raise HTTPException(404, "Information introuvable.")
    if body.evidence_checked and not body.document_id:
        raise HTTPException(422, "Sélectionnez un justificatif.")
    f.value, f.document_id, f.page, f.user_confirmed = body.value, body.document_id, body.page, True
    f.status = "VERIFIED" if body.evidence_checked else "SELF_DECLARED"
    return persist(db, row, c, "fact.reviewed")


@app.post("/api/documents", response_model=Snapshot, status_code=201)
async def upload_document(row: Current, db: DB, file: UploadFile = File(), kind: str = Form()):
    c = candidate(row)
    if len(c.documents) >= 100:
        raise HTTPException(422, "Limite de 100 documents atteinte.")
    content = await file.read(10 * 1024 * 1024 + 1)
    await file.close()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(413, "Fichier trop volumineux (10 Mo maximum).")
    mime = (
        "application/pdf"
        if content.startswith(b"%PDF-")
        else "image/png"
        if content.startswith(b"\x89PNG\r\n\x1a\n")
        else "image/jpeg"
        if content.startswith(b"\xff\xd8\xff")
        else None
    )
    if not mime:
        raise HTTPException(
            415, "Formats acceptés : PDF, PNG et JPEG. Le contenu du fichier doit correspondre."
        )
    doc_id = uid()
    name = (file.filename or "document").replace("\\", "/").split("/")[-1][:180]
    doc = Document(id=doc_id, name=name, kind=kind, mime=mime, size=len(content), uploaded_at=domain.now())
    extraction = ai.ReviewFirstExtractor().extract(content, mime, doc_id)
    doc.extraction, doc.processing_note = extraction.facts, extraction.note
    digest = hashlib.sha256(content).hexdigest()
    if db.scalar(select(DocumentRow).where(DocumentRow.candidate_id == c.id, DocumentRow.sha256 == digest)):
        raise HTTPException(409, "Ce document est déjà dans votre dossier.")
    key = f"{c.id}/{doc_id}"
    store = storage()
    store.put(key, content, mime)
    c.documents.append(doc)
    db.add(DocumentRow(id=doc_id, candidate_id=c.id, storage_key=key, mime=mime, sha256=digest))
    try:
        return persist(db, row, c, "document.uploaded")
    except Exception:
        db.rollback()
        store.delete(key)
        raise


@app.get("/api/documents/{document_id}/download")
def download_document(document_id: str, row: Current, db: DB):
    doc = db.get(DocumentRow, document_id)
    if not doc or doc.candidate_id != row.id:
        raise HTTPException(404, "Document introuvable.")
    return Response(
        content=storage().get(doc.storage_key),
        media_type=doc.mime,
        headers={
            "Content-Disposition": f'attachment; filename="document-{document_id}.{"pdf" if doc.mime == "application/pdf" else "png" if doc.mime == "image/png" else "jpg"}"',
            "Content-Security-Policy": "sandbox",
        },
    )


class DocumentReview(Schema):
    confirmed: bool
    education_id: str | None = None
    semester: int | None = None
    import_extraction: bool = False


@app.post("/api/documents/{document_id}/review", response_model=Snapshot)
def review_document(document_id: str, body: DocumentReview, row: Current, db: DB):
    c = candidate(row)
    doc = next((d for d in c.documents if d.id == document_id), None)
    if not doc:
        raise HTTPException(404, "Document introuvable.")
    if not body.confirmed:
        raise HTTPException(422, "Confirmez que vous avez relu la pièce.")
    if body.education_id:
        edu = next((e for e in c.education if e.id == body.education_id), None)
        if not edu or doc.kind != "transcript" or body.semester not in edu.expected_semesters:
            raise HTTPException(422, "Choisissez une année et un semestre attendus pour ce relevé.")
        edu.transcript_semesters = sorted(set(edu.transcript_semesters + [body.semester]))
    doc.status = "VERIFIED"
    if body.import_extraction:
        for extracted in doc.extraction:
            existing = next((f for f in c.facts if f.key == extracted.key), None)
            if existing:
                existing.value, existing.document_id, existing.page = extracted.value, doc.id, extracted.page
                existing.user_confirmed, existing.status = True, "VERIFIED"
    return persist(db, row, c, "document.reviewed")


@app.post("/api/education", response_model=Snapshot)
def save_education(body: Education, row: Current, db: DB):
    c = candidate(row)
    old = next((e for e in c.education if e.id == body.id), None)
    # Transcript coverage is changed only through document review.
    body.transcript_semesters = old.transcript_semesters if old else []
    c.education = [e for e in c.education if e.id != body.id] + [body]
    return persist(db, row, c, "education.saved")


@app.post("/api/grades", response_model=Snapshot)
def save_grade(body: Grade, row: Current, db: DB):
    c = candidate(row)
    owned_document(c, body.document_id)
    if any(
        g.subject.casefold() == body.subject.casefold() and g.semester == body.semester and g.id != body.id
        for g in c.grades
    ):
        raise HTTPException(409, "Cette matière existe déjà pour ce semestre. Modifiez la note existante.")
    c.grades = [g for g in c.grades if g.id != body.id] + [body]
    return persist(db, row, c, "grade.saved")


@app.delete("/api/grades/{grade_id}", response_model=Snapshot)
def delete_grade(grade_id: str, row: Current, db: DB):
    c = candidate(row)
    c.grades = [g for g in c.grades if g.id != grade_id]
    return persist(db, row, c, "grade.deleted")


@app.post("/api/experiences", response_model=Snapshot)
def save_experience(body: Experience, row: Current, db: DB):
    c = candidate(row)
    owned_document(c, body.document_id)
    c.experiences = [e for e in c.experiences if e.id != body.id] + [body]
    return persist(db, row, c, "experience.saved")


class QuestionCreate(Schema):
    claim_key: str


@app.post("/api/programs/{program_id}/questions", response_model=Snapshot)
def create_question(program_id: str, body: QuestionCreate, row: Current, db: DB):
    c = candidate(row)
    p = find_program(db, c, program_id)
    if body.claim_key not in domain.CRITICAL_CLAIMS:
        raise HTTPException(422, "Exigence inconnue.")
    if any(
        q.program_id == program_id and q.claim_key == body.claim_key and q.status != "RESOLVED"
        for q in c.questions
    ):
        raise HTTPException(409, "Une question ouverte existe déjà pour ce point.")
    label = domain.CRITICAL_CLAIMS[body.claim_key]
    question = f"Pouvez-vous confirmer : {label.lower()} pour mon profil ?"
    subject = f"Demande de clarification — {p.title}"
    draft = f"Madame, Monsieur,\n\nJe prépare une candidature à votre formation {p.title}. Ma situation actuelle est la suivante : {domain.fact_value(c, 'academic_status') or '[situation à compléter]'}.\n\n{question}\n\nCe point n’est pas confirmé dans les informations dont je dispose. Pourriez-vous m’indiquer la règle applicable à ma situation et, si possible, la page officielle de référence ?\n\nJe vous remercie pour votre aide.\n\n{domain.fact_value(c, 'first_name')} {domain.fact_value(c, 'last_name')}"
    contact = p.claims.get("contact")
    c.questions.append(
        Question(
            program_id=program_id,
            claim_key=body.claim_key,
            question=question,
            reason=f"{label} : information critique non résolue. L’absence de réponse peut modifier votre stratégie.",
            recipient=contact.value if contact and contact.status == "CONFIRMED" else None,
            subject=subject,
            email_draft=draft,
            created_at=domain.now(),
        )
    )
    return persist(db, row, c, "question.drafted")


@app.post("/api/questions/{question_id}", response_model=Snapshot)
def update_question(question_id: str, body: QuestionAction, row: Current, db: DB):
    c = candidate(row)
    q = next((q for q in c.questions if q.id == question_id), None)
    if not q:
        raise HTTPException(404, "Question introuvable.")
    transitions = {
        "approve": ({"DRAFT"}, "APPROVED"),
        "record_sent": ({"APPROVED"}, "SENT"),
        "waiting": ({"SENT"}, "WAITING"),
        "answer": ({"SENT", "WAITING"}, "ANSWERED"),
        "resolve": ({"ANSWERED"}, "RESOLVED"),
    }
    allowed, target = transitions[body.action]
    if q.status not in allowed or not body.confirmed:
        raise HTTPException(409, "Transition invalide ou confirmation manquante.")
    if body.action == "approve":
        q.candidate_approval = True
    if body.action == "record_sent":
        if (
            not body.recipient
            or "@" not in body.recipient
            or "\n" in body.recipient
            or "\r" in body.recipient
        ):
            raise HTTPException(422, "Indiquez le destinataire réel de votre envoi.")
        q.recipient = body.recipient
        q.sent_at = domain.now()
    if body.action == "answer":
        if not body.response.strip():
            raise HTTPException(422, "Ajoutez la réponse reçue.")
        q.response = body.response
    if body.action == "resolve":
        if not body.conclusion.strip():
            raise HTTPException(422, "Ajoutez une conclusion vérifiée à partir de la réponse.")
        q.conclusion = body.conclusion
        value = body.normalized_value.strip() or q.conclusion
        if q.claim_key == "eligibility" and value not in ("OUI", "NON"):
            raise HTTPException(
                422,
                "Sélectionnez une décision explicite : OUI ou NON. Si la réponse est incertaine, gardez la question ouverte.",
            )
        if q.claim_key == "deadline":
            try:
                date.fromisoformat(value)
            except ValueError:
                raise HTTPException(422, "Saisissez la date confirmée au format AAAA-MM-JJ.") from None
        if q.claim_key == "language" and value not in ("A1", "A2", "B1", "B2", "C1", "C2"):
            raise HTTPException(422, "Saisissez le niveau CECRL confirmé.")
        c.overrides.setdefault(q.program_id, {})[q.claim_key] = Claim(
            value=value,
            status="CONFIRMED",
            source_url=f"correspondence:{q.id}",
            retrieved_at=date.today().isoformat(),
            source_type="correspondence",
            note="Réponse saisie et conclusion confirmée par le candidat ; authenticité non certifiée automatiquement.",
        )
    q.status = target
    return persist(db, row, c, f"question.{body.action}")


@app.post("/api/programs/{program_id}/selection", response_model=Snapshot)
def select_program(program_id: str, body: SelectInput, row: Current, db: DB):
    c = candidate(row)
    p = find_program(db, c, program_id)
    s = next((s for s in c.selections if s.program_id == program_id), None)
    if not s:
        s = Selection(program_id=program_id, rank=len(c.selections) + 1)
        c.selections.append(s)
    if body.action == "save":
        s.saved = not s.saved
    if body.action == "select":
        if not body.confirmed:
            raise HTTPException(422, "Confirmez votre choix de formation.")
        cycle = get_cycle(db, c)
        selected = [x for x in c.selections if x.selected and x.program_id != program_id]
        if len(selected) >= cycle.max_choices:
            raise HTTPException(409, f"Limite configurée : {cycle.max_choices} choix.")
        ids = {x.program_id for x in selected}
        same = sum(x.category == p.category and x.id in ids for x in get_programs(db, c))
        if p.category in cycle.category_limits and same >= cycle.category_limits[p.category]:
            raise HTTPException(409, "Limite de choix atteinte pour cette catégorie.")
        if p.claims.get("eligibility") and p.claims["eligibility"].value == "NON":
            raise HTTPException(409, "Éligibilité non satisfaite : résolvez ce point avant sélection.")
        s.selected, s.saved, s.status = True, True, "SELECTED"
    if body.action in ("remove", "reject"):
        s.selected, s.saved, s.status = False, False, "WITHDRAWN" if body.action == "remove" else "REJECTED"
    if body.action == "rank":
        s.rank = body.rank
    if body.action == "track":
        if not body.confirmed or not s.selected:
            raise HTTPException(409, "Sélection et confirmation explicite requises.")
        allowed = {
            "SELECTED": ["APPLIED", "WITHDRAWN"],
            "APPLIED": ["UNDER_REVIEW", "ADMITTED", "WAITLISTED", "REJECTED", "WITHDRAWN"],
            "UNDER_REVIEW": ["ADMITTED", "WAITLISTED", "REJECTED", "WITHDRAWN"],
            "WAITLISTED": ["ADMITTED", "REJECTED", "WITHDRAWN"],
        }
        if body.status not in allowed.get(s.status, []):
            raise HTTPException(409, "Ce changement ne suit pas l’état actuel de la candidature.")
        if body.status == "APPLIED" and (
            domain.program_blockers(c, p) or domain.audit(c, get_programs(db, c), get_cycle(db, c)).critical
        ):
            raise HTTPException(409, "L’audit doit être résolu avant d’enregistrer un dépôt.")
        s.status, s.note = body.status, body.note
        if body.status == "WITHDRAWN":
            s.selected = False
    s.updated_at = domain.now()
    return persist(
        db,
        row,
        c,
        f"selection.{body.action}",
        invalidate=body.action in ("select", "remove", "reject")
        or body.action == "track"
        and body.status == "WITHDRAWN",
    )


@app.put("/api/narrative", response_model=Snapshot)
def narrative(body: Narrative, row: Current, db: DB):
    c = candidate(row)
    if not any(s.selected for s in c.selections):
        raise HTTPException(409, "Sélectionnez vos formations avant de construire le projet final.")
    if body.approved and (
        len(body.study_project.strip()) < 30 or len(body.professional_project.strip()) < 30
    ):
        raise HTTPException(422, "Développez chaque projet avant de le valider (30 caractères minimum).")
    c.narrative = body
    return persist(db, row, c, "narrative.saved")


class ArtifactRequest(Schema):
    kind: str
    program_id: str | None = None


@app.post("/api/artifacts", response_model=Snapshot)
def generate_artifact(body: ArtifactRequest, row: Current, db: DB):
    c = candidate(row)
    selected = [s for s in c.selections if s.selected]
    if not selected:
        raise HTTPException(409, "Sélectionnez vos formations avant de préparer vos documents.")
    if any(not domain.fact_value(c, key) for key in ("first_name", "last_name", "academic_status")):
        raise HTTPException(409, "Identité et situation académique à compléter ou vérifier avant génération.")
    if body.kind == "cv":
        focus = ", ".join(find_program(db, c, s.program_id).title for s in selected)
        artifact = ai.cv_draft(c, focus)
    elif body.kind == "motivation":
        if not c.narrative.approved:
            raise HTTPException(409, "Validez votre projet d’études et votre projet professionnel.")
        if body.program_id not in {s.program_id for s in selected}:
            raise HTTPException(409, "Cette formation n’est pas sélectionnée.")
        p = find_program(db, c, body.program_id)
        blockers = domain.program_blockers(c, p)
        if blockers:
            raise HTTPException(409, "Fiche formation incomplète : " + "; ".join(blockers))
        artifact = ai.motivation_draft(c, p, get_cycle(db, c).motivation_limit)
    else:
        raise HTTPException(422, "Type de document inconnu.")
    c.artifacts = [
        a for a in c.artifacts if not (a.kind == artifact.kind and a.program_id == artifact.program_id)
    ] + [artifact]
    return persist(db, row, c, "artifact.generated", invalidate=False)


class Approval(Schema):
    confirmed: bool


@app.post("/api/artifacts/{artifact_id}/approve", response_model=Snapshot)
def approve_artifact(artifact_id: str, body: Approval, row: Current, db: DB):
    c = candidate(row)
    artifact = next((a for a in c.artifacts if a.id == artifact_id), None)
    if not artifact:
        raise HTTPException(404, "Document introuvable.")
    if not body.confirmed or artifact.source_revision != c.revision:
        raise HTTPException(
            409, "Régénérez le document depuis les dernières informations puis confirmez sa relecture."
        )
    if artifact.kind == "motivation" and len(artifact.text) > get_cycle(db, c).motivation_limit:
        raise HTTPException(
            409, "La motivation dépasse la limite configurée. Réduisez vos projets puis régénérez."
        )
    artifact.approved = True
    return persist(db, row, c, "artifact.approved", invalidate=False)


@app.post("/api/interview", response_model=InterviewFeedback)
def interview(body: InterviewAnswer, row: Current):
    return ai.interview_feedback(body, candidate(row))


@app.post("/api/tasks/{task_id}/complete", response_model=Snapshot)
def complete_task(task_id: str, row: Current, db: DB):
    c = candidate(row)
    task = next((t for t in domain.tasks(c, get_programs(db, c), get_cycle(db, c)) if t.id == task_id), None)
    if not task or task.priority in ("CRITICAL", "HIGH"):
        raise HTTPException(409, "Cette priorité se résout en corrigeant sa cause, pas en la masquant.")
    c.completed_tasks = list(set(c.completed_tasks + [task_id]))
    return persist(db, row, c, "task.completed", invalidate=False)


@app.put("/api/cycle", response_model=Snapshot)
def update_cycle(body: Cycle, row: Current, db: DB):
    c = candidate(row)
    policy = get_cycle(db, c)
    if (body.max_choices, body.category_limits, body.motivation_limit, body.country, body.route) != (
        policy.max_choices,
        policy.category_limits,
        policy.motivation_limit,
        policy.country,
        policy.route,
    ):
        raise HTTPException(
            422, "Les limites de procédure sont administrées séparément du calendrier candidat."
        )
    if urlparse(body.source_url).hostname not in (
        "www.maroc.campusfrance.org",
        "www.campusfrance.org",
    ) or not body.source_url.startswith("https://"):
        raise HTTPException(
            422, "Utilisez la source officielle Campus France correspondant à votre procédure."
        )
    if body.status == "CONFIRMED" and (not body.deadline or body.label == "Cycle à confirmer"):
        raise HTTPException(422, "Précisez le cycle et sa date limite avant confirmation.")
    c.cycle = body
    return persist(db, row, c, "cycle.updated")
