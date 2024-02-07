var userInputEl = document.querySelector("#city-name");
var searchBtnEl = document.querySelector("#search-btn");
var currentTempSpan = document.querySelector("#current_temp");
var currentWindSpan = document.querySelector("#current_wind");
var currentHumiditySpan = document.querySelector("#current_humidity");
var searchHistoryEl = document.querySelector(".list-group");
var todaysDateSpan = document.querySelector("#current-date");
var displayCitySpan = document.querySelector("#city-span");
var todayIconSpan = document.querySelector("#weather_icon_0");

var APIKey = "1229e234900815784bef5846571c8b70";

searchBtnEl.addEventListener("click", function (event) {
  //add functionality to search btn
  event.preventDefault();
  var userInput = userInputEl.value;
  console.log(userInput);
  saveToLocalStorage(userInput);
  getCoordinates(userInput);
  displayCitySpan.textContent = userInput;
});

function saveToLocalStorage(cityName) {
  //for every city name user searches...
  var localStorageData = JSON.parse(localStorage.getItem("cityWeather")); //get ls as jS object
  if (localStorageData === null) {
    localStorageData = []; //make an empty array of userInputs
    localStorageData.push(cityName);
  } else {
    localStorageData.push(cityName);
  }
  localStorage.setItem("cityWeather", JSON.stringify(localStorageData)); //set ls as string
  loadSearchHistory();
}

function getCurrentWeather(lat, lon) {
  //using API for current atm data
  var requestUrl =
    "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=" +
    APIKey +
    "&units=metric";

  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      displayTodaysWeather(data);
    });
}

function getCoordinates(city) {
  //using API to grab coordinates
  var requestUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    city +
    "&limit=1&appid=" +
    APIKey;
  fetch(requestUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (coordinatesData) {
      // console.log(data);
      var lat = coordinatesData[0].lat; //set up variables to later use them
      var lon = coordinatesData[0].lon;
      getCurrentWeather(lat, lon);
      getForecast(lat, lon);
    });
}

function getForecast(lat, lon) {
  //using API for 5 DAY forecast
  var fiveDayForecast =
    "https://api.openweathermap.org/data/2.5/forecast?lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=" +
    APIKey +
    "&units=metric";

  fetch(fiveDayForecast)
    .then(function (response) {
      return response.json();
    })
    .then(function (weatherData) {
      console.log(weatherData);
      var counter = 1; //counter for span ids starting from 1 to 5
      for (var i = 1; i < weatherData.list.length; i += 8) {
        //update for every 3rd hour (8 times a day)
        var tempSpan = document.querySelector(`#forecast_temp_${counter}`); //use template literals
        tempSpan.innerHTML = weatherData.list[i].main.temp;
        var windSpan = document.querySelector(`#forecast_wind_${counter}`); //use template literals
        windSpan.innerHTML = weatherData.list[i].wind.speed;
        var humiditySpan = document.querySelector(
          `#forecast_humidity_${counter}` //use template literals
        );
        humiditySpan.innerHTML = weatherData.list[i].main.humidity;
        var iconSpan = document.querySelector(`#weather_icon_${counter}`);
        var iconURL = getIconURL(weatherData.list[i].weather[0].icon);
        iconSpan.innerHTML = `<img src=${iconURL} alt="openweather api icon" />`;
        counter += 1; //for every counter number.. 1,2,3,4,5
      }
    });
}

function loadSearchHistory() {
  searchHistoryEl.innerHTML = ""; //to fix the issue of extra buttons being added
  var localStorageData = JSON.parse(localStorage.getItem("cityWeather")); //get ls as a js object
  if (localStorageData != null) {
    //if not = to null...
    for (var i = 0; i < localStorageData.length; i++) {
      //for each ls data ...
      var listItem = document.createElement("li"); //create list
      var button = document.createElement("button"); //and button
      button.addEventListener("click", function (event) {
        //make button functional
        event.preventDefault();
        var cityName = event.target.innerHTML; //targeting text inside the button (cityNames)
        getCoordinates(cityName); //get coordinates of the cityName
        displayCitySpan.innerHTML = cityName;
      });
      button.innerHTML = localStorageData[i]; //each button will contain each cityName user searches
      listItem.append(button);
      searchHistoryEl.append(listItem);
    }
  }
}
loadSearchHistory();

function displayTodaysWeather(todaysData) {
  //manipulate dom elements to display them on today's data spans (top container)
  console.log(todaysData);
  currentTempSpan.innerHTML = todaysData.main.temp;
  currentWindSpan.innerHTML = todaysData.wind.speed;
  currentHumiditySpan.innerHTML = todaysData.main.humidity;
  var iconURL = getIconURL(todaysData.weather[0].icon);
  todayIconSpan.innerHTML = `<img src=${iconURL} alt="openweather api icon" />`;
}

function displayDates() {
  var currentDate = dayjs().format("MM/DD/YY");
  var dates = [1, 2, 3, 4, 5]; // array of days after tomorrow for 5-day forecast
  todaysDateSpan.innerHTML = currentDate;
  dates.forEach(function (day) {
    var formattedDay = dayjs().add(day, "day").format("MM/DD/YY");
    var afterTodaySpan = document.querySelector(`#after_current_day_${day}`);
    afterTodaySpan.innerHTML = formattedDay;
  });
}
displayDates();

function getIconURL(icon) {
  var iconURL = "https://openweathermap.org/img/wn/" + icon + ".png";
  return iconURL;
}
