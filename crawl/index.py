from nltk.corpus import wordnet as wn
from nltk.stem.wordnet import WordNetLemmatizer
from nltk import word_tokenize, pos_tag
from collections import defaultdict
import re
import json

# "'s", "'m", "'re", "'ve", "'d", "'ll"
def chuan_hoa(en: str):
    rex_exp = '[$#!-,.()]'
    string = ' '.join(re.split(rex_exp, string=en)).strip()
    string_split = re.sub(rex_exp, '', string=string).split(' ')

    filtered = list(filter(lambda x: len(x) > 0, string_split))

    return en, string, filtered

def format(text: str, vi: str, formatted_str: str):
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
        formatted_str = formatted_str.replace(el["s"], el["r"])
    tag_map = defaultdict(lambda: wn.NOUN)
    tag_map['J'] = wn.ADJ
    tag_map['V'] = wn.VERB
    tag_map['R'] = wn.ADV

    tokens = word_tokenize(formatted_str)
    lemma_function = WordNetLemmatizer()
    result = {"en": text, "vi": vi}
    lemmas = list()
    for token, tag in pos_tag(tokens):
        if "NNP" not in tag:
            lemma = lemma_function.lemmatize(token, tag_map[tag[0]])
            lemmas.append(lemma)
            lemmas.append(token)
    result.update({"lemmas": lemmas})
    return result


def read_data():
    f = open('./data.json')
    data = json.load(f)
    result = list()
    reset = 0
    for s in data:
        en = str(s['en']).strip()
        vi = str(s['vi']).strip()
        en_split = en.split()
        if len(en_split) <= 10:
            origin, formatted_str, en_split = chuan_hoa(en)
            r = format(origin, vi, formatted_str)
            result.append(r)
            if reset % 10000 == 0:
                print(chr(27) + "[2J")
                print(str(round((reset / len(data))*100, 2)) + "%")
        reset = reset + 1
    with open('text_lemmas.json', 'w') as wf:
        wf.write(json.dumps(result, ensure_ascii=False, indent=4))
    print(chr(27) + "[2J")
    print('100%')

read_data()
