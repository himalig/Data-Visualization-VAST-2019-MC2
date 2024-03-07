var himark;
var path;
var svg_choro;
var projection;
var targetNbrhood=[];
var mapmargin = { top: 20, right: 20, bottom: 20, left: 20 },
    mapwidth = 620 - mapmargin.left - mapmargin.right,
    mapheight = 700 - mapmargin.top - mapmargin.bottom;
var iconSize = [30, 30];
var startTime = new Date("2020-04-06 06:00:00").getTime();
var endTime = new Date("2020-04-06 07:00:59").getTime();
var sensorData;
var sensorData_6,sensorData_7,sensorData_8,sensorData_9,sensorData_10;
var mapdata = [];
var avgdata=[];
var mapcolor,colorRegion;
var sortByTime = function (a, b) { return new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime() };
var svg_choro_legend;
var avgValues = {
    'Broadview': 0,
    'Chapparal': 0,
    'Cheddarford': 0,
    'Downtown': 0,
    'East Parton': 0,
    'Easton': 0,
    'Northwest': 0,
    'Oak Willow': 0,
    'Old Town': 0,
    'Palace Hills': 0,
    'Pepper Mill': 0,
    'Safe Town': 0,
    'Scenic Vista': 0,
    'Southton': 0,
    'Southwest': 0,
    'Terrapin Springs': 0,
    'West Parton': 0,
    'Weston': 0,
    'Wilson Forest': 0
  };
  
var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
var selected_sensors = [];
var date;

var sensorIds = [1,  2,  3,  4,  5,  6,  7,  8,  9,  10,  11,  12,  13,  14,  15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25,  26,  27,  28,  29,  30,  31,  32,  33,  34,  35,  36,  37,  38,  39,  40,  41,  42,  43,  44,  45,  46,  47,  48,  49,  50];
var plotData = {};
var timeMinMax = { 'min': new Date('2020-04-06 00:00:00'), 'max': new Date('2020-04-10 23:59:59') };
var xScale;
var drag;
var hospitalList = [
    { latitude: 0.180960, longitude: -119.959400 },
    { latitude: 0.153120, longitude: -119.915900 },
    { latitude: 0.151090, longitude: -119.909520 },
    { latitude: 0.121800, longitude: -119.904300 },
    { latitude: 0.134560, longitude: -119.883420 },
    { latitude: 0.182990, longitude: -119.855580 },
    { latitude: 0.041470, longitude: -119.828610 },
    { latitude: 0.065250, longitude: -119.744800 }
  ];
var nuclearList=[{ latitude: 0.162679, longitude: -119.784825 }]

document.addEventListener('DOMContentLoaded', function () {
        // Promise.all([d3.json('data/StHimark.geojson'), d3.csv('data/mobileSensor_6.csv'), d3.csv('data/mobileSensor_7.csv'), d3.csv('data/mobileSensor_8.csv'), d3.csv('data/mobileSensor_9.csv'), d3.csv('data/mobileSensor_10.csv')]).then(function (values) {
    // colorRegion = d3.scaleSequential(d3.interpolateViridis)
    //         .domain([d3.min(staticsensorData, d => +d.Value), d3.max(staticsensorData, d => +d.Value)]);
    
  
    Promise.all([d3.json('data/himali_data/StHimark.geojson'), d3.csv('data/himali_data/mobileSensor_6.csv')]).then(function (values) {
        
        himark = values[0];
        sensorData=values[1];
        document.getElementById('play-pause-button').addEventListener('click', timelapse);
        mapcolor = d3.scaleOrdinal().domain(sensorIds).range(colorArray);
        svg_choro = d3.select('#svg_choro');
        date = new Date(document.getElementById('datepicker').value);
        date = new Date(+date + date.getTimezoneOffset() * 60000);
        document.getElementById('play-pause-button').addEventListener('click', timelapse);
        var starttime = document.getElementById('start').value;
        var endtime = document.getElementById('end').value;
        // console.log(starttime);

        // // Adjust timezone for start and end times
        // startTime = new Date(starttime.getTime() + date.getTimezoneOffset() * 60000);
        // endTime = new Date(endtime.getTime() + date.getTimezoneOffset() * 60000);
        
        // console.log(starttime);
        drag = d3.drag();

        projection = d3.geoEquirectangular()
            .fitSize([mapwidth-50, mapheight], himark);

        path = d3.geoPath().projection(projection);
        // console.log(sensorData);
        plotHimark();
        var chart_title =svg_choro.append("text")
            .attr("text-anchor","end")
            .attr("x",mapwidth/2)
            .attr("y",0)
            .attr("font-size","22")
            .text('Innovative Choropleth Map')
            .attr("transform", "translate("+mapwidth/4+",35)");

        var chart_desc = svg_choro.append("text")
            .attr("text-anchor", "end")
            .attr("x", mapwidth / 2)
            .attr("y", 0)
            .attr("font-size", 10)
            .attr("transform", "translate(" + 280 + "," + 45 + ")");
        
            chart_desc.append("tspan")
                .text("Shows average cpm values in all regions and the path of mobile sensors in selected region. Marks - Area, Line.")
                .attr("x", mapwidth / 2)
                .attr("dy", 10); 
            chart_desc.append("tspan")
                .text("Channels - Luminance, Color hue, Length, (lat,long) position.")
                .attr("x", 140)
                .attr("dy", 10);
        
        svg_choro.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', mapwidth / 2)
            .attr('y', mapheight-40)  
            .style('text-anchor', 'middle')  
            .text('Hour of the day')
            .style('fill', 'dark grey');

    })
    // lumScaledisplay();
})

