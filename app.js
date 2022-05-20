function assignment7(){
    var filePath="data.csv";
    question0(filePath);
    question1(filePath);
    question2(filePath);
    question3(filePath);
//    question4(filePath);
}
var rowConverter = function(d){
    d.Discount = parseFloat(d.Discount);
    d['Postal Code'] = parseFloat(d['Postal Code']);
    d.Profit = parseFloat(d.Profit);
    d.Quantity = parseFloat(d.Quantity);
    d['Row ID'] = parseFloat(d['Row ID']);
    d.Sales = parseFloat(d.Sales);



    return d
}

function unroll(rollup, keys, label = "value", p = {}) {
    return Array.from(rollup, ([key, value]) => 
      value instanceof Map 
        ? unroll(value, keys.slice(1), label, Object.assign({}, { ...p, [keys[0]]: key } ))
        : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
    ).flat();
}
var question0=function(filePath){
    d3.csv(filePath).then(function(data){
        // console.log(data);
    });
}

var question1=function(filePath){
    d3.csv(filePath, rowConverter).then(function(data){

        data = data.filter(function (d) {
            return parseInt(d['Order Date'].slice(-4)) > 2016;
        });
  
        data = data.filter(function(d){
            return d.Category == 'Technology';
        });


        var width=1500;
        var height=800;
        var padding=100;
        var colors = d3.scaleOrdinal().domain(['Sales', 'Profit']).range(['red', 'black'])
        var keys = ['Sales', 'Profit'];
        
        var states = Array.from(d3.group(data, d => d.State).keys()).sort();

        

        var saleProfits = Array.from(d3.rollup(data, v=>{return {values: {Sales: d3.sum(v, d=>d.Sales), Profit: d3.sum(v, d=>d.Profit)}}},
        d=>d.State))


        var total = []

        for (n in saleProfits){
            total.push({'State': saleProfits[n][0], 'Profit': saleProfits[n][1]['values']['Profit'], 'Sales': saleProfits[n][1]['values']['Sales']})
        }
    

        total = total.sort(function(a, b){
            let x = a.State.toLowerCase();
            let y = b.State.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
          });


        var profit = d3.map(total, function(d){return d['Profit']})
        var sales = d3.map(total, function(d){return d['Sales']})



    

        var xScale = d3.scaleBand().domain(states).range([padding, width-padding]);
        var yScale = d3.scaleLinear().domain([0, d3.sum([d3.max(sales), d3.max(profit)])]).range([height-padding, padding]);
        var svg_q1 = d3.select('#q1_plot').append('svg')
            .attr('width', width)
            .attr('height', height);



        const xAxis = d3.axisBottom().scale(xScale);
        const yAxis = d3.axisLeft().scale(yScale);

        svg_q1.append('g').call(xAxis)
            .attr('class', 'xAxis')
            .attr('transform', "translate("+ (-xScale.bandwidth()/2)+"," + (height - padding) + ")")
            .selectAll("text")
            .style('text-anchor', 'end')
            .attr('transform', 'translate(0,10) rotate(-45)');
            
                
        svg_q1.append('g').call(yAxis) 
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ padding + ',0)');


        var series = d3.stack().keys(['Sales', 'Profit'])
        var stack = series(total);

        console.log(stack)



        svg_q1.selectAll("layer").data(stack).enter()
        .append("path")
          .style("fill", function(d){ return colors(d.key)})
          .attr("d", d3.area()
            .x(function(d) { return xScale(d.data.State); })
            .y0(function(d) { return yScale(d[0]); })
            .y1(function(d) { return yScale(d[1]); })
        )


        var colorL = ['red', 'black']


        var circ = svg_q1.selectAll('circle').data(colorL).enter().append('circle')
            .attr('r', 10)
            .attr('cx', 1200)
            .attr('cy', function(d) {return (padding + (colorL.indexOf(d) * 25))})
            .style('fill', function(d){return d})

        var txt = svg_q1.selectAll('legend').data(keys).enter().append('text')
            .attr('x', 1220)
            .attr('y', function(d) {return (padding + (keys.indexOf(d) * 25))+5})
            .text(function(d){return d})
                
    
    });

}

