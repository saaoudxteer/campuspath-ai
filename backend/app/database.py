import os
from pathlib import Path

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'campuspath.db'}")
if not DEMO_MODE and not DATABASE_URL.startswith("postgresql"):
    raise RuntimeError("Production requires an explicitly configured PostgreSQL database.")
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class UserRow(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)


class SessionRow(Base):
    __tablename__ = "sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    expires_at: Mapped[str] = mapped_column(String(40))


class CandidateRow(Base):
    __tablename__ = "candidates"
    id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    data: Mapped[dict] = mapped_column(JSON)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    __mapper_args__ = {"version_id_col": version}


class InstitutionRow(Base):
    __tablename__ = "institutions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    data: Mapped[dict] = mapped_column(JSON)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=False)


class ProgramRow(Base):
    __tablename__ = "programs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    institution_id: Mapped[str] = mapped_column(ForeignKey("institutions.id"))
    data: Mapped[dict] = mapped_column(JSON)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=False)


class DocumentRow(Base):
    __tablename__ = "documents"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    candidate_id: Mapped[str] = mapped_column(ForeignKey("candidates.id"), index=True)
    storage_key: Mapped[str] = mapped_column(String(200))
    mime: Mapped[str] = mapped_column(String(100))
    sha256: Mapped[str] = mapped_column(String(64))


class CycleRow(Base):
    __tablename__ = "application_cycles"
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    data: Mapped[dict] = mapped_column(JSON)


class AuditEventRow(Base):
    __tablename__ = "audit_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    candidate_id: Mapped[str] = mapped_column(String(36), index=True)
    action: Mapped[str] = mapped_column(String(100))
    at: Mapped[str] = mapped_column(String(40))
    revision: Mapped[int] = mapped_column(Integer)


def initialize():
    Base.metadata.create_all(engine)
    from .schemas import Cycle
    from .seed import demo_programs

    with SessionLocal() as db:
        if not db.get(CycleRow, "MA-EEF-reference-2026"):
            cycle = Cycle()
            db.add(CycleRow(id=cycle.id, data=cycle.model_dump(mode="json")))
        if DEMO_MODE:
            for program in demo_programs():
                if not db.get(ProgramRow, program.id):
                    db.add(
                        InstitutionRow(
                            id=program.institution.id, data=program.institution.model_dump(), is_mock=True
                        )
                    )
                    db.flush()
                    db.add(
                        ProgramRow(
                            id=program.id,
                            institution_id=program.institution.id,
                            data=program.model_dump(mode="json"),
                            is_mock=True,
                        )
                    )
        db.commit()
