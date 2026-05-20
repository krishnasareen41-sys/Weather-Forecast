const API_KEY = 'ddacc8c36bb5bbee4618aca8cfd35c27';
function getApiKey() {
    return localStorage.getItem('owm_api_key') || API_KEY;
}

const PROXY_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://weather-predictor-proxy.onrender.com/api'; // Replace with deployed Render/Vercel URL

const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const REVERSE_GEO_URL = 'https://api.openweathermap.org/geo/1.0/reverse';

// --- Weather Background Class ---
class WeatherBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.weather = 'Clear';
        this.cloudType = 'light';
        this.isDay = true;
        this.particles = [];
        this.animationId = null;
        this.lightningFlash = 0;
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initParticles();
    }
    
    setWeather(weather, isDay, cloudCover = 0) {
        this.weather = weather;
        this.isDay = isDay;
        
        if (weather === 'Clouds') {
            if (cloudCover <= 33) this.cloudType = 'light';
            else if (cloudCover <= 66) this.cloudType = 'broken';
            else this.cloudType = 'overcast';
        } else {
            this.cloudType = 'none';
        }
        
        this.initParticles();
    }
    
    initParticles() {
        const count = this.getParticleCount();
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    getParticleCount() {
        switch (this.weather) {
            case 'Rain': case 'Drizzle': return 150;
            case 'Snow': return 100;
            case 'Thunderstorm': return 120;
            case 'Clouds': return this.cloudType === 'overcast' ? 50 : (this.cloudType === 'broken' ? 35 : 20);
            case 'Mist': return 40;
            default: return 0;
        }
    }
    
    createParticle() {
        let type = 'none';
        if (this.weather === 'Rain' || this.weather === 'Drizzle') type = 'rain';
        else if (this.weather === 'Snow') type = 'snow';
        else if (this.weather === 'Clouds') type = 'cloud';
        else if (this.weather === 'Mist') type = 'fog';
        else if (this.weather === 'Thunderstorm') type = 'rain';
        
        return {
            type: type,
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: type === 'rain' ? 2 + Math.random() * 3 : (type === 'snow' ? 3 + Math.random() * 5 : 20 + Math.random() * 40),
            speedY: type === 'rain' ? 4 + Math.random() * 6 : (type === 'snow' ? 1 + Math.random() * 3 : 0.3 + Math.random() * 0.7),
            speedX: type === 'cloud' ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 0.8,
            opacity: 0.5 + Math.random() * 0.5,
            angle: Math.random() * Math.PI * 2,
            twinkle: Math.random() * Math.PI * 2
        };
    }
    
    drawGradient() {
        let grad;
        if (this.isDay) {
            switch (this.weather) {
                case 'Clear':
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#4facfe');
                    grad.addColorStop(1, '#00f2fe');
                    break;
                case 'Clouds':
                    if (this.cloudType === 'light') {
                        grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                        grad.addColorStop(0, '#cbd5e1');
                        grad.addColorStop(1, '#94a3b8');
                    } else if (this.cloudType === 'broken') {
                        grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                        grad.addColorStop(0, '#9ca3af');
                        grad.addColorStop(1, '#6b7280');
                    } else {
                        grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                        grad.addColorStop(0, '#6b7280');
                        grad.addColorStop(1, '#374151');
                    }
                    break;
                case 'Rain':
                case 'Drizzle':
                case 'Thunderstorm':
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#4b79a1');
                    grad.addColorStop(1, '#283e51');
                    break;
                case 'Snow':
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#e6dada');
                    grad.addColorStop(1, '#b0c4de');
                    break;
                case 'Mist':
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#c0c6cc');
                    grad.addColorStop(1, '#8e9aaf');
                    break;
                default:
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#0f2027');
                    grad.addColorStop(1, '#203a43');
            }
        } else {
            switch (this.weather) {
                case 'Clear':
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#0f2027');
                    grad.addColorStop(1, '#2c5364');
                    break;
                case 'Clouds':
                    if (this.cloudType === 'light') {
                        grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                        grad.addColorStop(0, '#2d3e4f');
                        grad.addColorStop(1, '#1e2f3f');
                    } else if (this.cloudType === 'broken') {
                        grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                        grad.addColorStop(0, '#1f2f3f');
                        grad.addColorStop(1, '#0f1f2f');
                    } else {
                        grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                        grad.addColorStop(0, '#0f1f2f');
                        grad.addColorStop(1, '#07151f');
                    }
                    break;
                case 'Rain':
                case 'Drizzle':
                case 'Thunderstorm':
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#0a1f2e');
                    grad.addColorStop(1, '#0b2a3e');
                    break;
                case 'Snow':
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#1f2f3a');
                    grad.addColorStop(1, '#1e2f3c');
                    break;
                case 'Mist':
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#1f2937');
                    grad.addColorStop(1, '#111827');
                    break;
                default:
                    grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
                    grad.addColorStop(0, '#0f172a');
                    grad.addColorStop(1, '#020617');
            }
        }
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawStars() {
        if (!this.isDay && this.weather !== 'Clouds') {
            const starCount = 200;
            this.ctx.fillStyle = 'white';
            for (let i = 0; i < starCount; i++) {
                const x = (i * 131071) % this.width;
                const y = (i * 524287) % this.height;
                const size = 1 + (Math.sin(i) * 0.5);
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawSunMoon() {
        if (this.isDay && this.weather === 'Clear') {
            const sunX = this.width - 80;
            const sunY = 80;
            this.ctx.beginPath();
            this.ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 200, 100, 0.8)';
            this.ctx.fill();
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = 'rgba(255, 200, 100, 0.6)';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        } else if (!this.isDay && this.weather === 'Clear') {
            const moonX = this.width - 80;
            const moonY = 80;
            this.ctx.beginPath();
            this.ctx.arc(moonX, moonY, 35, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(240, 240, 255, 0.8)';
            this.ctx.fill();
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = 'rgba(200, 200, 255, 0.5)';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawLightningFlash() {
        if (this.weather === 'Thunderstorm' && this.lightningFlash > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 200, ${this.lightningFlash * 0.5})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.lightningFlash -= 0.03;
            if (this.lightningFlash < 0) this.lightningFlash = 0;
        } else if (this.weather === 'Thunderstorm' && Math.random() < 0.005) {
            this.lightningFlash = 1;
        }
    }
    
    updateParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.type === 'rain') {
                if (p.y > this.height) {
                    p.y = -10;
                    p.x = Math.random() * this.width;
                }
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
            } else if (p.type === 'snow') {
                if (p.y > this.height) {
                    p.y = -10;
                    p.x = Math.random() * this.width;
                }
                p.x += Math.sin(p.angle) * 0.5;
                p.angle += 0.05;
            } else if (p.type === 'cloud') {
                if (p.x > this.width + p.size) p.x = -p.size;
                if (p.x < -p.size) p.x = this.width + p.size;
                if (p.y > this.height + p.size) p.y = -p.size;
                if (p.y < -p.size) p.y = this.height + p.size;
            } else if (p.type === 'fog') {
                p.x += p.speedX;
                p.y += p.speedY * 0.2;
                if (p.y > this.height) p.y = -10;
                if (p.x > this.width) p.x = 0;
                if (p.x < 0) p.x = this.width;
            }
        }
    }
    
    drawParticles() {
        for (const p of this.particles) {
            if (p.type === 'rain') {
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - 2, p.y + 6);
                this.ctx.lineTo(p.x + 2, p.y + 6);
                this.ctx.fillStyle = `rgba(180, 220, 255, ${p.opacity})`;
                this.ctx.fill();
            } else if (p.type === 'snow') {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
                this.ctx.fill();
            } else if (p.type === 'cloud') {
                this.ctx.beginPath();
                this.ctx.ellipse(p.x, p.y, p.size / 2, p.size / 3, 0, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(200, 210, 220, ${p.opacity * 0.4})`;
                this.ctx.fill();
            } else if (p.type === 'fog') {
                this.ctx.beginPath();
                this.ctx.ellipse(p.x, p.y, 20, 10, 0, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(220, 230, 240, ${p.opacity * 0.2})`;
                this.ctx.fill();
            }
        }
    }
    
    animate() {
        this.drawGradient();
        this.drawStars();
        this.drawSunMoon();
        this.drawParticles();
        this.updateParticles();
        this.drawLightningFlash();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animate();
    }
}

// --- Helper Functions ---
function calculateHeatIndex(tempC, humidity) {
    const tempF = (tempC * 9/5) + 32;
    let hi = 0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (humidity * 0.094));
    if (hi >= 80) {
        hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity - 0.22475541 * tempF * humidity -
             0.00683783 * tempF * tempF - 0.05481717 * humidity * humidity +
             0.00122874 * tempF * tempF * humidity + 0.00085282 * tempF * humidity * humidity -
             0.00000199 * tempF * tempF * humidity * humidity;
    }
    const hiC = (hi - 32) * 5/9;
    return Math.round(hiC);
}

function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function checkExtremeWeather(weather, temp, windSpeed, humidity) {
    const extremes = [];
    if (weather === 'Thunderstorm') extremes.push('⚡ Thunderstorm Warning');
    if (temp < -10) extremes.push('❄️ Extreme Cold');
    if (windSpeed > 20) extremes.push('💨 High Wind Warning');
    if (humidity > 90) extremes.push('💧 High Humidity Alert');
    return extremes;
}

function getAQIRecommendation(aqi) {
    if (aqi <= 50) return 'Excellent: Perfect for outdoor activities';
    if (aqi <= 100) return 'Good: Safe for all activities';
    if (aqi <= 150) return 'Moderate: Sensitive groups reduce outdoor exertion';
    if (aqi <= 200) return 'Unhealthy: Limit outdoor activities';
    if (aqi <= 300) return 'Very Unhealthy: Avoid outdoor activities';
    return 'Hazardous: Stay indoors, use air purifier';
}

function calculateComfortIndex(temp, humidity, windSpeed) {
    let score = 100;
    if (temp > 30 || temp < 10) score -= 30;
    if (temp > 35 || temp < 0) score -= 20;
    if (humidity > 80) score -= 15;
    if (humidity < 20) score -= 10;
    if (windSpeed > 15) score -= 10;
    return Math.max(0, Math.min(100, score));
}

function calculateOutdoorScore(weather, temp, windSpeed, rainProb) {
    let score = 100;
    if (weather.includes('Rain') || weather === 'Drizzle') score -= 40;
    if (weather === 'Thunderstorm') score -= 60;
    if (weather === 'Snow') score -= 30;
    if (temp > 35 || temp < 0) score -= 40;
    if (windSpeed > 15) score -= 20;
    if (rainProb > 50) score -= 30;
    return Math.max(0, Math.min(100, score));
}

function generateSuggestions(weather, temp, humidity, windSpeed, isDay, aqi) {
    const tempC = state.unit === 'metric' ? temp : (temp - 32) * 5/9;
    
    let clothing = '';
    if (tempC <= 0) clothing = '🧥 Heavy winter coat, thermal layers, scarf, gloves, wool socks';
    else if (tempC <= 10) clothing = '🧥 Winter jacket, sweater, warm boots, beanie';
    else if (tempC <= 20) clothing = '🧥 Light jacket, hoodie, long sleeves, jeans';
    else if (tempC <= 28) clothing = '👕 T-shirt, shorts, light pants, sunglasses';
    else clothing = '🩳 Light clothing, shorts, tank top, stay hydrated, wear sunscreen';
    
    let accessory = '';
    if (weather.includes('Rain') || weather === 'Drizzle') {
        accessory = '☔ Umbrella, waterproof jacket, rain boots, water-resistant bag';
    } else if (weather === 'Snow') {
        accessory = '❄️ Winter boots, earmuffs, hand warmers, snow goggles';
    } else if (weather === 'Thunderstorm') {
        accessory = '⚡ Stay indoors, unplug electronics, avoid open areas, keep flashlight ready';
    } else if (weather === 'Clear' && tempC > 25) {
        accessory = '🕶️ Sunglasses, sunscreen (SPF 30+), hat, cooling towel';
    } else if (windSpeed > 10) {
        accessory = '🧣 Windbreaker, secure hat, scarf, protective eyewear';
    } else {
        accessory = '😎 Comfortable accessories, stay prepared for weather changes';
    }
    
    let activity = '';
    if (weather.includes('Rain') || weather === 'Drizzle' || weather === 'Thunderstorm') {
        activity = '🏠 Indoor activities: movies, reading, museums, cooking, gaming';
    } else if (weather === 'Snow') {
        activity = '⛄ Outdoor: snowman building, skiing, sledding. Indoor: hot chocolate, board games';
    } else if (weather === 'Clear' && tempC >= 15 && tempC <= 28) {
        activity = '🚶 Perfect for hiking, picnics, cycling, outdoor sports, photography';
    } else if (tempC > 30) {
        activity = '🏊 Beach, swimming, indoor activities during peak sun hours, stay hydrated';
    } else if (weather === 'Clouds') {
        activity = '🚴 Great for long walks, outdoor exercises, sightseeing, photography';
    } else {
        activity = '🏃 Adjust activities based on conditions, stay flexible';
    }
    
    let health = '';
    if (aqi > 150) health = '⚠️ Poor air quality: wear mask, reduce outdoor exposure';
    else if (tempC > 30) health = '💧 Stay hydrated, avoid midday sun, wear light clothing';
    else if (tempC < 5) health = '🧤 Dress warmly, protect extremities, avoid prolonged exposure';
    else health = '✅ Conditions favorable for outdoor activities, maintain regular routine';
    
    return { clothing, accessory, activity, health };
}

// --- Weather App State ---
const state = {
    unit: 'metric',
    currentCity: null,
    currentCoords: null,
    history: JSON.parse(localStorage.getItem('weatherHistory') || '[]'),
    map: null,
    chart: null,
    background: null,
    mapInitialized: false
};

const ui = {
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    locateBtn: document.getElementById('locate-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    historyDropdown: document.getElementById('history-dropdown'),
    unitToggle: document.getElementById('unit-toggle'),
    dashboard: document.getElementById('weather-dashboard'),
    loader: document.getElementById('loader'),
    errorMsg: document.getElementById('error-msg'),
    canvas: document.getElementById('bg-canvas')
};

// Helper: animated icons
const getAnimatedIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
};

function updateBackgroundCanvas(weatherMain, isDay, cloudCover = 0) {
    if (state.background) {
        state.background.setWeather(weatherMain, isDay, cloudCover);
    } else {
        state.background = new WeatherBackground(ui.canvas);
        state.background.setWeather(weatherMain, isDay, cloudCover);
        state.background.start();
    }
}

function updateDateTime() {
    const dtElem = document.getElementById('date-time');
    if (dtElem && ui.dashboard && !ui.dashboard.classList.contains('hidden')) {
        dtElem.innerText = new Intl.DateTimeFormat('en-US', {
            weekday: 'long', hour: 'numeric', minute: '2-digit'
        }).format(new Date());
    }
}
setInterval(updateDateTime, 1000);

function showLoader() {
    if (ui.dashboard) ui.dashboard.classList.add('hidden');
    if (ui.errorMsg) ui.errorMsg.classList.add('hidden');
    if (ui.loader) ui.loader.classList.remove('hidden');
}

function hideLoader() {
    if (ui.loader) ui.loader.classList.add('hidden');
    if (ui.errorMsg) ui.errorMsg.classList.add('hidden');
    if (ui.dashboard) ui.dashboard.classList.remove('hidden');
}

function showError(msg) {
    if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key') || msg.includes('Forbidden')) {
        showApiKeyPrompt();
        return;
    }
    if (ui.loader) ui.loader.classList.add('hidden');
    if (ui.dashboard) ui.dashboard.classList.add('hidden');
    if (ui.errorMsg) {
        ui.errorMsg.innerText = msg;
        ui.errorMsg.classList.remove('hidden');
    }
}

