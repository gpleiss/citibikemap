var width = 700,
    height = 700;

var svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("data/map/nyc.json", function(error, nyc) {
  if (error) return console.error(error);
  console.log(nyc);

  var data = _.filter(nyc.features, function(feature) {
    return _.contains([1, 3], feature.properties.boroughCode);
  });

  var projection = d3.geo.mercator()
    .center([-73.9819486, 40.7242699])
    .scale(250000)
    .translate([(width) / 2, (height)/2])
    .translate([(width) / 2, (height)/2]);

  var path = d3.geo.path()
    .projection(projection);

  var g = svg.append('g');

  g.append('g')
    .attr('id', 'map-features-container')
    .selectAll('.map-feature')
    .data(data)
    .enter()
      .append('path')
      .attr('class', 'map-feature')
      .attr('data-borough', function(d) { return d.properties.boroughCode; })
      .attr('d', path);
});
