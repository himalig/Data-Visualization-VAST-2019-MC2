var height,width,svg_choro;
var selectedRegions=[];
var ispaused=false;
// var selectedDate = document.getElementById('datepicker');
var targetNbrhood="";
var currentIndex=0;
const startTime = new Date("2020-04-08 00:00:00").getTime();
const endTime = new Date("2020-04-08 07:00:00").getTime();
var circles;
const mobileSensorsFiltered = [];
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
var iconSize = [30, 45];
var path;
var projection;
document.addEventListener("DOMContentLoaded", function () {
  svg_choro = d3.select("svg"),
    width = +svg_choro.attr("width"),
    height = +svg_choro.attr("height");
});

d3.json("data/StHimark.geojson").then(function(data){
    projection = d3.geoMercator()
        .scale(145000)
        .center(d3.geoCentroid(data))
        .translate([width / 2, height / 2]);
    path = d3.geoPath().projection(projection);
    svg_choro
        .append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", function (d) {
        return path(d.geometry);
        })
        .style("stroke", "#fff")
        .on("click", function (event, d) {
          var clickedNbrhood = d.properties['Nbrhood'];
      
          if (targetNbrhood!=clickedNbrhood && targetNbrhood=="") {
            d3.select(this).attr("fill", "#69b3a2");
            targetNbrhood = clickedNbrhood;
            d3.select(this).attr("fill", "blue");
            generatePaths(targetNbrhood);
          } else {
            targetNbrhood = "";
            d3.select(this).attr("fill", "#69b3a2");
          }
        });
    displayIcons();
    staticSensor();
});

