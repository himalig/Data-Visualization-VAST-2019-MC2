// global variables
const layout = {
    mapPos: [300, 300],
}
var svg_chart1;
var slider_chart1;
var currTime_chart1;
var timeFormat_chart1;
// const projection_chart1 = d3.geoMercator().center([-119.8558755, 0.1192925]).scale(110000).translate(layout.mapPos);
var projection_chart1;
var tooltip_chart1;
var info1_chart1;
var info2_chart1;
var playButton_chart1;
var startTime_chart1;
var endTime_chart1;
// const label1 = svg_chart1.append('text').text('Static Sensor').attr('transform', 'translate(490, 50)');
// const label2 = svg_chart1.append('text').text('Mobile Sensor').attr('transform', 'translate(490, 80)');
// const symbolCircle1 = svg_chart1.append('circle').attr('r', 10).attr('cx', 470).attr('cy', 45).attr('fill', 'red');
// const symbolCircle2 = svg_chart1.append('circle').attr('r', 10).attr('cx', 470).attr('cy', 75).attr('fill', 'black');
var ctrl_chart1 = 0;
// var selectedRegions_chart1 = new Set();
var colorArray_chart1 = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

var sensorIds_chart1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

var color_sensor = d3.scaleOrdinal()
    .domain(sensorIds_chart1)
    .range(d3.schemeCategory10);



function area(poly){
    var s = 0.0;
    var ring = poly.coordinates[0][0];
    // console.log('s',ring.length);
    for(i= 0; i < (ring.length-1); i++){
        s += ((ring[i][0]) * (ring[i+1][1]) - (ring[i+1][0]) * (ring[i][1]));
    }

    return 0.5 *s;
    }
function centroid(poly){
    var c = [0,0];
    var ring = poly.coordinates[0][0];

    for(i= 0; i < (ring.length-1); i++){
        c[0] += (ring[i][0] + ring[i+1][0]) * (ring[i][0]*ring[i+1][1] - ring[i+1][0]*ring[i][1]);
        c[1] += (ring[i][1] + ring[i+1][1]) * (ring[i][0]*ring[i+1][1] - ring[i+1][0]*ring[i][1]);
    }
    var a = area(poly);
    // console.log(a);
    c[0] /= a *6;
    c[1] /= a*6;
    return c;
    }



