
var svg_linechart;
var shrey_yScale;
var shrey_yAxis;
var shrey_startTime = new Date("2020-04-06 00:00:00").getTime();
var shrey_endTime = new Date("2020-04-10 24:00:00").getTime();
var shrey_xAxis;
var shrey_xScale;
var totalHeight = 700;
var totalWidth = 800;
var graphWidth = 650;
var leftMargin = 90;
var topMargin = 600;
var innerMargin = 3;
var graphHeight = 50;
var regions_list = [];
var sensor_list = [];
var shrey_div;
var luminanceScale;
var tooltip_shrey;
function get_min_max_cpm(data){
    var min_val = 100000;
    var max_val = -1000000;
    data.forEach((d,index) => {
        if(+d['closest_value']>max_val){
            max_val = +d['closest_value'];
        }
        if(+d['closest_value']<min_val){
            min_val =+d['closest_value'];
        }
        if(+d['Value']>max_val){
            max_val = +d['Value'];
        }
        if(+d['Value']<min_val){
            min_val = +d['Value'];
        }
        
    
    });

    return [min_val,max_val];
}

function get_min_max_distance(data){
    var min_val = 100000;
    var max_val = -1000000;
    data.forEach((d,index) => {
        if(+d['closest_distance']>max_val){
            max_val = +d['closest_distance'];
        }
        if(+d['closest_distance']<min_val){
            min_val =+d['closest_distance'];
        }
        
        
    
    });

    return [min_val,max_val];
}

// function create_y_axis(minValue, maxValue){
//     shrey_yScale = d3.scaleLinear()
//         .domain([minValue, maxValue])
//         .range([500, 400]); // Adjust the range based on the SVG height

//       // Create the y-axis generator
//     shrey_yAxis = d3.axisLeft(shrey_yScale).ticks(5);

//       // Append the y-axis to the SVG
//      svg_linechart.append("g")
//         .attr("transform", "translate(100, 100)") // Adjust the translation to position the axis
//         .call(shrey_yAxis);
    
// }
function create_x_axis(){
    var xlabel =svg_linechart.append("text")
    .attr("text-anchor","end")
    .attr("x",graphWidth/2)
    .attr("y",0)
    .attr("font-size","12")
    .text('Time')
    .attr("transform", "translate("+leftMargin+",+"+ (topMargin+90)+ ")")

    shrey_xScale = d3.scaleLinear()
        .domain([shrey_startTime, shrey_endTime])
        .range([0, graphWidth]); // Adjust the range based on the SVG height

      // Create the y-axis generator
      var tickValues = d3.timeHour.every(6).range(shrey_startTime, shrey_endTime + 1);

      // Create the x-axis generator with specified hourly ticks
      shrey_xAxis = d3.axisBottom(shrey_xScale)
        .tickValues(tickValues)
        .tickFormat(d3.timeFormat("%Y-%m-%d %H:%M"));
        console.log(shrey_xAxis);

      // Append the y-axis to the SVG
      const shrey_xAxisGroup =svg_linechart.append("g")
      .attr("transform", "translate("+leftMargin+"," +topMargin+")") // Adjust the translation to position the axis
      .call(shrey_xAxis);

    // Rotate the tick text vertically
    shrey_xAxisGroup.selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dy", "0.5em") // Adjust the vertical position as needed
      .attr("dx", "-0.5em"); // Adjust the horizontal position as needed
  
    
}

