var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var radius  = Math.min(width, height) / 2 - 40
var r = 180
var inner = 180/2


// chart of year
var svg1 = d3.select("#chart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// chart genre-platform
var svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// chart platform-year
var svg3 = d3.select("#chart3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// chart market areas
var svg4 = d3.select("#chart4")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + width /2 + "," + height/2 + ")");

// chart genre-market areas

var svg5 = d3.select("#chart5")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  

// tooltip 1° chart

var tooltip1 = d3.select("body")
    .append("div")	
    .attr("class", "tooltip1")				
    .style("opacity", 0);

// tooltip 5° chart

var tooltip2 = d3.select("body")
    .append("div")	
    .attr("class", "tooltip2")				
    .style("opacity", 0);

/////////////////////////////////////////////////////// DATA MANIPOLATION ///////////////////////////////////////////////////////

d3.csv("vgsales.csv").then(function(data) {

// drop N/A values 
    data = data.filter(function(d){ return d.Year != "N/A" && d.Year < 2017})
    data = data.filter(function(d){ return d.Genre != "N/A" })
    data = data.filter(function(d){ return d.Platform != "N/A" })
    data = data.filter(function(d){ return d.NA_Sales != "N/A" && d.EU_Sales != "N/A" && d.JP_Sales != "N/A" && d.Other_Sales != "N/A" })

// data 1° chart
    var year = d3.map(data, function(d){ return d.Year}).keys().sort(function(a,b){ return a-b})

    var sales_year = d3.nest()
        .key(function(d){ return d.Year})
        .rollup(function(v){ return {
            count: v.length,
            total: Math.round(d3.sum(v, function(d){ return d.Global_Sales}))
        };})
        .entries(data)

// data 2° chart

    var Platform = d3.nest()
        .key(function(d){ return d.Platform; })
        .key(function(d){ return d.Genre; })
        .rollup(function(v){
            return Math.round(d3.sum(v, function(d){ return d.Global_Sales})) })
        .entries(data)   

// data 3° chart

    var platform_year = d3.nest()
        .key(function(d){ return d.Year }).sortKeys(d3.descending)
        .key(function(d){ return d.Platform })
        .rollup(function(v){  return  Math.round(d3.sum(v, function(d){ return d.Global_Sales})) })
        .entries(data)

// data 4° chart

    var na = d3.sum(data, function(d){ return d.NA_Sales;})
    var eu = d3.sum(data, function(d){ return d.EU_Sales;})
    var jp = d3.sum(data, function(d){ return d.JP_Sales;})
    var other = d3.sum(data, function(d){ return d.Other_Sales;})

    var sales = {Nord_America : na, Europe : eu, Japan: jp, Other : other}
    var total = Math.round(na + eu + jp + other);  
    
// data 5° chart

    sales_genre = d3.nest()
        .key(function(d){ return d.Genre})
        .rollup(function(v){ return {
            nord_america : d3.sum(v, function(d){ return d.NA_Sales;}).toFixed(0),
            europe : d3.sum(v, function(d){ return d.EU_Sales;}).toFixed(0),
            japan : d3.sum(v, function(d){ return d.JP_Sales;}).toFixed(0),
            other : d3.sum(v, function(d){ return d.Other_Sales;}).toFixed(0)};
        })
        .entries(data)    

    var subgroups = ["nord_america","europe","japan","other"] 
    var groups = d3.map(sales_genre, function(d){ return d.key}).keys()

/////////////////////////////////////////////////////// DRAW THE CHART ///////////////////////////////////////////////////////

// 1° chart - sales timeline

    color_year = d3.scaleOrdinal(d3.schemeBlues[9])

    var x1 = d3.scaleBand()
        .domain(year) 
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1)

    svg1.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x1))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")      

    var y1 = d3.scaleLinear()
        .domain([0, d3.max(sales_year, d=> d.value.total)])
        .range([ height - margin.bottom, margin.top]);

    svg1.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y1))
        .append("text")
        .attr("fill", "#000")
        .attr("x", -25)
        .attr("y",  10)
        .attr("transform", "rotate(-90)")
	      .attr("dy", "0.71em")
	      .attr("text-anchor", "end")
	      .text(" Sales (Mln)");

    svg1.append("g")
        .attr("fill", "#3f8ab3")
        .selectAll("rect")
        .data(sales_year)
        .join("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y1(d.value.total))
        .attr("height", d => y1(0) - y1(d.value.total))
        .attr("width", x1.bandwidth())
        .on("mouseover", function(d){
            d3.select(this)
                .attr("fill","#e66f00")
        
            tooltip1.transition()		
                .duration(200)		
                .style("opacity", .9)	
        
            tooltip1.html("In " + d.key + "</br>" + " was sold " + "</br>" + d.value.total +  " milion copies"  + "</br>" + "of " + d.value.count + " titles ")	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })			
        .on("mouseout", function(d){
            d3.select(this)
                .attr("fill","#3f8ab3")
        
            tooltip1.transition()		
                .duration(200)		
                .style("opacity", 0)
        });

     svg1.append('text')
        .attr('x', width -20 )
        .attr('y', height -20 )
        .attr("font-size", "12px")
        .attr('text-anchor', 'middle')
        .text(" Years")

// 2° chart genre-platform

    var x2 = d3.scaleBand()
    	.rangeRound([0, width])
    	.padding(0.1);

    var y2 = d3.scaleLinear()
    	.rangeRound([height, 0]);

    var options_genre = d3.map(data, function(d){ return d.Platform}).keys()
    var color_genre = ["#3103ff","#001eff","#0089ff","#00ca98","#32a852","#2f7a34","#fa7e61","#f44174","#e8aeb7","#33658a","#eb4034","#ed3f00"]    

    var colorScaleGenre = d3.scaleOrdinal().range(color_genre)

    d3.select("#platform")
        .selectAll("myOption")
        .data(options_genre)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d,i) { return i; })

    d3.select("#platform")
        .on("change", function(d){
            var sel = d3.select(this).node().value
            update_genre(sel)
    })

    sel = Platform[0].values
    plat = Platform[0].key

    sel.sort(function(a,b){return b.value - a.value}) 
           
    x2.domain(sel.map(function(d){ return d.key}))

    y2.domain([0, d3.max(sel, d=> d.value)])

	var xAxis = svg2.append("g")
	    .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x2))
        
    svg2.append('text')
        .attr("class", "plat")
        .attr('x', width/2)
        .attr('y',  0 - (margin.top / 2))
        .attr("font-size", 25 )
        .attr('text-anchor', 'middle')
        .text("sales of " + plat)

    svg2.append('text')
        .attr('x', 0 + margin.left + 20)
        .attr('y', -10)
        .attr("font-size", "12px")
        .attr('text-anchor', 'middle')
        .text(" *million of copies (mln)")

    svg2.append('text')
        .attr('x', width + 20 )
        .attr('y', height + 20)
        .attr("font-size", "12px")
        .attr('text-anchor', 'middle')
        .text(" Genre")

    function update_genre(val){

        selected = Platform[val].values
        plat = Platform[val].key
    
        selected.sort(function(a,b){ return b.value - a.value})
        
        x2.domain(selected.map(function(d){ return d.key}))
    
        xAxis.transition().duration(1000).call(d3.axisBottom(x2))
    
        y2.domain([0, d3.max(selected, d=> d.value)])
    
        var bar = svg2.selectAll(".bar").data(selected)
            
        bar.enter()
            .append("rect")
            .merge(bar)
            .attr("class", "bar")
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x2(d.key); })
            .attr("y", function (d) { return y2(d.value); })
            .attr("width", x2.bandwidth())
            .attr("height", function (d) { return height - y2(Number(d.value));})
            .attr("fill", function(d,i){ return colorScaleGenre(i); })
    
        var lab = svg2.selectAll(".bar_label").data(selected)
        
        lab.enter()
            .append("text")
            .merge(lab)
            .transition()
            .duration(1000)
            .attr("class", "bar_label")
            .attr("x", function(d){ return x2(d.key) + x2.bandwidth()/2})
            .attr("y", function(d) { return y2(d.value) + 15; })
            .attr('text-anchor', 'middle')
            .attr("fill", "#FFF")
            .text(function(d) { 
                val = d.value;
                return val>0 ? val : ""})
    
        var p = d3.select(".plat").text("sales of " + plat)
    
        bar.exit().remove()
        lab.exit().remove()
        
    } 

    update_genre(0)

