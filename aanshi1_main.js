var aanshi1_svg;
var aanshi1_margin = {top: 20, right: 15, bottom: 20, left: 80};
var aanshi1_width = 700 - aanshi1_margin.left - aanshi1_margin.right;
var aanshi1_height = 600 - aanshi1_margin.top - aanshi1_margin.bottom;
var aanshi1_mobile,aanshi1_static;
var aanshi1_mergedData;
var aanshi1_tooltip;

document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
    
    // This will load your two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/aanshi_data/aanshi_mobile_data.csv'),d3.csv('data/aanshi_data/aanshi_static_data.csv')])
         .then(function (values) {
             console.log('loaded data');
             aanshi1_mobile = values[0];
             aanshi1_static = values[1];
             //console.log(mobile);
             //console.log(static);
             
             //console.log(aanshi1_static["Value"]);
            
             aanshi1_static.forEach((d) => {
                 //console.log(d.Value);
                 d["Sensor-id"] = 'S_' + parseInt(d["Sensor-id"]);
                 d.timestamp = new Date(d["Timestamp"]).getTime(); 
                 d.value = parseFloat(d["Value"]);
             });

             //console.log(static);

             aanshi1_mobile.forEach((d) => {
                //console.log(d.Value);
                d["Sensor-id"] = 'M_' + parseInt(d["Sensor-id"]);
                d.timestamp = new Date(d["Timestamp"]).getTime(); 
                d.value = parseFloat(d["Value"]);
            });

            //console.log(mobile);


             // Merge mobile and static data into one variable
            aanshi1_mergedData = [    ...aanshi1_mobile,
                 ...aanshi1_static];

            // Now, mergedData contains the combined data from both CSV files
            console.log(aanshi1_mergedData);

 
             //craeting the svg
             aanshi1_svg = d3.select("#svg_error")
                         .append("svg")
                             .attr("width", aanshi1_width + aanshi1_margin.left + aanshi1_margin.right)
                             .attr("height", aanshi1_height + aanshi1_margin.top + aanshi1_margin.bottom)
                         .append("g")
                             .attr("transform",
                                 "translate(" + aanshi1_margin.left + "," + aanshi1_margin.top + ")");

            aanshi1_tooltip = d3.select("body").append("div")
                                 .attr("class", "tooltip")
                                 .style("opacity", 0);
                                 
            var chart_title =aanshi1_svg.append("text")
               .attr("text-anchor","end")
               .attr("x",aanshi1_width/4)
               .attr("y",0)
               .attr("font-size","22")
               .text('Error-Bar Chart')
               .attr("transform", "translate("+(aanshi1_width/4+40)+",35)");
   
            var chart_desc = aanshi1_svg.append("text")
               .attr("text-anchor","end")
               .attr("x",aanshi1_width/7)
               .attr("y",0)
               .attr("font-size","10")
               .text('Shows uncertainity of hourly sensor reading.  Marks - Line. Channels - Height, (X,Y) position.')
               .attr("transform", "translate("+410+",+"+ (55)+ ")")
         });

   
 });

 function draw(neighbors){

    //console.log(static);
    console.log(neighbors);

    var uniqueNeighborhoods = Array.from(new Set(aanshi1_mergedData.map(d => d.Nbrhood)));
    console.log(uniqueNeighborhoods);

    var groupedData = d3.group(aanshi1_mergedData, d => d.Nbrhood);
    console.log(groupedData);

   //  // Convert the Map to an array for easier manipulation
   //  var groupedArray = Array.from(groupedData, ([key, value]) => ({
   //    Nbrhood: key,
   //    //sensorIds: Array.from(new Set(value.map(d => d['Sensor-id']))),
   //    aanshi1_mergedData: value // Assuming your data has a "Value" property
   //  }));
   //  console.log(groupedArray);

    var filteredGroupedArray = Array.from(groupedData)
    .filter(([key, value]) => neighbors.includes(key))
    .map(([key, value]) => ({
        Nbrhood: key,
        aanshi1_mergedData: value
    }));

console.log(filteredGroupedArray);

    var boxplotData = filteredGroupedArray
    .filter(d => d["Nbrhood"].trim() !== "") 
    .map(d => {
        // Separate sensor ids for static and mobile sensors
        var aanshi1_staticSensorIds = Array.from(new Set(d.aanshi1_mergedData.filter(entry => entry['Sensor-id'].includes('S_')).map(entry => entry['Sensor-id'])));
        var aanshi1_mobileSensorIds = Array.from(new Set(d.aanshi1_mergedData.filter(entry => entry['Sensor-id'].includes('M_')).map(entry => entry['Sensor-id'])));

        return {
            label: d["Nbrhood"],
            values: d.aanshi1_mergedData.map(entry => +entry.Value), // Assuming your data has a "Value" property
            aanshi1_staticSensorIds: aanshi1_staticSensorIds,
            aanshi1_mobileSensorIds: aanshi1_mobileSensorIds
        };
    });

    console.log(boxplotData);

    // Calculate statistics for each neighborhood
var summaryData = boxplotData.map(d => {
    // Sort values in ascending order
    var sortedValues = d.values.sort(d3.ascending);
    //console.log(sortedValues);
 
    // Calculate statistics
    var q1 = d3.quantile(sortedValues, 0.25);
    var median = d3.quantile(sortedValues, 0.5);
    var q3 = d3.quantile(sortedValues, 0.75);
    var interQuartileRange = q3 - q1;
    var min = sortedValues[0];
    var max = sortedValues[sortedValues.length - 1];
    //console.log(min);
    //console.log(max);
    var mean = d3.mean(d.values);
    var stdDev = d3.deviation(d.values);
    var lowerError = mean - stdDev/2;
    var upperError = mean + stdDev/2;
 
    return {
       label: d.label,
       //data: d.values,
       aanshi1_staticSensorIds: d.aanshi1_staticSensorIds,
       aanshi1_mobileSensorIds: d.aanshi1_mobileSensorIds,
       min: min,
       q1: q1,
       median: median,
       q3: q3,
       max: max,
       interQuartileRange: interQuartileRange,
       mean: mean,
       stddev: stdDev,
       le: lowerError,
       ue: upperError
    };
 });
 
 // Display the summary data in the console
 console.log(summaryData);

// Set up x-axis scale and domain
var xScale = d3.scaleBand()
    .domain(summaryData.map(d => d.label))
    .range([0, aanshi1_width - 50])
    .padding(0.1);

// Draw x-axis
aanshi1_svg.selectAll(".x-axis").remove(); // Remove existing x-axis if any
aanshi1_svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + (aanshi1_height - 100) + ")")
    .call(d3.axisBottom(xScale));

