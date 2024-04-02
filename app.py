import json
from flask import Flask, jsonify
import spacy
#import certifi
#from convokit import Corpus, download
from flask_cors import CORS
import os
from flask import render_template

# Run the main.ipynb before running this file 

app = Flask(__name__)
CORS(app)


@app.route('/get_entity_network', methods=['GET'])
def get_entity_network():
    file_path2 = os.path.join(os.path.dirname(__file__), 'entity_network.json')
    # Read data from the JSON file
    with open(file_path2, 'r') as f:
        data = json.load(f)
    return jsonify(data)



# Define a route to serve the JSON data
@app.route("/topics_data")
def get_topics_data():
    file_path1 = os.path.join(os.path.dirname(__file__), 'topics_data.json')
    with open(file_path1, "r") as json_file:
        data = json.load(json_file)
    return jsonify(data)

@app.route('/get_radial_network_data')
def get_radial_network_data():
    file_path = os.path.join(os.path.dirname(__file__), 'radial_network_data.json')
    with open(file_path, 'r') as file:
        data = json.load(file)
    return jsonify(data)



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/force')
def force():
    return render_template('force.html')

@app.route('/bubble')
def bubble():
    return render_template('bubble.html')

@app.route('/network')
def network():
    return render_template('network.html')

if __name__ == '__main__':
    app.run(debug=True, port=5001)
