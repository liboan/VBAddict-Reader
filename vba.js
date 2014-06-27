//setup function, checks for load
(function () {
    if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', setup, false);
    } else {
        window.attachEvent('onload', setup);
    }
} ());

//jQuery Function for Expanding Graphics
$(document).ready(function() {
	$(".bar").click(function() {
		var parent = $(this).attr("id");
		parent = parent.substring(0,parent.length-3);
		$("#" + parent).slideToggle('slow');
	});
});

//jQuery Function for Expanding Checkbox Menu
$(document).ready(function () {
	$('#filterBar').click(function() {
		$('#checkBoxWrapper').slideToggle('fast');
	});
});

//jQuery Function for Checking and Unchecking Textboxes
$(document).ready(function() {
	var selectNation = true; 
	var selectType = true;
	$("#nationButton").click(function () {
		//alert("nation");
		flip(selectNation,$("#nationButton"));
		selectNation = !selectNation;
		$(".nationBox").each(function() {
			this.checked = selectNation;
		});

		filter();
	});

	$("#typeButton").click(function() {
		flip(selectType,$("#typeButton"));
		selectType = !selectType;
		$(".typeBox").each(function() {
			this.checked = selectType;
		});

		filter();
	});

});

//assistant function for flipping
function flip(bool,$b){
	if (bool) { //currently true, will be false, clicked during deselect
		$b.css("background-color","turquoise");
		$b.text("Check All");
	}
	else {
		$b.css("background-color","navy");
		$b.text("Uncheck All");
	}
}

//assistant function for averaging battles
function average(battles) {
	var sum = 0;
	for (var i = 0; i < battles.length; i++) {
		sum += battles[i].wn8;
	}
	//console.log(sum/array.length);
	return Math.round(sum/battles.length);
}

//splice out erroneous VBAddict entries (wn8 score of 0)

for (var i = 0; i < battles.length; i++) {
	if (battles[i].wn8 == 0) {
		var splice = 1;
		for (splice = 1; battles[i + splice].wn8 == 0; splice++) {
			console.log("splicing " + splice);
		}
		battles.splice(i,splice);
	}
} 



var CONST_WN8_SPLIT = [0,300,600,900,1250,1600,1900,2350,2900];

//50-battle average in entire data set, will NOT be affected by slider
var avg50 = [];

var dist = [0,0,0,0,0,0,0,0,0];
var colors = 	["#000000",
				"#cd3333",
				"#D77900",
				"#D7B600",
				"#6D9521",
				"#4C672E",
				"#4A92B7",
				"#83579D",
				"#5A3175"];

var data = [
			["0-299",0],
			["300-599",0],
			["600-899",0],
			["900-1249",0],
			["1250-1599",0],
			["1600-1899",0],
			["1900-2349",0],
			["2350-2899",0],
			["2900+",0]
			];

var wn8Scores = [];

var bins; //histogram array variable
var max; //max # of bins



/*
*/

wn8Average = average(battles);



console.log("Average over " + battles.length + " battles recorded at VBAddict: " + wn8Average);

var pieDist = new Array(9); //global for now, for debugging purposes

