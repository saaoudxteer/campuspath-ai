from typing import Protocol

from .schemas import Program, Schema


class ResearchRequest(Schema):
    program_id: str
    official_urls: list[str]
    questions: list[str]


class ResearchResult(Schema):
    program: Program
    unresolved_fields: list[str]
    provider: str


class ResearchProvider(Protocol):
    def investigate(self, request: ResearchRequest) -> ResearchResult: ...


class ManualResearchProvider:
    """No arbitrary URL fetcher. An evaluated, allowlisted research adapter is an integration boundary."""

    def investigate(self, request: ResearchRequest) -> ResearchResult:
        raise NotImplementedError(
            "Recherche externe non connectée. Vérifiez et documentez les sources officielles."
        )