function plotHimark() {
   
    svg_choro.selectAll('.himark')
        .data(himark.features)
        .join('path')
        .attr('class', 'himark')
        .attr('d', path)
        .attr('height', mapheight)
        .attr('width', mapwidth)
        // .attr('fill', 'white')
        .attr('stroke', 'grey')
        .attr('stroke-width', '2px')
        .style('opacity', 0.5)
        .attr('transform', 'translate(' + mapmargin.left + ', 0)') 
        // .attr('fill', function(d) {
        //     var region = d.properties['Nbrhood'];
        //     // var averageValue = calculateAverageValue(region);
        //     return colorScale(averageValue);
        //   })
        .on("click", function (event, d) {
            var clickedNbrhood = d.properties['Nbrhood'];
            // console.log(targetNbrhood);
            var flag=true;
            if (targetNbrhood.includes(clickedNbrhood)) {
                flag=false;
                d3.select(this).attr("fill", "white");
                targetNbrhood=targetNbrhood.filter(obj => obj !== clickedNbrhood);        
            } 
            else {
                targetNbrhood.push(clickedNbrhood);
                // d3.select(this).attr("fill", "black");
            }
            // console.log("hj");
            timeOnChange();
            
            calculateAverageValue();
            colorRegion = d3.scaleSequential(d3.interpolateBlues)
                .domain([d3.min(Object.values(avgValues)), d3.max(Object.values(avgValues))]);
            // console.log(targetNbrhood);
            d3.selectAll('.himark')
                .style('fill', function (d) {
                var neighborhood = d.properties['Nbrhood']; 
                var avg = avgValues[neighborhood];

                if (targetNbrhood.includes(neighborhood)){
                    return "black";
                }
                // console.log('Neighborhood:', neighborhood, 'Average:', avg, colorRegion(avg)); 
                return avg ? colorRegion(avg) : colorRegion(10); 
                });
            syncwithpoint(clickedNbrhood);
            updateData();
            draw(targetNbrhood);
            checkbox_func(selected_sensors);
            plotPath();
          })
    calculateAverageValue();
    colorRegion = d3.scaleSequential(d3.interpolateBlues)
        .domain([d3.min(Object.values(avgValues)), d3.max(Object.values(avgValues))]);
    d3.selectAll('.himark')
        .style('fill', function (d) {
        var neighborhood = d.properties['Nbrhood']; 
        var avg = avgValues[neighborhood];
        // console.log('Neighborhood:', neighborhood, 'Average:', avg, colorRegion(avg)); 
        if (targetNbrhood.includes(neighborhood)){
            // console.log("sdfedfref");
            return "black";

        }
        return avg ? colorRegion(avg) : colorRegion(10); 
        });
        
    xScale = d3.scaleLinear()
        .domain([0, 24])
        .range([mapmargin.left, mapwidth]);

    var xAxis = d3.axisBottom()
        .scale(xScale);

    svg_choro.append('g')
    .attr('transform', 'translate(' + 0 + ',' + (mapheight-80) + ')')
    .attr('stroke-width', 2)
        .style('font-size', '15px')
        .call(xAxis)
        .selectAll('path') // Select the path element of the axis
        .style('stroke', 'grey');
    svg_choro.selectAll('.tick text')
        .style('fill', 'grey');

    svg_choro.selectAll('.hospital')
            .data(hospitalList)
            .enter()
            .append('image')
            .attr('xlink:href', 'data/himali_data/hospital.svg')
            .attr('class', 'hospital')
            .attr('width', iconSize[0])
            .attr('height', iconSize[1])
            .attr("transform", function(d) {
              return "translate(" + projection([d.longitude, d.latitude]) + ")";
            })          
            .attr('opacity', 0.75);        
    svg_choro.selectAll('.nuclearplant')
          .data(nuclearList)
          .enter()
          .append('image')
          .attr('xlink:href', 'data/himali_data/Nuclear_plant.png')
          .attr('class', 'nuclearplant')
          
          .attr('width', iconSize[0])
          .attr('height', iconSize[1])
          .attr("transform", function(d) {
            return "translate(" + projection([d.longitude, d.latitude]) + ")";
          })
          .attr('opacity', 0.75);
    svg_choro.selectAll('state_name_map')
          .data(himark.features)
          .enter().append("text")
          .attr("class", "state_name_map")
          .attr("x", function(d) {  
              // console.log('x',projection_chart1(centroid(d.geometry)));
              return projection(centroid(d.geometry))[0]+20; })
          .attr("y", function(d) { return projection(centroid(d.geometry))[1]; })
          .attr("text-anchor","middle")
          .attr('font-size',8)
          .text(function(d) { return d.properties.Nbrhood; })
}


