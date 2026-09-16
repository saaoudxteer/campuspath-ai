"""Remplit un dossier de démonstration réaliste et affiche le raisonnement de l'application.

Usage, une fois l'application lancée (scripts/start-dev.ps1 ou npm run dev:all) :

    python scripts/fill-demo.py                 # crée une session démo et remplit un nouveau dossier
    python scripts/fill-demo.py --cookie VALEUR # remplit le dossier déjà ouvert dans votre navigateur

Pour la seconde forme, copiez la valeur du cookie « campuspath_session » depuis les outils de
développement du navigateur (Application > Cookies > http://127.0.0.1:3000). Le dossier rempli
apparaît alors directement dans l'interface après rechargement de la page.

Le candidat est fictif. Aucune donnée n'est envoyée ailleurs que sur votre instance locale.
"""

from __future__ import annotations

import argparse
import io
import json
import sys
from datetime import date, timedelta

try:
    import httpx
except ImportError:  # pragma: no cover
    sys.exit("Installez httpx dans le venv du projet : pip install httpx")

ORIGIN = {"Origin": "http://127.0.0.1:3000"}

PROFILE = {
    "first_name": "Yassine",
    "last_name": "El Amrani",
    "birth_date": "2003-11-02",
    "nationality": "Marocaine",
    "residence": "Maroc",
    "city": "Casablanca",
    "address": "Quartier Maârif, Casablanca (adresse fictive)",
    "phone": "+212 661 000 000",
    "email": "yassine.elamrani@example.test",
    "academic_status": "Licence 3 - Informatique (Casablanca)",
    "french_level": "B2",
    "english_level": "B2",
}

PREFERENCES = {
    "goal": "Devenir ingénieur réseaux et sécurité, puis évoluer vers l'architecture de systèmes sécurisés.",
    "interests": ["réseaux", "cybersécurité", "systèmes"],
    "cities": ["Lyon", "Toulouse", "Rennes"],
    "annual_budget": 9000,
    "style": "practical",
    "duration": "long",
}

GRADES = [
    # (matière, note, coefficient, semestre)
    ("Algorithmique", 15.5, 3, 1),
    ("Mathématiques", 13.0, 3, 1),
    ("Architecture des ordinateurs", 14.0, 2, 1),
    ("Programmation C", 16.0, 3, 2),
    ("Analyse", 12.5, 2, 2),
    ("Systèmes d'exploitation", 15.0, 3, 3),
    ("Réseaux informatiques", 17.0, 3, 3),
    ("Bases de données", 14.5, 2, 3),
    ("Probabilités et statistiques", 11.5, 2, 4),
    ("Programmation orientée objet", 15.5, 3, 4),
    ("Sécurité des systèmes", 16.5, 3, 5),
    ("Administration réseau", 17.5, 3, 5),
    ("Génie logiciel", 13.5, 2, 5),
]

EXPERIENCES = [
    {
        "kind": "internship",
        "title": "Stage technicien réseau, PME de services informatiques (Casablanca)",
        "description": "Configuration de commutateurs et de routeurs, mise en place de VLAN et d'un pare-feu, documentation du réseau.",
        "date_label": "Juillet-août 2025",
    },
    {
        "kind": "project",
        "title": "Projet de fin de licence : tunnel IPv4 sur IPv6",
        "description": "Implémentation et test d'un tunnel entre deux réseaux, mesures de débit et rapport technique.",
        "date_label": "2025",
    },
    {
        "kind": "certification",
        "title": "Cisco CCNA en préparation",
        "description": "Modules routage et commutation suivis en autonomie.",
        "date_label": "2026",
    },
    {
        "kind": "activity",
        "title": "Membre du club informatique de la faculté",
        "description": "Animation d'ateliers Linux pour les étudiants de première année.",
        "date_label": "2024-2026",
    },
]

