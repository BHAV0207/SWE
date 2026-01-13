from flask import Flask , request , jsonify
from flask_cors import CORS
from business import get_data

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
  return "Hello, World!"

@app.route('/api' , methods=['GET'])
def api():
  data = get_data()
  
  data= {
    'data' : data
  }
  
  return jsonify(data)

if __name__ == '__main__':
  app.run(port=8000 , host='0.0.0.0' , debug=True)
  
  
