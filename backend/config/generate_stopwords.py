"""Run once to generate default_stopwords.json using NLTK corpora."""
import json, nltk

nltk.download("stopwords", quiet=True)
from nltk.corpus import stopwords

words = sorted(set(stopwords.words("spanish")) | set(stopwords.words("english")))
with open("default_stopwords.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

print(f"Saved {len(words)} stopwords.")
