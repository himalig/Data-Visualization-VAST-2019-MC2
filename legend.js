var svg_legends;

var staticsensors = ["Sensor 1", "Sensor 4", "Sensor 6", "Sensor 9", "Sensor 11", "Sensor 12", "Sensor 13", "Sensor 14", "Sensor 15"];

// var sensorIds = [1,  2,  3,  4,  5,  6,  7,  8,  9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25,  26,  27,  28,  29,  30,  31,  32,  33,  34,  35,  36,  37,  38,  39,  40,  41,  42,  43,  44,  45,  46,  47,  48,  49,  50];
document.addEventListener('DOMContentLoaded', function () {
    // Assuming selected_sensors is your source of sensor names
    var sensorNames = sensorIds.map(id => 'Sensor ' + id);
    console.log(sensorNames);
    var mapcolor = d3.scaleOrdinal().domain(sensorNames).range(colorArray);

    var svg_legends = d3.select('#svg_legend');
    // .attr('transform', 'translate(50,100)');

    var chart_title = svg_legends.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", 20)
        .attr("font-size", "20")
        .text('Mobile')
        .attr("transform", "translate(50,25)");

    var legend = svg_legends.append('g')
        .attr('class', 'legend_mapping')
        .attr('transform', 'translate(10,60)');

    var legendItems = legend.selectAll('.legend-item_mapping')
        .data(sensorNames)
        .enter()
        .append('g')
        .attr('class', 'legend-item_mapping')
        .attr('transform', (d, i) => 'translate(' + (i < 25 ? 0 : 80) + ',' + ((i % 25) * 20) + ')'); // Adjusted transform based on the index

    legendItems.append('circle')
        .attr('cx', 9)
        .attr('cy', 9)
        .attr('r', 5)
        .style('fill', d => mapcolor(d));

    legendItems.append('text')
        .attr('x', 25)
        .attr('y', 9)
        .attr('dy', '0.05em')
        .attr("font-size", "10px") 
        .style('text-anchor', 'start')
        .text(d => d);

    var chart_title2 = svg_legends.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 30)
        .attr("y", 560)
        .attr("font-size", "20")
        .text('Static')
        .attr("transform", "translate(50,25)");
        const sensorColor = {
            1: static_colorArray[0],
            4: static_colorArray[1],
            6: static_colorArray[2],
            9: static_colorArray[3],
            11: static_colorArray[4],
            12: static_colorArray[5],
            13: static_colorArray[6],
            14: static_colorArray[7],
            15: static_colorArray[8],
        };
        var legend = svg_legends.append('g')
        .attr('class', 'legend_mapping')
        .attr('transform', 'translate(10,120)');
            var legendItems2 = legend.selectAll('.legend-item_mapping')
            .data(staticsensors)
            .enter()
            .append('g')
            .attr('class', 'legend-item_mapping')
            .attr('transform', (d, i) => 'translate(' + (i < 5 ? 0 : 80) + ',' + (475 + (i % 5) * 20) + ')'); // Adjusted transform based on the index

            legendItems2.append('circle')
            .attr('cx', 9)
            .attr('cy', 9)
            .attr('r', 5)
            .style('fill', function(d){
                return sensorColor[d.split(" ")[1]];
            });

            legendItems2.append('text')
            .attr('x', 25)
            .attr('y', 9)
            .attr('dy', '0.2em')
            .attr("font-size", "10px") 
            .style('text-anchor', 'start')
            .text(d => d);

});