document.addEventListener('DOMContentLoaded', function () {

    

    slider_chart1 = d3.select('#slider_chart1').style('width', layout.sliderLen * 0.8 +'px');
    currTime_chart1 = d3.select('#current_time');
    timeFormat_chart1 = d3.timeFormat("%Y-%m-%d %H:%M:%S");
    // const projection_chart1 = d3.geoMercator().center([-119.8558755, 0.1192925]).scale(110000).translate(layout.mapPos);
    projection_chart1 = d3.geoMercator().center([-119.8558755, 0.1192925]).scale(122000).translate(layout.mapPos);
    tooltip_chart1 = d3.select(".tooltip");
    tooltip_chart1 = d3.select("body").append('div')
    .attr('class','tooltip')
    .style('opacity',0);
    info1_chart1 = d3.select("#line1_chart1");
    info2_chart1 = d3.select("#line2_chart1");
    playButton_chart1 = d3.select('#play_button_chart1');
    startTime_chart1 = new Date('2020-04-06 00:00:00');
    endTime_chart1 = new Date('2020-04-10 23:59:45');
    // const label1 = svg_chart1.append('text').text('Static Sensor').attr('transform', 'translate(490, 50)');
    // const label2 = svg_chart1.append('text').text('Mobile Sensor').attr('transform', 'translate(490, 80)');
    // const symbolCircle1 = svg_chart1.append('circle').attr('r', 10).attr('cx', 470).attr('cy', 45).attr('fill', 'red');
    // const symbolCircle2 = svg_chart1.append('circle').attr('r', 10).attr('cx', 470).attr('cy', 75).attr('fill', 'black');
    ctrl_chart1 = 0;
    selectedRegions_chart1 = new Set();
    colorArray_chart1 = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
        '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
        '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
        '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
        '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

    sensorIds_chart1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

    color_sensor = d3.scaleOrdinal()
        .domain(sensorIds_chart1)
        .range(d3.schemeCategory10);


    svg_chart1 = d3.select('#chart1');
    d3.json('data/StHimark.geojson').then(function (data) {

    console.log(data);
    const color_map = d3.scaleOrdinal([0, data.features.length - 1], d3.schemeSet3);
    // projection_chart1= d3.geoEquirectangular().fitSize([500, 500], data);;

    var path = d3.geoPath().projection(projection_chart1);
    // console.log(svg_chart1);
    svg_chart1.selectAll('.path_w')
        .data(data.features)
        .enter().append('path')
        .attr('class','path_w')
        .attr('d', path)
        // .attr('fill', (d, i) => {console.log(i); return color_map(i)})
        .attr('fill','lightgrey')
        .attr('opacity',0.5)
        .attr('stroke', 'black')
        .on("click", function (e, d) {
            // console.log("sdkjk",d);
            if (!targetNbrhood.includes(d.properties['Nbrhood'])) {
                d3.select(this).attr('fill', "blue");
                targetNbrhood.push(d.properties['Nbrhood']);
                console.log(targetNbrhood);
            }
            else{
                d3.select(this).attr('fill','lightgrey')
                .attr('opacity',0.5);
                targetNbrhood=targetNbrhood.filter(obj => obj !== d.properties['Nbrhood']);
            }
            syncwithmap(d.properties['Nbrhood']);
            draw(targetNbrhood);

        })
        // console.log(data.features)
        svg_chart1.selectAll('state_name')
        .data(data.features)
        .enter().append("text")
        .attr("class", "state_name")
        .attr("x", function(d) {  
            // console.log('x',projection_chart1(centroid(d.geometry)));
            return projection_chart1(centroid(d.geometry))[0]; })
        .attr("y", function(d) { return projection_chart1(centroid(d.geometry))[1]; })
        .attr("text-anchor","middle")
        .attr('font-size',8)
        .text(function(d) { return d.properties.Nbrhood; })
        // svg_linechart = d3.select('#svg_timeseries').append("g");

    var chart_title =svg_chart1.append("text")
        .attr("text-anchor","end")
        .attr("x",620/2)
        .attr("y",0)
        .attr("font-size","22")
        .text('Point Map')
        .attr("transform", "translate("+(leftMargin-30)+",+"+ (35)+ ")")
    
        var chart_desc = svg_chart1.append("text")
        .attr("text-anchor","end")
        .attr("x",620/2)
        .attr("y",0)
        .attr("font-size","10")
        .text('Shows the cpm value of mobile and static sensors. Marks - Area, Points. Channels - Radius, Color hue, (lat,long) position.')
        .attr("transform", "translate("+330+",+"+ (55)+ ")")


        var stypes = [
            { 'color': 'red', 'name': 'Mobile Sensor' },
            { 'color': 'steelblue', 'name': 'Static Sensor' }
        ];
        
        var legendItems_chart1 = svg_chart1.selectAll('.legend-item')
            .data(stypes)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => 'translate(' + 550 + ',' + (70 + i * 20) + ')');
        
        legendItems_chart1.append('rect')
            .attr('width', 11)
            .attr('height', 11)
            .style('fill', d => d.color);
        
        legendItems_chart1.append('text')
            .attr('x', 15)
            .attr('y', 8)
            .attr('dy', '.2em')
            .style('font-size', 11)
            .style('text-anchor', 'start')
            .text(d => d.name);

    Promise.all([d3.csv('data/wenhao_data/staticData_chart1.csv'),
    d3.csv('data/wenhao_data/mobileData_chart1.csv'),
    d3.csv('data/himali_data/StaticSensorLocations.csv')]).then(function (value) {
            staticSensor_chart1 = value[0];
            mobileSensor_chart1 = value[1];
            staticLocation_chart1 = value[2];

   

            console.log('All Data Loaded!');


            // slider event 
            slider_chart1.on('input', function (e) {
                // get current selected 10 min interval's data
                let curValue = Number.parseInt(slider_chart1.property('value'));
                let intervalStart = new Date(startTime_chart1.getTime() + (curValue * 10 * 60 * 1000));
                // let intervalEnd = new Date(startTime_chart1.getTime() + ((curValue + 1) * 10 * 60 * 1000));
                currTime_chart1.text(timeFormat_chart1(intervalStart));

                let staticMean = staticSensor_chart1.filter(d => new Date(d['Timestamp']).getTime() == intervalStart.getTime());
                let mobileMean = mobileSensor_chart1.filter(d => new Date(d['Timestamp']).getTime() == intervalStart.getTime());

                drawBubbles(staticMean, mobileMean);
            });

            // trigger slider event in the beginning
            slider_chart1.dispatch('input');
        });
        
});


});

function valueScale(value) {
    if (value <= 10) return 5;
    else if (value > 10 && value <= 30) return 7;
    else if (value > 30 && value <= 60) return 12;
    else if (value > 60 && value <= 200) return 17;
    else return 25;
}

