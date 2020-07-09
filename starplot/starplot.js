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
        .attr("x1", function(d,i){ return angleToCoordinate((Math.PI/2) + (2 * Math.PI * i / n_axis), j*2).x;})
        .attr("y1", function(d,i){ return angleToCoordinate((Math.PI/2) + (2 * Math.PI * i / n_axis), j*2).y;})
        .attr("x2", function(d,i){ return angleToCoordinate((Math.PI/2) + (2 * Math.PI * (i+1) / n_axis), j*2).x;})
        .attr("y2", function(d,i){ return angleToCoordinate((Math.PI/2) + (2 * Math.PI * (i+1) / n_axis), j*2).y;})
        .attr("stroke", "#a3a5a8")
        .attr("stroke-width", "2.5px")
        .attr("stroke-opacity","0.9")
        
}

// plot the test

for(var j=0; j<=level; j++){
    g.selectAll(".detail_levels")
        .data([1])
        .enter()
        .append("svg:text")
        .attr("x", function(d,i){ return angleToCoordinate((Math.PI/2) + (2 * Math.PI * i / n_axis), j*2).x + 5;})
        .attr("y", function(d,i){ return angleToCoordinate((Math.PI/2) + (2 * Math.PI * i / n_axis), j*2).y - 5;})
        .text(j*2)
}


function angleToCoordinate(angle, value){
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
     .attr("x2", function(d,i) { return angleToCoordinate((Math.PI/2) + (2 * Math.PI * i / n_axis), 10).x;})
     .attr("y2", function(d,i) { return angleToCoordinate((Math.PI/2) + (2 * Math.PI * i / n_axis), 10).y;})
     .attr("stroke", "#abb3ad")
     .attr("stroke-width", "2px")
     .attr("stroke-opacity","2")
     .on("click", function(d,i){
         updateData(data, i);
     });
     
// draw the label 
axis.append("text")
     .attr("class", function(d,i){ return "label" + i; })
     .text(function(d) { return d; })
     .attr("x", function(d,i) { return angleToCoordinate((Math.PI/2) + (2 * Math.PI * i / n_axis), 11).x;})
     .attr("y", function(d,i) { return angleToCoordinate((Math.PI/2) + (2 * Math.PI * i / n_axis), 11).y;});
        

// line

var line = d3.line()
    .x(d=> d.x)
    .y(d=> d.y);

function getPathCoordinates(data_point){
    var coordinate = [];
    for (var i = 0; i<n_axis; i++){
        var ft_name = data_point[i];
        var angle = (Math.PI/2) + (2* Math.PI * i / n_axis);
        coordinate.push(angleToCoordinate(angle, ft_name.value));
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

var triangolo1 = [];
triangolo1.push({ "x": 300, "y": 300 });
point = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 0 / n_axis), 10)
point1 = angleToCoordinate((Math.PI/2) + (2 * Math.PI * (1) / n_axis), 10)
point.x = point.x -4
point.y = point.y +4
point1.x = point1.x +4
point1.y = point1.y -4
triangolo1.push(point);
triangolo1.push(point1);
triangolo1.push({ "x": 300, "y": 300 });

t1 = g.append("path")
        .datum(triangolo1)
        .attr('class', "triangolo" + i)
        .attr("d", line)
        .attr("visibility", "Hidden")
        .attr("pointer-events", "fill")
        .on("click", function(){
           i = d3.select(this).attr("stroke-dashoffset");
           changeAxes(0);
        })

var triangolo2 = [];
triangolo2.push({ "x": 300, "y": 300 });
point = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 1 / n_axis), 10)
point1 = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 2 / n_axis), 10)
point.x = point.x -4
point.y = point.y +4
point1.x = point1.x -4
point1.y = point1.y +4
triangolo2.push(point);
triangolo2.push(point1);
triangolo2.push({ "x": 300, "y": 300 });

t2 = g.append("path")
        .datum(triangolo2)
        .attr('class', "triangolo" + i)
        .attr("d", line)
        .attr("visibility", "Hidden")
        .attr("pointer-events", "fill")
        .on("click", function(){
           i = d3.select(this).attr("stroke-dashoffset");
           changeAxes(1);
        })

var triangolo3 = [];
triangolo3.push({ "x": 300, "y": 300 });
point = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 2 / n_axis), 10)
point1 = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 3 / n_axis), 10)
point.x = point.x +4
point.y = point.y -4
point1.x = point1.x -4
point1.y = point1.y +4
triangolo3.push(point);
triangolo3.push(point1);
triangolo3.push({ "x": 300, "y": 300 });

t3 = g.append("path")
        .datum(triangolo3)
        .attr('class', "triangolo" + i)
        .attr("d", line)
        .attr("visibility", "Hidden")
        .attr("pointer-events", "fill")
        .on("click", function(){
           i = d3.select(this).attr("stroke-dashoffset");
           changeAxes(2);
        })

var triangolo4 = [];
triangolo4.push({ "x": 300, "y": 300 });
point = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 3 / n_axis), 10)
point1 = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 4 / n_axis), 10)
point.x = point.x +4
point.y = point.y -4
point1.x = point1.x -4
point1.y = point1.y +4
triangolo4.push(point);
triangolo4.push(point1);
triangolo4.push({ "x": 300, "y": 300 });

t4 = g.append("path")
        .datum(triangolo4)
        .attr('class', "triangolo" + i)
        .attr("d", line)
        .attr("visibility", "Hidden")
        .attr("pointer-events", "fill")
        .on("click", function(){
           i = d3.select(this).attr("stroke-dashoffset");
           changeAxes(3);
        })

var triangolo5 = [];
triangolo5.push({ "x": 300, "y": 300 });
point = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 4 / n_axis), 10)
point1 = angleToCoordinate((Math.PI/2) + (2 * Math.PI * 5 / n_axis), 10)
point.x = point.x +4
point.y = point.y -4
point1.x = point1.x +4
point1.y = point1.y -4
triangolo5.push(point);
triangolo5.push(point1);
triangolo5.push({ "x": 300, "y": 300 });

t5 = g.append("path")
        .datum(triangolo5)
        .attr('class', "triangolo" + i)
        .attr("d", line)
        .attr("visibility", "Hidden")
        .attr("pointer-events", "fill")
        .on("click", function(){
           i = d3.select(this).attr("stroke-dashoffset");
           changeAxes(4);
        })

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
function changeAxes(a){

    b = a+1;
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
