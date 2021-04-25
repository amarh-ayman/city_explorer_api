'use strict';

const express = require('express');
require('dotenv').config(); ///npm i dotenv

const cors = require('cors'); ///npm i cors
const PORT = process.env.PORT || 3030;

const server = express();

server.use(cors());

server.get('/test', (req, res) => res.send('You server is a live'));

server.get('/location', (req, res) => {
  let geoData = require('./data/location.json');
  let locationData = new Location(geoData);
  res.send(locationData);
  console.log(locationData);
});

function Location(locationData) {
  // this.search_query = 'seattle';
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}
server.get('*', (req, res) => {
  let errorObj = {
    status: 404,
    resText: 'Sorry this page not found',
  };
  res.status(404).send(errorObj);
});
server.listen(PORT, () => {
  console.log(`listening to PORT ${PORT}`);
});
