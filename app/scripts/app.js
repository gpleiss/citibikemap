var width = 700,
    height = 700;

var svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.mercator()
  .center([-73.9819486, 40.7242699])
  .scale(250000)
  .translate([(width) / 2, (height)/2])
  .translate([(width) / 2, (height)/2]);

var path = d3.geo.path()
  .projection(projection)
  .pointRadius(1.5);
var g = svg.append('g');

d3.json("data/map/nyc.json", function(error, mapDataRaw) {
  if (error) return console.error(error);

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

  d3.json("data/citibike/stations.json", function(error, stationsDataRaw) {
    if (error) return console.error(error);

    var stations = _.map(stationsDataRaw.stationBeanList, function(station) {
      return {
        type: "Point",
        coordinates: [station.longitude, station.latitude]
      };
    });

    var stationsContainer = g.append('g')
      .attr('id', 'stations-container')

    var newStationsGroups = stationsContainer.selectAll('stations')
      .data(stations)
      .enter()
        .append('g')
        .attr('class', 'stations')
        .attr("transform", function(d) { return "translate(" + projection(d.coordinates) + ")"; })

    newStationsGroups
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 2);
  });
});
