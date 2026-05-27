import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional

from ..nlp.pipeline import run_pipeline

router = APIRouter()

CONFIG_DIR = Path(__file__).parent.parent / "config"


def load_default_symbols() -> list[str]:
    with open(CONFIG_DIR / "default_symbols.json", encoding="utf-8") as f:
        return json.load(f)


def load_default_stopwords() -> set[str]:
    sw_path = CONFIG_DIR / "default_stopwords.json"
    if not sw_path.exists():
        return set()
    with open(sw_path, encoding="utf-8") as f:
        return set(json.load(f))


class TextProcessRequest(BaseModel):
    text: str
    clean_symbols: bool = True
    extra_symbols: list[str] = []
    selected_symbols: Optional[list[str]] = None
    do_tokenize: bool = True
    token_mode: str = "words"
    remove_stopwords: bool = True
    extra_stopwords: list[str] = []


def _run(req: TextProcessRequest) -> dict:
    symbols = req.selected_symbols if req.selected_symbols is not None else load_default_symbols()
    symbols = list(set(symbols + req.extra_symbols))
    stopwords = load_default_stopwords() | set(req.extra_stopwords)
    return run_pipeline(
        text=req.text,
        clean_symbols=req.clean_symbols,
        symbols=symbols,
        do_tokenize=req.do_tokenize,
        token_mode=req.token_mode,
        remove_stopwords=req.remove_stopwords,
        stopwords=stopwords,
    )


@router.post("/process/text")
def process_text(req: TextProcessRequest):
    return _run(req)


@router.post("/process/file")
async def process_file(
    file: UploadFile = File(...),
    options: str = "{}",
):
    if not file.filename.lower().endswith(".txt"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .txt")
    content = await file.read()
    text = content.decode("utf-8", errors="replace")
    opts = json.loads(options)
    req = TextProcessRequest(text=text, **opts)
    return _run(req)