function setup() { 
	//feed data to wn8Scores
	for (var i = 0; i < battles.length; i++) {
		wn8Scores.push(battles[i].wn8);
	}
	wn8Scores.sort(function(a,b) { return a-b; });
	var median = wn8Scores[Math.round(wn8Scores.length/2)];

	//feed values to avg50
	for (var i = 0; i + 50 < battles.length; i++) {
		var slice50 = battles.slice(i,i+50); //get 50 battle slice
		var avg = average(slice50);
		avg50.push([i,avg]);
		console.log(avg);
	}

	//jQuery function to set width of expand bars
	$(document).ready(function () {
		$(".bar").each(function() { //for each element in class
			var parent = $(this).attr("id");
			parent = parent.substring(0,parent.length-3); //set parent to name of bar element without "Bar"
			console.log(parent);
			var width = $("#" + parent).width() + 2*parseInt($("#" + parent).css("padding"));
			$(this).width(width); //go to parent element, set this width to parent's
			console.log(width);
			$(this).css("margin-left", "auto");
			$(this).css("margin-right", "auto");			
		});
	});

	//set up bins for histogram
	max = Math.floor((wn8Scores[wn8Scores.length-1] + 100 )/100)-1; //minus one because no bins needed for 0-100
	bins = new Array(max); //triple array of histogram values, first & second are bin range, second is # of elements

	for (var i = 0; i < max; i++) {
		bins[i] = [i*100+100,i*100+200,0];
	}
	//set up DOM references
	//set battle box data
	document.getElementById("averageWN8").innerHTML = "Average & median over " + battles.length + " battles recorded at VBAddict: " 												+ Math.round(wn8Average) + " & " + median;
	document.getElementById("lastUpdate").innerHTML = "Last pull from VBAddict: " + date;
	document.getElementById("rangeWN8").innerHTML = "Average & median over filtered " + battles.length + " battles: " + Math.round(wn8Average) + " & " + median;
	document.getElementById("maxslider").innerHTML = battles.length;

	//set checkboxes...:P let's try it w/ jQuery

	$("[type = checkbox]").each(function() {
		this.checked = true;	
	});

	//set slider 
	var slider = document.getElementById("recentBattles");
	slider.max = battles.length;
	slider.value = slider.max;

	//feed all the graphs
	distributeScores(battles);
	svg50Graph(avg50); //not going to be redone, so don't put it in distributeScores()
}

function distributeScores(battles) {
	//clear everything before re-tabulating
	for (var i = 0; i < data.length; i++) {
		//console.log(CONST_WN8_SPLIT[i] + " - " + CONST_WN8_SPLIT[i+1] + ": " + dist[i]);
		dist[i] = 0;
	}

	for (var j = 0; j < bins.length; j++) {
		bins[j][2] = 0;
	}

	for (var k = 0; k < wn8Scores.length; k++) {
		wn8Scores[k] = 0;
	}

	var count = 0;
	var wn8Bracket = 0;


	for (var i = 0; i < battles.length; i++) {
		var current = battles[i].wn8;
		//console.log("current: " + current);
		if (current < 300) {
			dist[0]++;
		}
		else if (current >= 300 && current < 600) {
			dist[1]++;
		}
		else if (current >= 600 && current < 900) {
			dist[2]++;
		}
		else if (current >= 900 && current < 1250) {
			dist[3]++;
		}
		else if (current >= 1250 && current < 1600) {
			dist[4]++;
		}
		else if (current >= 1600 && current < 1900) {
			dist[5]++;
		}
		else if (current >= 1900 && current < 2350) {
			dist[6]++;
		}
		else if (current >= 2350 && current < 2900) {
			dist[7]++;
		}
		else if (current >= 2900) {
			dist[8]++;
		}

		var hist = Math.floor((current-100)/100);
		//console.log("hist: " + hist);
		if (current > 100)
		bins[hist][2]++;
		}



	var total = 0;
	for (var i = 0; i < 9; i++) { //2D array, first col is data, 2nd col is start point (sum of all previous entries), 3rd column is colors
		pieDist[i] = [dist[i],total,colors[i]];
		total += Math.floor(dist[i]);
		//console.log(pieDist[i][0] + ", " + pieDist[i][1]);
	}

	graph(dist);
	document.getElementById("pie").innerHTML = "";
	document.getElementById("histogram").innerHTML = "";
	svgPie(pieDist);
	svgHist(bins);

}

function filter() {
	var filteredBattles = [];
	var battleMedian = [];

	var recent = document.getElementById("recentBattles").value;
	var battlesSubarray = battles.slice(0,recent); //only battles within slider's time range

	for (var i = 0; i < battlesSubarray.length; i++) { //check for nation and type
		if (document.getElementById(battlesSubarray[i].nation).checked && document.getElementById(battlesSubarray[i].type).checked) {
			filteredBattles.push(battlesSubarray[i]);
			battleMedian.push(battlesSubarray[i].wn8);
			//console.log(filteredBattles[filteredBattles.length-1].wn8);
		}
		//console.log(filteredBattles.length);

	}
		//sort wn8Scores
	battleMedian.sort(function(a,b) { return a-b; });
	var median = battleMedian[Math.round(battleMedian.length/2)];

	document.getElementById("rangeWN8").innerHTML = "Average & median over filtered " + filteredBattles.length + " battles: " + average(filteredBattles) + " & "
										+ median;
	distributeScores(filteredBattles);

}

