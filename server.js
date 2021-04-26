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
////park
server.get('/park', getPark);
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
    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
}

function getWeather(req, res) {
  let cityName = req.query.city;
  let key = process.env.WEATHER_API_KEY;
  let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}`;

  superagent
    .get(weatherURL) //send a request locatioIQ API
    .then(wth_Data => {
      let wData = wth_Data.body;
      let weatherStore = wData.data.map(item => {
        return new Weather(item);
      });
      res.send(weatherStore);
    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
}

function getPark(req, res) {
  let cityName = req.query.city;
  let key = process.env.PARKS_API_KEY;
  let parkURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&limit=10&api_key=${key}`;

  superagent
    .get(parkURL) //send a request locatioIQ API
    .then(park_Data => {
      let pData = park_Data.body;
      let parkStore = pData.data.map(item => {
        return new Park(item);
      });
      res.send(parkStore);
    })
    .catch(error => {
      res.send(error);
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
function Park(w_Data) {
  this.name = w_Data.fullName;
  this.address = `${w_Data.addresses[0].line1}, ${w_Data.addresses[0].city}, ${w_Data.addresses[0].stateCode} ${w_Data.addresses[0].postalCode}`;
  this.fee = w_Data.entranceFees[0].cost;
  this.description = w_Data.description;
  this.url = w_Data.url;
}
/*
   "name": "Klondike Gold Rush - Seattle Unit National Historical Park",
     "address": "319 Second Ave S., Seattle, WA 98104",
     "fee": "0.00",
     "description": "Seattle flourished during and after the Klondike Gold Rush. Merchants supplied people from around the world passing through this port city on their way to a remarkable adventure in Alaska. Today, the park is your gateway to learn about the Klondike Gold Rush, explore the area's public lands, and engage with the local community.",
     "url": "https://www.nps.gov/klse/index.htm"
*/
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