// Add ticks with labels
//aanshi1_svg.selectAll(".x-axis .ticks").attr("transform", "translate(" + (-xScale.bandwidth() / 2 +10) + ",0)");

aanshi1_svg.selectAll(".x-axis .tick text")
    .attr("transform"//, "translate(" + (-xScale.bandwidth() / 2 +10) + ",0)"
    , "rotate(-45)")
    .style("font-size", "12px")
    .style("text-anchor", "end");


// // Set up y-axis scale and domain
console.log(d3.min(summaryData, d => d.min));
//console.log(summaryData, d => d.max);

var yScale = d3.scaleLinear()
.domain(//[d3.min(summaryData, d => d.min), d3.max(summaryData, d => d.max)]
[d3.min(summaryData, d => d3.min([d.le, d.mean])), d3.max(summaryData, d => d3.max([d.ue, d.mean]))]
)
   .range([aanshi1_height-100, 70]);

var yScale2 = d3.scaleLinear()
   .domain(//[d3.min(summaryData, d => d.min), d3.max(summaryData, d => d.max)]
   [d3.min(summaryData, d => d.le), d3.max(summaryData, d => d.ue)]
   )
      .range([aanshi1_height-100, 70]);

// Draw y-axis
aanshi1_svg.selectAll(".y-axis").remove(); // Remove existing y-axis if any
aanshi1_svg.append("g")
    .attr("class", "y-axis")
    //.attr("transform", "translate(" + 20 +","+ (-100) + ")")
    .call(d3.axisLeft(yScale));

   // Draw boxes for each neighborhood
var boxaanshi1_width = 20; // Adjust the aanshi1_width of the boxes as needed

aanshi1_svg.selectAll(".box")
    .data(summaryData)
    .join(
      function(enter){
         return enter.append("rect").style("opacity",0)
      }
    ).on("mouseover", function (event, d) {
      // Show tooltip on hover
      var aanshi1_tooltipText = `
        Minimum: ${parseFloat(d.min).toFixed(2)} <br/>
        Maximum: ${parseFloat(d.max).toFixed(2)} <br/>
        Mean: ${parseFloat(d.mean).toFixed(2)} <br/>
        Standard Deviation: ${parseFloat(d.stddev).toFixed(2)}
     `;
      aanshi1_tooltip.transition()
          .duration(200)
          .style("opacity", .9);
      aanshi1_tooltip.html(aanshi1_tooltipText)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");

      // Highlight the hovered bar
      d3.select(this)
         //  .attr("fill", "orange")
         // .attr("width", boxaanshi1_width+5)
         .attr("stroke-width", 8)
         .attr("stroke", "steelblue");
  }).on("mouseout", function (d) {
      // Hide tooltip on mouseout
      // d3.select(this)
      //    //  .attr("fill", "orange")
      //    .attr("width", boxaanshi1_width);
      aanshi1_tooltip.transition()
          .duration(500)
          .style("opacity", 0);

      // Restore original fill for the bar
      d3.select(this)
          .attr("fill", "steelblue")
          .attr("stroke-width", 1)
          .attr("stroke", "black");
  }).on("click", function (event, d) {
      // Log data of the selected region to the console
      console.log("Selected Region Data:", d);
      var list = [...d.aanshi1_staticSensorIds,...d.aanshi1_mobileSensorIds];
      // console.log(list);
      drawRadial(list,d.label);
  })
    //.attr("height", 0)   // Start the bars with zero height
   .transition()
   .duration(400)
   .delay(function(d,i){ return i * 20 })
   .attr("class", "box")
   .attr("x", d => xScale(d.label)+xScale.bandwidth() / 2 -10)
   .attr("y", aanshi1_height-100)  // Start the bars at the bottom of the chart
   .attr("width", boxaanshi1_width)
   .attr("stroke", "black")
   .attr("fill", "steelblue")
   .attr("y", d => yScale(d.mean))  // Transition the bars to their final y position
   .attr("height", d => aanshi1_height-100 - yScale(d.mean))  // Transition the bars to their final height
   .on("end",()=>{
      aanshi1_svg.selectAll(".box").data(summaryData)
      .join("rect")
      .transition()
      .duration(400)
      .delay(function(d,i){ return i * 20 })
      .style("opacity",1)    
});

    // Draw error bars
