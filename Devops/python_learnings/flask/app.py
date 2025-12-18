from flask import Flask , render_template , request
from dotenv import load_dotenv
import os
import pymongo


load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
client = pymongo.MongoClient(mongo_uri)
db = client.test_database
collection = db['flask_test_collection']

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit' , methods=['POST'])
def submit():
    form_data = dict(request.form)
    
    collection.insert_one(form_data)
    
    return "Form Submitted Successfully , hello !"
  
if __name__ == '__main__':
    app.run(debug=True)