function create_line_chart(svg1_linechart,data,minValue, maxValue,up_margin){
    
    
    console.log(graphHeight);
    var temp_d = get_min_max_distance(data);
    var shrey_xScaleBar = d3.scaleBand()
    .range([0, graphWidth])
    .padding(0.0);
    shrey_xScaleBar.domain([shrey_startTime, shrey_endTime]);


    shrey_yScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([0, -graphHeight]); // Adjust the range based on the SVG height

      // Create the y-axis generator
    shrey_yAxis = d3.axisLeft(shrey_yScale).ticks(0);

      // Append the y-axis to the SVG
      svg1_linechart.append("g")
        .attr("transform", "translate("+leftMargin+",+"+ up_margin+ ")") // Adjust the translation to position the axis
        .call(shrey_yAxis);

    var ylabel = svg1_linechart.append("text")
    .attr("text-anchor","end")
    .attr("x",-10)
    .attr("y",graphHeight/2)
    .attr("font-size","11")
    .text('Mobile #'+data[0]['Sensor-id'])
    .attr("transform", "translate("+leftMargin+",+"+ (up_margin-graphHeight)+ ")")

    
    tooltip_shrey = d3.select(".tooltip");

    var luminanceScalet = d3.scaleLinear()
    .domain([temp_d[0], temp_d[1]])
    // .domain(0,12)
    .range([0.6, 0]); // Range of luminance values
      var bar =  svg1_linechart.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => shrey_xScale(new Date(d.Timestamp).getTime()))
    .attr("width", function(d,i){
        // console.log(shrey_xScaleBar.bandwidth());
        if(i==data.length-1){
            return 0;
        }
        return 7;
    } )
    .attr("y", d => shrey_yScale(maxValue))
    .attr("height", d => shrey_yScale(minValue)-shrey_yScale(maxValue))
    .style("fill", d => d3.interpolateBuGn(luminanceScalet(+d.closest_distance)))
    .attr("transform", "translate("+leftMargin+",+"+ up_margin+ ")")
    .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);


            function handleMouseOver(event, d) {
                console.log(event.pageX);
                tooltip_shrey.transition().duration(200).style("opacity", 1);
                tooltip_shrey.html("Mobile sensor reading: " + d["Value"] + "<br/>"+"Closest static sensor: "  + d['closest_static'] + "<br/>" +"Static sensor reading: " + d['closest_value']+
        "<br>")
            // .style("left", event.pageX +30 + "px")
            .style("left", event.pageX +10 + "px")
            .style("top", event.pageY - 10 + "px");
                // Highlight the current line
                d3.select(this).classed("highlighted", true);
            
                // Reduce the opacity of other lines
               svg_linechart.selectAll(".bar")
                    .filter(function (otherLineData) {
                        return otherLineData !== d;
                    })
                    .classed("unhighlighted", true);
            }
            
            // Function to handle mouseout event
            function handleMouseOut() {
                tooltip_shrey.transition().duration(50).style("opacity", 0);
                // Remove highlighting and reset opacity for all lines
               svg_linechart.selectAll(".bar")
                    .classed("highlighted", false)
                    .classed("unhighlighted", false);
            }
    // var area =svg_linechart.append("g").selectAll(".areas");
    // console.log('a');
    // area = area.data([data])
    // .enter()
    // .append("path")
    //   .attr("class","areas")
    //   .attr("fill", function(d){
    //     return d3.interpolateViridis(luminanceScale(d.closest_distance));
    //   })
    //   .attr("stroke", "none")
    //   .attr("d", d3.area()
    //     .x(function(d) { return shrey_xScale(new Date(d.Timestamp).getTime()) })
    //     .y0(function(d) { return shrey_yScale(minValue) })
    //     .y1(function(d) { return shrey_yScale(maxValue) })
    //     )
    //     .attr("transform", "translate(100, 100)");
        
    var line = svg1_linechart.append('g').attr("transform", "translate("+leftMargin+",+"+ up_margin+ ")").selectAll(".line1");
      line = line.data([data])
      .enter()
      .append("path")
      .attr("class","line1")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return shrey_xScale(new Date(d.Timestamp).getTime()) })
        .y(function(d) { return shrey_yScale(d.Value) })
        );


        const totalLength = line.node().getTotalLength();

        // Set up the animation transition
        line
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(2000) // Duration of the animation in milliseconds
    .ease(d3.easeLinear)
    .attr('stroke-dashoffset', 0);
    

    var line2 = svg1_linechart.append('g').attr("transform", "translate("+leftMargin+",+"+ up_margin+ ")").selectAll(".line2");
    line2 = line2.data([data])
    .enter()
    .append("path")
    .attr("class","line2")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(function(d) { return shrey_xScale(new Date(d.Timestamp).getTime()) })
        .y(function(d) { return shrey_yScale(d.closest_value) })
        );
        // .attr("transform", "translate(100, 100)");

        line2
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(1500) // Duration of the animation in milliseconds
    .ease(d3.easeLinear)
    .attr('stroke-dashoffset', 0);

        
    
}
function create_entire_chart(data_list){
    // graphHeight = Math.floor((totalHeight - 100) / data_list.length);
    if(data_list.length>9){
        graphHeight = Math.floor((420) / data_list.length);
    }
    var mobile_data =[];
    d3.selectAll(".divp").remove();
    for(var i=0;i<data_list.length;i++){
        var temp = {};
        temp['key'] = "sensor"+data_list[i][0]['Sensor-id'];
        temp['data'] = data_list[i];
        mobile_data.push(temp);
    }
    console.log('a',mobile_data);
    // var mobile_data = [{'key':'sensor1',
    //                     'data':data},
    //                     {'key':'sensor2',
    //                     'data':data}]
    // var heroes = d3.nest()
    //     .key(function(d) {
    //         return d.name;
    //     })
    //     .entries(data);
    shrey_div =svg_linechart.selectAll(".divp")
        .data(mobile_data).enter()
        // .append("g");

    shrey_div.append("g")
    
    .attr("id", function(d) { console.log("shrey_div "+d);
        return d.key;
    })
    .attr("class","divp")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .on("mouseover", hmi)
            .on("mouseout", hmo);


            function hmi(event, d) {
            
               svg_linechart.selectAll(".divp")
                    .filter(function (otherLineData) {
                        return otherLineData !== d;
                    })
                    .classed("unhighlighted", true);
            }
            
            // Function to handle mouseout event
            function hmo() {
               svg_linechart.selectAll(".divp")
                    .classed("highlighted", false)
                    .classed("unhighlighted", false);
            }
    
    
    // .append("g")
    // .attr("transform", "translate("+leftMargin+","+ 0+ ")");

    mobile_data.forEach(function(d, i) { console.log(d.key);

        var divr = d3.select("#" + d.key);
        var temp_arr = get_min_max_cpm(d.data);
        var min_val = temp_arr[0];
        var max_val = temp_arr[1];

        create_line_chart(divr,d.data,min_val, max_val,topMargin-i*(graphHeight+innerMargin));
        // div.append('g')
        //     .attr('class', 'y axis')
        //     .attr("transform", "translate(" + margin.left + ",0)")
        //     .call(shrey_yAxis);

        // div.append('g')
        //     .attr('class', 'x axis')
        //     .attr("transform", "translate(" + margin.left + "," + height + ")")
        //     .call(shrey_xAxis);

        // div.append("g")
        // 	.attr("transform", "translate(" + margin.left + ",0)")
        // 	.append("path")
        //     .attr("class", "line1")
        //     .attr("d", function(d) { 
        //         return line(d.values);
        //     })
        //     .style("stroke", "#333");
    });
}
function create_scale_legend(){

    luminanceScale = d3.scaleLinear()
    // .domain([temp_d[0], temp_d[1]])
    .domain(0,12)
    .range([0.6, 0]); 
    var barX = 650; // Adjust as needed
    var barY = 50; // Adjust as needed
    var barWidth = 100; // Adjust as needed
    var barHeight = 20; /// Adjust as needed

// Get the domain values from your luminance scale
var minValuex = 0;
var maxValuex = 12;
console.log(minValuex,maxValuex);

// Append the gradient definition to the SVG
var defs = svg_linechart.append("defs");

var gradient = defs.append("linearGradient")
    .attr("id", "luminanceGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

// Add color stops to the gradient based on luminance scale
gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.interpolateBuGn(minValuex));
gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.interpolateBuGn(maxValuex));

