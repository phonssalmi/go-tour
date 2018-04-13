var polyline = null;
var geoJSON = null;
var map;
var startInput;
var endInput;
var transportType = "driving-car";
var enableMarkers = false;
var startMarkerPlaced = false;
var endMarkerPlaced = false;
var isochroneMarker = false;
var previousMarker;
var userMarker = null;
var markersArray = [];
var inputsArray = [];
var inputsDiv = 0;
var autocompleteArray = [];
var inputStringHTML = "<div class=\"leaflet-routing-geocoder\">" +
	"<input class=\"input-fields extra-input\">" +
	"<i class=\"fas fa-times remove-icon\" onclick=\"removeInput(this.parentNode.parentNode)\"></i></div>";

var orsKey = "58d904a497c67e00015b45fce7820addba544082bfb751a87dd60ca8";

window.onload = function () {
	var cookieHandler = getCookieHandler();

	/*Map creation*/
	map = L.map('mapid', {
		center: [60.4500, 22.2667],
		zoom: 14,
		zoomControl: true,
		scaleControl: false,
		minZoom: 4
	});
	recreateInputs();

	cookieHandler.load();
	var cntHandler = getContainerHandler(document.getElementById('menu-main-container'));
	cntHandler.setOnclickEventsHandler('-cnt-button');
	cntHandler.focusContainerById('routing-menu');
	
	document.getElementById('routing-menu-cnt-button').onclick = () => {
		cntHandler.focusContainerById('routing-menu');
	};
	document.getElementById('attraction-menu-container-cnt-button').onclick = () => {
		cntHandler.focusContainerById('attraction-menu-container');
	};
	document.getElementById('bus-transit-container-cnt-button').onclick = () => {
		cntHandler.focusContainerById('bus-transit-container');
	};
	
	document.getElementById("car").style.backgroundColor = "blue";

	inputsArray = document.getElementsByClassName("input-fields");

	map.locate({ setView: true, maxZoom: 14 });
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap contributors</a>'
	}).addTo(map);

	loadAttractions(map);
	document.getElementById('search-img-container').onclick = onSearchButtonClick;

	createAutocomplete();
	function onMapRightClick(e) {
		//deleteMarkers();
		//removeIsochrones();
	}
	map.on('contextmenu', onMapRightClick);

	function onMapClick(e) {
		/*Place marker*/
		if (enableMarkers) {
			if (isochroneMarker && markersArray.length > 0) {
				return;
			}
			var tempMarker = L.marker([e.latlng.lat, e.latlng.lng], { draggable: true }).addTo(map).addEventListener('dragend', onDrag);
			markersArray.push(tempMarker);
			getPointAddress(tempMarker);
			getRoute();
			if (markersArray.length == 2) {
				createEmptyInput(tempMarker, true);
			}
			else {
				createEmptyInput(tempMarker);
			}
			createAutocomplete();
		}
	}
	map.on('click', onMapClick);
	
	/*Notification on user tracking*/
	if(cookieHandler.get('locok') === null) {
		$(document).ready(function(){
			setTimeout(function () {
				$("#tracking-notification").fadeIn(200);
			}, 1000);
			$("#close-tracking-notification, .trackingConsentOk").click(trackOnClick);
		});

	} else {
		document.getElementById('tracking-notification').style.display = 'none';
	}

	function trackOnClick() {
		$("#tracking-notification").fadeOut(200);
		cookieHandler.set('locok', 'ok');
		console.log(cookieHandler.get('locok'));
		console.log(document.cookie);
	}

	
	/*Adding continuously updated user location icon to the map*/
	map.on('locationfound', function(e){
			console.log("LocationFound called");
			var userIcon = L.icon({
								iconUrl: 'markers_icons/user_img.png',
								iconSize: [ 17, 17 ],
								iconAnchor: [ 9, 9 ],
							});
			if(userMarker == null) /*If no marker -> create one*/
			{
				userMarker = L.marker([e.latlng.lat, e.latlng.lng], { draggable: false, icon: userIcon });
				userMarker.addTo(map);
				//var circle = L.circle([e.latlng.lat, e.latlng.lng], {radius: e.accuracy / 2}).addTo(map);
				console.log("User tracking marker added");
			}
			else	/*If marker -> move it to new location*/
			{
				userMarker.setLatLng([e.latlng.lat, e.latlng.lng]);
				console.log("User location tracking success");	
			}
				
		});
	map.on('locationerror', function(e) {
				console.log("User location tracking failure");
		});
	map.locate({watch: true, timeout: 1000});
}
function removeMarkers() {
	markersArray.forEach(marker => {
		map.removeLayer(marker);
	});
	markersArray = [];
	getRoute();
	autocompleteArray = [];
}
function onDrag(e) {
	getPointAddress(e.target, false, true);
	if (isochroneMarker) {
		removeIsochrones();
		getIsochrones();
	}
	else {
		getRoute();
	}
}

