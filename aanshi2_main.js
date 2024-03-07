var aanshi2_svg;
var aanshi2_margin = {top: 30, right: 30, bottom: 30, left: 100};
var aanshi2_width = 1000 - aanshi2_margin.left - aanshi2_margin.right;
var aanshi2_height = 370 - aanshi2_margin.top - aanshi2_margin.bottom;
var aanshi2_mobile,aanshi2_static;
var aanshi2_tooltip;
var aanshi2_merged;
var aanshi2_startTime = new Date("2020-04-06 00:00:00").getTime();
var aanshi2_endTime = new Date("2020-04-10 24:00:00").getTime();

var aanshi2_colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
'#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
'#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
'#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
'#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
'#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
'#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
'#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
'#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
'#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
var aanshi2_static_colorArray = ['#FF9900', '#33FF33', '#FF33CC', '#FFCC33', '#33CCFF',
'#CC33FF', '#33FF66', '#FF3366', '#66FF33', '#3366FF'];

const aanshi2_sensorColorMap = {
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

var aanshi2_color;

document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
    
    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/aanshi_data/aanshi_mobile_data.csv'),d3.csv('data/aanshi_data/aanshi_static_data.csv')])
         .then(function (values) {
             console.log('loaded data');
             aanshi2_mobile = values[0];
             aanshi2_static = values[1];
             //console.log(mobile);
             //console.log(static);

             //console.log(static["Value"]);
            
             aanshi2_static.forEach((d) => {
                 //console.log(d.Value);
                 d["Sensor-id"] = 'S_' + parseInt(d["Sensor-id"]);
                 d.timestamp = new Date(d["Timestamp"]).getTime(); 
                 d.value = parseFloat(d["Value"]);
             });

             aanshi2_mobile.forEach((d) => {
              //console.log(d.Value);
              d["Sensor-id"] = 'M_' + parseInt(d["Sensor-id"]);
              d.timestamp = new Date(d["Timestamp"]).getTime(); 
              d.value = parseFloat(d["Value"]);
          });

          aanshi2_merged = [...aanshi2_mobile, ...aanshi2_static];
          console.log(aanshi2_merged);  
 
            //  //craeting the svg
            //  aanshi2_svg = d3.select("#svg_lollipop")
            //              .append("svg")
            //                  .attr("width", aanshi2_width + aanshi2_margin.left + aanshi2_margin.right)
            //                  .attr("height", aanshi2_height + aanshi2_margin.top + aanshi2_margin.bottom)
            //              .append("g")
            //                  .attr("transform",
            //                      "translate(" + aanshi2_margin.left + "," + aanshi2_margin.top + ")");

            // aanshi2_tooltip = d3.select("body").append("div")
            //                      .attr("class", "tooltip")
            //                      .style("opacity", 0);
            //  //drawlollipop();
         });
 });

 function drawlollipop(selectedsensor){

    var aanshi2_svg1 = d3.select("#svg_lollipop");
    aanshi2_svg1.selectAll("*").remove();
    var aanshi2_svg = aanshi2_svg1.append("svg")
        .attr("width", aanshi2_width + aanshi2_margin.left + aanshi2_margin.right)
        .attr("height", aanshi2_height + aanshi2_margin.top + aanshi2_margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + aanshi2_margin.left + "," + aanshi2_margin.top + ")");

    aanshi2_svg.attr("transform","scale(1.75)");

    aanshi2_tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


    var s=[];
    console.log(selectedsensor);
    console.log(aanshi1_mergedData);
    console.log(aanshi1_static);
    console.log(aanshi1_mobile); 

    //var sensorName = selectedsensor[0].split("_")[1];
    //console.log(sensorName);
    var chart_title =aanshi2_svg.append("text")
        .attr("text-anchor","end")
        .attr("x",0)
        .attr("y",0)
        .attr("font-size","12")
        .text('Lollipop Chart')
        .attr("transform", "translate("+(aanshi2_width/3+40)+",10)");
       

     var chart_desc = aanshi2_svg.append("text")
        .attr("text-anchor","end")
        .attr("x",0)
        .attr("y",0)
        .attr("font-size","6")
        .text('Shows average sensor readings for 1 Hr accross the timeline. Marks - Line, Point. Channels - Color hue, Length, (X,Y) Position')
        .attr("transform", "translate("+470+",+"+ (20)+ ")");

    if (selectedsensor.includes("S_")) {
      for (let i=0; i<aanshi1_static.length;i++){
        console.log(aanshi1_static[i]["Sensor-id"]);
        //console.log(selectedsensor[0]);
        if(aanshi1_static[i]["Sensor-id"]==selectedsensor){
          s.push(aanshi1_static[i]);
          aanshi2_color = aanshi2_sensorColorMap[parseInt(selectedsensor.split("_")[1])];
        }
      }
    }else{
      for (let i=0; i<aanshi1_mobile.length;i++){
        if(aanshi1_mobile[i]["Sensor-id"]==selectedsensor){
          s.push(aanshi1_mobile[i]);
          aanshi2_color = aanshi2_colorArray[parseInt(selectedsensor.split("_")[1]) - 1]
        }
      }
    }

    console.log(s);

        var chartData = [s];
        //console.log(chartData);

// const timestamps = chartData[0].map(d=>d["Timestamp"]);
// //timestamps = timestamps+1;
// timestamps.concat(['2020-04-11 00:00:00']);
// console.log(timestamps)
const timestampsFromData = chartData[0].map(d => d["Timestamp"]);
const additionalTimestamp = "2020-04-11 00:00:00"; // Replace with your desired timestamp

// Concatenate the arrays to include the additional timestamp
const timestamps = timestampsFromData.concat([additionalTimestamp]);

// Now, timestamps contains both the timestamps from chartData[0] and the additional timestamp
console.log(timestamps);;

const sensorIds = [...new Set(chartData.flatMap(d => d.map(item => item["Sensor-id"])))];
//console.log(sensorIds);

// Create lollipop charts for each sensor
sensorIds.forEach((sensorId, index) => {
    // Filter data for the current sensor-id
    const sensorValues = chartData.find(data => data[0]["Sensor-id"] === sensorId);
    //console.log(sensorValues);

    console.log(sensorId);

        // Set up scales and axes
    //console.log(75*(index+1) , (index) * 75);
    var max_temp = 0;
    console.log(sensorValues);
    for (var i=0;i<sensorValues.length;i++){
        if(+sensorValues[i]['Value']>max_temp){
          max_temp = +sensorValues[i]['Value'];
        }
    }
    console.log(max_temp);
    const yScale = d3.scaleLinear()
    .domain([0, max_temp])
    .range([150 , 30]);
  
    // Set up xScale for the current sensor
    //console.log([index * 1000, (index + 1) * 1000]);

    // Remove existing X-axis and its associated elements
aanshi2_svg.selectAll(".x-axis").remove();
aanshi2_svg.selectAll(".x-axis-label").remove();


const parsedTimestamps = timestamps.map(timestamp => new Date(timestamp));

console.log(d3.extent(parsedTimestamps));
//Create a new X-axis scale
const xScale =d3.scaleTime()
    .domain(d3.extent(parsedTimestamps))
    .range([50, 550]);
    //.padding(0.1);

    const xScale2 = d3.scaleBand()
    .domain(timestampsFromData)
    .range([50, 550])
    .padding(0.1);
  
    const ticks = xScale.ticks(d3.timeHour.every(6));
    console.log(ticks);
  // Configure ticks to be every 6 hours
 // const ticks = timeScale.ticks(d3.timeHour.every(6));
//  var ticks = d3.timeHour.every(6).range(shrey_startTime, shrey_endTime + 1);
//  console.log(ticks);

//const numTicks = 5;
// const tick = d3.timeHour.every(6).range(aanshi2_startTime, aanshi2_endTime+1);
// console.log(tick);

// const xAxis = d3.axisBottom(xScale)
//         .tickValues(tick)
//         .tickFormat(d3.timeFormat("%Y-%m-%d %H:%M"))
// console.log(xAxis);

      // // Create the x-axis generator with specified hourly ticks
      // shrey_xAxis = d3.axisBottom(shrey_xScale)
      //   .tickValues(tickValues)
      //   .tickFormat(d3.timeFormat("%Y-%m-%d %H:%M"));
// Append a new X-axis to the SVG
aanshi2_svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${(index + 2) * 75})`)
    .call(d3.axisBottom(xScale).tickValues(ticks).tickFormat(d3.timeFormat("%Y-%m-%d %H:%M")))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .attr("x", -10)
    .attr("y", 0)
    .style("font-size", "5px")
    .style("text-anchor", "end");

// Append a new X-axis label
aanshi2_svg.append("text")
    .attr("class", "x-axis-label")
    .attr("transform", `translate(300, 210)`)
    .style("text-anchor", "middle")
    .text("Timestamp")
    .style("font-size", "8px");

      // Create Y-axis for the current sensor

      //aanshi2_svg.selectAll("y-axis").remove();
  aanshi2_svg.append("g")
    .attr("class","y-axis")
    .call(d3.axisLeft(yScale))
    .style("font-size","5px") 
    .attr("transform", `translate(50,0)`) ;

    // Y-axis label
    aanshi2_svg.append("text")
    .attr("class",".y-axis text")
        .attr("transform", `translate(30, 100) rotate(-90)`)
        .style("text-anchor", "middle")
        .text("Sensor Value")
        .style("font-size","8px");

    //sensorGroup.selectAll("*").remove();

    // Create lollipop chart for the current sensor
    const paddingBetweenPoints = 10; // Set your desired padding

    aanshi2_svg.selectAll(".circle").remove();
    
    aanshi2_svg.selectAll(".circle")
        .data(sensorValues)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("cx", function(d, i){
          return xScale2(d["Timestamp"]) + xScale2.bandwidth() / 2;
        } )
        .attr("cy", d => yScale(d["Value"]))
        .attr("r", 2)
        .attr("fill", aanshi2_color)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

        
        aanshi2_svg.selectAll(".line").remove();
        aanshi2_svg.selectAll(".line")
        .data(sensorValues)
        .enter().append("line")
        .attr("class", "line")
        .attr("x1", function(d){ //console.log(xScale(d["Timestamp"])); 
        return xScale2(d["Timestamp"]) + xScale2.bandwidth() / 2;})
        .attr("x2", function(d){ //console.log(xScale(d["Timestamp"])); 
        return xScale2(d["Timestamp"]  ) + xScale2.bandwidth() / 2;})
        .attr("y1", yScale(0))
        .attr("y2", function(d){ 
          //console.log((d["Value"])); 
        return yScale(+d["Value"])})
        .attr("stroke-width", 0.5)
        .attr("stroke", "black")
        .attr("fill","black");

    function handleMouseOver(event, d) {
          // Show tooltip on hover
          aanshi2_tooltip.transition()
              .duration(200)
              .style("opacity", .9);
          aanshi2_tooltip.html(`Sensor ID: ${sensorId}<br>CPM Value: ${parseFloat(d["Value"]).toFixed(2)}`+" cpm")
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");

          // Highlight the lollipop on hover
        d3.select(this)
        .attr("r", 4)  // Increase the radius or change any other attribute
        .attr("stroke-width", 2);
        // .attr("fill", "lightgrey");
      }
  
    function handleMouseOut() {

      // Reset the lollipop to its original state
      d3.select(this)
      .attr("r", 2)
      .attr("stroke-width", 1)
      .attr("fill", aanshi2_color);

          // Hide tooltip on mouseout
          aanshi2_tooltip.transition()
              .duration(500)
              .style("opacity", 0);
      }
   
});
    
 }

