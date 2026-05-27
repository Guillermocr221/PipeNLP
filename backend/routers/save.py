import random
import string
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
STORAGE = Path(__file__).parent.parent / "storage"
STORAGE.mkdir(exist_ok=True)


class SaveRequest(BaseModel):
    texto_original: Optional[str] = None
    texto_limpio: str
    texto_procesado: Optional[str] = None
    tokens_generados: Optional[list[str]] = None
    tokens_sin_stopwords: Optional[list[str]] = None
    tokens: list[str]
    total_tokens: int
    tokens_unicos: int
    frecuencias: list[dict]
    metrics: Optional[dict] = None
    configuracion: Optional[dict] = None
    filename: Optional[str] = None


def _pipeline_id() -> str:
    return "pl_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=6))


def _build_txt(req: SaveRequest) -> str:
    now = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    cfg = req.configuracion or {}
    met = req.metrics or {}

    orig_text = req.texto_original or ""
    char_count = len(orig_text)
    word_count = met.get("palabras_originales", len(orig_text.split()) if orig_text else 0)
    line_count = orig_text.count("\n") + 1 if orig_text else 0
    reduction  = met.get("reduccion_porcentual", 0)
    top_token  = req.frecuencias[0] if req.frecuencias else {"token": "—", "conteo": 0}

    # Pipeline steps
    steps = []
    if cfg.get("to_lowercase"):    steps.append("  ✓ minúsculas")
    if cfg.get("remove_numbers"):  steps.append("  ✓ eliminar números")
    if cfg.get("normalize_spaces"): steps.append("  ✓ normalizar espacios")
    if cfg.get("clean_symbols"):
        n = len(cfg.get("selected_symbols") or [])
        steps.append(f"  ✓ limpiar símbolos ({n})")
    if cfg.get("do_tokenize"):
        mode = cfg.get("token_mode", "words")
        steps.append(f"  ✓ tokenizar ({mode})")
    if cfg.get("remove_stopwords"):
        extras = len(cfg.get("extra_stopwords") or [])
        steps.append(f"  ✓ stopwords ({extras} extra)")

    # Top-10
    top10 = "\n".join(
        f"  {str(i+1).rjust(2)}. {row['token']:<20} {row['conteo']}"
        for i, row in enumerate(req.frecuencias[:10])
    )

    lines = [
        f"# PipeNLP · Reporte de procesamiento",
        f"# Generado: {now} UTC",
        f"# Pipeline ID: {_pipeline_id()}",
        "",
        "[ENTRADA]",
        f"  caracteres ........... {char_count}",
        f"  palabras ............. {word_count}",
        f"  líneas ............... {line_count}",
        "",
        "[PIPELINE]",
        "\n".join(steps) if steps else "  (ninguna operación activa)",
        "",
        "[SALIDA]",
        f"  tokens totales ....... {req.total_tokens}",
        f"  tokens únicos ........ {req.tokens_unicos}",
        f"  reducción ............ {reduction}%",
        f'  top token ............ "{top_token["token"]}" ({top_token["conteo"]})',
        "",
        "[TOP-10]",
        top10,
    ]

    return "\n".join(lines)


@router.post("/save")
def save_dataset(req: SaveRequest):
    content = _build_txt(req)
    ts   = datetime.now().strftime("%Y%m%d_%H%M%S")
    name = req.filename or f"pipenlp_reporte_{ts}"
    if not name.endswith(".txt"):
        name += ".txt"
    path = STORAGE / name
    path.write_text(content, encoding="utf-8")
    return {"filename": name, "tokens": req.total_tokens}