function getTransportType(e, sender) {
	$('#transportType').children().each(function () {
		this.style.backgroundColor = "#007bff";
	})
	sender.style.backgroundColor = "blue";
	transportType = e

	if (e === 'bus') map.removeLayer(polyline);
	else clearLines();
	getRoute();
}

function getRoute() {
	if (transportType === 'bus') {	//TODO, make a real solution, this is temp fix
		getRouteN();
		return;
	}

	if (polyline != null) {
		map.removeLayer(polyline);
	}
	if (markersArray.length < 2) {
		return;
	}
	var coordinatesString = "";
	for (i = 0; i < markersArray.length; i++) {
		coordinatesString += markersArray[i]._latlng.lng + '%2C' + markersArray[i]._latlng.lat + '%7C';
	}
	coordinatesString = coordinatesString.slice(0, -3);
	var request = new XMLHttpRequest();
	var requestURI = 'https://api.openrouteservice.org/directions?api_key=' + orsKey + '&coordinates='
		+ coordinatesString + '&profile=' + transportType;
	request.open('GET', requestURI);
	request.setRequestHeader('Accept', 'text/json; charset=utf-8');

	request.onreadystatechange = function () {
		if (this.readyState === 4) {
			var JSONresponse = JSON.parse(this.response);
			var totalDistance = parseDistance(JSONresponse.routes[0].summary.distance);
			var totalTime = parseTime(JSONresponse.routes[0].summary.duration);
			document.getElementById("totalDistance").innerHTML = "Total distance: " + totalDistance;
			document.getElementById("totalTime").innerHTML = "Total time: " + totalTime;
			var encoded = JSONresponse.routes[0].geometry;
			polyline = L.Polyline.fromEncoded(encoded).addTo(map);
			var steps = [];
			for (var i = 0; i < JSONresponse.routes[0].segments.length; i++) {
				for (var j = 0; j < JSONresponse.routes[0].segments[i].steps.length; j++) {
					steps.push(JSONresponse.routes[0].segments[i].steps[j]);
				}
			}
			var displaySteps = "<table style='width:100%'>";
			for (var i = 0; i < steps.length; i++) {
				displaySteps += "<tr>";
				displaySteps += "<td colspan ='2'>" + steps[i].instruction + "</td>";
				displaySteps += "</tr>";
				displaySteps += "<tr>";
				displaySteps += "<td>" + parseDistance(steps[i].distance) + "</td>";
				displaySteps += "<td>" + parseTime(steps[i].duration) + "</td>";
				displaySteps += "</tr>";
			}
			displaySteps += "</table>";
			document.getElementById("directionsTable").innerHTML = displaySteps;
		}
	};
	request.send();
}
function parseDistance(distance) {
	return (parseFloat(distance) / 1000).toFixed(2) + " km";
}
function parseTime(time) {
	return (parseFloat(time) / 60).toFixed(2) + " min";
}
function createOneInput() {
	inputsDiv = document.getElementById("inputs-form");
	inputsDiv.innerHTML = '<div class="leaflet-routing-geocoder">' +
		'<input placeholder="Location" class="input-fields extra-input">' +
		'<i class=\"fas fa-times remove-icon\" onclick="removeInput(this.parentNode.parentNode)"></i>' +
		'</div>';
	createAutocomplete();
}
function recreateInputs() {
	inputsDiv = document.getElementById("inputs-form");
	inputsDiv.innerHTML = '<div class="leaflet-routing-geocoder">' +
		'<input placeholder="Start" class="input-fields extra-input">' +
		'<i class=\"fas fa-times remove-icon\" onclick="removeInput(this.parentNode.parentNode)"></i>' +
		'</div>' +
		'<div class="leaflet-routing-geocoder">' +
		'<input placeholder="End" class="input-fields extra-input">' +
		'<i class=\"fas fa-times remove-icon\" onclick="removeInput(this.parentNode.parentNode)"></i>' +
		'</div>' +
		'<button class="leaflet-routing-add-waypoint" type="button"></button>';
	createAutocomplete();
}

