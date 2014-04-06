

function d3_plot (data, type) {

	var chart = ' ';
	if(type == 'line' || type == null) {
		nv.addGraph(function(chart) {
		  chart = nv.models.lineChart()
		    .useInteractiveGuideline(true)
		    ;

		  chart.xAxis
		    .tickFormat(d3.format(',r'))
		    ;

		  chart.yAxis
		    .tickFormat(d3.format('.02f'))
		    ;
		});
	}
	else if(type == 'scatter') {
		nv.addGraph(function(chart) {
		  chart = nv.models.scatterChart()
		                .showDistX(true)
		                .showDistY(true)
		                .color(d3.scale.category10().range());

		  chart.xAxis.tickFormat(d3.format('.02f'));
		  chart.yAxis.tickFormat(d3.format('.02f'));

		});
	}

	d3.select('#chart svg')
		      .datum(data)
		    .transition().duration(500)
		      .call(chart);

	nv.utils.windowResize(chart.update);

	return chart;

}

function xAxisTitle (chart, title) {
	chart.xAxis
    .axisLabel(title);
}

function yAxisTitle (chart, title) {
	chart.yAxis
    .axisLabel(title);
}