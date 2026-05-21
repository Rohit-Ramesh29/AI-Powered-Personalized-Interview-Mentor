from pathlib import Path
from uuid import uuid4

from app.core.config import get_settings


class VectorStore:
    def __init__(self) -> None:
        settings = get_settings()
        self._fallback_docs: list[dict] = []
        try:
            model_path = Path(settings.embedding_model)
            if not model_path.exists():
                raise RuntimeError("Embedding model is not available locally")

            import chromadb
            from sentence_transformers import SentenceTransformer

            self.encoder = SentenceTransformer(str(model_path), local_files_only=True)
            self.client = chromadb.PersistentClient(path=settings.chroma_path)
            self.collection = self.client.get_or_create_collection("interview_knowledge")
            self.enabled = True
        except Exception:
            self.encoder = None
            self.client = None
            self.collection = None
            self.enabled = False

    def chunk(self, text: str, size: int = 900, overlap: int = 120) -> list[str]:
        words = text.split()
        chunks = []
        step = max(1, size - overlap)
        for start in range(0, len(words), step):
            chunk = " ".join(words[start:start + size])
            if chunk:
                chunks.append(chunk)
        return chunks or [text[:2000]]

    def add_texts(self, texts: list[str], metadatas: list[dict] | None = None) -> None:
        metadatas = metadatas or [{} for _ in texts]
        if self.enabled and self.collection and self.encoder:
            embeddings = self.encoder.encode(texts).tolist()
            self.collection.add(ids=[str(uuid4()) for _ in texts], documents=texts, embeddings=embeddings, metadatas=metadatas)
            return
        self._fallback_docs.extend({"text": text, "metadata": meta} for text, meta in zip(texts, metadatas))

    def search(self, query: str, k: int = 5) -> list[dict]:
        if self.enabled and self.collection and self.encoder:
            embedding = self.encoder.encode([query]).tolist()[0]
            result = self.collection.query(query_embeddings=[embedding], n_results=k)
            docs = result.get("documents", [[]])[0]
            metas = result.get("metadatas", [[]])[0]
            return [{"text": doc, "metadata": meta} for doc, meta in zip(docs, metas)]
        terms = set(query.lower().split())
        ranked = sorted(self._fallback_docs, key=lambda item: len(terms & set(item["text"].lower().split())), reverse=True)
        return ranked[:k]


vector_store = VectorStore()


def seed_from_file(path: Path) -> None:
    if path.exists():
        text = path.read_text(encoding="utf-8")
        chunks = vector_store.chunk(text)
        vector_store.add_texts(chunks, [{"source": path.name} for _ in chunks])