function showApiKeyPrompt() {
    if (document.getElementById('api-key-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'api-key-modal';
    modal.className = 'glass-panel';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.zIndex = '9999';
    modal.style.padding = '2rem';
    modal.style.width = '420px';
    modal.style.maxWidth = '90%';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 30px 60px rgba(0,0,0,0.6)';
    modal.style.border = '1px solid rgba(255, 255, 255, 0.15)';
    modal.style.borderRadius = '24px';
    modal.style.backdropFilter = 'blur(20px)';
    modal.style.background = 'rgba(15, 25, 45, 0.85)';

    modal.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #ffffff; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><i class="fas fa-key text-primary"></i> API Key Required</h3>
        <p style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 1.5rem; line-height: 1.6; text-align: center;">
            The default OpenWeatherMap API key is rate-limited or inactive. Please enter a valid OpenWeatherMap API Key (free tier) to continue:
        </p>
        <input type="text" id="custom-api-key-input" placeholder="Paste your OpenWeatherMap API key..." style="width: 100%; padding: 0.8rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; margin-bottom: 1.5rem; outline: none; font-family: inherit;">
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="save-api-key-btn" class="primary-btn" style="padding: 0.6rem 1.5rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">Save Key</button>
            <button id="close-api-key-btn" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 0.6rem 1.5rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">Cancel</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('save-api-key-btn').onclick = () => {
        const inputKey = document.getElementById('custom-api-key-input').value.trim();
        if (inputKey) {
            localStorage.setItem('owm_api_key', inputKey);
            modal.remove();
            refreshData();
        }
    };

    document.getElementById('close-api-key-btn').onclick = () => {
        modal.remove();
        if (ui.loader) ui.loader.classList.add('hidden');
        if (ui.errorMsg) {
            ui.errorMsg.innerText = 'Search failed: Invalid API key.';
            ui.errorMsg.classList.remove('hidden');
        }
    };
}

function saveHistory(city) {
    const updated = [city, ...state.history.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
    state.history = updated;
    localStorage.setItem('weatherHistory', JSON.stringify(updated));
    renderHistory();
}

function renderHistory() {
    if (!ui.historyDropdown) return;
    ui.historyDropdown.innerHTML = '';
    state.history.forEach(city => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-history" style="margin-right: 10px; color: #3b82f6;"></i> ${city}`;
        li.addEventListener('click', () => {
            ui.searchInput.value = city;
            ui.historyDropdown.classList.add('hidden');
            fetchWeather(city);
        });
        ui.historyDropdown.appendChild(li);
    });
}

function renderHourly(forecastList, unitSymbol) {
    const container = document.getElementById('hourly-container');
    if (!container) return;
    container.innerHTML = '';
    const hourly = forecastList.slice(0, 8);
    let rainHours = 0;
    hourly.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp);
        const icon = getAnimatedIcon(item.weather[0].icon);
        const rainProb = Math.round((item.pop || 0) * 100);
        if (rainProb > 30) rainHours++;
        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div style="font-size: 0.8rem;">${time}</div>
            <img src="${icon}" style="width: 38px; margin: 5px 0;" alt="icon">
            <strong>${temp}${unitSymbol}</strong>
            <div style="font-size: 0.7rem;">${item.weather[0].description.split(' ')[0]}</div>
            ${rainProb > 0 ? `<div style="font-size: 0.65rem; margin-top: 3px;"><i class="fas fa-tint"></i> ${rainProb}%</div>` : ''}
        `;
        container.appendChild(card);
    });
    const summaryElem = document.getElementById('hourly-summary');
    if (summaryElem) summaryElem.innerHTML = rainHours > 3 ? `☔ ${rainHours} hours with rain` : '';
}

function renderForecast(forecastList, unitSymbol) {
    const container = document.getElementById('forecast-container');
    if (!container) return;
    const dailyMap = new Map();
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-CA');
        if (!dailyMap.has(date)) {
            dailyMap.set(date, { temps: [], icons: [], pops: [], weathers: [] });
        }
        const day = dailyMap.get(date);
        day.temps.push(item.main.temp);
        day.icons.push(item.weather[0].icon);
        day.pops.push(item.pop || 0);
        day.weathers.push(item.weather[0].main);
    });
    const days = Array.from(dailyMap.entries()).slice(0, 5);
    container.innerHTML = '';
    let weekRainDays = 0;
    days.forEach(([dateStr, data]) => {
        const maxTemp = Math.max(...data.temps);
        const minTemp = Math.min(...data.temps);
        const iconCode = data.icons[Math.floor(data.icons.length / 2)];
        const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
        const popAvg = Math.round(data.pops.reduce((a,b)=>a+b,0) / data.pops.length * 100);
        if (popAvg > 40) weekRainDays++;
        const card = document.createElement('div');
        card.className = 'forecast-day';
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${getAnimatedIcon(iconCode)}" style="width: 36px;" alt="icon">
                <strong>${dayName}</strong>
            </div>
            <div>${Math.round(minTemp)}${unitSymbol} / ${Math.round(maxTemp)}${unitSymbol}</div>
            <div style="font-size: 0.75rem;"><i class="fas fa-tint"></i> ${popAvg}%</div>
        `;
        container.appendChild(card);
    });
    const weekSummary = document.getElementById('week-summary');
    if (weekSummary) weekSummary.innerHTML = weekRainDays > 2 ? `🌧️ ${weekRainDays} days with rain expected` : '☀️ Mostly dry week ahead';
}

