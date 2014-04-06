function d3_plot (data, type) {
	var p=[];
	for(var i in data.x){
		p.push({'x':data.x[i], 'y':data.y[i]});
	}
	//console.log('data is: '+p);

	/*These lines are all chart setup.  Pick and choose which chart features you want to utilize. */
	  var chart = nv.models.lineChart()
	                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
	                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
	                .transitionDuration(350)  //how fast do you want the lines to transition?
	                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
	                .showYAxis(true)        //Show the y-axis
	                .showXAxis(true)        //Show the x-axis
	  ;

	  chart.xAxis     //Chart x-axis settings
	      .axisLabel('Time (ms)')
	      .tickFormat(d3.format(',r'));

	  chart.yAxis     //Chart y-axis settings
	      .axisLabel('Voltage (v)')
	      .tickFormat(d3.format('.02f'));

	  d3.select('#chart svg')    //Select the <svg> element you want to render the chart in.   
	      .datum(p)         //Populate the <svg> element with chart data...
	      .call(chart);          //Finally, render the chart!

	  //Update the chart when window resizes.
	  nv.utils.windowResize(function() { chart.update() });
	  return chart;
}
	


// 	var chart = ' ';
// 	if(type == 'line' || type == null) {
// 		nv.addGraph(function(chart) {
// 		  chart = nv.models.lineChart()
// 		    .useInteractiveGuideline(true)
// 		    ;

// 		  chart.xAxis
// 		    .tickFormat(d3.format(',r'))
// 		    ;

// 		  chart.yAxis
// 		    .tickFormat(d3.format('.02f'))
// 		    ;
// 		});
// 	}
// 	else if(type == 'scatter') {
// 		nv.addGraph(function(chart) {
// 		  chart = nv.models.scatterChart()
// 		                .showDistX(true)
// 		                .showDistY(true)
// 		                .color(d3.scale.category10().range());

// 		  chart.xAxis.tickFormat(d3.format('.02f'));
// 		  chart.yAxis.tickFormat(d3.format('.02f'));

// 		});
// 	}

// 	d3.select('#chart svg')
// 		      .datum(data)
// 		    .transition().duration(500)
// 		      .call(chart);

// 	nv.utils.windowResize(chart.update);

// 	return chart;

// }

function xAxisTitle (chart, title) {
	chart.xAxis
    .axisLabel(title);
}

function yAxisTitle (chart, title) {
	chart.yAxis
    .axisLabel(title);
}