var question2=function(filePath){
    d3.csv(filePath, rowConverter).then(function(data){

        data = data.filter(function (d) {
            return d['Order Date'].slice(-4) > 2016;
        });

        data = data.filter(function(d){
            return d.Category == 'Furniture';
        });


        const keys = ['Chairs', 'Furnishings', 'Tables', 'Bookcases'];
        const colors = ['red', 'brown', 'orange', 'yellow']

        var rolled = d3.rollup(data, v => d3.sum(v, d => d.Sales), d => d['Sub-Category'], d => d.State);
        var unrolled = unroll(rolled, ["Sub-Category", 'State'], "Sales");
        var states = Array.from(d3.group(data, d => d.State).keys()).sort();

    
        var dataFinal = []
        for (n in states){
            var temp = {}
            temp['State'] = states[n]
            for (i in keys){
                var point = unrolled.filter(function(d){ return d['Sub-Category'] == keys[i] && d.State == states[n]})
                if (point.length != 0){
                    temp[keys[i]] = point[0].Sales
                } else {
                    temp[keys[i]] = 0
                }       
            }
            dataFinal.push(temp)

        }
        var width=1500;
        var height=800;
        var padding=100;

        var series =  d3.stack().keys(keys);
		var stack = series(dataFinal);

        var svg_q2 = d3.select("#q2_plot").append("svg")
            .attr("height", height)
            .attr("width", width);

        var xScale = d3.scaleBand()
            .domain(d3.range(dataFinal.length)) 
            .range([padding, width-padding])
            .padding([0.1]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataFinal, function(d){ 
                return d.Tables + d.Chairs + d.Bookcases + d.Furnishings + padding;
            })])
            .range([height-padding, padding]);
        

        const xAxis = d3.axisBottom().tickFormat(function(d) { return states[d]}).scale(xScale);
        const yAxis = d3.axisLeft().scale(yScale);

        svg_q2.append('g').call(xAxis)
            .attr('class', 'xAxis')
            .attr('transform', "translate(0," + (height - padding) + ")")
            .selectAll("text")
            .style('text-anchor', 'end')
            .attr('transform', 'translate(0,10) rotate(-45)');
        
        svg_q2.append('g').call(yAxis) 
            .attr('class', 'yAxis')
            .attr('transform', 'translate('+ padding + ',0)');


        var groups = svg_q2.selectAll('.gbars')
            .data(stack).enter().append('g')
            .attr('class', 'gbars')
            .style('fill', function(d){return colors[d.index]})



        var rects = groups.selectAll('rect').data(function(d){return d}).enter().append('rect')
            .attr('x', function(d,i){
                return xScale(i);
            })
            .attr('y', function(d){
                return yScale(d[1]);
            })
            .attr('width', function(d){
                return xScale.bandwidth();
            })
            .attr('height', function(d){
                return  yScale(d[0]) - yScale(d[1]);
            })

        var circ = svg_q2.selectAll('circle').data(colors).enter().append('circle')
            .attr('r', 10)
            .attr('cx', 1200)
            .attr('cy', function(d) {return (padding + (colors.indexOf(d) * 25))})
            .style('fill', function(d){return d})

        var txt = svg_q2.selectAll('legend').data(keys).enter().append('text')
            .attr('x', 1220)
            .attr('y', function(d) {return (padding + (keys.indexOf(d) * 25))+5})
            .text(function(d){return d})
    });

      
}

