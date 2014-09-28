var width = 700,
    height = 700;

var svg = d3.select('#map-container').append('svg')
    .attr('width', width)
    .attr('height', height);

var projection = d3.geo.mercator()
  .center([-73.9819486, 40.7242699])
  .scale(250000)
  .translate([(width) / 2, (height)/2])
  .translate([(width) / 2, (height)/2]);

var path = d3.geo.path()
  .projection(projection)
  .pointRadius(1.5);

var g = svg.append('g');

async.map([
  'data/map/nyc.json',
  'data/citibike/stations_by_group.json'
], d3.json, function(error, data) {
  if (error) return console.error(error);

  var mapDataRaw = data[0];
  var neighborhoods = data[1];
  var stations = _.flatten(_.map(neighborhoods, 'stations'));

  var mapData = _.filter(mapDataRaw.features, function(feature) {
    return _.contains([1, 3], feature.properties.boroughCode);
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

  var neighborhoodsContainer = g.append('g')
    .attr('id', 'neighborhoods-container');

  var neighborhoodGroups = neighborhoodsContainer.selectAll('neighborhood')
    .data(neighborhoods)
    .enter()
      .append('g')
      .attr('class', 'neighborhood')
      .attr('transform', function(d) { return 'translate(' + projection(d.averageLocation) + ')'; });

  neighborhoodGroups
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 5);

  neighborhoodGroups
    .append('text')
    .attr('x', 5)
    .text(function(d) { return d.name });

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
});
