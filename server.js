'use strict';

/*---------------------start server.js---------------------------*/
//Application Depandancies
const express = require('express');
require('dotenv').config(); ///npm i dotenv
const cors = require('cors'); ///npm i cors
const superagent = require('superagent');

//Application Setup
const server = express();
const PORT = process.env.PORT || 3030;
server.use(cors());

//Routes
server.get('/test', testAlive);
/////location
server.get('/location', getLocation);
/////weather
server.get('/weather', getWeather);
server.get('*', errorObject);

//listening to server
server.listen(PORT, listeningPORT);

/*---------------------start Function Expression------------------------------*/
function testAlive(req, res) {
  res.send('You server is a live');
}

function getLocation(req, res) {
  let cityName = req.query.city;
  let key = process.env.GEOCODE_API_KEY;
  let locURL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
  superagent
    .get(locURL) //send a request locatioIQ API
    .then(geoData => {
      let gData = geoData.body;
      let locationData = new Location(cityName, gData);
      res.send(locationData);
      // console.log(geoData);
    });
}

function getWeather(req, res) {
  let cityName = req.query.city;
  let key = process.env.WEATHER_API_KEY;
  let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}`;
  //let wth_Data = require('./data/weather.json');

  superagent
    .get(weatherURL) //send a request locatioIQ API
    .then(wth_Data => {
      let wData = wth_Data.body;
      // console.log(wData);
      let weatherStore = wData.data.map(item => {
        return new Weather(item);
      });
      res.send(weatherStore.slice(0, 8));
    });
}

function Location(cityN, locationData) {
  this.search_query = cityN;
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}

function Weather(w_Data) {
  this.forecast = w_Data.weather.description;
  this.time = new Date(w_Data.valid_date).toString().slice(0, 16);
}

function errorObject(req, res) {
  let errorObj = {
    status: 500,
    resText: 'Sorry this page not found',
  };
  res.status(500).send(errorObj);
}

function listeningPORT() {
  console.log(`listening to PORT ${PORT}`);
}

/*---------------------End Function Expression------------------------------*/