let currentItineraries = [];

function clearMarkerArray() {
	markersArray = [];	//TEMPORARY, FOR RESETING FROM CONSOLE
}

function getRouteN() {
	if (markersArray.length < 2) return;
	/*var startlat = markersArray[0]._latlng.lat;
	var startlng = markersArray[0]._latlng.lng;
	var endlat = markersArray[1]._latlng.lat;
	var endlng = markersArray[1]._latlng.lng;*/

	var start = markersArray[0]._latlng;
	var end = markersArray[markersArray.length - 1]._latlng;
	var stops = [];
	var otpOpts = {};

	if(markersArray.length > 2) {
		for(var i = 1; i < markersArray.length -1; i++) {
			stops.push(markersArray[i]._latlng);
		}
		otpOpts.showIntermediateStops = true;
		otpOpts.intermediatePlacesOrdered = true;
	}
	

	requestOtpRoute(start, end, otpOpts, stops).then((data) => {
		if (typeof data === 'string') {
			console.log(data);
			return;
		}
		if (data.error) {
			console.log(data.error);
			return;
		}

		currentItineraries = data.plan.itineraries;
		drawRouteItinerary(currentItineraries[0]);

		let itnRootDiv = document.getElementById('transit-itineraries');
		itnRootDiv.innerHTML = '';
		currentItineraries.forEach((itn) => { itnRootDiv.appendChild(drawItineraryOptionDiv(itn)); });
	});

}

function drawItineraryOptionDiv(itn) {
	let div = document.createElement('div');
	div.onclick = function (ev) { drawRouteItinerary(itn); };
	div.appendChild(document.createTextNode('Duration: ' + itn.duration));
	div.appendChild(document.createElement('br'));
	let content = '';
	itn.legs.forEach((l) => { content += ' > ' + l.mode + ' ' + l.route; });
	div.appendChild(document.createTextNode(content));
	return div;
}

let currentPolylines = [];
const routeColors = { 'WALK': 'red', 'BUS': 'blue' };

function drawRouteItinerary(itr) {
	clearLines();

	itr.legs.forEach((route) => {
		console.log(route.legGeometry.points);
		currentPolylines.push(routeToPolyline(route));
		//currentPolylines.push(new L.Polyline(getRouteCords(route), { color: routeColors[route.mode] }));
		//currentPolylines.push(L.Polyline.fromEncoded(route.legGeometry.points, { color: routeColors[route.mode] }));
	});

	redrawLines();
}

function routeToPolyline(route) {
	console.log(route.mode);
	var polylineOpts = { color: routeColors[route.mode] };
	if (route.transitLeg) return L.Polyline.fromEncoded(route.legGeometry.points, polylineOpts);

	var ncords = [];
	ncords.push([route.from.lat, route.from.lon]);
	route.steps.forEach((step) => { ncords.push([step.lat, step.lon]); }); ncords.push([route.to.lat, route.to.lon]);
	//ncords.push(...pline.getLatLngs());
	console.log(ncords);
	return new L.Polyline(ncords, polylineOpts);

	//route.steps.forEach((step) => { console.log(step);routeCords.push([ step.lat, step.lon ]); });
	//routeCords.push([ route.to.lat, route.to.lon ]);
}

function redrawLines() {
	if (currentPolylines.length === 0) return;
	currentPolylines.forEach((pl) => { pl.addTo(map); });
}

function clearLines() {
	if (currentPolylines.length === 0) return;
	currentPolylines.forEach((pl) => { map.removeLayer(pl); });
	currentPolylines = [];
}

