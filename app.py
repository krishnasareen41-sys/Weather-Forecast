from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from bcrypt import checkpw, hashpw, gensalt
from db import get_db_connection

# Load environment variables from a gitignored .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = 'replace_this_with_a_random_secret_key'
CORS(app)  # Enable CORS so frontend (e.g. GitHub Pages) can communicate securely

# Retrieve OpenWeatherMap API Key securely from server environment
API_KEY = os.environ.get('OPENWEATHER_API_KEY') or 'ddacc8c36bb5bbee4618aca8cfd35c27'

@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    units = request.args.get('units', 'metric')
    
    if not lat or not lon:
        return jsonify({'error': 'Missing coordinates (lat/lon)'}), 400
        
    try:
        # 1. Fetch Current Weather
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units={units}&appid={API_KEY}"
        weather_res = requests.get(weather_url)
        
        # 2. Fetch 24-Hour/5-Day Forecast
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units={units}&appid={API_KEY}"
        forecast_res = requests.get(forecast_url)
        
        # 3. Fetch Air Quality Index (AQI)
        air_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
        air_res = requests.get(air_url)
        
        if weather_res.status_code != 200 or forecast_res.status_code != 200 or air_res.status_code != 200:
            return jsonify({'error': 'Failed to fetch weather from provider'}), 502
            
        return jsonify({
            'current': weather_res.json(),
            'forecast': forecast_res.json(),
            'air': air_res.json()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/geocode', methods=['GET'])
def geocode():
    q = request.args.get('q')
    if not q:
        return jsonify({'error': 'Missing search query (q)'}), 400
        
    try:
        geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={q}&limit=1&appid={API_KEY}"
        res = requests.get(geo_url)
        if res.status_code != 200:
            return jsonify({'error': 'Failed to geocode location'}), 502
        return jsonify(res.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reverse-geocode', methods=['GET'])
def reverse_geocode():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Missing coordinates (lat/lon)'}), 400
        
    try:
        geo_url = f"https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={API_KEY}"
        res = requests.get(geo_url)
        if res.status_code != 200:
            return jsonify({'error': 'Failed to reverse geocode location'}), 502
        return jsonify(res.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'message': 'Missing credentials'}), 400
    email = data['email']
    password = data['password']
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    if user is None:
        return jsonify({'success': False, 'message': 'Incorrect email or password'}), 401
    # Verify password using bcrypt
    if not checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'success': False, 'message': 'Incorrect email or password'}), 401
    session['user_id'] = user['id']
    return jsonify({'success': True, 'message': 'Login successful'}), 200

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'message': 'Missing fields'}), 400
    name = data['name']
    email = data['email']
    password = data['password']
    # Hash the password using bcrypt
    password_hash = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', (name, email, password_hash))
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'Signup failed: {str(e)}'}), 500
    conn.close()
    return jsonify({'success': True, 'message': 'Signup successful'}), 201

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Secure API Proxy Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