function drawBubbles(staticMean, mobileMean) {
    // match sensor_id and lat and long for static data
    for (const sensor of staticMean) {
        let temp = staticLocation_chart1.filter(d => sensor['Sensor-id'] == d['Sensor-id'])[0];
        sensor['position'] = [temp['Long'], temp['Lat']];
    }

    // var gQuakes = svg.append('g')
    //              .attr('id', 'all-quakes');

    var sc_group = svg_chart1.selectAll('g')
       .data(staticMean, d => d['Sensor-id'])
       .enter().append('g')
    //    .attr('id', function(d) {
    //        return d['Sensor-id'];
    //    })
       .attr('class', 'sc-group');

    svg_chart1.selectAll('.sc-group')
       .append('circle')
       .attr('class', 'circle pulse-circle')
       .attr('cx', function(d) {
           return projection_chart1(d.position)[0];
       })
       .attr('cy', function(d) {
           return projection_chart1(d.position)[1];
       })
       .attr('r', function(d) {
           return 0;
       })
       .attr('fill', 'black');

       svg_chart1.selectAll('.sc-group')
       .append('circle')
       .attr('cx', function(d) {
            return projection_chart1(d.position)[0];
        })
       .attr('cy', function(d) {
            return projection_chart1(d.position)[1];
        })
        .attr('r', function(d) {
            return valueScale(d['Value'])*.5;
          })
       .attr('class', 'circle quake-circle')
       .style('fill', 'red')
       .style('opacity', 0.75)
       .append('title')
       .text(function(d) {
         return 'Magnitue ';
       });
 

       var pulseCircles = svg_chart1.selectAll('.pulse-circle')
       .data(staticMean, d => d['Sensor-id'])
       .transition()
       .delay(function(d,i) {
         return i*20;
       })
       .duration(1000)
       .attr('r', function(d) {
         return valueScale(d['Value'])*2;
       })
       .style('opacity', 0)
       .remove();

    // svg_chart1.selectAll('.staticCircles')
    //     .data(staticMean, d => d['Sensor-id'])
    //     .join(
    //         enter => enter.append('circle')
    //             .attr('class', 'staticCircles')
    //             .attr('r', d => valueScale(d['Value']))
    //             .attr('cx', d => projection_chart1(d.position)[0])
    //             .attr('cy', d => projection_chart1(d.position)[1])
    //             .attr('fill', 'black'),

    //         update => update.transition().duration(500)
    //             .attr('r', d => valueScale(d['Value']))
    //             .attr('cx', d => projection_chart1(d.position)[0])
    //             .attr('cy', d => projection_chart1(d.position)[1])
    //             .attr('fill', 'black'),

    //         exit => exit.remove()
    //     )

    svg_chart1.selectAll('.mobileCircles')
        .data(mobileMean, d => d['Sensor-id'])
        .join(
            enter => enter.append('circle')
                .attr('class', 'mobileCircles')
                .attr('r', d => valueScale(parseFloat(d['Value'])))
                .attr('cx', d => projection_chart1([d['Long'], d['Lat']])[0])
                .attr('cy', d => projection_chart1([d['Long'], d['Lat']])[1])
                .attr('fill','steelblue')
                .attr('opacity',0.75),

            update => update.transition().duration(500)
                .attr('r', d => valueScale(parseFloat(d['Value'])))
                .attr('cx', d => projection_chart1([d['Long'], d['Lat']])[0])
                .attr('cy', d => projection_chart1([d['Long'], d['Lat']])[1])
                .attr('fill','steelblue')
                .attr('opacity',0.75),

            exit => exit.remove()
        );

    // tooltip display 
    d3.selectAll("circle").on("mousemove", function (e, d) {
        tooltip_chart1.style("opacity", "1");
        tooltip_chart1.style("left", (e.pageX + "px")).style("top", (e.pageY + "px"));
    });

    d3.selectAll("circle").on("mouseout", function () {
        tooltip_chart1.transition().duration(200).style("opacity", "0");
    });

    d3.selectAll("circle").on("mouseover", function (e, d) {
        tooltip_chart1.transition().duration(200).style("opacity", "1");
        tooltip_chart1.html("Sensor Id: " + d["Sensor-id"] + "<br/>"+"Radiation Value: "+ Math.floor(d['Value'] * 100) / 100);
        // info1_chart1.text("Sensor Id: " + d['Sensor-id']);
        // info2_chart1.text("radiation value: " + d['Value']);
    });

    playButton_chart1.on('click', event => {
        if (playButton_chart1.property('value') == 'PLAY') {
            playButton_chart1.property('value', 'PAUSE');

            intervalId = setInterval(draw, 2000);

            function draw() {
                let curValue = Number.parseInt(slider_chart1.property('value'));
                let curTime = new Date(startTime_chart1.getTime() + (curValue * 10 * 60 * 1000));
                if (curTime <= new Date('2020-04-10 23:50:00')) {
                    slider_chart1.property('value', (curValue + 1).toString());
                    slider_chart1.dispatch('input');
                }
                else {
                    clearInterval(intervalId);
                }
            }
        }
        else {
            playButton_chart1.property('value', 'PLAY');
            clearInterval(intervalId);
        }
    });
}
function syncwithpoint(neighborhood){
        d3.selectAll('.path_w')
            .attr('fill',  function (d) {
                console.log(d);
                if (targetNbrhood.includes(neighborhood) && targetNbrhood.includes(d.properties['Nbrhood'])){
                            console.log("df",targetNbrhood);
                            return "blue";
                }
                else if (targetNbrhood.includes(d.properties['Nbrhood'])) {

                return "blue"; 
                }
                return "lightgrey"
            })
            .attr('opacity',0.5);
    }


