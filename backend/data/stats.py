from collections import Counter


def compute_stats(tokens: list[str]) -> list[dict]:
    if not tokens:
        return []
    counts = Counter(tokens)
    total = sum(counts.values())
    return [
        {"token": token, "conteo": count, "frecuencia": round(count / total, 6)}
        for token, count in counts.most_common()
    ]