function plotPath() {

    var sensorNames = selected_sensors.map(id => 'Sensor ' + id);
    svg_choro.selectAll('.timeline').remove();
    svg_choro.selectAll('.path')
        .data(mapdata)
        .join(
            function (enter) {
                return enter
                    .append('rect');
            }
        )
        .attr('class', 'path')
        // .attr('cx', d => projection([+d.Long, +d.Lat])[0] + mapmargin.left)
        // .attr('cy', d => projection([+d.Long, +d.Lat])[1])
        // .attr('r',4)
        .attr('x', d => projection([+d.Long, +d.Lat])[0] + mapmargin.left - 2) // Adjust x position for centering
        .attr('y', d => projection([+d.Long, +d.Lat])[1] - 2) // Adjust y position for centering
        .attr('width', 4) // Width of the rectangle
        .attr('height', 4) // Height of the rectangle

        .style('fill', (d => mapcolor(d['Sensor-id'])))
        .style('opacity', 1)
        .call(drag)

    svg_choro.selectAll('.timeline').remove();
    svg_choro.selectAll('.timeline')
        .data(Object.entries(timeMinMax))
        .enter()
        .append('line')
        .attr('class', 'timeline')
        .attr('id', d => 'timeline' + d[0])
        .attr('x1', d => xScale(+d[1].getHours() + d[1].getMinutes() / 60)  )
        .attr('y1', mapheight -90)
        .attr('x2', d => xScale(+d[1].getHours() + d[1].getMinutes() / 60) )
        .attr('y2', mapheight -70)
        .attr('stroke', '#007bff')
        .attr('stroke-width', '5px')
   
            
    
    // svg_choro.selectAll('.himark.fill-region')
    //     .attr('fill', 'red');

}
function calculateAverageValue() {
    // console.log(startTime);
    // console.log(sensorData);
    // console.log(endTime)
    avgdata=[];
    avgdata = Array.from(
        sensorData.filter(d =>
          new Date(d['Timestamp']).getTime() >= startTime &&
          new Date(d['Timestamp']).getTime() <= endTime
        )
    );
    console.log(avgdata);
    var groupByNbrhood = {};
    avgdata.forEach((d) => {
      var nbrhood = d['Nbrhood'];
      var value = parseFloat(d['Value']);
    
      if (!isNaN(value)) {
        if (!groupByNbrhood[nbrhood]) {
          groupByNbrhood[nbrhood] = { sum: 0, count: 0 };
        }
    
        groupByNbrhood[nbrhood].sum += value;
        groupByNbrhood[nbrhood].count++;
      }
    });
    
    for (var nbrhood in groupByNbrhood) {
      if (groupByNbrhood.hasOwnProperty(nbrhood)) {
        var avg = groupByNbrhood[nbrhood].sum / groupByNbrhood[nbrhood].count;
        avgValues[nbrhood] = avg || 0; // Set to 0 if avg is undefined
      }
    }   
}
function updateData() {
    console.log(targetNbrhood);
    console.log(avgdata);
    mapdata = [];
    mapdata = Array.from(
        avgdata.filter(d =>
          targetNbrhood.includes(d["Nbrhood"]) 
        )
      );
    console.log(mapdata);
    selected_sensors = Array.from(new Set(mapdata.map((sensor) => sensor["Sensor-id"])));
    mapdata = Array.from(
        sensorData.filter(d =>
          selected_sensors.includes(d["Sensor-id"]) &&
          new Date(d.Timestamp).getTime() >= startTime &&
          new Date(d.Timestamp).getTime() <= endTime
        )
      );
    console.log(selected_sensors);

    Object.entries(plotData).map(pd => {
        pd[1].map(item => {
            mapdata.push(item);
        });
    });
    mapdata.sort(sortByTime);

    if (selected_sensors.length != 0) {
        timeMinMax.min = new Date(mapdata[0]['Timestamp'])
        timeMinMax.max = new Date(mapdata[mapdata.length - 1]['Timestamp']);
    }
    plotPath();
}

