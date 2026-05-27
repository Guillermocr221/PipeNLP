from .cleaner import clean
from .tokenizer import tokenize, FORMULA as TOKEN_FORMULA
from .stopwords_filter import filter_stopwords
from ..data.stats import compute_stats


def run_pipeline(
    text: str,
    clean_symbols: bool,
    symbols: list[str],
    do_tokenize: bool,
    token_mode: str,
    remove_stopwords: bool,
    stopwords: set[str],
) -> dict:
    steps = []
    current_text = text

    # 1. Limpieza de símbolos
    if clean_symbols and symbols:
        current_text, formula = clean(current_text, symbols)
        steps.append({"step": "limpieza", "formula": formula})
    else:
        steps.append({"step": "limpieza", "formula": "texto_limpio = texto  # desactivado"})

    # 2. Tokenización
    tokens: list[str] = []
    if do_tokenize:
        tokens = tokenize(current_text, mode=token_mode)
        steps.append({"step": "tokenizacion", "formula": TOKEN_FORMULA[token_mode]})
    else:
        tokens = current_text.split()
        steps.append({"step": "tokenizacion", "formula": "tokens = texto.split()  # tokenización básica"})

    # 3. Filtro stopwords
    if remove_stopwords and stopwords:
        tokens, formula = filter_stopwords(tokens, stopwords)
        steps.append({"step": "stopwords", "formula": formula})
    else:
        steps.append({"step": "stopwords", "formula": "tokens = tokens  # desactivado"})

    # 4. Estadísticas
    stats = compute_stats(tokens)
    steps.append({"step": "frecuencia", "formula": "f(t) = count(t) / Σ count(tᵢ)"})

    return {
        "texto_limpio": current_text,
        "tokens": tokens,
        "total_tokens": len(tokens),
        "tokens_unicos": len(set(tokens)),
        "frecuencias": stats,
        "steps": steps,
    }