function renderChart(forecastList, unitSymbol) {
    const ctx = document.getElementById('weatherChart')?.getContext('2d');
    if (!ctx) return;
    const dailyMap = new Map();
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-CA');
        if (!dailyMap.has(date)) {
            dailyMap.set(date, { temps: [], pops: [] });
        }
        const day = dailyMap.get(date);
        day.temps.push(item.main.temp);
        day.pops.push(item.pop || 0);
    });
    const entries = Array.from(dailyMap.entries()).slice(0, 6);
    const labels = entries.map(([d]) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' }));
    const avgTemps = entries.map(([,v]) => Math.round(v.temps.reduce((a,b)=>a+b,0)/v.temps.length));
    const avgPops = entries.map(([,v]) => Math.round(v.pops.reduce((a,b)=>a+b,0)/v.pops.length * 100));
    
    const tempRange = Math.max(...avgTemps) - Math.min(...avgTemps);
    const tempRangeElem = document.getElementById('temp-range');
    const rainProbElem = document.getElementById('rain-probability');
    if (tempRangeElem) tempRangeElem.innerHTML = `${Math.min(...avgTemps)}° - ${Math.max(...avgTemps)}°`;
    if (rainProbElem) rainProbElem.innerHTML = `${Math.max(...avgPops)}%`;
    
    if (state.chart) state.chart.destroy();
    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: `Temperature (${state.unit === 'metric' ? '°C' : '°F'})`, data: avgTemps, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', tension: 0.3, fill: true, pointRadius: 4, pointBackgroundColor: '#fb923c' },
                { label: 'Rain Probability (%)', data: avgPops, type: 'bar', backgroundColor: '#38bdf8', borderRadius: 8, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { tooltip: { mode: 'index' }, legend: { labels: { color: '#e2e8f0' } } },
            scales: {
                y: { title: { display: true, text: 'Temperature', color: '#cbd5e1' }, grid: { color: '#334155' } },
                y1: { position: 'right', title: { text: 'Rain %', color: '#7dd3fc' }, min: 0, max: 100, grid: { drawOnChartArea: false } }
            }
        }
    });
    
    const trendText = tempRange > 10 ? '📈 Significant temperature variation' : '📉 Stable temperatures';
    const trendStats = document.getElementById('trend-stats');
    if (trendStats) trendStats.innerHTML = trendText;
}

