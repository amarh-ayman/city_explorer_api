'use strict';

const express = require('express');
require('dotenv').config(); ///npm i dotenv

const cors = require('cors'); ///npm i cors

const server = express();
const PORT = process.env.PORT || 3030;

server.use(cors());

server.get('/test', (req, res) => res.send('You server is a live'));
/////location
server.get('/location', (req, res) => {
  let geoData = require('./data/location.json');
  let locationData = new Location(geoData);
  res.send(locationData);
  // console.log(locationData);
});

function Location(locationData) {
  this.search_query = 'Lynnwood';
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}
/////weather
server.get('/weather', (req, res) => {
  let wth_Data = require('./data/weather.json');
  let weatherStore = [];
  wth_Data.data.forEach(item => {
    let weatherData = new Weather(item);
    weatherStore.push(weatherData);
  });
  res.send(weatherStore);

  // console.log(locationData);
});
function Weather(w_Data) {
  this.forecast = w_Data.weather.description;
  this.time = w_Data.datetime;
}

server.get('*', (req, res) => {
  let errorObj = {
    status: 500,
    resText: 'Sorry this page not found',
  };
  res.status(500).send(errorObj);
});
server.listen(PORT, () => {
  console.log(`listening to PORT ${PORT}`);
});
