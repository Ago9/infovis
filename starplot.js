d3.json("datapoint.json", function (error, data) {
    if (error) throw error;
    
var width = 700;
var height = 700;
var padding_height = 20;
var level = 5;
var padding_width = 0;
var translate_x = (width/2)
var translate_y = 30;
var features = data[0].map(function(d){ return d.asse; });
var max_value = 10;
var n_axis = features.length;
var colors = ["#1700e8", "#2e00d1", "#4600b9", "#5d00a2", "#74008b", "#8b0074", "#a2005d", "#b90046", "#d1002e", "#e80017"];

var svg = d3.select("body")
    .selectAll("svg")
    .append("svg");

var g = d3.select("body")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 " + ((width * 2) + padding_width) + " " + (height + padding_height))
    .append("g")
    .attr("transform", "translate(" + translate_x + "," + translate_y + ")");

var radialScale = d3.scaleLinear()
    .domain([0,10])
    .range([0,250]);


// plot the segment
for(var j=0; j<=level; j++){

    g.selectAll(".detail_levels")
        .data(features)
        .enter()
        .append("svg:line")
        .attr("x1", function(d,i){ return angleToCoordiante((Math.PI/2) + (2 * Math.PI * i / n_axis), j*2).x;})
        .attr("y1", function(d,i){ return angleToCoordiante((Math.PI/2) + (2 * Math.PI * i / n_axis), j*2).y;})
        .attr("x2", function(d,i){ return angleToCoordiante((Math.PI/2) + (2 * Math.PI * (i+1) / n_axis), j*2).x;})
        .attr("y2", function(d,i){ return angleToCoordiante((Math.PI/2) + (2 * Math.PI * (i+1) / n_axis), j*2).y;})
        .attr("stroke", "#a3a5a8")
        .attr("stroke-width", "2.5px")
        .attr("stroke-opacity","0.9")
        .on("click",function(d,i){
            changeAxes(data, i, i+1);
        })           
}

// plot the test

for(var j=0; j<=level; j++){
    g.selectAll(".detail_levels")
        .data([1])
        .enter()
        .append("svg:text")
        .attr("x", function(d,i){ return angleToCoordiante((Math.PI/2) + (2 * Math.PI * i / n_axis), j*2).x + 5;})
        .attr("y", function(d,i){ return angleToCoordiante((Math.PI/2) + (2 * Math.PI * i / n_axis), j*2).y - 5;})
        .text(j*2)
}


function angleToCoordiante(angle, value){
    var x = Math.cos(angle) * radialScale(value);
    var y = Math.sin(angle) * radialScale(value);
    return { "x": 300 + x, "y": 300 - y };
}

// axis

var axis = g.selectAll(".axis")
    .data(features)
    .enter()
    .append("g")
    .attr("class","axis");

// draw the axis

axis.append("line")
     .attr("class", "line")
     .attr("x1", 300)
     .attr("y1", 300)
     .attr("x2", function(d,i) { return angleToCoordiante((Math.PI/2) + (2 * Math.PI * i / n_axis), 10).x;})
     .attr("y2", function(d,i) { return angleToCoordiante((Math.PI/2) + (2 * Math.PI * i / n_axis), 10).y;})
     .attr("stroke", "#abb3ad")
     .attr("stroke-width", "3px")
     .attr("stroke-opacity","2")
     .on("click", function(d,i){
         updateData(data, i);
     });
     
// draw the label 
axis.append("text")
     .attr("class", function(d,i){ return "label" + i; })
     .text(function(d) { return d; })
     .attr("x", function(d,i) { return angleToCoordiante((Math.PI/2) + (2 * Math.PI * i / n_axis), 11).x;})
     .attr("y", function(d,i) { return angleToCoordiante((Math.PI/2) + (2 * Math.PI * i / n_axis), 11).y;});
        

// line

var line = d3.line()
    .x(d=> d.x)
    .y(d=> d.y);

function getPathCoordinates(data_point){
    var coordinate = [];
    for (var i = 0; i<n_axis; i++){
        var ft_name = data_point[i];
        var angle = (Math.PI/2) + (2* Math.PI * i / n_axis);
        coordinate.push(angleToCoordiante(angle, ft_name.value));
    }
    return coordinate;
}

// create a path for each coordinate

for (var i = 0; i < data.length; i ++){
    var d = data[i];
    var color = colors[i];
    var coordinates = getPathCoordinates(d);

    coordinates.push(coordinates[0]);
    
    //draw the path element
    
    g.append("path")
        .datum(coordinates)
        .attr("class", "path" + i)
        .attr("d", line)
        .attr("stroke-width", "3px")
        .attr("stroke", color)
        .attr("fill", "none")
        .attr("opacity", 0.4)

        .on("mouseover", function (d,i){
            d3.select(this).transition()
                .duration("50")
                .attr("opacity", 0.7)
        })
        
        .on("mouseout", function (d,i){
            d3.select(this).transition()
                .duration("50")
                .attr("opacity", 0.4)
        });
}


// reverse the axes
function updateData(data, d){
    // update data
    var select;
    for (var i=0; i< data.length;i++){
        select = data[i];
        select[d].value = 10 - select[d].value;
    // update coordinate
        var coordinates = getPathCoordinates(select);
        coordinates.push(coordinates[0]);
    // update path    
        g.selectAll(".path" + i)
            .datum(coordinates)
            .attr("d", line)
            .transition(200);         
    }
};

// flip the axis
function changeAxes(data, a, b){

    if(b==5) b=0;

    for(var i=0; i<data.length;i++){
        // update data
        sel = data[i];
        temp = sel[a].value;
        sel[a].value = sel[b].value;
        sel[b].value = temp; 
        lab = sel[a].asse
        sel[a].asse = sel[b].asse;
        sel[b].asse = lab;
        // update coordinate
        var coordinates = getPathCoordinates(sel);
        coordinates.push(coordinates[0]);
        // update path
        g.selectAll(".path"+i)
            .datum(coordinates)
            .attr("d", line)
            .transition(200);
        // update label
        g.select(".label" + a).text(sel[a].asse);
        g.select(".label" + b).text(sel[b].asse);
    }
   
    }
});
