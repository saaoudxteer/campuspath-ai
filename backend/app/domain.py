from datetime import date, datetime, timedelta, timezone

from .schemas import (
    Audit,
    Candidate,
    Completeness,
    Cycle,
    Diagnostic,
    Match,
    MatchDimension,
    Pathway,
    Program,
    SectionCompletion,
    Task,
)

CRITICAL_CLAIMS = {
    "curriculum": "Programme pédagogique",
    "prerequisites": "Prérequis",
    "route": "Voie de candidature",
    "deadline": "Date limite",
    "language": "Exigences linguistiques",
    "tuition": "Frais de scolarité",
    "eligibility": "Éligibilité",
}
IDENTITY_KEYS = ["first_name", "last_name", "birth_date", "nationality", "residence"]
CONTACT_KEYS = ["city", "address", "phone", "email", "academic_status"]


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def fact_value(c: Candidate, key: str) -> str:
    return next(
        (
            f.value
            for f in c.facts
            if f.key == key and f.status not in ("MISSING", "INCONSISTENT", "NEEDS_REVIEW")
        ),
        "",
    )


def weighted_average(grades) -> float | None:
    denominator = sum(g.coefficient for g in grades)
    return (
        round(sum(g.value / g.scale * 20 * g.coefficient for g in grades) / denominator, 2)
        if denominator
        else None
    )


def diagnose(c: Candidate) -> Diagnostic:
    subjects = {
        s: weighted_average([g for g in c.grades if g.subject == s])
        for s in sorted({g.subject for g in c.grades})
    }
    semesters = {
        s: weighted_average([g for g in c.grades if g.semester == s])
        for s in sorted({g.semester for g in c.grades})
    }
    ordered = sorted(subjects, key=lambda s: subjects[s], reverse=True)
    values = list(semesters.values())
    warnings = []
    if not c.grades:
        warnings.append("Ajoutez vos notes pour calculer votre diagnostic.")
    if any(
        not g.user_confirmed
        or not any(
            d.id == g.document_id and d.kind == "transcript" and d.status == "VERIFIED" for d in c.documents
        )
        for g in c.grades
    ):
        warnings.append("Certaines notes sont déclarées et restent à vérifier sur pièce.")
    seen = set()
    for g in c.grades:
        key = (g.subject.casefold(), g.semester)
        if key in seen:
            warnings.append(f"Doublon possible : {g.subject}, semestre {g.semester}.")
        seen.add(key)
    return Diagnostic(
        average=weighted_average(c.grades),
        subject_averages=subjects,
        semester_averages=semesters,
        strongest=ordered[:2],
        weakest=list(reversed(ordered))[:2],
        progression=round(values[-1] - values[0], 2) if len(values) >= 2 else None,
        warnings=warnings,
        grade_count=len(c.grades),
    )


def completeness(c: Candidate) -> Completeness:
    def present(key):
        return any(
            f.key == key and f.value.strip() and f.status not in ("MISSING", "INCONSISTENT") for f in c.facts
        )

    required_docs = ["identity", "photo", "diploma", "transcript", "language"]
    counts = [
        ("Identité", sum(present(k) for k in IDENTITY_KEYS), len(IDENTITY_KEYS)),
        ("Coordonnées", sum(present(k) for k in CONTACT_KEYS), len(CONTACT_KEYS)),
        (
            "Documents",
            sum(any(d.kind == k and d.status != "REJECTED" for d in c.documents) for k in required_docs),
            5,
        ),
        (
            "Parcours académique",
            int(bool(c.education))
            + int(bool(c.grades))
            + int(
                bool(c.education)
                and all(set(e.expected_semesters) <= set(e.transcript_semesters) for e in c.education)
            ),
            3,
        ),
        (
            "Langues",
            int(present("french_level"))
            + int(present("english_level"))
            + int(any(d.kind == "language" and d.status == "VERIFIED" for d in c.documents)),
            3,
        ),
        (
            "Projet & expériences",
            int(bool(c.preferences.goal))
            + int(bool(c.preferences.interests))
            + int(bool(c.experiences) or present("no_experience")),
            3,
        ),
    ]
    complete = sum(n for _, n, _ in counts)
    total = sum(n for _, _, n in counts)
    populated = [f for f in c.facts if f.value]
    verified = sum(f.status == "VERIFIED" for f in populated)
    return Completeness(
        percent=round(100 * complete / total),
        verified_percent=round(100 * verified / len(populated)) if populated else 0,
        sections=[
            SectionCompletion(label=label, complete=n, total=d, percent=round(100 * n / d))
            for label, n, d in counts
        ],
    )


