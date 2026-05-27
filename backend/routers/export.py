from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()
STORAGE = Path(__file__).parent.parent / "storage"


@router.get("/export/{filename}")
def export_file(filename: str):
    path = STORAGE / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    if not path.resolve().is_relative_to(STORAGE.resolve()):
        raise HTTPException(status_code=400, detail="Ruta no válida")
    return FileResponse(path, media_type="text/plain; charset=utf-8", filename=filename)


@router.get("/files")
def list_files():
    files = [
        {"filename": f.name, "size_kb": round(f.stat().st_size / 1024, 2)}
        for f in STORAGE.glob("*.txt")
    ]
    return sorted(files, key=lambda x: x["filename"], reverse=True)
