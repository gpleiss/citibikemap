var async = require('async');
var restler = require('restler');
var _ = require('lodash');
var fs = require('fs');

var stations = require('../app/data/citibike/stations.json').stationBeanList;
var neighborhoodStationDict = {};

async.each(
  stations,

  function iterator(station, callback) {
    var station = {
      id: station.id,
      latitude: station.latitude,
      longitude: station.longitude,
    };

    var req = restler.get('https://api.flickr.com/services/rest', {
      query: {
        method: 'flickr.places.findByLatLon',
        api_key: process.env.FLICKR_API_KEY,
        format: 'json',
        nojsoncallback: 1,
        lat: station.latitude,
        lon: station.longitude
      }
    });

    req.on('success', function(data) {
      var neighborhood = data.places.place[0].woe_name || 'unknown';

      if (neighborhoodStationDict[neighborhood]) {
        neighborhoodStationDict[neighborhood].stations.push(station);
      } else {
        neighborhoodStationDict[neighborhood] = {
          stations: [station],
        };
      }
      callback();
    });

    req.on('fail', function(err) {
      callback(err);
    });
  }, 

  function callback(err) {
    if (err) console.error(err);

    var neighborhoods = _.map(neighborhoodStationDict, function(props, neighborhoodName) {
      return _.merge(props, { name: neighborhoodName });
    });

    _.each(neighborhoods, function(neighborhood) {
      var stations = neighborhood.stations;
      var meanSum = function(prop) {
        return function meanSum(accum, val) {
          return accum + val[prop]/stations.length;
        };
      };
      neighborhood.averageLocation = [
        _.reduce(stations, meanSum('longitude'), 0),
        _.reduce(stations, meanSum('latitude'), 0),
      ]
    });

    var output = JSON.stringify(neighborhoods, null, 2);
    fs.writeFile('app/data/citibike/stations_by_neighborhood.json', output, function(err) {
      if (err) console.error(err);
      console.log(output);
      console.log('Written to app/data/citibike/stations_by_neighborhood.json');
    });
  }
);
