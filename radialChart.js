var svg_Chart6;
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
var static_colorArray = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];
var sensorLegendData = [];
const svgWidth_Chart6 = 700;
const svgHeight_Chart6 = 620;
let lolipop_selectedSensorIds = [];
let selectedSensors_Chart6_length;
var svgLegend;
var tooltip_chart6;
const sensorColorMap = {
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
let full_days_chart6 = [
    { Timestamp: "2020-04-06 00:00:00"},
    { Timestamp: "2020-04-06 06:00:00"},
    { Timestamp: "2020-04-06 12:00:00"},
    { Timestamp: "2020-04-06 18:00:00"},
    { Timestamp: "2020-04-07 00:00:00"},
    { Timestamp: "2020-04-07 06:00:00"},
    { Timestamp: "2020-04-07 12:00:00"},
    { Timestamp: "2020-04-07 18:00:00"},
    { Timestamp: "2020-04-08 00:00:00"},
    { Timestamp: "2020-04-08 06:00:00"},
    { Timestamp: "2020-04-08 12:00:00"},
    { Timestamp: "2020-04-08 18:00:00"},
    { Timestamp: "2020-04-09 00:00:00"},
    { Timestamp: "2020-04-09 06:00:00"},
    { Timestamp: "2020-04-09 12:00:00"},
    { Timestamp: "2020-04-09 18:00:00"},
    { Timestamp: "2020-04-10 00:00:00"},
    { Timestamp: "2020-04-10 06:00:00"},
    { Timestamp: "2020-04-10 12:00:00"},
    { Timestamp: "2020-04-10 18:00:00"}
];
var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
full_days_chart6.forEach(d => {
    d.parsedTime = parseTime(d.Timestamp);
});
var timeExtent = d3.extent(full_days_chart6, d => d.parsedTime);
let globalTimeScale_Chart6 = d3.scaleTime()
    .domain(timeExtent)
    .range([0, 2 * Math.PI * ((20 - 1) / 20)]);
//Use List named selectedSensors_Chart6 to draw Radial Bubble Chart
//Use List named lolipop_selectedSensorIds to draw Lollipop Chart
document.addEventListener("DOMContentLoaded", function () {
    // const submitButton_Chart6 = document.getElementById("submitSensors");
    // const clearButton_Chart6 = document.getElementById("clearChart");
    tooltip_chart6 = d3.select(".tooltip");
    tooltip_chart6 = d3.select("body").append('div')
    .attr('class','tooltip')
    .style('opacity',0);

    svg_Chart6 = d3.select("#svg_radial")
        .attr("width", svgWidth_Chart6)
        .attr("height", svgHeight_Chart6)
        .append("g")
        .attr("transform", `translate(${svgWidth_Chart6 / 2 -45},${svgHeight_Chart6 / 2  + 45})`);
    
    var chart_title =svg_Chart6.append("text")
        .attr("text-anchor","end")
        .attr("x",svgWidth_Chart6/7 - 260)
        .attr("y",svgHeight_Chart6-925 - 40)
        .attr("font-size","22")
        .text('Circle of Influenza Chart')
        .attr("transform", "translate("+280+",15)");

     var chart_desc = svg_Chart6.append("text")
        .attr("text-anchor","end")
        .attr("x",svgWidth_Chart6/7 - 250)
        .attr("y",svgHeight_Chart6-925 - 40)
        .attr("font-size","9")
        .text('Shows Sensor radiation regionwise across entire timeline. Marks - Points. Channels - Radius, Radial position, Color hue.')
        .attr("transform", "translate("+430+",+"+ (35)+ ")");

});
function drawRadial(selectedSensors_Chart6,regions){

    selectedSensors_Chart6 = selectedSensors_Chart6.slice(0, 10);
    console.log("selectedSensors: ", selectedSensors_Chart6);
    selectedSensors_Chart6_length = selectedSensors_Chart6.length;
    function drawRadialChart(selectedSensors_Chart6) {
        console.log("drawRadialChart is called, " + selectedSensors_Chart6);
        svg_Chart6.selectAll("*").remove();
        let sensorDataMap_Chart6 = {};

        const dataPromises = selectedSensors_Chart6.map(sensorId => {
            let folderPath, fileName;
            if (sensorId.includes('S')) {
                folderPath = "data/data_tengyu/SortbyStatic/";
                fileName = `${sensorId}-Static-6hrAverage.csv`;
            } else { 
                folderPath = "data/data_tengyu/SortbyMobile/";
                fileName = `${sensorId}-MobileSensor-6hrAverage.csv`;
            }
            return d3.csv(folderPath + fileName).then(data => {
                sensorDataMap_Chart6[sensorId] = data;
            });
        });

        Promise.all(dataPromises).then(() => {
            const combinedData_Chart6 = Object.values(sensorDataMap_Chart6).flat();
            const globalSizeScale_Chart6 = computeSizeScale(combinedData_Chart6);
            const maxSingleRadius = Math.min(svgWidth_Chart6, svgHeight_Chart6)/3;
            const spacing = maxSingleRadius / selectedSensors_Chart6.length;
            const uniqueDates = Array.from(new Set(combinedData_Chart6.map(d => d.Timestamp.split(" ")[0])));
            const numberOfDays_chart6 = uniqueDates.length;
            populateDateDropdown_event();
            sensorLegendData = [];
            selectedSensors_Chart6.forEach((sensorId, index) => {
                const circleRadius_Chart6 = maxSingleRadius - (index * spacing);
                const data_chart6 = sensorDataMap_Chart6[sensorId];
                var sensorName;
                if (sensorId.includes('M')) { 
                    sensorName = "Mobile "+ sensorId.split("_")[1];
                    console.log(sensorName)
                    createCircle(data_chart6, circleRadius_Chart6, colorArray[parseInt(sensorId.split("_")[1]) - 1], sensorId,sensorName, globalSizeScale_Chart6);
                } else {
                    sensorName = "Static "+ sensorId.split("_")[1];
                    console.log(sensorName)
                    createCircle(data_chart6, circleRadius_Chart6, sensorColorMap[parseInt(sensorId.split("_")[1])], sensorId,sensorName, globalSizeScale_Chart6);
                }
                
            });
            drawLabelCircle(maxSingleRadius + 30, ["D1", "D2", "D3", "D4", "D5"]); 
            drawDottedLinesForDays(maxSingleRadius, numberOfDays_chart6, 30)
     });
    }

    drawRadialChart(selectedSensors_Chart6);

    var chart_title =svg_Chart6.append("text")
        .attr("text-anchor","end")
        .attr("x",svgWidth_Chart6/7 - 260)
        .attr("y",svgHeight_Chart6-925-40)
        .attr("font-size","22")
        .text('Circle of Influenza Chart')
        .attr("transform", "translate("+280+",15)");
       

     var chart_desc = svg_Chart6.append("text")
        .attr("text-anchor","end")
        .attr("x",svgWidth_Chart6/7 - 250)
        .attr("y",svgHeight_Chart6-925-40)
        .attr("font-size","10")
        .text('Shows Sensor radiation regionwise across entire timeline.  Marks - Points. Channels - Radius, Radial position, Color hue.')
        .attr("transform", "translate("+430+",+"+ (35)+ ")");
    
    dateDropdown.addEventListener("change", function () {
        highlightBubbles(this.value);
    });

   
    
    function createCircle(sensorData, outerRadius_Chart6, color, sensorId_draw, sensorName, globalSizeScale_Chart6) {
        sensorLegendData.push({ name: sensorName, color: color });

        var dmin = d3.min(sensorData, d => +d.avg_cpm);
        var dmax = d3.max(sensorData, d => +d.avg_cpm);
     
        var circleRadius_Chart6  = outerRadius_Chart6; //circleRadius_Chart6 use for calucate the size of bubble
        if (circleRadius_Chart6 < 30) {
            circleRadius_Chart6 = 30;
        }
        if (circleRadius_Chart6 > 110 && selectedSensors_Chart6_length > 6) {
            circleRadius_Chart6 = 110;
        }
        sensorData.forEach(function(d) {
            d.parsedTime = parseTime(d.Timestamp);
        });
        const sizeScale = d3.scaleSqrt()
            .domain([dmin, dmax])
            .range([circleRadius_Chart6 / 20, circleRadius_Chart6 / 9]);
        
            var sensorCircle_Chart6 = svg_Chart6.append("circle")
            .attr("r", outerRadius_Chart6)
            .attr("cx", 0).attr("cy", 0)
            .style("fill", "none")
            .style("stroke", color)
            .style("stroke-width", 2)
            .attr("class", "sensorCircle_Chart6 " + sensorName)
            .datum({ sensorId: sensorId_draw });
        
        var textLabel = svg_Chart6.append("text")
            .attr("x", 0)
            .attr("y", -280)
            .attr("text-anchor", "middle") 
            .attr("dy", ".2em") 
            .style("font-size", "18px") 
            .style("font-weight", 300)
            .text(regions);
        
        sensorCircle_Chart6.on("mouseover", function (event, d) {
            console.log(d.sensorId);
            d3.select(this)
                // .style("stroke", "green")
                .style("stroke-width", 3);
        })
        .on("mouseout", function (event, d) {
            if (!d3.select(this).classed("selectedSensor")) {
                d3.select(this)
                    .style("stroke", color)
                    .style("stroke-width", 2);
            }
        })
        .on("click", function (event, d) {
            console.log('clicked');
            //if (event.ctrlKey || event.metaKey) {
                console.log('Key pressed');
                const isSelected = d3.select(this).classed("selectedSensor");
                d3.select(this).classed("selectedSensor", !isSelected);

                if (!isSelected) {
                    lolipop_selectedSensorIds.push(d.sensorId);
                } else {
                    lolipop_selectedSensorIds = lolipop_selectedSensorIds.filter(id => id !== d.sensorId);
                }
            //}
            console.log(lolipop_selectedSensorIds);
        
            if(lolipop_selectedSensorIds.length > 0){
                console.log('hello world');
                openPopup(lolipop_selectedSensorIds);
                // drawLollipopChart(lolipop_selectedSensorIds);   
            }

            
            });
            

       
        // d3.select(window).on("keyup", function(event) {
        //     if ((event.key === "Control" || event.key === "Meta") && lolipop_selectedSensorIds.length > 0) {
        //         drawLollipopChart(lolipop_selectedSensorIds);
        //     }
        // });
        var circle_degree_adjust = 10;
        let bubbles_Chart6 = svg_Chart6.selectAll(".bubble." + sensorId_draw)
            .data(sensorData)
            .enter().append("circle")
            .attr("class", "bubble " + sensorId_draw)
            .attr("r", d => sizeScale(+d.avg_cpm))
            // .attr("cx", (d, i) => outerRadius_Chart6 * Math.cos(2 * Math.PI * i / sensorData.length - Math.PI / 2)) 
            // .attr("cy", (d, i) => outerRadius_Chart6 * Math.sin(2 * Math.PI * i / sensorData.length - Math.PI / 2)) 
            .attr("cx", d => outerRadius_Chart6 * Math.cos(globalTimeScale_Chart6(d.parsedTime) - Math.PI / 2))
            .attr("cy", d => outerRadius_Chart6 * Math.sin(globalTimeScale_Chart6(d.parsedTime) - Math.PI / 2))
            .style("fill", color);
        
        //add tooltip
        svg_Chart6.selectAll(".bubble." + sensorId_draw).on("mousemove", function (e, d) {
            d3.select(this).attr("r", d => sizeScale(+d.avg_cpm)+5);

            tooltip_chart6.style("opacity", "1");
            tooltip_chart6
            .html("Sensor: " + sensorName + "<br>Timestamp: " + d.Timestamp + "<br>Average CPM reading: " + parseFloat(d.avg_cpm).toFixed(2)+" cpm")
            .style("left", (e.pageX + 5) + "px")
            .style("top", (e.pageY - 28) + "px");
        });
        svg_Chart6.selectAll(".bubble." + sensorId_draw).on("mouseout", function (e, d) {
            d3.select(this).attr("r", d => sizeScale(+d.avg_cpm));
            console.log("mouseout");
            tooltip_chart6.transition().duration(200).style("opacity", "0");
        });
        //svg6_Chart6.selectAll(".bubble." + sensorId_draw)
        bubbles_Chart6.on("click", function (event, d) {
            console.log('clicked',sensorId_draw);
            //if (event.ctrlKey || event.metaKey) {
                // console.log('Key pressed');
                // const isSelected = d3.select(this).classed("selectedSensor");
                // d3.select(this).classed("selectedSensor", !isSelected);

                // if (!isSelected) {
                    // lolipop_selectedSensorIds.push(sensorId_draw);
                // } else {
                //     lolipop_selectedSensorIds = lolipop_selectedSensorIds.filter(id => id !== sensorId_draw);
                //     console.log(lolipop_selectedSensorIds);
                // }
            //}
            // console.log(lolipop_selectedSensorIds);
            console.log(sensorId_draw);
        
            // if(lolipop_selectedSensorIds.length > 0){
                // console.log('hello world');
                openPopup(sensorId_draw);
                //drawLollipopChart(lolipop_selectedSensorIds);   
            // }

            
            });
           

    }

    function openPopup(sensorId) {
        console.log('popup open');
        const popup = document.getElementById('popupRadial');
        const popupSensorId = document.getElementById('popupSensorId');
        
        // Customize this part based on the data you want to display in the popup
        //popupSensorId.textContent = `Sensor ID: ${sensorId}`;
        // Set the size of the popup dynamically
       // popup.style.width = `500px`;
       /// popup.style.height = `500px`;
       
       // Add the blurred-background class to apply the blur effect
       // body.classed('blurred-background', true);

    //    var modal1 = new bootstrap.Modal(document.getElementById('exampleModal')); 
    //     function toggleModal1() { 
              
    //         // Toggle Modal 
    //         modal1.toggle(); 
              
    //         // Toggle the modal again after 3 seconds 
    //         setTimeout(() => { 
    //             modal1.toggle(); 
    //         }, 30);
    //     }
    console.log(sensorId);
    // console.log(sensorId[0].split("_")[1]);

    if(sensorId.includes("S_")){
        popupSensorId.textContent = `Static Sensor: ${sensorId.split("_")[1]}`;
    }else{
        popupSensorId.textContent = `Mobile Sensor: ${sensorId.split("_")[1]}`;
    }
        
    //    const myInput = document.getElementById('popupSensorId');
       

    //     myModal.addEventListener('shown.bs.modal', () => {
    //     myInput.focus();
    //     })

    //$('#exampleModal').modal('show');

       

        drawLollipopChart(sensorId);
      
        // Show the popup
        popup.style.display = 'block';
        element = document.querySelector('#SvgContainer');
        console.log(element);
        element.classList.add('blurred-container');

      }
      
    

    function drawLollipopChart(selectedSensorIds) {
        console.log("drawLollipopChart is called, " + selectedSensorIds);
        drawlollipop(selectedSensorIds);
    }

    function highlightBubbles(selectedEventTime) {
        if (!selectedEventTime) {
            svg_Chart6.selectAll(".bubble").style("opacity", 0.8)
                                            .style("stroke", "none");
            return;
        }
       
        svg_Chart6.selectAll(".bubble").style("opacity", 0.2);
        svg_Chart6.selectAll(".bubble")
            .filter(d => new Date(d.Timestamp) >= new Date(selectedEventTime))
            .style("opacity", 0.8)
            .style("stroke", "black")
            .raise();
       
    }


    function computeSizeScale(combinedData_Chart6) {
        const maxCpm = d3.max(combinedData_Chart6, d => +d.avg_cpm);
        return d3.scaleSqrt().domain([0, maxCpm]).range([5, 20]);
    }
    function drawLabelCircle(radius, labels) {
        const labelGroup = svg_Chart6.append("g")
            .attr("class", "label-circle");
        labelGroup.append("circle")
            .attr("r", radius)
            .attr("cx", 0)
            .attr("cy", 0)
            .style("fill", "none")
            .style("stroke", "grey");
    
            labels.forEach((label, index) => {
                let labelRadiusAdjustment = 20;
                let dyAdjustment = "0.35em"; 
                let textAnchor = "middle";
                
                const angle = index * (2 * Math.PI / labels.length) - Math.PI / 2;
                const adjustedRadius = radius + labelRadiusAdjustment;
                const x = adjustedRadius * Math.cos(angle);
                const y = adjustedRadius * Math.sin(angle);
        
                labelGroup.append("text")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dyAdjustment)
                    .attr("text-anchor", textAnchor)
                    .style("fill", "black")
                    .text(label);
            });
    }

    function drawDottedLinesForDays(outerRadius, numberOfDays, labelRadiusAdjustment) {
        const extendedRadius = outerRadius + labelRadiusAdjustment; // Adjust this radius to match the label circle's outer edge
        for (let i = 0; i < numberOfDays; i++) {
            const angle = 2 * Math.PI * i / numberOfDays - Math.PI / 2;
            const x1 = 0; // Center of the circle
            const y1 = 0; // Center of the circle
            const x2 = extendedRadius * Math.cos(angle);
            const y2 = extendedRadius * Math.sin(angle);
    
            svg_Chart6.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .style("stroke", "grey")
                .style("stroke-width", 1)
                .style("stroke-dasharray", "4"); // This creates the dotted effect
        }
    }
    

    // function populateDateDropdown(uniqueDates) {
    //     const dateDropdown = document.getElementById("dateDropdown");
    //     dateDropdown.innerHTML = '';
    //     dateDropdown.options.add(new Option('Select a date', ''));
    //     uniqueDates.forEach(date => {
    //         dateDropdown.options.add(new Option(date, date));
    //     });
    // }
    function populateDateDropdown_event() {
        const dateDropdown = document.getElementById("dateDropdown");
        dateDropdown.innerHTML = '';
        dateDropdown.options.add(new Option('Select an event', ''));
        dateDropdown.options.add(new Option('Earthquake - 2020-04-08 08:36:00', '2020-04-08T08:36:00'));
        dateDropdown.options.add(new Option('Power Restoration - 2020-04-09 04:25:30', '2020-04-09T04:25:30'));
        dateDropdown.options.add(new Option('Aftershock - 2020-04-09 15:00:30', '2020-04-09T15:00:30'));
    }
    
    function drawLegend() {
        svgLegend=d3.select('#radialBubbleChart-legend')
        svg_Chart6.selectAll('.legend-item').remove(); 
        svg_Chart6.select('.legend').remove();
       
        
        var legend = svg_Chart6.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(' +(180) + ', -280)'); 
        
        var legendItems = legend.selectAll('.legend-item')
            .data(sensorLegendData)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => 'translate(0,' + (i * 20) + ')');
    
        legendItems.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', d => d.color);
    
        legendItems.append('text')
            .attr('x', 25)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'start')
            .text(d => d.name);
    }
    
}

function closePop() {
    const popup = document.getElementById('popupRadial');
    //document.getElementById("exampleModal").hidden = true;
    //body.classed('blurred-background', false);
    // Hide the popup
    popup.style.display = 'none';

    element = document.querySelector('#SvgContainer');
        console.log(element);
 element.classList.remove('blurred-container');
}