function initMap(lat, lon) {
    const mapDiv = document.getElementById('weather-map');
    if (!mapDiv) {
        console.error('Map container not found');
        return;
    }
    
    // Ensure map container is visible before initializing
    setTimeout(() => {
        if (state.map && state.mapInitialized) {
            state.map.setView([lat, lon], 10);
            if (state.mapMarker) {
                state.mapMarker.setLatLng([lat, lon])
                    .bindPopup(`📍 ${state.currentCity || 'Your Location'}<br>Current weather: ${document.getElementById('temperature')?.innerText || '--'}`)
                    .openPopup();
            }
            return;
        }
        
        try {
            // Force map container to have dimensions
            if (mapDiv.offsetWidth === 0 || mapDiv.offsetHeight === 0) {
                setTimeout(() => initMap(lat, lon), 100);
                return;
            }
            
            state.map = L.map('weather-map').setView([lat, lon], 10);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CartoDB, OpenStreetMap contributors',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(state.map);
            
            state.mapMarker = L.marker([lat, lon]).addTo(state.map)
                .bindPopup(`📍 ${state.currentCity || 'Your Location'}<br>Current weather: ${document.getElementById('temperature')?.innerText || '--'}`)
                .openPopup();
            
            state.mapInitialized = true;
            
            // Force map to redraw after a short delay
            setTimeout(() => {
                if (state.map) state.map.invalidateSize();
            }, 200);
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }, 100);
}

function updateSunProgress(sunrise, sunset) {
    const now = Math.floor(Date.now() / 1000);
    const totalDay = sunset - sunrise;
    const elapsed = Math.max(0, Math.min(now - sunrise, totalDay));
    const percent = (elapsed / totalDay) * 100;
    const progressBar = document.getElementById('sun-progress-bar');
    if (progressBar) progressBar.style.width = `${percent}%`;
}

function updateSuggestions(weather, temp, humidity, windSpeed, isDay, aqi) {
    const suggestions = generateSuggestions(weather, temp, humidity, windSpeed, isDay, aqi);
    const clothingElem = document.getElementById('clothing-suggestion');
    const accessoryElem = document.getElementById('accessory-suggestion');
    const activityElem = document.getElementById('activity-suggestion');
    const healthElem = document.getElementById('health-suggestion');
    if (clothingElem) clothingElem.innerHTML = suggestions.clothing;
    if (accessoryElem) accessoryElem.innerHTML = suggestions.accessory;
    if (activityElem) activityElem.innerHTML = suggestions.activity;
    if (healthElem) healthElem.innerHTML = suggestions.health;
}

async function fetchTripData(lat, lon, city) {
    const summaryElem = document.getElementById('city-summary-text');
    const hotelList = document.getElementById('hotel-list');
    const attractionList = document.getElementById('attraction-list');
    const tripCityName = document.getElementById('city-name');
    
    if (tripCityName) tripCityName.innerText = city;
    
    // 1. Wikipedia Summary
    try {
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`);
        if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            if (summaryElem) summaryElem.innerHTML = wikiData.extract || 'Explore the beauty and culture of this amazing destination.';
        } else {
            if (summaryElem) summaryElem.innerHTML = 'A beautiful destination with unique attractions waiting to be explored.';
        }
    } catch (e) {
        if (summaryElem) summaryElem.innerHTML = 'Could not load city information.';
    }
    
    // 2. Overpass API for Hotels & Attractions
    try {
        const query = `
            [out:json];
            (
              node["tourism"="hotel"](around:5000,${lat},${lon});
              node["tourism"="attraction"](around:5000,${lat},${lon});
              node["historic"="monument"](around:5000,${lat},${lon});
            );
            out 20;
        `;
        const overpassRes = await fetch(`https://overpass-api.de/api/interpreter`, {
            method: 'POST',
            body: query
        });
        const overpassData = await overpassRes.json();
        
        let hotels = [];
        let attractions = [];
        
        if (overpassData.elements) {
            overpassData.elements.forEach(el => {
                if (el.tags) {
                    let englishName = el.tags["name:en"] || el.tags["int_name"];
                    if (!englishName && el.tags.name) {
                        const isMostlyEnglish = /^[\u0000-\u007F\u00C0-\u00FF\u0100-\u017F\s,\.\-'\(\)&]+$/.test(el.tags.name);
                        if (isMostlyEnglish) {
                            englishName = el.tags.name;
                        }
                    }
                    
                    if (englishName) {
                        if (el.tags.tourism === 'hotel') {
                            if (hotels.length < 5 && !hotels.includes(englishName)) hotels.push(englishName);
                        } else {
                            if (attractions.length < 5 && !attractions.includes(englishName)) attractions.push(englishName);
                        }
                    }
                }
            });
        }
        
        if (hotelList) {
            hotelList.innerHTML = hotels.length > 0 
                ? hotels.map(h => `<li><i class="fas fa-bed"></i> ${h}</li>`).join('')
                : '<li><i class="fas fa-info-circle"></i> No specific hotels found nearby.</li>';
        }
        
        if (attractionList) {
            attractionList.innerHTML = attractions.length > 0 
                ? attractions.map(a => `<li><i class="fas fa-map-marker-alt"></i> ${a}</li>`).join('')
                : '<li><i class="fas fa-info-circle"></i> Explore the beautiful local scenery!</li>';
        }
        
    } catch (e) {
        if (hotelList) hotelList.innerHTML = '<li><i class="fas fa-exclamation-circle"></i> Unable to load hotels.</li>';
        if (attractionList) attractionList.innerHTML = '<li><i class="fas fa-exclamation-circle"></i> Unable to load attractions.</li>';
    }
}

