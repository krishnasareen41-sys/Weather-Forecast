from flask import Flask, request, jsonify
import os
import requests
from flask_cors import CORS

# Load env vars (e.g., OPENWEATHER_API_KEY) – Vercel provides them as environment variables
API_KEY = os.environ.get('OPENWEATHER_API_KEY') or 'ddacc8c36bb5bbee4618aca8cfd35c27'

app = Flask(__name__)
CORS(app)

@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    units = request.args.get('units', 'metric')
    if not lat or not lon:
        return jsonify({'error': 'Missing coordinates (lat/lon)'}), 400
    try:
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units={units}&appid={API_KEY}"
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units={units}&appid={API_KEY}"
        air_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}"
        weather_res = requests.get(weather_url)
        forecast_res = requests.get(forecast_url)
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
    return jsonify({'success': True, 'message': 'Login successful'})

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'message': 'Missing fields'}), 400
    return jsonify({'success': True, 'message': 'Signup successful'})
# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

# Vercel will call this entry point
def handler(event, context):
    return app(event, context)