function removeInput(node) {
	// autocomplete does not work after removing input
	inputsDiv = document.getElementById("inputs-form");
	var index = Array.prototype.indexOf.call(inputsDiv.children, node);
	if (inputsArray.length < 3 || index == inputsDiv.children.length - 1) {
		return;
	}
	inputsDiv.removeChild(node);
	map.removeLayer(markersArray[index]);
	markersArray.splice(index, 1);
	autocompleteArray.splice(index, 1);
	getRoute();
}

function getIsochrones() {
	if (markersArray.length <= 0) {
		alert("Please put a marker first");
		return;
	}
	var range = document.getElementById("isochrones_range").value * 60;
	var interval = document.getElementById("isochrones_interval").value * 60;
	var request = new XMLHttpRequest();

	request.open('GET', 'https://api.openrouteservice.org/isochrones?api_key=' + orsKey + '&locations='
		+ markersArray[0]._latlng.lng + '%2C' + markersArray[0]._latlng.lat + '&profile=' + transportType + '&range_type=time&range=' + range + '&interval=' + interval);

	request.setRequestHeader('Accept', 'text/json; charset=utf-8');

	request.onreadystatechange = function () {
		if (this.readyState === 4) {
			var polygons = JSON.parse(this.response).features;
			console.log(polygons);
			if (geoJSON != null) {
				geoJSON.remove();
			}
			geoJSON = L.geoJSON(polygons, {
				style: function (feature) {
					return { fillColor: "#29559e" };
				}
			}).addTo(map);
		}
	};
	request.send();
}
function removeIsochrones() {
	if (geoJSON != null)
		map.removeLayer(geoJSON);
}

function getPointAddress(marker, autoCreate = true, changeInputValue = false) {
	var req = new XMLHttpRequest();
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + marker._latlng.lat + "," + marker._latlng.lng + "&key=AIzaSyBa_gZPpd2jbG06slhnujNjy2pagPZRKGE";
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var myArr = JSON.parse(this.responseText);
			showPopup(marker, myArr);
			if (autoCreate) {
				createPlaceInputFromMarker(marker, myArr);
				createAutocomplete();
			}
			if (changeInputValue) {
				changeInputsValue(marker, myArr);
			}
		}
	};
	req.open("GET", url, true);
	req.send();
}

function createPlaceInputFromMarker(marker, myArr) {
	var index = markersArray.indexOf(marker);
	inputsDiv = document.getElementById("inputs-form");

	if (index != -1) {
		if (index != 0 && index != 1) {
			var inp = document.createElement('div');
			inp.innerHTML = inputStringHTML;
			inputsDiv.appendChild(inp);
		}
		inputsArray = document.getElementsByClassName("input-fields");
		inputsArray[index].value = myArr.results[0].formatted_address;
	}
}

function changeInputsValue(marker, myArr) {
	var index = markersArray.indexOf(marker);
	inputsArray[index].value = myArr.results[0].formatted_address;
}

function createEmptyInput(marker, forceCreate = false) {
	var index = markersArray.indexOf(marker);
	inputsDiv = document.getElementById("inputs-form");

	if (index != -1) {
		if ((index != 0 && inputsArray[inputsArray.length - 1].value.length > 0) || forceCreate) {
			var inp = document.createElement('div');
			inp.innerHTML = inputStringHTML;
			inputsDiv.appendChild(inp);
			createAutocomplete();
		}
	}
}