async function fetchAllWeatherData(lat, lon, locationName) {
    showLoader();
    try {
        let current, forecast, aqiData;
        let loadedFromProxy = false;

        // Try requesting via secure proxy backend first
        try {
            const res = await fetch(`${PROXY_URL}/weather?lat=${lat}&lon=${lon}&units=${state.unit}`);
            if (res.ok) {
                const data = await res.json();
                current = data.current;
                forecast = data.forecast;
                aqiData = data.air;
                loadedFromProxy = true;
            }
        } catch (proxyErr) {
            console.warn('Backend proxy weather fetch failed, falling back to direct client-side fetch:', proxyErr);
        }

        // Fallback: Direct client-side fetch from OpenWeatherMap
        if (!loadedFromProxy) {
            const key = getApiKey();
            const [weatherRes, forecastRes, airRes] = await Promise.all([
                fetch(`${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&units=${state.unit}&appid=${key}`),
                fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&units=${state.unit}&appid=${key}`),
                fetch(`${AIR_POLLUTION_URL}?lat=${lat}&lon=${lon}&appid=${key}`)
            ]);
            if (weatherRes.status === 401 || forecastRes.status === 401 || airRes.status === 401) {
                throw new Error('API key error (401)');
            }
            if (!weatherRes.ok || !forecastRes.ok || !airRes.ok) throw new Error('API error');
            current = await weatherRes.json();
            forecast = await forecastRes.json();
            aqiData = await airRes.json();
        }
        
        const unitSym = state.unit === 'metric' ? '°C' : '°F';
        const speedUnit = state.unit === 'metric' ? 'm/s' : 'mph';
        const now = Math.floor(Date.now() / 1000);
        const isDay = now >= current.sys.sunrise && now < current.sys.sunset;
        
        // Update basic info
        const cityNameElem = document.getElementById('city-name');
        const tempElem = document.getElementById('temperature');
        const descElem = document.getElementById('description');
        const iconElem = document.getElementById('weather-icon');
        
        if (cityNameElem) cityNameElem.innerText = locationName;
        if (tempElem) tempElem.innerHTML = `${Math.round(current.main.temp)}${unitSym}`;
        if (descElem) descElem.innerText = current.weather[0].description;
        if (iconElem) iconElem.src = getAnimatedIcon(current.weather[0].icon);
        
        // Local Time Logic
        const localTimeElem = document.getElementById('local-time');
        if (localTimeElem && current.timezone !== undefined) {
            // current.timezone is offset in seconds from UTC. 
            // Get current UTC time in ms, add the offset in ms.
            const utcTime = Date.now() + (new Date().getTimezoneOffset() * 60000);
            const localTimeDate = new Date(utcTime + (current.timezone * 1000));
            localTimeElem.innerHTML = `<i class="far fa-clock"></i> Local Time: ${localTimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' })}`;
            localTimeElem.classList.remove('hidden');
        }
        
        // Quick Actions Logic
        const btnFlights = document.getElementById('btn-flights');
        const btnHotels = document.getElementById('btn-hotels');
        const btnShare = document.getElementById('btn-share');
        
        if (btnFlights) btnFlights.onclick = () => window.open(`https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(locationName)}`, '_blank');
        if (btnHotels) btnHotels.onclick = () => window.open(`https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(locationName)}`, '_blank');
        if (btnShare) {
            btnShare.onclick = () => {
                const textToShare = `Check out my trip to ${locationName}! The weather is currently ${Math.round(current.main.temp)}${unitSym} and ${current.weather[0].description}.`;
                navigator.clipboard.writeText(textToShare).then(() => {
                    const originalHtml = btnShare.innerHTML;
                    btnShare.innerHTML = `<i class="fas fa-check"></i> Copied!`;
                    setTimeout(() => btnShare.innerHTML = originalHtml, 2000);
                }).catch(err => console.error('Error copying text: ', err));
            };
        }

        
        // Wind with direction
        const windDir = getWindDirection(current.wind.deg);
        const windSpeedElem = document.getElementById('wind-speed');
        const windDirElem = document.getElementById('wind-direction');
        if (windSpeedElem) windSpeedElem.innerHTML = `${current.wind.speed} ${speedUnit}`;
        if (windDirElem) windDirElem.innerHTML = `↗️ ${windDir}`;
        
        const humidityElem = document.getElementById('humidity');
        const feelsLikeElem = document.getElementById('feels-like');
        const pressureElem = document.getElementById('pressure');
        const visibilityElem = document.getElementById('visibility');
        
        if (humidityElem) humidityElem.innerHTML = `${current.main.humidity}%`;
        if (feelsLikeElem) feelsLikeElem.innerHTML = `${Math.round(current.main.feels_like)}${unitSym}`;
        if (pressureElem) pressureElem.innerHTML = `${current.main.pressure} hPa`;
        if (visibilityElem) visibilityElem.innerHTML = `${(current.visibility / 1000).toFixed(1)} km`;
        
        const timeOpt = { hour: 'numeric', minute: '2-digit' };
        const sunriseElem = document.getElementById('sunrise');
        const sunsetElem = document.getElementById('sunset');
        if (sunriseElem) sunriseElem.innerHTML = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], timeOpt);
        if (sunsetElem) sunsetElem.innerHTML = new Date(current.sys.sunset * 1000).toLocaleTimeString([], timeOpt);
        
        const cloudCoverElem = document.getElementById('cloud-cover');
        const windGustElem = document.getElementById('wind-gust');
        if (cloudCoverElem) cloudCoverElem.innerHTML = `${current.clouds.all}%`;
        if (windGustElem) windGustElem.innerHTML = current.wind.gust ? `${current.wind.gust} ${speedUnit}` : 'N/A';
        
        // Dew Point
        const dewPoint = calculateDewPoint(current.main.temp, current.main.humidity);
        const dewPointElem = document.getElementById('dew-point');
        if (dewPointElem) dewPointElem.innerHTML = `${Math.round(dewPoint)}${unitSym}`;
        
        // Heat Index
        const heatIndex = calculateHeatIndex(current.main.temp, current.main.humidity);
        const heatIndexElem = document.getElementById('heat-index');
        if (heatIndexElem) heatIndexElem.innerHTML = `${Math.round(heatIndex)}${unitSym}`;
        
        // Air Quality
        const aqiVal = aqiData.list[0].main.aqi;
        const aqiText = ['Excellent', 'Good', 'Moderate', 'Unhealthy', 'Very Unhealthy', 'Hazardous'][aqiVal-1];
        const aqiElem = document.getElementById('aqi');
        const aqiRecElem = document.getElementById('aqi-recommendation');
        if (aqiElem) aqiElem.innerHTML = `${aqiText} (${aqiVal})`;
        if (aqiRecElem) aqiRecElem.innerHTML = getAQIRecommendation(aqiVal * 50);
        
        // Extreme weather check
        const extremes = checkExtremeWeather(current.weather[0].main, current.main.temp, current.wind.speed, current.main.humidity);
        
        // Alerts
        const alertsSection = document.getElementById('alerts-section');
        const alertsList = document.getElementById('alerts-list');
        if (alertsSection && alertsList) {
            if (extremes.length > 0) {
                alertsSection.classList.remove('hidden');
                alertsList.innerHTML = extremes.map(alert => `<div class="alert-item"><i class="fas fa-exclamation-circle"></i> ${alert}</div>`).join('');
            } else {
                alertsSection.classList.add('hidden');
            }
        }
        
        // Analytics
        const comfortIndex = calculateComfortIndex(current.main.temp, current.main.humidity, current.wind.speed);
        const comfortElem = document.getElementById('comfort-index');
        if (comfortElem) comfortElem.innerHTML = `${comfortIndex}/100 ${comfortIndex > 70 ? '😊' : (comfortIndex > 40 ? '😐' : '😰')}`;
        
        const avgRainProb = forecast.list.slice(0, 8).reduce((sum, item) => sum + (item.pop || 0), 0) / 8 * 100;
        const outdoorScore = calculateOutdoorScore(current.weather[0].main, current.main.temp, current.wind.speed, avgRainProb);
        const outdoorElem = document.getElementById('outdoor-score');
        if (outdoorElem) outdoorElem.innerHTML = `${outdoorScore}/100 ${outdoorScore > 70 ? '🏆 Great!' : (outdoorScore > 40 ? '⚠️ Caution' : '🚫 Avoid')}`;
        
        // Generate suggestions
        updateSuggestions(current.weather[0].main, current.main.temp, current.main.humidity, current.wind.speed, isDay, aqiVal);
        
        // Background
        updateBackgroundCanvas(current.weather[0].main, isDay, current.clouds.all);
        updateSunProgress(current.sys.sunrise, current.sys.sunset);
        
        renderHourly(forecast.list, unitSym);
        renderForecast(forecast.list, unitSym);
        renderChart(forecast.list, unitSym);
        
        // Hide Hero and Trending sections when dashboard is shown
        const tripHero = document.getElementById('trip-hero');
        const trendingSection = document.getElementById('trending-section');
        if (tripHero) tripHero.classList.add('hidden');
        if (trendingSection) trendingSection.classList.add('hidden');
        
        hideLoader();

        // Initialize map after data is loaded and dashboard is visible
        initMap(lat, lon);
        
        // Fetch Trip Planning Data asynchronously
        fetchTripData(lat, lon, locationName);
    } catch (err) {
        console.error('Error fetching weather data:', err);
        showError('Unable to fetch weather data. Please check your connection and try again.');
    }
}

async function fetchWeather(city, updateHistory = true) {
    showLoader();
    try {
        let lat, lon, name;
        let loadedFromProxy = false;

        // Try secure proxy first
        try {
            const res = await fetch(`${PROXY_URL}/geocode?q=${city}`);
            if (res.ok) {
                const geoData = await res.json();
                if (geoData && geoData.length > 0) {
                    ({ lat, lon, name } = geoData[0]);
                    loadedFromProxy = true;
                }
            }
        } catch (proxyErr) {
            console.warn('Backend proxy geocode failed, falling back to direct client-side fetch:', proxyErr);
        }

        // Fallback: Direct client-side fetch from OpenWeatherMap
        if (!loadedFromProxy) {
            const key = getApiKey();
            const geoRes = await fetch(`${GEO_URL}?q=${city}&limit=1&appid=${key}`);
            if (geoRes.status === 401) throw new Error('API key error (401)');
            const geoData = await geoRes.json();
            if (!geoData.length) throw new Error('City not found');
            ({ lat, lon, name } = geoData[0]);
        }

        state.currentCity = name;
        state.currentCoords = { lat, lon };
        if (updateHistory) saveHistory(name);
        await fetchAllWeatherData(lat, lon, name);
    } catch (err) {
        console.error('Error fetching city:', err);
        showError(err.message || 'City lookup failed. Please check the city name.');
    }
}

async function fetchWeatherByCoords(lat, lon) {
    showLoader();
    try {
        let name = 'Your Location';
        let loadedFromProxy = false;

        // Try secure proxy first
        try {
            const res = await fetch(`${PROXY_URL}/reverse-geocode?lat=${lat}&lon=${lon}`);
            if (res.ok) {
                const geoData = await res.json();
                if (geoData && geoData.length > 0) {
                    name = geoData[0].name;
                    if (geoData[0].state) name += `, ${geoData[0].state}`;
                    loadedFromProxy = true;
                }
            }
        } catch (proxyErr) {
            console.warn('Backend proxy reverse-geocode failed, falling back to direct client-side fetch:', proxyErr);
        }

        // Fallback: Direct client-side fetch from OpenWeatherMap
        if (!loadedFromProxy) {
            const key = getApiKey();
            const geoRes = await fetch(`${REVERSE_GEO_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${key}`);
            if (geoRes.status === 401) throw new Error('API key error (401)');
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
                name = geoData[0].name;
                if (geoData[0].state) name += `, ${geoData[0].state}`;
            }
        }

        state.currentCity = name;
        state.currentCoords = { lat, lon };
        await fetchAllWeatherData(lat, lon, name);
    } catch (err) {
        console.error('Error reverse geocoding:', err);
        try {
            await fetchAllWeatherData(lat, lon, 'Local Weather');
        } catch (e) {
            showError('Unable to fetch weather for your location. Please search manually.');
        }
    }
}

