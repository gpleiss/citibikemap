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
      location: [station.longitude, station.latitude]
    };

    var req = restler.get('https://api.flickr.com/services/rest', {
      query: {
        method: 'flickr.places.findByLatLon',
        api_key: process.env.FLICKR_API_KEY,
        format: 'json',
        nojsoncallback: 1,
        lat: station.location[1],
        lon: station.location[0]
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
      var meanCoordSum = function(index) {
        return function meanCoordSum(accum, station) {
          return accum + station.location[index]/stations.length;
        };
      };
      neighborhood.averageLocation = [
        _.reduce(stations, meanCoordSum(0), 0),
        _.reduce(stations, meanCoordSum(1), 0),
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