// Append the bar with the gradient
var luminanceBar = svg_linechart.append("rect")
    .attr("x", barX)
    .attr("y", barY)
    .attr("width", barWidth)
    .attr("height", barHeight)
    .style("fill", "url(#luminanceGradient)");

// Optional: Add text labels for the domain values
var minValueLabel = svg_linechart.append("text")
    .text(12)
    .attr("x", barX - 5)
    .attr("y", barY + barHeight / 2)
    .style("text-anchor", "end")
    .attr("font-size","11")
    .attr("dy", "0.35em");

var maxValueLabel = svg_linechart.append("text")
    .text(0)
    .attr("x", barX + barWidth + 5)
    .attr("y", barY + barHeight / 2)
    .attr("font-size","11")
    .style("text-anchor", "start")
    .attr("dy", "0.35em");


    var startX = 370; // Adjust as needed
var startY = 0; // Adjust as needed
var lineLength = 100; // Adjust as needed

// Create a line ending with an arrow pointing to the right
svg_linechart.append("line")
    .attr("x1", startX)
    .attr("y1", startY)
    .attr("x2", startX + lineLength-5)
    .attr("y2", startY)
    .attr("stroke", "black")
    .attr("marker-end", "url(#arrow-marker)")
    .attr("transform", "translate("+280+",+"+ (77)+ ")")