function handleSearch() {
    const query = ui.searchInput.value.trim();
    if (query) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('city', query);
        window.location.href = currentUrl.toString();
        ui.searchInput.value = '';
    }
    if (ui.historyDropdown) ui.historyDropdown.classList.add('hidden');
}

function handleNavSearch() {
    const navInput = document.getElementById('nav-search-input');
    const query = navInput ? navInput.value.trim() : '';
    if (query) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('city', query);
        window.location.href = currentUrl.toString();
        if (navInput) navInput.value = '';
    }
}

function toggleUnit() {
    state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
    if (ui.unitToggle) {
        ui.unitToggle.innerHTML = state.unit === 'metric' ? '<strong>°C</strong> | °F' : '°C | <strong>°F</strong>';
    }
    if (state.currentCoords) {
        fetchAllWeatherData(state.currentCoords.lat, state.currentCoords.lon, state.currentCity);
    }
}

function refreshData() {
    if (state.currentCoords) {
        fetchAllWeatherData(state.currentCoords.lat, state.currentCoords.lon, state.currentCity);
    } else if (state.currentCity) {
        fetchWeather(state.currentCity, false);
    }
}

function bindEvents() {
    if (ui.searchBtn) ui.searchBtn.addEventListener('click', handleSearch);
    if (ui.searchInput) ui.searchInput.addEventListener('keypress', e => e.key === 'Enter' && handleSearch());
    
    // Bind top nav search events
    const navSearchBtn = document.getElementById('nav-search-btn');
    const navSearchInput = document.getElementById('nav-search-input');
    if (navSearchBtn) navSearchBtn.addEventListener('click', handleNavSearch);
    if (navSearchInput) navSearchInput.addEventListener('keypress', e => e.key === 'Enter' && handleNavSearch());

    if (ui.refreshBtn) ui.refreshBtn.addEventListener('click', refreshData);
    if (ui.unitToggle) ui.unitToggle.addEventListener('click', toggleUnit);
    if (ui.searchInput) {
        ui.searchInput.addEventListener('focus', () => {
            if (state.history.length && ui.historyDropdown) ui.historyDropdown.classList.remove('hidden');
        });
    }
    document.addEventListener('click', (e) => {
        if (ui.searchInput && ui.historyDropdown && 
            !ui.searchInput.contains(e.target) && !ui.historyDropdown.contains(e.target)) {
            ui.historyDropdown.classList.add('hidden');
        }
    });
}