var question3=function(filePath){
    var svgwidth=1000;
    var svgheight=800;
    var padding=50;
    var rowConverter = function(d){
        d.Discount = parseFloat(d.Discount);
        d['Postal Code'] = parseFloat(d['Postal Code']);
        d.Profit = parseFloat(d.Profit);
        d.Quantity = parseFloat(d.Quantity);
        d['Row ID'] = parseFloat(d['Row ID']);
        d.Sales = parseFloat(d.Sales);
        return d
    }
    d3.csv(filePath,rowConverter).then(function(data){

        var width = 960;
        var height = 500;
        // State Symbol dictionary for conversion of names and symbols.
        var stateSym = {
        AZ: 'Arizona',
        AL: 'Alabama',
        AK: 'Alaska',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PA: 'Pennsylvania',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
    };
    

        var states = Array.from(d3.group(data, d => d.State).keys());

        
        var data = unroll(d3.rollup(data, v => d3.sum(v, d =>d.Sales), d => d.State), ['State']);
        var maxSales = d3.max(data, d => d.value);
        var minSales = d3.min(data, d => d.value);

        var allStates = Object.values(stateSym);
        for (n in allStates){
            if (!states.includes(allStates[n])){
                data.push({State: allStates[n], value: 1e-2})
            }
        }
        var svg_q3 = d3.select("#q3_plot")
            .append("svg").attr("width", svgwidth).
            attr("height", svgheight);

        const projection1  = d3.geoAlbersUsa()
        const pathgeo1 = d3.geoPath().projection(projection1);

        const us = d3.json('us-states.json')

        
        var blues = ["#f7fbff","#f6faff","#f5fafe","#f5f9fe","#f4f9fe","#f3f8fe","#f2f8fd","#f2f7fd","#f1f7fd","#f0f6fd","#eff6fc","#eef5fc","#eef5fc","#edf4fc","#ecf4fb","#ebf3fb","#eaf3fb","#eaf2fb","#e9f2fa","#e8f1fa","#e7f1fa","#e7f0fa","#e6f0f9","#e5eff9","#e4eff9","#e3eef9","#e3eef8","#e2edf8","#e1edf8","#e0ecf8","#e0ecf7","#dfebf7","#deebf7","#ddeaf7","#ddeaf6","#dce9f6","#dbe9f6","#dae8f6","#d9e8f5","#d9e7f5","#d8e7f5","#d7e6f5","#d6e6f4","#d6e5f4","#d5e5f4","#d4e4f4","#d3e4f3","#d2e3f3","#d2e3f3","#d1e2f3","#d0e2f2","#cfe1f2","#cee1f2","#cde0f1","#cce0f1","#ccdff1","#cbdff1","#cadef0","#c9def0","#c8ddf0","#c7ddef","#c6dcef","#c5dcef","#c4dbee","#c3dbee","#c2daee","#c1daed","#c0d9ed","#bfd9ec","#bed8ec","#bdd8ec","#bcd7eb","#bbd7eb","#b9d6eb","#b8d5ea","#b7d5ea","#b6d4e9","#b5d4e9","#b4d3e9","#b2d3e8","#b1d2e8","#b0d1e7","#afd1e7","#add0e7","#acd0e6","#abcfe6","#a9cfe5","#a8cee5","#a7cde5","#a5cde4","#a4cce4","#a3cbe3","#a1cbe3","#a0cae3","#9ec9e2","#9dc9e2","#9cc8e1","#9ac7e1","#99c6e1","#97c6e0","#96c5e0","#94c4df","#93c3df","#91c3df","#90c2de","#8ec1de","#8dc0de","#8bc0dd","#8abfdd","#88bedc","#87bddc","#85bcdc","#84bbdb","#82bbdb","#81badb","#7fb9da","#7eb8da","#7cb7d9","#7bb6d9","#79b5d9","#78b5d8","#76b4d8","#75b3d7","#73b2d7","#72b1d7","#70b0d6","#6fafd6","#6daed5","#6caed5","#6badd5","#69acd4","#68abd4","#66aad3","#65a9d3","#63a8d2","#62a7d2","#61a7d1","#5fa6d1","#5ea5d0","#5da4d0","#5ba3d0","#5aa2cf","#59a1cf","#57a0ce","#569fce","#559ecd","#549ecd","#529dcc","#519ccc","#509bcb","#4f9acb","#4d99ca","#4c98ca","#4b97c9","#4a96c9","#4895c8","#4794c8","#4693c7","#4592c7","#4492c6","#4391c6","#4190c5","#408fc4","#3f8ec4","#3e8dc3","#3d8cc3","#3c8bc2","#3b8ac2","#3a89c1","#3988c1","#3787c0","#3686c0","#3585bf","#3484bf","#3383be","#3282bd","#3181bd","#3080bc","#2f7fbc","#2e7ebb","#2d7dbb","#2c7cba","#2b7bb9","#2a7ab9","#2979b8","#2878b8","#2777b7","#2676b6","#2574b6","#2473b5","#2372b4","#2371b4","#2270b3","#216fb3","#206eb2","#1f6db1","#1e6cb0","#1d6bb0","#1c6aaf","#1c69ae","#1b68ae","#1a67ad","#1966ac","#1865ab","#1864aa","#1763aa","#1662a9","#1561a8","#1560a7","#145fa6","#135ea5","#135da4","#125ca4","#115ba3","#115aa2","#1059a1","#1058a0","#0f579f","#0e569e","#0e559d","#0e549c","#0d539a","#0d5299","#0c5198","#0c5097","#0b4f96","#0b4e95","#0b4d93","#0b4c92","#0a4b91","#0a4a90","#0a498e","#0a488d","#09478c","#09468a","#094589","#094487","#094386","#094285","#094183","#084082","#083e80","#083d7f","#083c7d","#083b7c","#083a7a","#083979","#083877","#083776","#083674","#083573","#083471","#083370","#08326e","#08316d","#08306b"]
        var logScale = d3.scaleLog()
            .domain([minSales, maxSales]).range([100,256]);
        var colorScale = d3.scaleThreshold()
            .domain(d3.range(100, 256))
            .range(blues.slice(100));
        



        us.then(function(map){
            svg_q3.selectAll('path').data(map.features).enter().append('path')
                .attr('d', pathgeo1)
                .style('fill', function(d){return colorScale(logScale(data.filter(function(v){ return v.State == stateSym[d.properties.name]})[0].value))})
                .style('stroke', 'black')

        });

    });
      
}

