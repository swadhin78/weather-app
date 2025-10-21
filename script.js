const apiKey = "8de0ef98a36c0cb2708aedf2f78ab6e6"; // replace with your OpenWeatherMap key
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name!");
  getWeatherData(city);
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => alert("Location permission denied!")
    );
  }
});

async function getWeatherData(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error("City not found!");
    const data = await res.json();
    updateCurrentWeather(data);
    getForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    alert(err.message);
  }
}

async function getWeatherByCoords(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  const data = await res.json();
  updateCurrentWeather(data);
  getForecast(lat, lon);
}

function updateCurrentWeather(data) {
  document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("temperature").textContent = `${data.main.temp.toFixed(1)}°C`;
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("wind").textContent = `${data.wind.speed} km/h`;
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
  document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  const isNight = data.weather[0].icon.includes("n");
  document.body.classList.toggle("night", isNight);
  document.body.classList.toggle("day", !isNight);
}

async function getForecast(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  const data = await res.json();
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  // Filter for next 5 days (every 24h)
  const daily = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
  daily.forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h4>${dayName}</h4>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
      <p>${day.main.temp.toFixed(1)}°C</p>
    `;
    forecastDiv.appendChild(card);
  });
}
