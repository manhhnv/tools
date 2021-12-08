from nltk.corpus import wordnet as wn
from nltk.stem.wordnet import WordNetLemmatizer
from nltk import word_tokenize, pos_tag
from collections import defaultdict
import sys

# "'s", "'m", "'re", "'ve", "'d", "'ll"
def format():
    text = sys.argv[1]
    arr = [
        {
            "s": "'s",
            "r": " is"
        },
        {
            "s": "'m",
            "r": " am"
        },
        {
            "s": "'re",
            "r": " are"
        },
        {
            "s": "'ve",
            "r": " have"
        },
        {
            "s": "'d",
            "r": " would"
        },
        {
            "s": "'ll",
            "r": " will"
        }
    ]
    for el in arr:
        text = text.replace(el["s"], el["r"])
    tag_map = defaultdict(lambda: wn.NOUN)
    tag_map['J'] = wn.ADJ
    tag_map['V'] = wn.VERB
    tag_map['R'] = wn.ADV

    tokens = word_tokenize(text)
    lemma_function = WordNetLemmatizer()
    result: str
    for token, tag in pos_tag(tokens):
        lemma = lemma_function.lemmatize(token, tag_map[tag[0]])
        print(lemma)
    sys.stdout.flush()

format()