def timeline_tasks(c: Candidate) -> list[Task]:
    tasks = []
    ordered = sorted(c.education, key=lambda e: (e.start_year, e.end_year))
    for index, edu in enumerate(ordered):
        missing = sorted(set(edu.expected_semesters) - set(edu.transcript_semesters))
        for semester in missing:
            tasks.append(
                Task(
                    id=f"semester-{edu.id}-{semester}",
                    title=f"Ajouter le relevé du semestre {semester}",
                    detail=f"{edu.label} : ce semestre n’a pas de relevé associé. Sans cette pièce, le parcours reste incomplet.",
                    priority="CRITICAL",
                    next_action="Ajouter mon relevé",
                    route="documents",
                )
            )
        if index and edu.start_year > ordered[index - 1].end_year and not edu.explanation.strip():
            tasks.append(
                Task(
                    id=f"gap-{edu.id}",
                    title="Expliquer une interruption de parcours",
                    detail=f"Période {ordered[index - 1].end_year}–{edu.start_year} sans explication.",
                    priority="HIGH",
                    next_action="Compléter mon parcours",
                    route="academic",
                )
            )
        if index and edu.start_year < ordered[index - 1].end_year and not edu.explanation.strip():
            tasks.append(
                Task(
                    id=f"overlap-{edu.id}",
                    title="Vérifier des années qui se chevauchent",
                    detail=f"{edu.label} chevauche {ordered[index - 1].label}. Documentez les études simultanées ou corrigez les dates.",
                    priority="HIGH",
                    next_action="Vérifier les dates",
                    route="academic",
                )
            )
        if index and edu.level == ordered[index - 1].level and not edu.explanation.strip():
            tasks.append(
                Task(
                    id=f"repeat-{edu.id}",
                    title="Préciser une année répétée",
                    detail=f"Deux années au niveau {edu.level} : ajoutez une explication.",
                    priority="HIGH",
                    next_action="Expliquer cette année",
                    route="academic",
                )
            )
    return tasks


def deadline_state(value: str | None, today: date | None = None) -> str:
    if not value:
        return "UNKNOWN"
    try:
        delta = (date.fromisoformat(value) - (today or date.today())).days
    except ValueError:
        return "UNKNOWN"
    return "OVERDUE" if delta < 0 else "URGENT" if delta <= 3 else "SOON" if delta <= 14 else "NORMAL"


def program_blockers(c: Candidate, p: Program) -> list[str]:
    blockers = []
    for key, label in CRITICAL_CLAIMS.items():
        claim = p.claims.get(key)
        if (
            not claim
            or claim.status != "CONFIRMED"
            or not claim.value
            or not claim.source_url
            or not claim.retrieved_at
        ):
            blockers.append(f"{label} à confirmer")
        elif claim.source_type not in ("official", "correspondence") and not c.is_demo:
            blockers.append(f"{label} : source non admissible")
    eligibility = p.claims.get("eligibility")
    if not eligibility or eligibility.value not in ("OUI", "NON"):
        blockers.append("Éligibilité : décision explicite manquante")
    elif eligibility.value == "NON":
        blockers.append("Éligibilité non satisfaite")
    deadline = deadline_state(p.claims.get("deadline").value if p.claims.get("deadline") else None)
    if deadline == "UNKNOWN":
        blockers.append("Date limite exacte inconnue")
    if deadline == "OVERDUE":
        blockers.append("Date limite dépassée")
    levels = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    required = p.claims.get("language")
    if required and required.status == "CONFIRMED":
        actual = levels.get(fact_value(c, "french_level"), 0)
        if required.value not in levels or actual < levels[required.value]:
            blockers.append("Prérequis de français non satisfait ou à clarifier")
    french = next((f for f in c.facts if f.key == "french_level"), None)
    if (
        not french
        or french.status != "VERIFIED"
        or not any(
            d.id == french.document_id and d.kind == "language" and d.status == "VERIFIED"
            for d in c.documents
        )
    ):
        blockers.append("Justificatif linguistique à vérifier")
    if any(q.program_id == p.id and q.status != "RESOLVED" for q in c.questions):
        blockers.append("Question critique non résolue")
    if p.is_mock and not c.is_demo:
        blockers.append("Formation de démonstration indisponible pour un dossier réel")
    return blockers


