import nltk
from nltk.tokenize import word_tokenize, regexp_tokenize

nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)


def tokenize(text: str, mode: str = "words") -> list[str]:
    """
    mode='words'  → NLTK word_tokenize (words + punctuation as separate tokens)
    mode='chars'  → every character is a token
    mode='all'    → regexp keeps words, numbers, punctuation and symbols
    """
    if mode == "words":
        return word_tokenize(text)
    if mode == "chars":
        return list(text)
    # mode == "all": words + isolated symbols
    return regexp_tokenize(text, pattern=r"\w+|[^\w\s]")


FORMULA = {
    "words": "tokens = word_tokenize(texto)",
    "chars": "tokens = list(texto)",
    "all":   "tokens = regexp_tokenize(texto, r'\\w+|[^\\w\\s]')",
}
