import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import process, save, export

app = FastAPI(title="NLP Pipeline API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router, tags=["process"])
app.include_router(save.router, tags=["save"])
app.include_router(export.router, tags=["export"])

CONFIG_DIR = Path(__file__).parent / "config"


@app.get("/config")
def get_config():
    with open(CONFIG_DIR / "default_symbols.json", encoding="utf-8") as f:
        symbols = json.load(f)
    sw_path = CONFIG_DIR / "default_stopwords.json"
    stopwords = []
    if sw_path.exists():
        with open(sw_path, encoding="utf-8") as f:
            stopwords = json.load(f)
    return {"symbols": symbols, "stopwords": stopwords}


@app.get("/health")
def health():
    return {"status": "ok"}