def match(c: Candidate, p: Program, diagnostic: Diagnostic) -> Match:
    average = diagnostic.average
    academic = None if average is None else min(100, round(average / 20 * 100))
    eligible = p.claims.get("eligibility")
    prerequisite = (
        None
        if not eligible or eligible.status != "CONFIRMED" or eligible.value not in ("OUI", "NON")
        else (0 if eligible.value == "NON" else 100)
    )
    language_claim = p.claims.get("language")
    levels = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
    actual = levels.get(fact_value(c, "french_level"))
    required = (
        levels.get(language_claim.value or "")
        if language_claim and language_claim.status == "CONFIRMED"
        else None
    )
    language = None if not actual or not required else min(100, round(actual / required * 100))
    interests = " ".join(c.preferences.interests + [c.preferences.goal]).casefold()
    career = (
        None if not interests.strip() else (100 if any(tag.casefold() in interests for tag in p.tags) else 40)
    )
    geography = (
        None if not c.preferences.cities else (100 if p.institution.city in c.preferences.cities else 35)
    )
    tuition = p.claims.get("tuition")
    try:
        cost = float(tuition.value) if tuition and tuition.status == "CONFIRMED" else None
    except (ValueError, TypeError):
        cost = None
    budget = (
        None
        if cost is None or c.preferences.annual_budget is None
        else (100 if cost <= c.preferences.annual_budget else 0)
    )
    dimensions = [
        MatchDimension(
            key="academic",
            label="Académique",
            weight=30,
            score=academic,
            reason="Moyenne pondérée ramenée sur 100 ; ce n’est pas une probabilité.",
        ),
        MatchDimension(
            key="prerequisite",
            label="Prérequis",
            weight=25,
            score=prerequisite,
            reason="Éligibilité documentée dans la fiche formation.",
        ),
        MatchDimension(
            key="language",
            label="Langue",
            weight=15,
            score=language,
            reason="Niveau déclaré comparé au niveau requis ; certificat à vérifier.",
        ),
        MatchDimension(
            key="career",
            label="Projet",
            weight=15,
            score=career,
            reason="Correspondance explicite des centres d’intérêt avec les thèmes de la formation.",
        ),
        MatchDimension(
            key="geography",
            label="Géographie",
            weight=10,
            score=geography,
            reason="Ville dans vos préférences géographiques.",
        ),
        MatchDimension(
            key="budget",
            label="Budget",
            weight=5,
            score=budget,
            reason="Frais de scolarité uniquement ; logement et vie quotidienne non inclus.",
        ),
    ]
    known = [d for d in dimensions if d.score is not None]
    coverage = sum(d.weight for d in known)
    score = round(sum(d.score * d.weight for d in known) / coverage) if coverage else None
    blockers = program_blockers(c, p)
    classification = "UNASSESSED"
    if prerequisite == 0:
        classification = "INELIGIBLE"
    elif score is not None and prerequisite == 100 and average is not None:
        classification = "SAFER" if score >= 85 and not blockers else "TARGET" if score >= 65 else "AMBITIOUS"
    risks = list(blockers)
    if language is not None and language < 100:
        risks.append("Niveau de français inférieur au prérequis déclaré")
    if not any(d.kind == "language" and d.status == "VERIFIED" for d in c.documents):
        risks.append("Justificatif linguistique à vérifier")
    risks.append("Sélectivité réelle inconnue ; aucune chance d’admission calculée.")
    return Match(
        program_id=p.id,
        score=score,
        coverage=coverage,
        classification=classification,
        dimensions=dimensions,
        strengths=[d.label + " : adéquation favorable" for d in known if d.score >= 80],
        risks=risks,
        ready=not blockers,
        blockers=blockers,
    )


