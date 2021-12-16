from nltk.corpus import wordnet as wn
from nltk.stem.wordnet import WordNetLemmatizer
from nltk import word_tokenize, pos_tag
from collections import defaultdict
import sys
import json

# "'s", "'m", "'re", "'ve", "'d", "'ll"


def format(text: str, vi: str):
    # text = sys.argv[1]
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
    result = {"en": text, "vi": vi}
    lemmas = list()
    for token, tag in pos_tag(tokens):
        if "NNP" not in tag:
            lemma = lemma_function.lemmatize(token, tag_map[tag[0]])
            lemmas.append(lemma)
    result.update({"lemmas": lemmas})
    return result


def read_data():
    f = open('../data.json')
    data = json.load(f)
    result = list()
    reset = 0
    for s in data:
        en = s['en']
        vi = s['vi']
        en_split = en.split()
        if len(en_split) <= 10:
            r = format(en, vi)
            result.append(r)
            if reset % 10000 == 0:
                print(chr(27) + "[2J")
                print(str(round((reset / len(data))*100, 2)) + "%")
        reset = reset + 1
    with open('text_lemmas.json', 'w') as wf:
        wf.write(json.dumps(result, ensure_ascii=False, indent=4))


read_data()