function createAutocomplete() {

	var options = {
		componentRestrictions: { country: 'fi' }
	};
	inputsArray = document.getElementsByClassName("input-fields");
	for (i = autocompleteArray.length; i < inputsArray.length; i++) {
		autocompleteArray[i] = new google.maps.places.Autocomplete(inputsArray[i], options);
		google.maps.event.addListener(autocompleteArray[i], 'place_changed', function () {
			var tempMarker = L.marker([this.getPlace().geometry.location.lat(), this.getPlace().geometry.location.lng()], { draggable: true }).addTo(map).addEventListener('dragend', onDrag);
			getPointAddress(tempMarker, false);
			markersArray.push(tempMarker);
			getRoute();
			checkMarkers(tempMarker);
		})
	}

	// google.maps.event.addListener(autocompleteStart, 'place_changed', function () {
	// 	var tempMarker = L.marker([autocompleteStart.getPlace().geometry.location.lat(), autocompleteStart.getPlace().geometry.location.lng()], { draggable: true }).addTo(map).addEventListener('dragend', getRoute);
	// 	getPointAddress(tempMarker);
	// 	markersArray.push(tempMarker);
	// 	markersArray[0]._latlng.lng = autocompleteStart.getPlace().geometry.location.lng();
	// 	markersArray[0]._latlng.lat = autocompleteStart.getPlace().geometry.location.lat();
	// 	getRoute();
	// })

	// google.maps.event.addListener(autocompleteEnd, 'place_changed', function () {
	// 	var tempMarker = L.marker([autocompleteStart.getPlace().geometry.location.lat(), autocompleteStart.getPlace().geometry.location.lng()], { draggable: true }).addTo(map).addEventListener('dragend', getRoute);
	// 	getPointAddress(tempMarker);
	// 	markersArray.push(tempMarker);
	// 	markersArray[markersArray.length - 1]._latlng.lng = autocompleteEnd.getPlace().geometry.location.lng();
	// 	markersArray[markersArray.length - 1]._latlng.lat = autocompleteEnd.getPlace().geometry.location.lat();
	// 	getRoute();
	// })

}

function checkMarkers(marker) {
	inputsArray = document.getElementsByClassName("input-fields");
	if (inputsArray.length == markersArray.length) {
		createEmptyInput(marker);
	}
}

function onIntervalChange() {
	var interval = document.getElementById("isochrones_interval");
	var range = document.getElementById("isochrones_range");

	document.getElementById("intervalMin").innerHTML = "Min:" + interval.min;
	document.getElementById("intervalMax").innerHTML = "Max:" + interval.max;
	document.getElementById("intervalCurrent").innerHTML = interval.value;
}

function onRangeChange() {
	var interval = document.getElementById("isochrones_interval");
	var range = document.getElementById("isochrones_range");
	interval.min = Math.ceil(range.value / 10);
	interval.value = Math.max(interval.min, interval.value);
	document.getElementById("rangeMin").innerHTML = "Min:" + range.min;
	document.getElementById("rangeMax").innerHTML = "Max:" + range.max;
	document.getElementById("rangeCurrent").innerHTML = range.value + " min";

	document.getElementById("intervalMin").innerHTML = "Min:" + interval.min;
	document.getElementById("intervalCurrent").innerHTML = interval.value + " min";
}

function placeMarkers() {
	enableMarkers = !enableMarkers;
}

function allowIsochroneMarker() {
	enableMarkers = !enableMarkers;
	isochroneMarker = !isochroneMarker;
}

function enableIsochrones() {
	removeMarkers();
	removeIsochrones();
	allowIsochroneMarker();

	if (document.getElementById("isochrones").style.display === "block") {
		document.getElementById("isochrones").style.display = "none";
		recreateInputs();
	}
	else {
		document.getElementById("isochrones").style.display = "block";
		createOneInput();
	}
}

function showPopup(marker, myArr) {
	marker.bindPopup("<b>" + myArr.results[0].formatted_address + "</b>").openPopup();
}

function zoomIn() {
	map.zoomIn(2);
}

function zoomOut() {
	map.zoomOut(2);
}


var attractionUris = ['JS/RestaurantsGeoJSON.js', 'JS/museums.js'];
function loadAttractions(map) {
	attractionUris.forEach((uri, idx) => {
		loadMapData(uri).then((data) => {
			if (idx === attractionUris.length - 1) bindToMap(map);
		});
	});
}

/*Function to enter user's location as the starting position for a route*/
function locateUser() {
	map.locate({ setView: true, maxZoom: 14 })
		.on('locationfound', function (e) {
			var tempMarker = L.marker([e.latlng.lat, e.latlng.lng], { draggable: true }).addEventListener('dragend', onDrag);
			if (markersArray.length != 0) {
				markersArray[0].setLatLng([e.latlng.lat, e.latlng.lng]);
			}
			else {
				markersArray.push(tempMarker.addTo(map));
			}
			getPointAddress(markersArray[0]);
			getRoute();
			console.log("Location found");
		})
		.on('locationerror', function (e) {
			console.log("Location not found");
		});
}
