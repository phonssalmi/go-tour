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
var markersArray = [];
var orsKey = "58d904a497c67e00015b45fce7820addba544082bfb751a87dd60ca8";

window.onload = function () {
	/*Map creation*/
	map = L.map('mapid', {
		center: [60.4500, 22.2667],
		zoom: 14,
		zoomControl: true,
		scaleControl: false,
		minZoom: 4
	});

	map.locate({ setView: true, maxZoom: 14 });
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap contributors</a>'
	}).addTo(map);

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
			getPointAddress(markersArray[0]);
			getPointAddress(markersArray[markersArray.length - 1]);
			getRoute();

		}
	}
	map.on('click', onMapClick);
}
function removeMarkers() {
	markersArray.forEach(marker => {
		map.removeLayer(marker);
	});
	markersArray = [];
	getRoute();
}
function onDrag(e) {
	getPointAddress(e.target);
	if (isochroneMarker) {
		removeIsochrones();
		getIsochrones();
	}
	else {
		getRoute();
	}
}

function getTransportType(e) {
	transportType = e;
	getRoute();
}

function getRoute() {
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
			var encoded = JSON.parse(this.response).routes[0].geometry;

			polyline = L.Polyline.fromEncoded(encoded).addTo(map);
		}
	};
	request.send();
}

let currentItineraries = [];

function getRouteN() {
	if (startlat === 0 || startlng === 0 || endlat === 0 || endlng === 0) return;

	requestRoute(startlat, startlng, endlat, endlng).then((data) => {
		if (typeof data === 'string') {
			console.log(data);
			return;
		}
		if (data.error) {
			console.log(data.error);
			return;
		}
		console.log(data);
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
	route.steps.forEach((step) => { ncords.push([step.lat, step.lon]); });
	ncords.push([route.to.lat, route.to.lon]);
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

function getPointAddress(marker) {
	var req = new XMLHttpRequest();
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + marker._latlng.lat + "," + marker._latlng.lng + "&key=AIzaSyBa_gZPpd2jbG06slhnujNjy2pagPZRKGE";
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var myArr = JSON.parse(this.responseText);
			showPopup(marker, myArr);
			var index = markersArray.indexOf(marker);
			if (index != -1) {
				if (index == 0) {
					startInput.value = myArr.results[0].formatted_address;
				}
				if (index == markersArray.length - 1) {
					endInput.value = myArr.results[0].formatted_address;
				}
			}
			//startInput.value = myArr.results[0].formatted_address;
		}
	};
	req.open("GET", url, true);
	req.send();
}

function createAutocomplete() {
	startInput = document.getElementById('startPoint');
	endInput = document.getElementById('endPoint');
	// var defaultBounds = new google.maps.LatLngBounds(
	//     new google.maps.LatLng(60.4465963, 22.3275915),
	//     new google.maps.LatLng(60.44704549999999, 22.2007352));

	var options = {
		// bounds: defaultBounds,
		componentRestrictions: { country: 'fi' }
	};
	var autocompleteStart = new google.maps.places.Autocomplete(startInput, options);
	var autocompleteEnd = new google.maps.places.Autocomplete(endInput, options);

	google.maps.event.addListener(autocompleteStart, 'place_changed', function () {
		var tempMarker = L.marker([autocompleteStart.getPlace().geometry.location.lat(), autocompleteStart.getPlace().geometry.location.lng()], { draggable: true }).addTo(map).addEventListener('dragend', getRoute);
		getPointAddress(tempMarker);
		markersArray.push(tempMarker);
		markersArray[0]._latlng.lng = autocompleteStart.getPlace().geometry.location.lng();
		markersArray[0]._latlng.lat = autocompleteStart.getPlace().geometry.location.lat();
		getRoute();
	})

	google.maps.event.addListener(autocompleteEnd, 'place_changed', function () {
		var tempMarker = L.marker([autocompleteEnd.getPlace().geometry.location.lat(), autocompleteEnd.getPlace().geometry.location.lng()], { draggable: true }).addTo(map).addEventListener('dragend', getRoute);
		getPointAddress(tempMarker);
		markersArray.push(tempMarker);
		markersArray[markersArray.length - 1]._latlng.lng = autocompleteEnd.getPlace().geometry.location.lng();
		markersArray[markersArray.length - 1]._latlng.lat = autocompleteEnd.getPlace().geometry.location.lat();
		getRoute();
	})

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
	document.getElementById("rangeCurrent").innerHTML = range.value;

	document.getElementById("intervalMin").innerHTML = "Min:" + interval.min;
	document.getElementById("intervalCurrent").innerHTML = interval.value;
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
	}
	else {
		document.getElementById("isochrones").style.display = "block";
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
