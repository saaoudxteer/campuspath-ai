"""Explicitly fictional fixtures. Never loaded in production mode."""

from datetime import date, timedelta

from .domain import now
from .schemas import (
    Candidate,
    Claim,
    Document,
    Education,
    Experience,
    Fact,
    Grade,
    Institution,
    Preferences,
    Program,
)


PROFILE_FIELDS = [
    ("first_name", "Prénom", "identity"),
    ("last_name", "Nom", "identity"),
    ("birth_date", "Date de naissance", "identity"),
    ("nationality", "Nationalité", "identity"),
    ("residence", "Pays de résidence", "identity"),
    ("city", "Ville", "contact"),
    ("address", "Adresse", "contact"),
    ("phone", "Téléphone", "contact"),
    ("email", "Email", "contact"),
    ("academic_status", "Situation actuelle", "contact"),
    ("french_level", "Niveau de français", "languages"),
    ("english_level", "Niveau d’anglais", "languages"),
    ("no_experience", "Aucune expérience à déclarer", "experience"),
]


def empty_candidate(candidate_id: str, email: str) -> Candidate:
    return Candidate(
        id=candidate_id,
        facts=[
            Fact(key=key, label=label, section=section, value=email if key == "email" else "")
            for key, label, section in PROFILE_FIELDS
        ],
    )


def demo_candidate(candidate_id: str) -> Candidate:
    c = empty_candidate(candidate_id, "imane@example.test")
    c.is_demo = True
    data = {
        "first_name": "Imane",
        "last_name": "Bennani",
        "birth_date": "2004-04-18",
        "nationality": "Marocaine",
        "residence": "Maroc",
        "city": "Rabat",
        "address": "Adresse fictive — Rabat",
        "phone": "+212 600 000 000",
        "academic_status": "Licence 3 — Informatique",
        "french_level": "B2",
        "english_level": "B1",
    }
    for f in c.facts:
        if f.key in data:
            f.value = data[f.key]
        f.status = "SELF_DECLARED"
        if f.key in ("first_name", "last_name", "birth_date", "nationality"):
            f.status, f.document_id, f.user_confirmed = "VERIFIED", "demo-identity", True
    c.documents = [
        Document(
            id="demo-identity",
            name="Identité — exemple fictif.pdf",
            kind="identity",
            status="VERIFIED",
            uploaded_at=now(),
            is_mock=True,
            processing_note="Pièce illustrative, sans valeur administrative.",
        ),
        Document(
            id="demo-bac",
            name="Baccalauréat — exemple fictif.pdf",
            kind="diploma",
            status="VERIFIED",
            uploaded_at=now(),
            is_mock=True,
        ),
        Document(
            id="demo-transcript",
            name="Relevés S1–S3 — exemple fictif.pdf",
            kind="transcript",
            status="VERIFIED",
            uploaded_at=now(),
            is_mock=True,
        ),
    ]
    c.education = [
        Education(
            id="bac",
            label="Baccalauréat sciences mathématiques",
            institution="Lycée de démonstration · Rabat",
            start_year=2021,
            end_year=2022,
            level="Bac",
        ),
        Education(
            id="l1",
            label="Licence 1 · Informatique",
            institution="Université de démonstration · Rabat",
            start_year=2022,
            end_year=2023,
            level="L1",
            expected_semesters=[1, 2],
            transcript_semesters=[1, 2],
        ),
        Education(
            id="l2",
            label="Licence 2 · Informatique",
            institution="Université de démonstration · Rabat",
            start_year=2023,
            end_year=2024,
            level="L2",
            expected_semesters=[3, 4],
            transcript_semesters=[3],
        ),
        Education(
            id="l3",
            label="Licence 3 · Informatique",
            institution="Université de démonstration · Rabat",
            start_year=2024,
            end_year=2025,
            level="L3",
            expected_semesters=[5, 6],
            transcript_semesters=[],
        ),
    ]
    c.grades = [
        Grade(
            subject=s,
            value=v,
            coefficient=k,
            semester=sem,
            document_id="demo-transcript",
            user_confirmed=True,
        )
        for s, v, k, sem in [
            ("Algorithmique", 16, 3, 1),
            ("Mathématiques", 15, 2, 1),
            ("Programmation", 16.5, 3, 2),
            ("Réseaux", 14.5, 2, 2),
            ("Algorithmique", 17, 3, 3),
            ("Bases de données", 15.5, 2, 3),
            ("Anglais", 12, 1, 3),
        ]
    ]
    c.preferences = Preferences(
        goal="Ingénieure en cybersécurité",
        interests=["informatique", "cybersécurité", "réseaux"],
        cities=["Lyon", "Rennes", "Lille"],
        annual_budget=10000,
        style="practical",
    )
    c.experiences = [
        Experience(
            kind="project",
            title="Supervision d’un réseau local",
            description="Projet universitaire de démonstration : configuration d’un réseau et suivi des journaux système.",
            date_label="2024",
            user_confirmed=True,
        ),
        Experience(
            kind="skill",
            title="Python, Linux, SQL",
            description="Compétences déclarées dans le profil fictif.",
            user_confirmed=True,
        ),
    ]
    return c