function init() {
    console.log('Initializing Weather Predictor...');
    
    // Dynamic Greeting
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = `${greeting}! Plan your next journey with <span class="text-primary">AI</span>`;
    }
    
    // Security and UX Gate: Redirect to login page on manual reload/refresh or if unauthorized
    const urlParams = new URLSearchParams(window.location.search);
    const isSubPage = urlParams.has('city');
    
    if (!isSubPage) {
        const hasAuth = sessionStorage.getItem('auth_success') === 'true';
        const isReload = sessionStorage.getItem('index_loaded') === 'true';
        
        if (isReload || !hasAuth) {
            console.log('Reload or unauthorized access detected. Redirecting to login gateway...');
            sessionStorage.removeItem('auth_success');
            sessionStorage.removeItem('index_loaded');
            window.location.replace('start.html');
            return;
        }
        
        // Mark page as successfully loaded so a future refresh triggers the reload redirect
        sessionStorage.setItem('index_loaded', 'true');
    }

    bindEvents();
    renderHistory();
    
    // Update time display
    if (ui.canvas && !state.background) {
        state.background = new WeatherBackground(ui.canvas);
        state.background.start();
    }

    // Read URL query parameters to load search results in a new tab
    const cityQuery = urlParams.get('city');
    
    if (cityQuery) {
        // Hide the landing hero and trending sections instantly so the dashboard displays seamlessly
        const tripHero = document.getElementById('trip-hero');
        const trendingSection = document.getElementById('trending-section');
        if (tripHero) tripHero.classList.add('hidden');
        if (trendingSection) trendingSection.classList.add('hidden');
        
        fetchWeather(cityQuery);
    }
}

// Start the app when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}