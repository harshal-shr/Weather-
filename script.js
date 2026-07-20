const API_KEY = '508e1761588ab9ca8eca8408efe0fab9';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('city-input');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherCard = document.getElementById('weather-card');
const forecastSection = document.getElementById('forecast-section');

// ============================================
// BACKGROUND GRADIENTS
// ============================================
const backgrounds = {
    '01d': 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)', // Clear day
    '01n': 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', // Clear night
    '02d': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // Few clouds day
    '02n': 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)', // Few clouds night
    '03d': 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', // Scattered clouds
    '03n': 'linear-gradient(135deg, #232526 0%, #414345 100%)', // Scattered clouds night
    '04d': 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)', // Broken clouds
    '04n': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', // Broken clouds night
    '09d': 'linear-gradient(135deg, #3a6186 0%, #89253e 100%)', // Shower rain
    '09n': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', // Shower rain night
    '10d': 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)', // Rain day
    '10n': 'linear-gradient(135deg, #141E30 0%, #243B55 100%)', // Rain night
    '11d': 'linear-gradient(135deg, #373B44 0%, #4286f4 100%)', // Thunderstorm
    '11n': 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)', // Thunderstorm night
    '13d': 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)', // Snow
    '13n': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Snow night
    '50d': 'linear-gradient(135deg, #3E5151 0%, #DECBA4 100%)', // Mist
    '50n': 'linear-gradient(135deg, #1c1c1c 0%, #434343 100%)', // Mist night
};

function setBackground(iconCode) {
    const bg = backgrounds[iconCode] || backgrounds['01d'];
    document.body.style.background = bg;
    document.body.style.transition = 'background 0.5s ease';
}

// ============================================
// SEARCH WEATHER BY CITY
// ============================================
async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name!');
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        const currentUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const currentResponse = await fetch(currentUrl);
        
        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error('City not found! Try: Mumbai, London, New York');
            } else if (currentResponse.status === 401) {
                throw new Error('API Key invalid!');
            } else {
                throw new Error('Error: ' + currentResponse.status);
            }
        }
        
        const currentData = await currentResponse.json();
        
        const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        // ✅ Background change!
        setBackground(currentData.weather[0].icon);
        
        hideLoading();
        weatherCard.classList.remove('hidden');
        forecastSection.classList.remove('hidden');
        
    } catch (err) {
        hideLoading();
        showError(err.message);
    }
}

// ============================================
// GET LOCATION (GPS)
// ============================================
function getLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => fetchWeatherByCoords(position.coords),
            err => {
                hideLoading();
                showError('Location access denied!');
            }
        );
    } else {
        showError('Geolocation not supported!');
    }
}

async function fetchWeatherByCoords(coords) {
    try {
        const { latitude, longitude } = coords;
        
        const currentResponse = await fetch(
            `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) throw new Error('Weather data not found!');
        
        const currentData = await currentResponse.json();
        
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        // ✅ Background change!
        setBackground(currentData.weather[0].icon);
        
        hideLoading();
        weatherCard.classList.remove('hidden');
        forecastSection.classList.remove('hidden');
        
    } catch (err) {
        hideLoading();
        showError(err.message);
    }
}

// ============================================
// DISPLAY CURRENT WEATHER
// ============================================
function displayCurrentWeather(data) {
    const cityName = data.name || 'Unknown City';
    const country = data.sys && data.sys.country ? data.sys.country : '';
    const fullLocation = country ? `${cityName}, ${country}` : cityName;
    
    document.getElementById('city-name').textContent = fullLocation;
    document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('condition').textContent = data.weather[0].description;
    
    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = 
        `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} km/h`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
}

// ============================================
// DISPLAY 5-DAY FORECAST
// ============================================
function displayForecast(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';
    
    const dailyData = [];
    const seenDates = new Set();
    
    for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (!seenDates.has(dateStr) && dailyData.length < 5) {
            seenDates.add(dateStr);
            dailyData.push(item);
        }
    }
    
    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const div = document.createElement('div');
        div.className = 'forecast-day';
        div.innerHTML = `
            <div class="day-name">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
            <div class="day-temp">${Math.round(day.main.temp)}°C</div>
        `;
        container.appendChild(div);
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showLoading() {
    loading.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    forecastSection.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(msg) {
    error.textContent = msg;
    error.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    forecastSection.classList.add('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

