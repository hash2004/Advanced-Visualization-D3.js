from flask import Flask, jsonify
import spacy
import os
import certifi
from convokit import Corpus, download

os.environ['SSL_CERT_FILE'] = certifi.where()


# corpus = Corpus(filename=download("movie-corpus"))
corpus = Corpus(filename="/Users/wajeeh/.convokit/downloads/movie-corpus")



app = Flask(__name__)

# python -m spacy download en_core_web_sm 
# Load spaCy model
nlp = spacy.load("en_core_web_sm")

@app.route('/get_entity_network', methods=['GET'])
def get_entity_network():
    # Using a dictionary to track co-occurrence
    co_occurrence = {}

    for utterance in list(corpus.iter_utterances())[:10000]:
        doc = nlp(utterance.text)
        entities = [ent.text for ent in doc.ents if ent.label_ in ['PERSON', 'ORG', 'GPE']]  # Filter entities if needed
        for i, entity in enumerate(entities):
            for adjacent in entities[i + 1:]:
                if entity != adjacent:
                    pair = tuple(sorted([entity, adjacent]))
                    co_occurrence[pair] = co_occurrence.get(pair, 0) + 1

    # Preparing nodes and links for D3
    nodes = list({entity for pair in co_occurrence for entity in pair})
    links = [{"source": pair[0], "target": pair[1], "value": count} for pair, count in co_occurrence.items()]

    return jsonify({"nodes": [{"id": node} for node in nodes], "links": links})


if __name__ == '__main__':
    app.run(debug=True, port=5001)










