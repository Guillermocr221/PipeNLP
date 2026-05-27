def filter_stopwords(tokens: list[str], stopwords: set[str]) -> tuple[list[str], str]:
    """Returns (filtered_tokens, formula_string)."""
    if not stopwords:
        return tokens, "tokens = tokens  # sin stopwords configuradas"
    filtered = [t for t in tokens if t.lower() not in stopwords]
    formula = "tokens = [t for t in tokens if t.lower() ∉ stopwords]"
    return filtered, formula