NARRATIVE = {
    "study_project": (
        "Je souhaite suivre un master en réseaux et sécurité pour approfondir l'administration "
        "des infrastructures, la sécurisation des systèmes et la gestion des incidents. Mon stage "
        "et mon projet de licence m'ont montré que c'est le domaine dans lequel je progresse le plus vite."
    ),
    "professional_project": (
        "Après le master, je vise un poste d'ingénieur réseaux et sécurité dans une entreprise "
        "de services ou un opérateur, en France ou au Maroc, avant d'évoluer vers l'architecture "
        "de systèmes sécurisés."
    ),
    "approved": True,
}

INTERVIEW = (
    "Pourquoi cette formation ?",
    "Pendant mon stage à Casablanca, j'ai configuré un pare-feu et des VLAN pour une PME, et j'ai vu "
    "concrètement l'impact d'une mauvaise segmentation du réseau. Mon projet de licence sur un tunnel "
    "IPv4 sur IPv6 m'a donné le goût des protocoles. Votre master combine réseaux sécurisés et gestion "
    "des incidents, ce qui correspond exactement au poste d'ingénieur réseaux et sécurité que je vise.",
)


def make_pdf(lines: list[str]) -> bytes:
    """PDF texte minimal, lisible par l'extracteur de l'application."""
    from pypdf import PdfWriter
    from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject

    writer = PdfWriter()
    page = writer.add_blank_page(width=595, height=842)
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
    content = "BT /F1 12 Tf 50 780 Td " + " ".join(
        f"({line.replace('(', '').replace(')', '')}) Tj 0 -20 Td" for line in lines
    ) + " ET"
    stream = DecodedStreamObject()
    stream.set_data(content.encode("latin-1", "replace"))
    page[NameObject("/Contents")] = writer._add_object(stream)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


