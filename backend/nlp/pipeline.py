import re

from .cleaner import clean
from .tokenizer import tokenize, FORMULA as TOKEN_FORMULA
from .stopwords_filter import filter_stopwords
from ..data.stats import compute_stats


TOKEN_SET_FORMULA = {
    "words": "T = {w1, w2, ..., wn}",
    "all": "T = {w1, s1, w2, s2, ..., wn}",
    "chars": "C = {c1, c2, ..., cn}",
}


def run_pipeline(
    text: str,
    clean_symbols: bool,
    symbols: list[str],
    do_tokenize: bool,
    token_mode: str,
    remove_stopwords: bool,
    stopwords: set[str],
    to_lowercase: bool = False,
    remove_numbers: bool = False,
    normalize_spaces: bool = True,
) -> dict:
    steps = []
    original_text = text
    current_text = text
    original_words = len(current_text.split())

    if to_lowercase:
        current_text = current_text.lower()
        steps.append({"step": "minusculas", "formula": "texto' = lower(texto)", "explanation": "Convierte todo el texto a minúsculas."})

    if remove_numbers:
        current_text = re.sub(r"\d+", " ", current_text)
        steps.append({"step": "numeros", "formula": "texto' = re.sub(r'\\d+', ' ', texto)", "explanation": "Elimina secuencias numéricas del texto."})

    # 1. Limpieza de símbolos
    symbols_removed = 0
    if clean_symbols and symbols:
        before_clean = current_text
        current_text, formula = clean(current_text, symbols)
        symbols_removed = max(len(before_clean) - len(current_text), 0)
        steps.append({"step": "limpieza", "formula": formula, "explanation": "texto' = texto - {s1, s2, ..., sn}"})
    else:
        steps.append({"step": "limpieza", "formula": "texto_limpio = texto  # desactivado", "explanation": "No se eliminaron símbolos."})

    if normalize_spaces:
        current_text = re.sub(r"\s+", " ", current_text).strip()
        steps.append({"step": "espacios", "formula": "texto' = re.sub(r'\\s+', ' ', texto).strip()", "explanation": "Se aplica después de quitar números y símbolos para compactar saltos de línea, tabulaciones y espacios múltiples antes de tokenizar."})

    texto_limpio = current_text

    # 2. Tokenización
    tokens: list[str] = []
    if do_tokenize:
        tokens = tokenize(current_text, mode=token_mode)
        steps.append({"step": "tokenizacion", "formula": TOKEN_SET_FORMULA[token_mode], "explanation": TOKEN_FORMULA[token_mode]})
    else:
        tokens = current_text.split()
        steps.append({"step": "tokenizacion", "formula": "tokens = texto.split()  # tokenización básica", "explanation": "Se usa separación básica por espacios."})

    tokens_generados = tokens[:]

    # 3. Filtro stopwords
    stopwords_removed = 0
    if remove_stopwords and stopwords:
        before_stopwords = len(tokens)
        tokens, formula = filter_stopwords(tokens, stopwords)
        stopwords_removed = before_stopwords - len(tokens)
        steps.append({"step": "stopwords", "formula": "T' = T - S", "explanation": "Elimina del conjunto de tokens las palabras vacías seleccionadas."})
    else:
        steps.append({"step": "stopwords", "formula": "tokens = tokens  # desactivado", "explanation": "No se eliminaron stopwords."})

    texto_procesado = " ".join(tokens)

    # 4. Estadísticas
    stats = compute_stats(tokens)
    steps.append({"step": "frecuencia", "formula": "f(t) = count(t) / Σ count(tᵢ)", "explanation": "Frecuencia relativa de cada token."})

    reduction = round(((original_words - len(tokens)) / original_words) * 100, 2) if original_words else 0

    return {
        "texto_original": original_text,
        "texto_limpio": texto_limpio,
        "tokens_generados": tokens_generados,
        "tokens_sin_stopwords": tokens,
        "texto_procesado": texto_procesado,
        "tokens": tokens,
        "total_tokens": len(tokens),
        "tokens_unicos": len(set(tokens)),
        "frecuencias": stats,
        "metrics": {
            "palabras_originales": original_words,
            "tokens_generados": len(tokens_generados),
            "tokens_finales": len(tokens),
            "tokens_unicos": len(set(tokens)),
            "stopwords_eliminadas": stopwords_removed,
            "simbolos_eliminados_aprox": symbols_removed,
            "reduccion_porcentual": reduction,
        },
        "configuracion": {
            "clean_symbols": clean_symbols,
            "do_tokenize": do_tokenize,
            "token_mode": token_mode,
            "remove_stopwords": remove_stopwords,
            "to_lowercase": to_lowercase,
            "remove_numbers": remove_numbers,
            "normalize_spaces": normalize_spaces,
        },
        "steps": steps,
    }