// 3° chart: platform year

    var options_year = d3.map(data, function(d){ return d.Year }).keys().sort(function(a,b){ return b - a })

    d3.select("#year")
        .selectAll("myOption")
        .data(options_year)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d,i) { return i; })

    d3.select("#year")
        .on("change", function(d){
            var sel = d3.select(this).node().value
            update_year(sel)
        })
    
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    var s = platform_year[0].values
    var yr = platform_year[0].key

    s.sort(function(a,b){return b.value - a.value})

    var x3 = d3.scaleLinear()
        .domain([0, d3.max(s, function(d){ return d.value})])
        .range([0, width])

    var y3 = d3.scaleBand()
        .range([0, height])
        .domain(s.map(function(d){ return d.key}))
        .padding(.3)

    var yAxis = svg3.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y3)
        .tickSize(0))
        
    svg3.append('text')
        .attr('x', width - margin.right - 20)
        .attr('y', -10)
        .attr("font-size", "12px")
        .attr('text-anchor', 'middle')
        .text("million of copies (mln)")

    svg3.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .attr("font-size", "12px")
        .attr('text-anchor', 'middle')
        .text("platform ↓  ")
    
    svg3.append('text')
        .attr("class", "year")
        .attr('x', width/2)
        .attr('y',  0 - (margin.top / 2))
        .attr("font-size", 25 )
        .attr('text-anchor', 'middle')
        .text("sales of " + yr)
    
    function update_year(val){

        selection = platform_year[val].values 
        year = platform_year[val].key
        console.log(year)
         
        selection.sort(function(a,b){ return b.value - a.value})
    
        x3.domain([0, d3.max(selection, function(d){ return d.value})])
        //xAxis.transition().duration(1000).call(d3.axisBottom(x))
        
        y3.domain(selection.map(function(d){ return d.key}))
        yAxis.transition().duration(1000).call(d3.axisLeft(y3))
    
        var b = svg3.selectAll("rect").data(selection)
    
        b.enter()
            .append("rect")
            .merge(b)
            .transition()
            .duration(1000)
            .attr("x", x3(0) )
            .attr("y", function(d) { return y3(d.key); })
            .attr("width", function(d) { return x3(d.value); })
            .attr("height", y3.bandwidth() )
            .attr("fill", function(d,i){ return colorScale(i) })
    
        var l = svg3.selectAll(".bar_label").data(selection)
        
        l.enter()
            .append("text")
            .merge(l)
            .transition()
            .duration(1000)
            .attr("class", "bar_label")
            .attr("x", function (d) { return x3(d.value) + 12; })
            .attr("y", function (d) { return y3(d.key) + y3.bandwidth() / 2; })
            .text(function (d) { return d.value; })
            .attr('text-anchor', 'middle');
        
        var t = d3.select(".year").text("sales on " + year)
    
    
        b.exit().remove()   
        l.exit().remove()   
    
    }

    update_year(0)