class Filler:
    def __init__(self, base: str, cookie: str | None):
        self.c = httpx.Client(base_url=base, timeout=60, headers=ORIGIN)
        if cookie:
            self.c.cookies.set("campuspath_session", cookie)
            self.snap = self.check(self.c.get("/api/state"), "lecture du dossier")
        else:
            self.snap = self.check(self.c.post("/api/auth/demo"), "création de la session démo")
        self.log = []

    @staticmethod
    def check(r: httpx.Response, step: str):
        if r.status_code >= 400:
            sys.exit(f"Échec ({step}) : HTTP {r.status_code} {r.text[:300]}")
        return r.json()

    def step(self, title: str, r: httpx.Response):
        ok = r.status_code < 400
        detail = "" if ok else f"HTTP {r.status_code} {r.text[:160]}"
        self.log.append((title, ok, detail))
        print(("  ok   " if ok else "  refus") + " " + title + ("" if ok else "  ->  " + detail))
        if ok and r.headers.get("content-type", "").startswith("application/json"):
            body = r.json()
            if isinstance(body, dict) and "candidate" in body:
                self.snap = body
        return r

    def fact(self, key: str):
        return next(f for f in self.snap["candidate"]["facts"] if f["key"] == key)

    def run(self):
        c = self.c
        print("\n1. Profil et préférences")
        self.step("profil", c.put("/api/profile", json={"values": PROFILE, "preferences": PREFERENCES}))

        print("\n2. Parcours : Licence 3 en cours avec relevés S1 à S5")
        for edu in self.snap["candidate"]["education"]:
            if edu["id"] == "l3":
                edu["institution"] = "Faculté des sciences - Casablanca (fictif)"
                edu["end_year"] = 2026
                self.step("mise à jour L3", c.post("/api/education", json=edu))

        print("\n3. Notes (13 matières, S1 à S5)")
        existing = {(g["subject"].casefold(), g["semester"]) for g in self.snap["candidate"]["grades"]}
        for subject, value, coefficient, semester in GRADES:
            if (subject.casefold(), semester) in existing:
                continue
            self.step(
                f"{subject} S{semester} : {value}/20",
                c.post(
                    "/api/grades",
                    json={"subject": subject, "value": value, "scale": 20, "coefficient": coefficient, "semester": semester},
                ),
            )

        print("\n4. Expériences")
        for exp in EXPERIENCES:
            # user_confirmed : seule une expérience confirmée par le candidat entre dans le CV généré.
            self.step(exp["title"][:60], c.post("/api/experiences", json={**exp, "user_confirmed": True}))

        print("\n5. Documents : relevé S4-S5, attestation de français, photo")
        docs = {}
        for kind, lines in (
            ("transcript", ["RELEVE DE NOTES FICTIF - S4 et S5", "Etudiant : Yassine El Amrani", "Faculte des sciences - Casablanca"]),
            ("language", ["ATTESTATION FICTIVE - TCF", "Niveau global : B2", "Candidat : Yassine El Amrani", "Email : yassine.elamrani@example.test"]),
            ("photo", ["PHOTO D IDENTITE FICTIVE"]),
        ):
            r = self.step(f"dépôt {kind}", c.post("/api/documents", data={"kind": kind}, files={"file": (f"{kind}.pdf", make_pdf(lines), "application/pdf")}))
            if r.status_code < 400:
                docs[kind] = r.json()["candidate"]["documents"][-1]
                extracted = docs[kind].get("extraction", [])
                if extracted:
                    print(f"       l'application propose sans l'appliquer : {[(f['label'], f['value']) for f in extracted]}")
        if "transcript" in docs:
            for edu_id, semester in (("l2", 4), ("l3", 5)):
                self.step(f"relecture relevé, rattaché à {edu_id} S{semester}", c.post(f"/api/documents/{docs['transcript']['id']}/review", json={"confirmed": True, "education_id": edu_id, "semester": semester}))
        if "language" in docs:
            self.step("relecture attestation de français", c.post(f"/api/documents/{docs['language']['id']}/review", json={"confirmed": True}))
            self.step("niveau de français vérifié sur pièce", c.post(f"/api/facts/{self.fact('french_level')['id']}/review", json={"value": "B2", "document_id": docs["language"]["id"], "confirmed": True, "evidence_checked": True}))
        if "photo" in docs:
            self.step("relecture photo", c.post(f"/api/documents/{docs['photo']['id']}/review", json={"confirmed": True}))

        print("\n6. Formations : sélection de p1 (Cyber, fiche incomplète), p2 (Systèmes & réseaux), p6 (Réseaux & télécoms)")
        for pid in ("p1", "p2", "p6"):
            self.step(f"sélection {pid}", c.post(f"/api/programs/{pid}/selection", json={"action": "select", "confirmed": True}))

        print("\n7. Clarification pour p1 : prérequis non confirmés")
        r = self.step("brouillon de question sur les prérequis", c.post("/api/programs/p1/questions", json={"claim_key": "prerequisites"}))
        if r.status_code < 400:
            q = [q for q in self.snap["candidate"]["questions"] if q["program_id"] == "p1" and q["claim_key"] == "prerequisites"][-1]
            self.step("approbation du message", c.post(f"/api/questions/{q['id']}", json={"action": "approve", "confirmed": True}))
            self.step("envoi déclaré par le candidat", c.post(f"/api/questions/{q['id']}", json={"action": "record_sent", "confirmed": True, "recipient": "admissions@example.test"}))
            self.step("réponse reçue saisie", c.post(f"/api/questions/{q['id']}", json={"action": "answer", "confirmed": True, "response": "Une licence informatique avec des modules réseaux est acceptée sous réserve du dossier."}))
            self.step("conclusion confirmée", c.post(f"/api/questions/{q['id']}", json={"action": "resolve", "confirmed": True, "conclusion": "Licence informatique acceptée sous réserve du dossier", "normalized_value": "Licence informatique acceptée sous réserve du dossier"}))

        print("\n8. Cycle de candidature confirmé (fictif, échéance dans 90 jours)")
        cycle = {**self.snap["cycle"], "label": "Cycle fictif 2026-2027", "deadline": (date.today() + timedelta(days=90)).isoformat(), "status": "CONFIRMED"}
        self.step("cycle", c.put("/api/cycle", json=cycle))

        print("\n9. Projet d'études et projet professionnel")
        self.step("récit validé", c.put("/api/narrative", json=NARRATIVE))

        print("\n10. CV et lettre de motivation (p2), puis entretien")
        self.step("génération CV", c.post("/api/artifacts", json={"kind": "cv"}))
        self.step("génération motivation p2", c.post("/api/artifacts", json={"kind": "motivation", "program_id": "p2"}))
        self.step("génération motivation p1 (attendu : refus tant que la fiche est incomplète)", c.post("/api/artifacts", json={"kind": "motivation", "program_id": "p1"}))
        self.interview = None
        r = self.step("entretien guidé", c.post("/api/interview", json={"question": INTERVIEW[0], "answer": INTERVIEW[1]}))
        if r.status_code < 400:
            self.interview = r.json()
        self.snap = self.check(c.get("/api/state"), "lecture finale")

    def report(self):
        s = self.snap
        programs = {p["id"]: p for p in s["programs"]}
        print("\n" + "=" * 78)
        print("CE QUE L'APPLICATION EN DÉDUIT")
        print("=" * 78)
        d = s["diagnostic"]
        print(f"\nMoyenne pondérée : {d['average']}/20 sur {d['grade_count']} notes. Point fort : {d['strongest']}. Point faible : {d['weakest']}.")
        print(f"Progression : {d['progression']}")
        for w in d["warnings"]:
            print(f"  ! {w}")
        print(f"\nComplétude : {json.dumps(s['completeness'], ensure_ascii=False)}")
        print("\nAdéquation par formation (score = heuristique de préparation, pas une probabilité d'admission) :")
        for m in sorted(s["matches"], key=lambda m: -(m["score"] or 0)):
            p = programs[m["program_id"]]
            print(f"\n  {p['title']} ({p['institution']['city']}) : {m['score']}/100, couverture {m['coverage']} %, classé {m['classification']}, prêt : {m['ready']}")
            for dim in m["dimensions"]:
                print(f"     - {dim['label']} (poids {dim['weight']}) : {dim['score']}  {dim['reason']}")
            for x in m["strengths"]:
                print(f"     + {x}")
            for x in m["risks"]:
                print(f"     ~ {x}")
            for x in m["blockers"]:
                print(f"     x {x}")
        print("\nParcours proposés :")
        for pw in s["pathways"]:
            print(f"  - {pw['title']} : {pw['fit']} ; durée {pw['duration']} ; difficulté {pw['difficulty']}")
        print("\nPriorités calculées :")
        for t in s["tasks"]:
            print(f"  [{t['priority']}] {t['title']} -> {t['next_action']}")
        a = s["audit"]
        print(f"\nAudit : {a['state']}")
        for x in a["critical"]:
            print(f"  x {x}")
        for x in a["warnings"]:
            print(f"  ~ {x}")
        for x in a["ready_items"]:
            print(f"  + {x}")
        for art in s["candidate"]["artifacts"]:
            print(f"\n--- {art['kind'].upper()} (moteur {art['engine']}, révision {art['source_revision']}) ---")
            print(art["text"])
            for w in art["quality_warnings"]:
                print(f"  ! {w}")
        if self.interview:
            i = self.interview
            print("\n--- ENTRETIEN ---")
            print(i["assessment"])
            for x in i["strengths"]:
                print(f"  + {x}")
            for x in i["improvements"]:
                print(f"  ~ {x}")
            print(f"  suite : {i['follow_up']}")
        print(f"\nCookie de session (pour ouvrir ce dossier dans le navigateur) : {self.c.cookies.get('campuspath_session')}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base", default="http://127.0.0.1:8000", help="URL de l'API (défaut : http://127.0.0.1:8000)")
    parser.add_argument("--cookie", help="Valeur du cookie campuspath_session d'une session déjà ouverte")
    args = parser.parse_args()
    filler = Filler(args.base, args.cookie)
    filler.run()
    filler.report()