aanshi1_svg.selectAll(".error-bar")
.data(summaryData)
.join(
   function(enter){
      return enter.append("line").style("opacity",0)
   }
)
.transition()
.duration(400)
.delay(function(d,i){ console.log(xScale(d.label)+xScale.bandwidth() / 2);
   return i * 20 })
.attr("class", "error-bar")
.attr("x1", d => xScale(d.label)+xScale.bandwidth() / 2)
.attr("y1", d => yScale2(d.le))
.attr("x2", d => xScale(d.label)+xScale.bandwidth() / 2)
.attr("y2", d => yScale2(d.ue))
.attr("stroke", "black")
.attr("stroke-width", 1)
.on("end",()=>{
   aanshi1_svg.selectAll(".error-bar").data(summaryData)
   .join("line")
   .transition()
   .duration(400)
   .delay(function(d,i){ return i * 20 })
   .style("opacity",1)
   
});

// Add small horizontal lines at the ends of error bars
var errorBarEndSize = 3; // Adjust the size of the horizontal lines as needed

// Lower end
aanshi1_svg.selectAll(".error-bar-end")
   .data(summaryData)
   .join(
      function(enter){
         return enter.append("line").style("opacity",0)
      }
   )
   .transition()
   .duration(400)
   .delay(function(d,i){ console.log(xScale(d.label) - errorBarEndSize / 2-10);
      return i * 20 })
   .attr("class", "error-bar-end")
   .attr("x1", d => xScale(d.label) - errorBarEndSize / 2 + xScale.bandwidth() / 2)
   .attr("y1", d => yScale2(d.le))
   .attr("x2", d => xScale(d.label) + errorBarEndSize / 2 + xScale.bandwidth() / 2)
   .attr("y2", d => yScale2(d.le))
   .attr("stroke", "black")
   .attr("stroke-width", 2)
   .on("end",()=>{
      aanshi1_svg.selectAll(".error-bar-end").data(summaryData)
      .join("line")
      .transition()
      .duration(400)
      .delay(function(d,i){ return i * 20 })
      .style("opacity",1)
      
   });

// Upper end
aanshi1_svg.selectAll(".error-bar-upper-end")
   .data(summaryData)
   .join(
      function(enter){
         return enter.append("line").style("opacity",0)
      }
   )
   .transition()
   .duration(400)
   .delay(function(d,i){ return i * 20 })
   .attr("class", "error-bar-upper-end")
   .attr("x1", d => xScale(d.label) - errorBarEndSize / 2 + xScale.bandwidth() / 2)
   .attr("y1", d => yScale2(d.ue))
   .attr("x2", d => xScale(d.label) + errorBarEndSize / 2 + xScale.bandwidth() / 2)
   .attr("y2", d => yScale2(d.ue))
   .attr("stroke", "black")
   .attr("stroke-width", 2)
   .on("end",()=>{
      aanshi1_svg.selectAll(".error-bar-upper-end").data(summaryData)
      .join("line")
      .transition()
      .duration(400)
      .delay(function(d,i){ return i * 20 })
      .style("opacity",1)
      
   });

   aanshi1_svg.selectAll(".x-axis-label").remove(); // Remove existing y-axis if any
aanshi1_svg.append("text")
   .attr("class", "x-axis-label")
   .attr("text-anchor", "middle")
   .attr("x", aanshi1_width/2-60)
   .attr("y", aanshi1_height-20) // Adjust the y-coordinate as needed
   .attr("font-size", "15")
   .text("Neighborhoods");

   aanshi1_svg.selectAll(".y-axis-label").remove(); // Remove existing y-axis if any
aanshi1_svg.append("text")
   .attr("class", "y-axis-label")
   .attr("text-anchor", "middle")
   .attr("transform", "rotate(-90)")
   .attr("x", -aanshi1_height / 2 )
   .attr("y", -aanshi1_margin.left+50)
   .text("Values");
    
 }