def pathways(c: Candidate) -> list[Pathway]:
    if not c.preferences.interests and not c.preferences.goal:
        return []
    goal = c.preferences.goal or "Objectif à préciser"
    has_licence = any("licence" in e.level.lower() or "l3" in e.level.lower() for e in c.education)
    return [
        Pathway(
            id="university",
            title="La voie universitaire",
            steps=["Licence" if has_licence else "Bac", "Master" if has_licence else "Licence", goal],
            fit="À explorer selon vos matières et prérequis",
            duration="Master : généralement 2 ans après la licence",
            difficulty="Approfondissement théorique et autonomie",
            professionalization="Projets et stages selon la formation",
            flexibility="Spécialisation progressive",
            cost="À vérifier auprès de chaque établissement",
            opportunities=[goal],
            risks=["Admission sur dossier", "Les passerelles ne sont jamais automatiques"],
            exits=["Poursuite d’études", "Emploi selon compétences et marché"],
        ),
        Pathway(
            id="applied",
            title="La voie professionnalisante",
            steps=["Diplôme actuel", "Formation appliquée", "Stage / projet", goal],
            fit="Intéressante si vous privilégiez la pratique",
            duration="Variable selon le niveau d’entrée confirmé",
            difficulty="Rythme soutenu et projets pratiques",
            professionalization="Forte si stages et projets sont confirmés",
            flexibility="Passerelles à vérifier individuellement",
            cost="Aucune estimation sans source",
            opportunities=[goal],
            risks=["Conditions d’accès spécifiques", "Alternance et financement non garantis"],
            exits=["Emploi", "Poursuite sous conditions"],
        ),
        Pathway(
            id="engineering",
            title="La voie ingénieur",
            steps=["Diplôme actuel", "Admission sur titre / concours", "Cycle ingénieur", goal],
            fit="À examiner selon les fondamentaux scientifiques",
            duration="Dépend du niveau d’admission",
            difficulty="Exigence scientifique et sélection à documenter",
            professionalization="Projets, stages, spécialisation",
            flexibility="Entrées et sorties soumises aux règles de l’école",
            cost="Tarifs et statut public / privé à vérifier",
            opportunities=[goal],
            risks=["Diplôme et prérequis à confirmer", "Aucune passerelle garantie"],
            exits=["Emploi", "Recherche sous conditions"],
        ),
    ]


def tasks(c: Candidate, programs: list[Program], cycle: Cycle) -> list[Task]:
    result = timeline_tasks(c)
    if not c.education:
        result.append(
            Task(
                id="education",
                title="Reconstituer votre parcours",
                detail="Ajoutez chaque année de formation, y compris les interruptions.",
                priority="CRITICAL",
                next_action="Ajouter une année",
                route="academic",
            )
        )
    for kind, label in [
        ("identity", "pièce d’identité"),
        ("photo", "photo d’identité"),
        ("diploma", "diplôme"),
        ("language", "justificatif de langue"),
    ]:
        if not any(d.kind == kind and d.status != "REJECTED" for d in c.documents):
            result.append(
                Task(
                    id=f"doc-{kind}",
                    title=f"Ajouter votre {label}",
                    detail="Pièce nécessaire à l’audit du dossier. Les exigences exactes dépendent de la procédure.",
                    priority="HIGH",
                    next_action="Ajouter un document",
                    route="documents",
                )
            )
    for f in c.facts:
        if f.key == "no_experience":
            continue
        if f.status in ("MISSING", "INCONSISTENT", "NEEDS_REVIEW"):
            result.append(
                Task(
                    id=f"fact-{f.id}",
                    title=f"Vérifier : {f.label}",
                    detail="Information manquante ou à revoir. Confirmez la valeur et sa source.",
                    priority="HIGH",
                    next_action="Vérifier mon profil",
                    route="profile",
                )
            )
    for q in c.questions:
        if q.status != "RESOLVED":
            result.append(
                Task(
                    id=f"question-{q.id}",
                    title=q.question,
                    detail=q.reason,
                    priority="HIGH",
                    next_action="Examiner la question",
                    route="programs",
                    program_id=q.program_id,
                    deadline=(datetime.fromisoformat(q.sent_at) + timedelta(days=7)).date().isoformat()
                    if q.sent_at
                    else None,
                )
            )
    if not any(s.selected for s in c.selections):
        result.append(
            Task(
                id="select",
                title="Construire votre sélection",
                detail="Comparez les contenus, les contraintes et les points à confirmer avant de choisir.",
                priority="MEDIUM",
                next_action="Explorer les formations",
                route="programs",
            )
        )
    if cycle.status != "CONFIRMED":
        result.append(
            Task(
                id="cycle",
                title="Vérifier le calendrier officiel",
                detail="Aucune date limite annuelle n’est supposée. Consultez le calendrier du cycle qui vous concerne.",
                priority="HIGH",
                next_action="Voir les échéances",
                route="tasks",
            )
        )
    if cycle.deadline:
        state = deadline_state(cycle.deadline.isoformat())
        result.append(
            Task(
                id="cycle-deadline",
                title="Échéance du cycle de candidature",
                detail=cycle.label,
                priority="CRITICAL" if state == "OVERDUE" else "HIGH",
                next_action="Vérifier le calendrier",
                route="tasks",
                deadline=cycle.deadline.isoformat(),
                warning_state=state,
            )
        )
    for p in programs:
        if not any(s.program_id == p.id and s.selected for s in c.selections):
            continue
        claim = p.claims.get("deadline")
        if claim and claim.value and claim.status == "CONFIRMED":
            state = deadline_state(claim.value)
            result.append(
                Task(
                    id=f"deadline-{p.id}",
                    title=f"Échéance : {p.title}",
                    detail="Échéance illustrative" if p.is_mock else "Date issue de la fiche formation.",
                    priority="CRITICAL" if state == "OVERDUE" else "HIGH",
                    next_action="Examiner la candidature",
                    route="applications",
                    program_id=p.id,
                    deadline=claim.value,
                    warning_state=state,
                )
            )
    for task in result:
        # System-derived blockers cannot be dismissed without fixing their cause.
        if task.priority in ("MEDIUM", "LOW") and task.id in c.completed_tasks:
            task.status = "DONE"
        if task.deadline:
            task.warning_state = deadline_state(task.deadline)
    order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    return sorted(result, key=lambda t: (t.status == "DONE", order[t.priority], t.deadline or "9999"))


