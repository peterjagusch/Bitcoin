
var dataPoints = [];
var csvData;
var updateTicker = function(val){
	if(val){
		$(".ticketlist").empty();
		$.getJSON( "https://api.bitcoinaverage.com/ticker/global/" + val, function( data ) {
		  var items = [];
		  $.each( data, function( key, val ) {
			items.push( "<li id='" + key + "'><span>" + key + ":</span> " + val + "</li>" );
		  });
		 
		  $( "<ul/>", {
			"class": "ticketlist",
			html: items.join( "" )
		  }).appendTo( "body" );
		});
		loadChart(val);
	}
};

var getCurrency = function(){
	$(".currencylist").empty();
	$.getJSON( "https://api.bitcoinaverage.com/ticker/global/", function( data ) {
	  var items = [];
	  
	  $.each( data, function( key, val ) {
		items.push( "<option id='" + key + "'>" + key + "</option>" );
	  });
	 
	  $( "<select/>", {
		"id": "currencyList",
		"class": "currencyList",
		html: items.join( "" )
	  }).appendTo( ".frm" );
	});
	updateTicker($(this).find(":selected").val());
};
			
var loadChart = function(currency){
	$.ajax({
		url: "https://api.bitcoinaverage.com/history/"+ currency +"/per_minute_24h_sliding_window.csv",
		aync: false,
		success: function (data) {
		data = csvJSON(data);
		$.each(JSON.parse(data), function (key, data) {
			var dateTime = data.datetime;
			var index, value;
			$.each(data, function (index, data) {
				index = index;
				value = data;
			})
			dataPoints.push({label: dateTime, x : key, y: Number(value)} );
		})	
		}, 
		error:function (xhr, ajaxOptions, thrownError){
			setWarning();
		},		
		complete: function () {			
			generateChart();		
		}
	});
};	

function csvJSON(csv){
	  var lines=csv.split("\n");
	  var result = [];
	  var headers=lines[0].split(",");
	  for(var i=1;i<lines.length;i++){
		  var obj = {};
		  var currentline=lines[i].split(",");
		  for(var j=0;j<headers.length;j++){
			  obj[headers[j]] = currentline[j];
		  }
		  result.push(obj);
	  }
	  //return result; //JavaScript object
	  return JSON.stringify(result); //JSON
}

function generateChart(){
	$("#chartContainer").empty();
	dataPoints = dataPoints.slice(0, -1);
	var chart = new CanvasJS.Chart("chartContainer",
		{
			title: {
				text: "Bitcoin Chart"
			},
			axisX: {						
				title: "Time of Day"
			},
			axisY: {						
				title: "Value of Bitcoin"
			},
				data: [
					{
					type: "spline",
                       dataPoints: [	
							 dataPoints = dataPoints
					]
				}]
		});
	chart.options.data[0].dataPoints = dataPoints;
	chart.render();
}
function setWarning(){
	 $( "#warning" ).show( "slow", function() {
		setTimeout(hideWarning, 5000);
	 });
}
function hideWarning(){
	 $( "#warning" ).hide( "slow", function() {
	 });
}


$( document ).ready(function() {
	getCurrency();
	$('body').delegate('.currencyList','change', function(){
		dataPoints = [];
		 updateTicker($(this).find(":selected").val());
		
	});
});