function graph(data) {
	//data.sort(function(a,b) {return a-b;})
	var graph = d3.select("#graph")
					.selectAll("div")
					.data(data)
					.transition()
					.duration(1000)
					.style("width", function (d) { return d*6+10; })
					.text(function (d) { return d; });

}

function svgPie(data) {
	var max = data[8][0] + data[8][1];
	var distScale = d3.scale.linear().domain([0, Math.floor(data[8][1] + data[8][0])]).range([0,2*Math.PI]); 

	var middle = d3.select("#svgPieWrapper")
					.append("div")
					.attr("class","piemiddle")
					.style("opacity", 1);

	var arc = d3.svg.arc()
				.innerRadius(50)
				.outerRadius(200)	///OKAY YOU DUMBASS, THE ACCESSOR METHOD USES D AS THE DATA, SO CALL D IN ORDER TO GRAB CURRENT ITERATING DATA
				.startAngle(function (d) {return distScale(d[1]);}) //return scaled starting pt data values
				.endAngle(function (d) {return distScale(d[1]+d[0]);}); //ending pt increases by amount in data

	var pie = d3.select("#pie")
				.selectAll("path")
				.data(data)
				.enter()
				.append("path")
				.on("mouseover", function (d) {
					middle.style("opacity", 1);
					middle.html(d[0] + " battles" + "<br>" + Math.round(d[0]*100/max) + "%");
				})
				.on("mouseout", function (d) {
					middle.style("opacity",0);
				})
				.attr("d", arc)
				.style("fill", function (d) { return d[2]; }) //third col of data has hex values for color
				.attr("transform", "translate(200,200)");
}

function svgHist(data) {
	//tooltip div for mousing over histogram
	var tooltip = d3.select("#svgHistWrapper")
					.append("div")
					.attr("class", "tooltip")
					.style("opacity", 1);


	var svg = d3.select("#histogram")
				.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
				.on("mouseover", function (d) {
					tooltip.style("opacity",1)
							.style("top", Math.round(-100 - d[2]*4 - 20)) //-100 puts at bottom of bar. subtract height to match bar. subtract 20 to put above
							.style("left",(d[0]*1.1 - 50)/10) //take off 5 (50/10) (1/4 of 20) to shift div (width 20) left, centering text right above bar
							.text(d[2]);
					
				})
				.on("mouseout", function (d) {
					tooltip.style("opacity",0);
				})
				.attr("fill", "red")	
				.attr("x", function (d) {return ((d[0])/10)*1.1;})
				.attr("width", function (d) {return 10;})
				.attr("height", function (d) {return d[2]*4;})
				.attr("y", function (d) {return 200-d[2]*4;});

	var txt = d3.select("#histogram")
				.selectAll("text")
				.data(data)
				.enter()
				.append("text")
				.attr("transform", function (d) {
					return "translate(" + (d[0]*1.1/10+3) + ",230)rotate(270)";
				})
				.attr("fill", "black")
				.attr("font-size", "10px")
				.attr("font-family", "sans-serif")
				.text(function (d) {
					return d[0];
				});

}	

function svg50Graph(data) {
	var line = d3.svg.line()
					.x(function (d) { return d[0]*2;})
					.y(function (d) { return d[1]/10;})
					.interpolate("linear");
	var svgGraph = d3.select("#graph50")
					.append("path")
					.attr("d",line(data))
					.attr("stroke","blue")
					.attr("stroke-width",2)
					.attr("fill", "none");
}


function sliderChange() {
	var recent = document.getElementById("recentBattles").value;
	var wn8Subarray = battles.slice(0,recent);
	document.getElementById("rangeWN8").innerHTML = "Average over most recent " + wn8Subarray.length + " battles: " + average(wn8Subarray);
	distributeScores(wn8Subarray);

}