// Add an arrowhead marker
svg_linechart.append("svg:defs").append("svg:marker")
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
svg_linechart.append("text")
    .text("Decreasing Proximity")
    .attr("x", startX + (lineLength-5) / 2)
    .attr("y", startY + 30) // Adjust the distance below the line
    .style("text-anchor", "middle")
    .attr("font-size","8")
    .attr("transform", "translate("+285+",+"+ (60)+ ")")
}
function create_tool_tip(){
    tooltip_shrey = d3.select("body").append('div')
    .attr('class','tooltip')
    .style('opacity',0);
}
document.addEventListener('DOMContentLoaded', function () {

    // svg_linechart = d3.select("#my_dataviz").append("svg")
    //     .attr("width", totalHeight)
    //     .attr("height", totalWidth)
    //     .append("g");
    svg_linechart = d3.select('#svg_timeseries').append("g");

    var chart_title =svg_linechart.append("text")
    .attr("text-anchor","end")
    .attr("x",totalWidth/2)
    .attr("y",0)
    .attr("font-size","22")
    .text('Innovative Time-series Chart')
    .attr("transform", "translate("+(leftMargin+30)+",+"+ (25)+ ")")

    var chart_desc = svg_linechart.append("text")
    .attr("text-anchor","end")
    .attr("x",totalWidth/2)
    .attr("y",0)
    .attr("font-size","10")
    .attr("transform", "translate("+400+",+"+ (35)+ ")");
    chart_desc.append("tspan")
                .text("Shows the cpm for the entire timeline of selected mobile sensors along with the promixity to the closest static sensor.  Marks - Line.")
                .attr("x", mapwidth / 2)
                .attr("dy", 10); 
    chart_desc.append("tspan")
        .text("Channels - Luminance, Color hue, (X,Y) position.")
        .attr("x", 100)
        .attr("dy", 10);

    var legend = svg_linechart.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(700,95)'); 

    // svg_linechart.selectAll('.legend-item').remove();
    var stypes = [{'color':'red','name':'Static Sensor'},
                    {'color':'steelblue','name':'Mobile Sensor'}]
    var legendItems = legend.selectAll('.legend-item')
        .data(stypes)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => 'translate(0,' + (i * 20) + ')');

    legendItems.append('rect')
        .attr('width', 11)
        .attr('height', 11)
        .style('fill', d => d.color);

    legendItems.append('text')
        .attr('x', 15)
        .attr('y', 8)
        .attr('dy', '.2em')
        .style('font-size',11)
        .style('text-anchor', 'start')
        .text(d => d.name);

        create_scale_legend();
        create_tool_tip();

});


function checkRegion() {
    regions_list = [];
    for (var i = 0; i < 5; i++) {
        var checkbox = document.getElementById("sc" + i);
        // var region = "close_sensor_" + i;
        
        if (checkbox && checkbox.checked) {
            // Check if the region is not already in the list
            if (regions_list.indexOf(i) === -1) {
                regions_list.push(i);
            }
        } else {
            // Remove the region from the list if the checkbox is unchecked
            var index = regions_list.indexOf(i);
            if (index !== -1) {
                regions_list.splice(index, 1);
            }
        }
    }
    var temp_arr = [];
    regions_list.forEach(function(d){
        for(var i=1;i<11;i++){
            temp_arr.push(i+parseInt(d*10));
        }
        
    });
    console.log(temp_arr);
    checkbox_func(temp_arr);
    // checkbox_func(regions_list);
    // return regions_list;
}
function checkbox_func(sensor_list){
    // var sensor_list = checkRegion();
    console.log(sensor_list);
    // ['8', '10', '47', '11', '6', '5', '46', '9', '7', '12']
    // sensor_list = ['close_sensor_8','close_sensor_10','close_sensor_47','close_sensor_11','close_sensor_6','close_sensor_5','close_sensor_46','close_sensor_9','close_sensor_7','close_sensor_12']
    
    var temp_list = [];
    for(var i=0;i<sensor_list.length;i++){
        temp_list.push(d3.csv("data/shrey_data/processed_close_sensor_"+sensor_list[i]+".csv"))
    }
    console.log(sensor_list);
    // [d3.csv("MC2/data/chart2_data/close_sensor_1.csv"),d3.csv("MC2/data/chart2_data/close_sensor_2.csv")];
    Promise.all(temp_list)
            .then(function (csv_data) {
        cs_1_data = csv_data[0];
        create_x_axis(cs_1_data);
        create_entire_chart(csv_data);
    
    });
    sensor_list = [];

}

// function selected_sensor_call(){
//     var selectedValue = document.getElementById("simpleDropdown").value;
//     var temp_arr = [];
//     for(var i=1;i<11;i++){
//         temp_arr.push(i+parseInt(selectedValue));
//     }
//     console.log(temp_arr);
//     checkbox_func(temp_arr);

// }
