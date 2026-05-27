import io
import pandas as pd


SUPPORTED_EXTENSIONS = {".csv", ".json", ".xlsx", ".xls"}


def load_dataset(content: bytes, filename: str) -> tuple[pd.DataFrame, list[str]]:
    ext = "." + filename.rsplit(".", 1)[-1].lower()
    if ext == ".csv":
        df = pd.read_csv(io.BytesIO(content), encoding="utf-8", encoding_errors="replace")
    elif ext == ".json":
        df = pd.read_json(io.BytesIO(content))
    elif ext in (".xlsx", ".xls"):
        df = pd.read_excel(io.BytesIO(content))
    else:
        raise ValueError(f"Formato no soportado: {ext}")
    text_columns = [c for c in df.columns if df[c].dtype == object]
    return df, text_columns


def apply_pipeline_to_column(df: pd.DataFrame, column: str, pipeline_fn) -> pd.DataFrame:
    """Apply pipeline_fn(text) → dict to every row; adds resultado columns."""
    results = df[column].fillna("").astype(str).apply(pipeline_fn)
    df = df.copy()
    df["texto_limpio"] = results.apply(lambda r: r["texto_limpio"])
    df["tokens"] = results.apply(lambda r: " | ".join(r["tokens"]))
    df["total_tokens"] = results.apply(lambda r: r["total_tokens"])
    return df


def dataframe_to_csv_bytes(df: pd.DataFrame) -> bytes:
    return df.to_csv(index=False, encoding="utf-8").encode("utf-8")