function timelapse() {
    svg_choro.selectAll('#timelinemin')
        .transition()
        .duration(mapdata.length * 5 + 500)
        .ease(d3.easeLinear)
        .attr('x1', xScale(+timeMinMax.max.getHours() + timeMinMax.max.getMinutes() / 60) )
        .attr('y1', mapheight -90)
        .attr('x2', xScale(+timeMinMax.max.getHours() + timeMinMax.max.getMinutes() / 60)  )
        .attr('y2', mapheight -70)
        .attr('stroke', '#007bff')
        .attr('stroke-width', '5px')
        .on('end', (d, i) => {
            svg_choro.selectAll('#timelinemin')
                .attr('x1', xScale(+timeMinMax.min.getHours() + timeMinMax.min.getMinutes() / 60) )
                .attr('y1', mapheight -90)
                .attr('x2', xScale(+timeMinMax.min.getHours() + timeMinMax.min.getMinutes() / 60) )
                .attr('y2', mapheight -70)
                .attr('stroke', '#007bff')
                .attr('stroke-width', '5px')
        })

    svg_choro.selectAll('.path').remove();
    console.log(mapdata);  
  
    svg_choro.selectAll('.path')
        .data(mapdata)
        .join(
            function (enter) {
                return enter
                    .append('rect')
                    .style('opacity', 0)
                    .style('fill', 'white');
            }           
        )
        .attr('class', 'path')
        // .attr('cx', d => projection([+d.Long, +d.Lat])[0] + mapmargin.left)
        // .attr('cy', d => projection([+d.Long, +d.Lat])[1])
        // .attr('r', 4)
        .attr('x', d => projection([+d.Long, +d.Lat])[0] + mapmargin.left - 2) // Adjust x position for centering
        .attr('y', d => projection([+d.Long, +d.Lat])[1] - 2) // Adjust y position for centering
        .attr('width', 4) // Width of the rectangle
        .attr('height', 4) // Height of the rectangle

        .transition()
        .duration(1000)
        .delay(function (d, i) {
            return i * 5;
        })
        .style('opacity', 1)
        .style('fill', (d => mapcolor(d["Sensor-id"])));


}

