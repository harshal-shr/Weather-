const API_KEY = '508e1761588ab9ca8eca8408efe0fab9';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('city-input');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherCard = document.getElementById('weather-card');
const forecastSection = document.getElementById('forecast-section');

async function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name!');
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) throw new Error('City not found!');
        const currentData = await currentResponse.json();
        
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        hideLoading();
        weatherCard.classList.remove('hidden');
        forecastSection.classList.remove('hidden');
        
    } catch (err) {
        hideLoading();
        showError(err.message);
    }
}

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
        const currentData = await currentResponse.json();
        
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastResponse.json();
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        hideLoading();
        weatherCard.classList.remove('hidden');
        forecastSection.classList.remove('hidden');
        
    } catch (err) {
        hideLoading();
        showError(err.message);
    }
}

function displayCurrentWeather(data) {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
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

function displayForecast(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';
    
    const dailyData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
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
    if (e.key === 'Enter') searchWeather();
});

