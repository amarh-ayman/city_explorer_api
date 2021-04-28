'use strict';

/*---------------------start server.js---------------------------*/
//Application Depandancies
const express = require('express');
require('dotenv').config(); ///npm i dotenv
const cors = require('cors'); ///npm i cors
const superagent = require('superagent');
const pg = require('pg');
//Application Setup
const server = express();
const PORT = process.env.PORT || 5000;
server.use(cors());
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
}); // client.connect();

//Routes
server.get('/test', testAlive);
/////location
server.get('/location', getLocation);
/////weather
server.get('/weather', getWeather);
////park
server.get('/parks', getPark);

/////sql
server.get('/result', getDataHandler);
////root
server.get('*', errorObject);
//listening to server after connecting with postgress, good way for debugging
client.connect().then(() => {
  server.listen(PORT, () => {
    console.log(`listening to PORT ${PORT}`);
  });
});

/*---------------------start Function Expression------------------------------*/
function testAlive(req, res) {
  res.send('You server is a live');
}

function getLocation(req, res) {
  let cityName = req.query.city;
  let key = process.env.GEOCODE_API_KEY;
  let locURL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`;
  let SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  // let safeValues = [cityName];
  // console.log(client.query(SQL, [cityName]));
  client
    .query(SQL, [cityName])
    .then(result => {
      result.rows.length === 0
        ? superagent
            .get(locURL) //send a request locatioIQ API
            .then(geoData => {
              let gData = geoData.body;
              let locationData = new Location(cityName, gData);
              res.send(locationData);
              // console.log(cityName);
              // console.log('API');
            })
            .catch(error => {
              console.log(error);
              res.send(error);
            })
        : res.send(result.rows);
      // if (result.rows.length !== 0) console.log('DB');
    })
    .catch(error => {
      res.send(error);
    });
}

function getWeather(req, res) {
  let cityName = req.query.search_query;
  let key = process.env.WEATHER_API_KEY;
  let weatherURL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}&days=3`;

  superagent
    .get(weatherURL)
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
  let cityName = req.query.search_query;
  let key = process.env.PARKS_API_KEY;
  let parkURL = `https://developer.nps.gov/api/v1/parks?q=${cityName}&limit=10&api_key=${key}`;

  superagent
    .get(parkURL)
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
  this.searchQquery = cityN;
  this.formattedQuery = locationData[0].display_name;
  this.laTiTude = locationData[0].lat;
  this.loNGiTude = locationData[0].lon;
  //safe values
  let SQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);`;
  let safeValues = [
    this.searchQquery,
    this.formattedQuery,
    this.laTiTude,
    this.loNGiTude,
  ];
  client.query(SQL, safeValues);
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

function errorObject(req, res) {
  let errorObj = {
    status: 500,
    resText: 'Sorry this page not found',
  };
  res.status(500).send(errorObj);
}

/*---------------------End Function Expression------------------------------*/
/*---------DataBase------------------*/

function getDataHandler(req, res) {
  let SQL = `SELECT * FROM locations;`;
  client
    .query(SQL)
    .then(result => {
      res.send(result.rows);
    })
    .catch(error => {
      res.send(error);
    });
}
