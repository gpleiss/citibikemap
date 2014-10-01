function mapScale(width, height) {
  return 420 * Math.min(width, height); // Precomputed formula, works for some reason.
}

function negate(num) {
  return -num;
}

var width = $(window).width();
var height = $(window).height();

var svg = d3.select('#map-container').append('svg')
    .attr('width', width)
    .attr('height', height);

var projection = d3.geo.mercator()
  .center([-73.9819486, 40.7242699])
  .scale(mapScale(width, height))
  .translate([(width) / 2, (height)/2])
  .translate([(width) / 2, (height)/2]);

var path = d3.geo.path()
  .projection(projection)
  .pointRadius(1.5);

var g = svg.append('g');

async.map([
  'data/map/nyc.json',
  'data/citibike/stations_by_group.json',
  'data/citibike/trips_histogram.json',
], d3.json, function(error, data) {
  if (error) return console.error(error);

  var mapDataRaw = data[0];
  var neighborhoods = data[1];
  var stations = _.flatten(_.map(neighborhoods, 'stations'));
  var tripsRaw = data[2];

  var mapData = _.filter(mapDataRaw.features, function(feature) {
    return _.contains([1, 3], feature.properties.boroughCode);
  });

  _.each(tripsRaw, function(tripsByNeighborhood, i) {
    var totalNumTrips = _.inject(tripsByNeighborhood, function(sum, numTrips) { return sum + numTrips; }, 0);
    neighborhoods[i].trips = _.map(tripsByNeighborhood, function(tripsToDest, j) {
      return {
        type: "LineString",
        coordinates: [neighborhoods[i].averageLocation, neighborhoods[j].averageLocation],
        percentageOfTrips: tripsToDest/totalNumTrips
      }
    });
  });

  g.append('g')
    .attr('id', 'map-features-container')
    .selectAll('.map-feature')
    .data(mapData)
    .enter()
      .append('path')
      .attr('class', 'map-feature')
      .attr('data-borough', function(d) { return d.properties.boroughCode; })
      .attr('d', path);

  var stationsContainer = g.append('g')
    .attr('id', 'stations-container')

  var stationGroups = stationsContainer.selectAll('station')
    .data(stations)
    .enter()
      .append('g')
      .attr('class', 'station')
      .attr('transform', function(d) { return 'translate(' + projection(d.location) + ')'; });

  stationGroups
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 2);

  var neighborhoodsContainer = g.append('g')
    .attr('id', 'neighborhoods-container');

  var neighborhoodGroups = neighborhoodsContainer.selectAll('neighborhood')
    .data(neighborhoods)
    .enter()
      .append('g')
      .attr('class', 'neighborhood')
      .attr('transform', function(d) { return 'translate(' + projection(d.averageLocation) + ')'; });

  var tripGroups = neighborhoodGroups.append('g')
    .attr('class', 'trips-container hidden')
    .attr('transform', function(d) { return 'translate(' + _.map(projection(d.averageLocation), negate) + ')'; });

  tripGroups.selectAll('trips')
    .data(function(neighborhood) { return neighborhood.trips; })
    .enter()
      .append('path')
      .attr('class', 'trip')
      .attr('stroke-width', function(d) { return d.percentageOfTrips * 50; })
      .attr('d', path);

  neighborhoodGroups
    .append('circle')
    .attr('class', 'neighborhood-marker')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 5);

  neighborhoodGroups
    .append('text')
    .attr('class', 'neighborhood-label')
    .attr('x', 8)
    .attr('dy', 4)
    .text(function(d) { return d.name });

  neighborhoodGroups
    .append('circle')
    .attr('class', 'neighborhood-target')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 15)
    .on('mouseover', function(d) {
      d3.select(this.parentNode).select('g.trips-container')
        .classed('hidden', false);
    })
    .on('mouseout', function(d) {
      d3.select(this.parentNode).select('g.trips-container')
        .classed('hidden', true);
    });
});
