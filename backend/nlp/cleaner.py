import re


def build_pattern(symbols: list[str]) -> str:
    escaped = [re.escape(s) for s in symbols]
    return "[" + "".join(escaped) + "]"


def clean(text: str, symbols: list[str]) -> tuple[str, str]:
    """Returns (cleaned_text, formula_string)."""
    if not symbols:
        return text, "texto_limpio = texto  # sin símbolos seleccionados"
    pattern = build_pattern(symbols)
    cleaned = re.sub(pattern, " ", text)
    cleaned = re.sub(r" {2,}", " ", cleaned).strip()
    formula = f"texto_limpio = re.sub(r'{pattern}', ' ', texto)"
    return cleaned, formula
