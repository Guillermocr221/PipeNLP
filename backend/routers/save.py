from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
STORAGE = Path(__file__).parent.parent / "storage"
STORAGE.mkdir(exist_ok=True)


class SaveRequest(BaseModel):
    texto_limpio: str
    tokens: list[str]
    total_tokens: int
    tokens_unicos: int
    frecuencias: list[dict]
    filename: Optional[str] = None


def _build_txt(req: SaveRequest) -> str:
    sep = "=" * 64
    dash = "-" * 64
    lines = [
        sep,
        "RESULTADOS DEL PIPELINE NLP",
        f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        sep,
        "",
        "[TEXTO LIMPIO]",
        req.texto_limpio,
        "",
        dash,
        "",
        f"[TOKENS] — {req.total_tokens} total, {req.tokens_unicos} únicos",
    ]
    lines += req.tokens
    lines += [
        "",
        dash,
        "",
        "[TABLA DE FRECUENCIAS] — f(t) = count(t) / sum(count(ti))",
        f"{'#':<6}{'TOKEN':<25}{'CONTEO':>8}{'FRECUENCIA':>14}",
        "-" * 55,
    ]
    for i, row in enumerate(req.frecuencias, 1):
        lines.append(
            f"{i:<6}{row['token']:<25}{row['conteo']:>8}{row['frecuencia']:>14.6f}"
        )
    lines += ["", sep]
    return "\n".join(lines)


@router.post("/save")
def save_dataset(req: SaveRequest):
    content = _build_txt(req)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    name = req.filename or f"resultado_{ts}"
    if not name.endswith(".txt"):
        name += ".txt"
    path = STORAGE / name
    path.write_text(content, encoding="utf-8")
    return {"filename": name, "tokens": req.total_tokens}
