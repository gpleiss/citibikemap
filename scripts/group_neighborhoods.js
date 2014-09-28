var _ = require('lodash');
var fs = require('fs');

var neighborhoods = require('../app/data/citibike/stations_by_neighborhood.json');
var groupNeighborhoodDict = require('../app/data/map/neighborhood_groups.json');

var neighborhoodNames1 = _.map(neighborhoods, 'name');
var neighborhoodNames2 = _.flatten(_.values(groupNeighborhoodDict));

// Seeing if we're missing any neighborhoods from groupings
var missingFromNeighborhoodGroups = _.difference(neighborhoodNames1, neighborhoodNames2);
if (!missingFromNeighborhoodGroups.length === 0) {
  throw new Error('Missing ' + missingFromNeighborhoodGroups + ' from neighborhood_gruops.json');
}

var additionalFromNeighborhoodGroups = _.difference(neighborhoodNames2, neighborhoodNames1);
if (!additionalFromNeighborhoodGroups.length === 0) {
  throw new Error(additionalFromNeighborhoodGroups + ' shouldn\'t exist in neighborhood_gruops.json');
}

// Make lookup dict from neighborhoods to stations
var neighborhoodStationsDict = {};
_.each(neighborhoods, function(neighborhood) {
  neighborhoodStationsDict[neighborhood.name] = neighborhood
});

// Create groups of neighborhoods
var groups = _.map(groupNeighborhoodDict, function(groupNeighborhoods, groupName) {
  var stations = _.flatten(_.map(groupNeighborhoods, function(neighborhood) {
    return neighborhoodStationsDict[neighborhood].stations;
  }));

  var meanSum = function(prop) {
    return function meanSum(accum, val) {
      return accum + val[prop]/stations.length;
    };
  };

  return {
    name: groupName,
    averageLocation: [
      _.reduce(stations, meanSum('longitude'), 0),
      _.reduce(stations, meanSum('latitude'), 0),
    ],
    stations: stations,
    neighborhoods: groupNeighborhoods
  };
});

// Save results to file
var output = JSON.stringify(groups, null, 2);
fs.writeFile('app/data/citibike/stations_by_group.json', output, function(err) {
  if (err) console.error(err);
  console.log(output);
  console.log('Written to app/data/citibike/stations_by_group.json');
});