function generatePaths(targetNbrhood){
  d3.csv("data/grouped_data.csv").then(function (mobilesensorData) {
    const mobileSensorsTrgtArea = mobilesensorData.filter((d) => {
      const timestamp = new Date(d.Timestamp).getTime();
      return timestamp >= startTime && timestamp <= endTime && d.Nbrhood === targetNbrhood;
    });
    
    const sensorIds = Array.from(new Set(mobileSensorsTrgtArea.map((sensor) => sensor["Sensor-id"])));
    // console.log(mobileSensorsTrgtArea);
    const pathGenerator = d3.line()
        .x(d => projection([+d.Long, +d.Lat])[0])
        .y(d => projection([+d.Long, +d.Lat])[1])
        .curve(d3.curveLinear);
    const colorScale = d3.scaleOrdinal()
        .domain(sensorIds)
        .range(d3.schemeCategory10);
    const groupedData = Array.from(
          d3.group(
            mobilesensorData.filter(d => 
              sensorIds.includes(d["Sensor-id"]) &&
              new Date(d.Timestamp).getTime() >= startTime &&
              new Date(d.Timestamp).getTime() <= endTime
            ),
            d => d.Timestamp
          ).entries()
        );
    console.log(groupedData);
          
    groupedData.forEach((sensorPath,index) => {

        console.log(sensorPath[1]);
        svg_choro.append('path')
            .datum(sensorPath[1])
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
            .attr('opacity', 0)
            .transition()
            .delay(index * 800) 
            .duration(800) 
            .attr('opacity', 1);
    });
            
    
       
    }); 
}
function staticSensor(){
  d3.csv("data/static_data.csv").then(function (staticsensorData) {
    var groupedData = d3.group(staticsensorData, d => d.Timestamp);
    var colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([d3.min(staticsensorData, d => +d.Value), d3.max(staticsensorData, d => +d.Value)]);
  
    var duration = 1000; 
    var delay = 500; 
    
    Array.from(groupedData.values()).forEach((groupData, index) => {        
        // console.log(groupData);
        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
        circles = svg_choro.selectAll(".scircle")
        .data(groupData)
        .join("circle")
        .attr('class','scircle')
        .transition()
        .delay(index*200)
        .duration(200)
        .attr("cx", d => projection([d.Long, d.Lat])[0])
        .attr("cy", d => projection([d.Long, d.Lat])[1])
        .attr("r", 7)
        .style("fill", d => {return colorScale(+d.Value);})
        .attr("opacity", 0.8);
        // .on("mouseover", function (event, d) {
        //   tooltip.transition()
        //     .duration(200)
        //     .style("opacity", 0.9);
        //   tooltip.html("Sensor ID: " + d["Sensor-id"] + "<br>CPM Value: " + d.Value)
        //     .style("left", (event.pageX + 5) + "px")
        //     .style("top", (event.pageY - 28) + "px");
        // })
        // .on("mouseout", function () {
        //   tooltip.transition()
        //     .duration(500)
        //     .style("opacity", 0);
        // });
    });
  });
}
  

  // d3.csv("data/static_data.csv").then(function (staticsensorData) {
  //   staticsensorData.sort(function(a, b) {
  //     return new Date(a.Timestamp) - new Date(b.Timestamp);
  //   });
  
  //   var colorScale = d3.scaleSequential(d3.interpolateViridis)
  //     .domain([d3.min(staticsensorData, d => +d.Value), d3.max(staticsensorData, d => +d.Value)]);
  
  //   // Append circles
  //   var circles = svg_choro.selectAll("circle")
  //     .data(staticsensorData)
  //     .enter().append("circle")
  //     .attr("cx", d => projection([d.Long, d.Lat])[0])
  //     .attr("cy", d => projection([d.Long, d.Lat])[1])
  //     .attr("r", 7)
  //     .style("fill", d => colorScale(+d.Value))
  //     .attr("opacity", 0.8);
  
  //   var initialTimestamp = new Date(staticsensorData[0].Timestamp);
  //   var endTimestamp = new Date(staticsensorData[staticsensorData.length - 1].Timestamp);
  
  //   // Add tooltip
  //   var tooltip = d3.select("body").append("div")
  //     .attr("class", "tooltip")
  //     .style("opacity", 0);
  
  //   circles.on("mouseover", function (event, d) {
  //       tooltip.transition()
  //           .duration(200)
  //           .style("opacity", .9);
  //       console.log(d["Sensor-id"]+" "+ d.Value+" "+ d.Timestamp);
  //       tooltip.html("Sensor ID: " + d["Sensor-id"] + "<br>CPM Value: " + d.Value)
  //           .style("left", (event.pageX + 5) + "px")
  //           .style("top", (event.pageY - 28) + "px");
  //   })
  //   .on("mouseout", function (d) {
  //       tooltip.transition()
  //           .duration(500)
  //           .style("opacity", 0);
  //   });
  
  //   var currentIndex = 0;
  
  //   // Function to update the display based on the current index
  //   function updateDisplay() {
  //     var currentTimestamp = new Date(staticsensorData[currentIndex].Timestamp);
  
  //     // Check if the current timestamp is within the desired range
  //     if (currentTimestamp >= initialTimestamp && currentTimestamp <= endTimestamp) {
  //       circles.filter(function(d, i) {
  //           return i === currentIndex;
  //         })
  //         .transition()
  //         .duration(500)
  //         .ease(d3.easeLinear)
  //         .attr("r", 7) // Update the radius based on the "Value"
  //         .style("fill", d => colorScale(+d.Value))
  //         .attr("opacity", 0.8);
  //     }
  
  //     currentIndex++;
  
  //     if (currentIndex >= staticsensorData.length || currentTimestamp > endTimestamp) {
  //       clearInterval(animationInterval); // Stop the interval when the animation is complete
  //     }
  //   }
  
  //   // Set up an interval to update the display
  //   var animationInterval = d3.interval(updateDisplay, 500);
  
  // });
  function displayIcons(){
    svg_choro.selectAll('.hospital')
            .data(hospitalList)
            .enter()
            .append('image')
            .attr('xlink:href', 'data/hospital.svg')
            .attr('class', 'hospital')
            .attr('width', iconSize[0])
            .attr('height', iconSize[1])
            .attr("transform", function(d) {
              return "translate(" + projection([d.longitude, d.latitude]) + ")";
            });
    svg_choro.selectAll('.nuclearplant')
          .data(nuclearList)
          .enter()
          .append('image')
          .attr('xlink:href', 'data/Nuclear_plant.png')
          .attr('class', 'nuclearplant')
          .attr('width', iconSize[0])
          .attr('height', iconSize[1])
          .attr("transform", function(d) {
            return "translate(" + projection([d.longitude, d.latitude]) + ")";
          });
  }
   // .attrTween("transform", translateAlong(path));
        // const circle = svg.append("circle")
        //     .attr("r", 5)
        //     .attr("fill", "red")
        //     .attr('opacity', 0) 
        //     .transition()
        //     .delay(index * 2000) // Adjust the delay between circles as needed
        //     .duration(2000) // Adjust the duration of each circle animation
        //     .attr('opacity', 1) // Fade in the circle
        //     .attrTween("transform", translateAlong(path)); 
    // });
    // const mobileSensorsinArea = mobilesensorData.filter((d) => {
    //   const timestamp = new Date(d.Timestamp).getTime();
    //   return timestamp >= startTime && timestamp <= endTime && sensorIds.includes(d["Sensor-id"]);
    // });

    // mobileSensorsinArea.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
     
        // svg_choro.append('path')
        //     .datum(mobileSensorsinArea)
        //     .attr('d', pathGenerator)
        //     .attr('fill', 'none')
        //     .attr('stroke', "blue")
        //     .attr('stroke-width', 2)
        //     .transition()
        //     .duration(10000);

      // groupedData.forEach((sensorData, sensorId) => {
      //   // Draw the path
      //   console.log(sensorData);
      //   const path = svg_choro.append("path")
      //     .datum(sensorData)
      //     .attr("d", pathGenerator)
      //     .attr("fill", "none")
      //     .attr("stroke", colorScale(sensorId))
      //     .attr("stroke-width", 2);
    
      //   // Create a circle for each data point
      //   const circles = svg_choro.selectAll(`.circle-${sensorId}`)
      //     .data(sensorData)
      //     .enter().append("circle")
      //     .attr("class", `circle-${sensorId}`)  // Add a dot before 'circle-${sensorId}'
      //     .attr("r", 5)
      //     .attr("fill", colorScale(sensorId))
      //     .attr("cx", d => projection([d.Long, d.Lat])[0])
      //     .attr("cy", d => projection([d.Long, d.Lat])[1])
      //     .style("opacity", 1); 
        
      //   circles.transition()
      //     .duration(5000) // Adjust the duration of the animation
      //     .attrTween("transform", translateAlong(path))
      //     .style("opacity", 1); // Fade in the circles
      // });
      // function translateAlong(path) {
      //   const l = path.node().getTotalLength();
      //   return function (d, i, a) {
      //     return function (t) {
      //       const p = path.node().getPointAtLength(t * l);
      //       return "translate(" + p.x + "," + p.y + ")";
      //     };
      //   };
      // }