def demo_programs() -> list[Program]:
    fixtures = [
        (
            "p1",
            "Master Cybersécurité",
            "Lyon",
            "Institut Rhône — Démo",
            ["cybersécurité", "réseaux"],
            "Réseaux sécurisés, cryptographie et gestion des incidents.",
            "blue",
            False,
            250,
            45,
        ),
        (
            "p2",
            "Master Informatique · Systèmes & réseaux",
            "Rennes",
            "Université Armorique — Démo",
            ["informatique", "réseaux"],
            "Systèmes distribués, administration des réseaux et projet de recherche.",
            "purple",
            True,
            250,
            60,
        ),
        (
            "p3",
            "Master Data & intelligence artificielle",
            "Lille",
            "Institut du Nord — Démo",
            ["data", "statistiques"],
            "Statistiques, apprentissage automatique et traitement des données.",
            "teal",
            False,
            450,
            75,
        ),
        (
            "p4",
            "Cycle ingénieur · Sécurité numérique",
            "Paris",
            "École Horizon — Démo",
            ["cybersécurité", "informatique"],
            "Architecture sécurisée, systèmes embarqués et projets d’ingénierie.",
            "orange",
            False,
            12000,
            90,
        ),
        (
            "p5",
            "Master Informatique appliquée",
            "Nantes",
            "Université Atlantique — Démo",
            ["informatique", "programmation"],
            "Génie logiciel, bases de données et projet de développement.",
            "blue",
            True,
            300,
            80,
        ),
        (
            "p6",
            "Master Réseaux & télécommunications",
            "Toulouse",
            "Institut Occitan — Démo",
            ["réseaux", "informatique"],
            "Infrastructure réseau, communications et services distribués.",
            "teal",
            False,
            400,
            70,
        ),
    ]
    result = []
    for pid, title, city, school, tags, curriculum, color, complete, tuition, days in fixtures:

        def claim(value, confirmed=True):
            return Claim(
                value=value,
                status="CONFIRMED" if confirmed else "UNCERTAIN",
                source_url=f"https://example.invalid/campuspath/{pid}",
                retrieved_at=date.today().isoformat(),
                source_type="mock",
                note="Exemple fictif. Ne constitue pas une exigence d’admission réelle.",
            )

        claims = {
            "curriculum": claim(curriculum),
            "prerequisites": claim("Licence informatique ou diplôme équivalent à examiner", complete),
            "route": claim("EEF — scénario illustratif", complete),
            "deadline": claim((date.today() + timedelta(days=days)).isoformat()),
            "language": claim("B2"),
            "tuition": claim(str(tuition)),
            "eligibility": claim("OUI" if complete else "À confirmer", complete),
            "degree": claim("Licence ou diplôme équivalent"),
            "documents": claim("Diplôme, relevés, CV, motivation et justificatif de langue"),
            "outcomes": claim("Métiers liés aux systèmes informatiques ; aucun emploi garanti"),
            "instruction_language": claim("Français"),
            "application_fee": claim(None, False),
            "contact": claim(None, False),
            "program_url": claim(None, False),
            "admission_url": claim(None, False),
        }
        result.append(
            Program(
                id=pid,
                title=title,
                institution=Institution(
                    id=f"i-{pid}", name=school, city=city, campus=city, connected_status="UNKNOWN"
                ),
                degree_type="Master" if pid != "p4" else "Diplôme d’ingénieur",
                academic_level="Bac +5",
                tags=tags,
                description=curriculum,
                claims=claims,
                relevant_subjects=tags,
                color=color,
            )
        )
    return result
