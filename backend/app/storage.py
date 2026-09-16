import os
from pathlib import Path
from typing import Protocol

from .database import DATA_DIR, DEMO_MODE


class Storage(Protocol):
    def put(self, key: str, content: bytes, mime: str) -> None: ...
    def get(self, key: str) -> bytes: ...
    def delete(self, key: str) -> None: ...


class LocalStorage:
    def __init__(self, root: Path):
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def path(self, key: str) -> Path:
        path = (self.root / key).resolve()
        if not path.is_relative_to(self.root):
            raise ValueError("Invalid storage key")
        return path

    def put(self, key: str, content: bytes, mime: str) -> None:
        path = self.path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    def get(self, key: str) -> bytes:
        return self.path(key).read_bytes()

    def delete(self, key: str) -> None:
        self.path(key).unlink(missing_ok=True)


class S3Storage:
    def __init__(self):
        import boto3

        self.bucket = os.environ["S3_BUCKET"]
        self.client = boto3.client("s3", endpoint_url=os.getenv("S3_ENDPOINT_URL"))

    def put(self, key: str, content: bytes, mime: str) -> None:
        self.client.put_object(
            Bucket=self.bucket, Key=key, Body=content, ContentType=mime, ServerSideEncryption="AES256"
        )

    def get(self, key: str) -> bytes:
        return self.client.get_object(Bucket=self.bucket, Key=key)["Body"].read()

    def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)


def storage() -> Storage:
    if os.getenv("STORAGE_BACKEND", "local") == "s3":
        return S3Storage()
    if not DEMO_MODE:
        raise RuntimeError("Production requires S3-compatible storage configuration.")
    return LocalStorage(DATA_DIR / "uploads")