function timeOnChange() {
    var starttime = document.getElementById('start').value;
    startTime=new Date(date)
    startTime.setHours(starttime.split(":")[0]);
    startTime.setMinutes(starttime.split(":")[1]);
    endTime=new Date(date)
    var endtime = document.getElementById('end').value;
    endTime.setHours(endtime.split(":")[0]);
    endTime.setMinutes(endtime.split(":")[1]);
    prepareData();
}
function dateOnChange(input) {
    date = new Date(input.value);
    date = new Date(+date + date.getTimezoneOffset() * 60000);
    console.log(date.getDate());
    timeOnChange();
    prepareData();
    
    
}
function prepareData()
{
    data=[];
    mapdata = [];
    plotData = {};
    if(date.getDate()==6){
        d3.csv('data/himali_data/mobileSensor_6.csv').then(function(senData) {
            sensorData=senData;
            calculateAverageValue();
            colorRegion = d3.scaleSequential(d3.interpolateBlues)
                .domain([d3.min(Object.values(avgValues)), d3.max(Object.values(avgValues))]);
            d3.selectAll('.himark')
                .style('fill', function (d) {
                var neighborhood = d.properties['Nbrhood']; 
                var avg = avgValues[neighborhood];
                // console.log('Neighborhood:', neighborhood, 'Average:', avg, colorRegion(avg)); 
                if (targetNbrhood.includes(neighborhood)){
                    // console.log("sdfedfref");
                    return "black";

                }
                return avg ? colorRegion(avg) : colorRegion(10); 
                });
            updateData();
        });   
    }
    else if(date.getDate()==7){
        d3.csv('data/himali_data/mobileSensor_7.csv').then(function(senData) {
            sensorData=senData;
            calculateAverageValue();
            colorRegion = d3.scaleSequential(d3.interpolateBlues)
                .domain([d3.min(Object.values(avgValues)), d3.max(Object.values(avgValues))]);
            d3.selectAll('.himark')
                .style('fill', function (d) {
                var neighborhood = d.properties['Nbrhood']; 
                var avg = avgValues[neighborhood];
                // console.log('Neighborhood:', neighborhood, 'Average:', avg, colorRegion(avg)); 
                if (targetNbrhood.includes(neighborhood)){
                    // console.log("sdfedfref");
                    return "black";

                }
                return avg ? colorRegion(avg) : colorRegion(10); 
                });
            updateData();
        });
    }
    else if(date.getDate()==8){
        d3.csv('data/himali_data/mobileSensor_8.csv').then(function(senData) {
            sensorData=senData;
            calculateAverageValue();
            colorRegion = d3.scaleSequential(d3.interpolateBlues)
                .domain([d3.min(Object.values(avgValues)), d3.max(Object.values(avgValues))]);
            d3.selectAll('.himark')
                .style('fill', function (d) {
                var neighborhood = d.properties['Nbrhood']; 
                var avg = avgValues[neighborhood];
                // console.log('Neighborhood:', neighborhood, 'Average:', avg, colorRegion(avg)); 
                if (targetNbrhood.includes(neighborhood)){
                    // console.log("sdfedfref");
                    return "black";

                }
                return avg ? colorRegion(avg) : colorRegion(10); 
                });
            updateData();
        });   
    }
    else if(date.getDate()==9){
        d3.csv('data/himali_data/mobileSensor_9.csv').then(function(senData) {
            sensorData=senData;
            calculateAverageValue();
            colorRegion = d3.scaleSequential(d3.interpolateBlues)
                .domain([d3.min(Object.values(avgValues)), d3.max(Object.values(avgValues))]);
            d3.selectAll('.himark')
                .style('fill', function (d) {
                var neighborhood = d.properties['Nbrhood']; 
                var avg = avgValues[neighborhood];
                // console.log('Neighborhood:', neighborhood, 'Average:', avg, colorRegion(avg)); 
                if (targetNbrhood.includes(neighborhood)){
                    // console.log("sdfedfref");
                    return "black";

                }
                return avg ? colorRegion(avg) : colorRegion(10); 
                });
            updateData();
        });   
    }
    else if(date.getDate()==10){
        d3.csv('data/himali_data/mobileSensor_10.csv').then(function(senData) {
            sensorData=senData;
            calculateAverageValue();
            colorRegion = d3.scaleSequential(d3.interpolateBlues)
                .domain([d3.min(Object.values(avgValues)), d3.max(Object.values(avgValues))]);
            d3.selectAll('.himark')
                .style('fill', function (d) {
                var neighborhood = d.properties['Nbrhood']; 
                var avg = avgValues[neighborhood];
                // console.log('Neighborhood:', neighborhood, 'Average:', avg, colorRegion(avg)); 
                if (targetNbrhood.includes(neighborhood)){
                    // console.log("sdfedfref");
                    return "black";

                }
                return avg ? colorRegion(avg) : colorRegion(10); 
                });
            updateData();
            
        });   
    }
    
}
function lumScaledisplay(){
    luminanceScale = d3.scaleLinear()
    // .domain([temp_d[0], temp_d[1]])
    .domain(0,24)
    .range([0.6, 0]); 
    var barX = 230; // Adjust as needed
    var barY = 70; // Adjust as needed
    var barWidth = 100; // Adjust as needed
    var barHeight = 20; /// Adjust as needed

    

    // Append the gradient definition to the SVG
    var defs = svg_choro.append("defs");

    var gradient = defs.append("linearGradient")
        .attr("id", "luminanceGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    // Add color stops to the gradient based on luminance scale
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.interpolateBlues(minValuex));
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.interpolateBlues(maxValuex));

    // Append the bar with the gradient
    var luminanceBar = svg_choro.append("rect")
        .attr("x", barX)
        .attr("y", barY)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .style("fill", "url(#luminanceGradient)");

    // Optional: Add text labels for the domain values
    var minValueLabel = svg_choro.append("text")
        .text(12)
        .attr("x", barX - 5)
        .attr("y", barY + barHeight / 2)
        .style("text-anchor", "end")
        .attr("font-size","11")
        .attr("dy", "0.35em");

    var maxValueLabel = svg_choro.append("text")
        .text(0)
        .attr("x", barX + barWidth + 5)
        .attr("y", barY + barHeight / 2)
        .attr("font-size","11")
        .style("text-anchor", "start")
        .attr("dy", "0.35em");


    var startX = 50; // Adjust as needed
    var startY = 20; // Adjust as needed
    var lineLength = 100; // Adjust as needed

    // Create a line ending with an arrow pointing to the right
    svg_choro.append("line")
        .attr("x1", startX)
        .attr("y1", startY)
        .attr("x2", startX + lineLength-5)
        .attr("y2", startY)
        .attr("stroke", "black")
        .attr("marker-end", "url(#arrow-marker)")
        .attr("transform", "translate("+280+",+"+ (77)+ ")")

    // Add an arrowhead marker
    svg_choro.append("svg:defs").append("svg:marker")
        .attr("id", "arrow-marker")
        .attr("refX", 0)
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,0 L0,4 L6,2 Z")
        .style("fill", "black")
        // .attr("transform", "translate("+leftMargin+",+"+ (35)+ ")")
        

    // Add text 'Decreasing Distance' below the line
    svg_choro.append("text")
        .text("Decreasing Proximity")
        .attr("x", startX + (lineLength-5) / 2)
        .attr("y", startY + 30) // Adjust the distance below the line
        .style("text-anchor", "middle")
        .attr("font-size","8")
        .attr("transform", "translate("+285+",+"+ (60)+ ")")
}

function syncwithmap(neighborhood){
    // console.log("js");
    // console.log(targetNbrhood);

    d3.selectAll('.himark')
        .style('fill', function (d) {
        console.log(d);
        if (targetNbrhood.includes(neighborhood) && targetNbrhood.includes(d.properties['Nbrhood'])){
            console.log("df",targetNbrhood);
            return "black";
        }
        else if (targetNbrhood.includes(d.properties['Nbrhood'])) {

            return "black"; 
        }
            
        var avg = avgValues[d.properties['Nbrhood']];
        // console.log('Neighborhood:', d.properties['Nbrhood'], 'Average:', avg, colorRegion(avg)); 
        return avg ? colorRegion(avg) : colorRegion(10); 
        });
    updateData();
    plotPath();
    checkbox_func(selected_sensors);
}