// 4° chart - market sales

    var color_sales = d3.scaleOrdinal()
        .domain(sales)
        .range(["#3f8ab3", "#539417"," #eb4034", "#a89997"])

    var pie = d3.pie()
        .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(sales))

    var arcGenerator = d3.arc()
        .innerRadius(inner)
        .outerRadius(r)

    var arcOver = d3.arc()
        .innerRadius(inner + 5)
        .outerRadius(r + 5 )

    
    svg4.selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('path')
        .attr("class", "donuts")
        .attr('d', arcGenerator)
        .attr('fill', function(d){ return(color_sales(d.data.key)) })
        .attr("stroke", "white")
        .attr("stroke-width", "2px")
        .attr("opacity", 0.7)
        .on("mouseover", function(d){

            d3.select(this).transition()
                .duration(200)
                .attr("d", arcOver)
                .attr("opacity", 1)

            textTop.text(d3.select(this).datum().data.key)
                .attr("y", -10);
            textBottom.text(d3.select(this).datum().data.value.toFixed(0) + " Mln")
                .attr("y", 10);
     })
        .on("mouseout", function(d){

            d3.select(this).transition()
                .duration(200)
                .attr("d", arcGenerator)
                .attr("opacity", 0.7)

            textTop.text( "Total" )
                .attr("y", -10);
            textBottom.text(total.toFixed(0) + " Mln");
        })

    var textTop = svg4.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .attr("class","textop")
        .text("Total")
        .attr("y", -10)

    var textBottom = svg4.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .attr("class", "textBottom")
        .text(total + " Mln")
        .attr("y", 10);

    var legend = svg4.append("svg")
        .attr("class", "legend")
        //.attr("width", r)
        //.attr("height", r * 2)
        .selectAll("g")
        .data(data_ready)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + (radius + 20) + "," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return color_sales(i); });

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d.data.key; }); 

    svg4.append("text")
        .attr("x", 200)
        .attr("y", 100)
        .attr("dy", ".35em")
        .text("million of copies")

    
