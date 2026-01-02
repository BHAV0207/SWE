from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os


load_dotenv()

app = Flask(__name__)
CORS(app)


client = MongoClient(os.getenv("MONGO_URI"))
db = client["mydb"]
collection = db["submissions"]

from bson import ObjectId

@app.route("/api", methods=["GET"])
def get_data():
    try:
        data = list(collection.find({}))

        # Convert ObjectId → string (JSON safe)
        for item in data:
            item["_id"] = str(item["_id"])

        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/submit" , methods=["POST"])
def submit_data():
  try:
    data = request.json
    
    if not data:
      return jsonify({"error": "No data provided"}), 400
    
    collection.insert_one(data)
    
    return jsonify({"message": "Data submitted successfully"}), 201
  
  except Exception as e:
    return jsonify({"error": str(e)}), 500
  
  
  
if __name__ == "__main__":
    app.run(debug=True, port=5000)