def audit(c: Candidate, programs: list[Program], cycle: Cycle) -> Audit:
    critical, warnings, ready = [], [], []
    for key in IDENTITY_KEYS + CONTACT_KEYS:
        f = next((f for f in c.facts if f.key == key), None)
        if not f or not f.value or f.status in ("MISSING", "INCONSISTENT"):
            critical.append(f"Information à compléter : {f.label if f else key}")
    for kind, label in [
        ("identity", "Identité"),
        ("photo", "Photo"),
        ("diploma", "Diplôme"),
        ("transcript", "Relevés"),
        ("language", "Langue"),
    ]:
        if any(d.kind == kind and d.status == "VERIFIED" for d in c.documents):
            ready.append(label + " : pièce revue")
        else:
            critical.append(label + " : pièce absente ou non vérifiée")
    if not c.education:
        critical.append("Historique académique absent")
    critical.extend(t.title for t in timeline_tasks(c))
    critical.extend(diagnose(c).warnings)
    selected = [p for p in programs if any(s.program_id == p.id and s.selected for s in c.selections)]
    if len(selected) > cycle.max_choices:
        critical.append("Nombre de choix supérieur à la limite du cycle")
    for category, limit in cycle.category_limits.items():
        if sum(p.category == category for p in selected) > limit:
            critical.append("Nombre de choix supérieur à la limite de catégorie : " + category)
    if not selected:
        critical.append("Aucune formation sélectionnée")
    for p in selected:
        critical.extend(p.title + " : " + b for b in program_blockers(c, p))
        if not any(
            a.kind == "motivation" and a.program_id == p.id and a.approved and a.source_revision == c.revision
            for a in c.artifacts
        ):
            critical.append(p.title + " : motivation non validée")
    if not any(a.kind == "cv" and a.approved and a.source_revision == c.revision for a in c.artifacts):
        critical.append("CV non validé ou à actualiser")
    if not c.narrative.approved:
        critical.append("Projet d’études et professionnel à valider")
    if cycle.status != "CONFIRMED":
        critical.append("Cycle et calendrier à confirmer auprès des sources officielles")
    if not cycle.deadline or deadline_state(cycle.deadline.isoformat()) in ("UNKNOWN", "OVERDUE"):
        critical.append("Date limite du cycle absente ou dépassée")
    if any(q.status != "RESOLVED" and any(p.id == q.program_id for p in selected) for q in c.questions):
        critical.append("Questions critiques non résolues")
    if any(f.status in ("NEEDS_REVIEW", "INCONSISTENT") for f in c.facts):
        critical.append("Informations contradictoires ou non revues")
    if any(f.status == "SELF_DECLARED" for f in c.facts):
        warnings.append("Des informations restent déclaratives. Vérifiez les justificatifs exigés.")
    if c.is_demo:
        warnings.append("Données fictives : cet audit ne certifie aucune candidature réelle.")
    warnings.append("L’entretien et le financement doivent être préparés avec les exigences du cycle.")
    return Audit(
        state="BLOCKED" if critical else "READY_DEMO" if c.is_demo else "READY",
        critical=list(dict.fromkeys(critical)),
        warnings=warnings,
        ready_items=ready,
    )