// 5° chart - genre-market

    var x5 = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding([0.2])

    svg5.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x5))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "translate(" + width + "," +  25 + ")")
        .attr("x", 0)
        .attr("y", -10)
        .attr("dy", "0.71em")
        .attr("text-anchor", "middle")
        .text("Genre");

    var y5 = d3.scaleLinear()
        .domain([0, 2000])
        .range([ height, 0 ]);

    svg5.append("g")
        .call(d3.axisLeft(y5))
        .append("text")
        .attr("fill", "#000")
        .attr("x", -25)
        .attr("y",  8)
        .attr("transform", "rotate(-90)")
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(" Sales (Mln)")

        var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#32a852", "#fcba03", "#eb4034", "#4287f5"])
    
    var stackedData = d3.stack()
        .keys(subgroups)
        .value((d,i) => d.value[i])
        (sales_genre)
    
    svg5.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d,i){  return d; })
        .enter()
        .append("rect")
        .attr("x", function(d) { return x5(d.data.key); })
        .attr("y", function(d) { return y5(d[1]); })
        .attr("height", function(d) { return y5(d[0]) - y5(d[1]); })
        .attr("width", x5.bandwidth())
        .on("mouseover", function(d,i){

            d3.select(this).attr("opacity", 0.5)

            var subgroupName = d3.select(this.parentNode).datum().key;
            var subgroupValue = d.data.value[subgroupName];

            tooltip2.transition()		
                .duration(200)		
                .style("opacity", .9)	

            tooltip2.html("Market: "+ subgroupName + "</br>" + "sales: " + subgroupValue + " Mln")	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
        })
        .on("mouseleave", function(d){

            d3.select(this).attr("opacity", 1)

            tooltip2.transition()		
                .duration(200)		
                .style("opacity", 0)
        })
                  
    var legend = svg5.append("svg")
        .attr("class", "legend")
        .selectAll("g")
        .data(subgroups)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + 1030 + "," + i * 20 + ")"; });
    
    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return color(i); });
    
    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d; }); 




});