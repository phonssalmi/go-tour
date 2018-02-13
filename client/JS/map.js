var startlng = 0;
var startlat = 0;
var endlng = 0;
var endlat = 0;
var polyline = null;
var geoJSON = null;
var map;
var startMarker;
var endMarker;
var startInput;
var endInput;
var transportType = "driving-car";
var enableMarkers = false;
var startMarkerPlaced = false;
var endMarkerPlaced = false;
var isochroneMarker = false;

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

	/*Event listeners for the map*/
	startMarker = L.marker([], { draggable: true });
	endMarker = L.marker([], { draggable: true });
	function onMapRightClick(e) {
		/*Place marker*/
		if(enableMarkers && !isochroneMarker){
			endMarker
				.setLatLng(e.latlng)
				.addTo(map);
			endlng = e.latlng.lng;
			endlat = e.latlng.lat;
			getEndPoint(endlat, endlng, endMarker);
			getRoute();
			endMarkerPlaced = true;
			checkMarkers();
		}
	}
	map.on('contextmenu', onMapRightClick);

	function onMapClick(e) {
		/*Place marker*/
		if(enableMarkers){
			startMarker
				.setLatLng(e.latlng)
				.addTo(map);
			startlng = e.latlng.lng;
			startlat = e.latlng.lat;
			getStartPoint(startlat, startlng, startMarker);
			getRoute();
			startMarkerPlaced = true;
			checkMarkers();

			if (isochroneMarker){
				allowIsochroneMarker();
			}
		}
	}
	map.on('click', onMapClick);

	function startMarkerDrag(e) {
		startlng = e.latlng.lng;
		startlat = e.latlng.lat;
		getStartPoint(startlat, startlng, startMarker);
	}

	function endMarkerDrag(e) {
		endlng = e.latlng.lng;
		endlat = e.latlng.lat;
		getEndPoint(endlat, endlng, startMarker);
	}

	function removeEndMarker(){
		endMarker.remove();
	}

	function removeStartMarker(){
		startMarker.remove();
	}

	startMarker.on('move', startMarkerDrag);
	endMarker.on('move', endMarkerDrag);
	startMarker.on('dragend', getRoute);
	endMarker.on('dragend', getRoute);
	startMarker.on('dblclick', removeStartMarker);
	endMarker.on('dblclick', removeEndMarker);
}
function getTransportType(e) {
	transportType = e;
	getRoute();
}

function getRoute() {
	if (startlat == 0 || startlng == 0 || endlat == 0 || endlng == 0)
		return;

	var request = new XMLHttpRequest();
	var requestURI = 'https://api.openrouteservice.org/directions?api_key=58d904a497c67e00015b45fce7820addba544082bfb751a87dd60ca8&coordinates='
		+ startlng + '%2C' + startlat + '%7C' + endlng + '%2C' + endlat + '&profile=' + transportType;
	request.open('GET', requestURI);
	request.setRequestHeader('Accept', 'text/json; charset=utf-8');

	request.onreadystatechange = function () {
		if (this.readyState === 4) {
			var encoded = JSON.parse(this.response).routes[0].geometry;
			if (polyline != null) {
				map.removeLayer(polyline);
			}
			polyline = L.Polyline.fromEncoded(encoded).addTo(map);
		}
	};
	request.send();
}

function getIsochrones() {
	if (startlat == 0 || startlng == 0) {
		alert("Please put a marker first");
		return;
	}
	var range = document.getElementById("isochrones_range").value * 60;
	var interval = document.getElementById("isochrones_interval").value * 60;
	var request = new XMLHttpRequest();

	request.open('GET', 'https://api.openrouteservice.org/isochrones?api_key=58d904a497c67e00015b45fce7820addba544082bfb751a87dd60ca8&locations='
		+ startlng + '%2C' + startlat + '&profile=' + transportType + '&range_type=time&range=' + range + '&interval=' + interval);

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

function getStartPoint(lat, lng, marker) {
	var req = new XMLHttpRequest();
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=AIzaSyBa_gZPpd2jbG06slhnujNjy2pagPZRKGE";
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var myArr = JSON.parse(this.responseText);
			showPopup(marker, myArr);
			startInput.value = myArr.results[0].formatted_address;
		}
	};
	req.open("GET", url, true);
	req.send();
}

function getEndPoint(lat, lng, marker) {
	var req = new XMLHttpRequest();
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=AIzaSyBa_gZPpd2jbG06slhnujNjy2pagPZRKGE";
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var myArr = JSON.parse(this.responseText);
			showPopup(marker, myArr);
			endInput.value = myArr.results[0].formatted_address;
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

		startMarker
			.setLatLng([autocompleteStart.getPlace().geometry.location.lat(), autocompleteStart.getPlace().geometry.location.lng()])
			.addTo(map);
		startlng = autocompleteStart.getPlace().geometry.location.lng();
		startlat = autocompleteStart.getPlace().geometry.location.lat();
		getStartPoint(startlat, startlng, startMarker);
		getRoute();
	})

	google.maps.event.addListener(autocompleteEnd, 'place_changed', function () {

		endMarker
			.setLatLng([autocompleteEnd.getPlace().geometry.location.lat(), autocompleteEnd.getPlace().geometry.location.lng()])
			.addTo(map);
		endlng = autocompleteEnd.getPlace().geometry.location.lng();
		endlat = autocompleteEnd.getPlace().geometry.location.lat();
		getEndPoint(endlat, endlng, endMarker);
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

function placeMarkers(){
	enableMarkers = !enableMarkers;
	startMarkerPlaced = false;
	endMarkerPlaced = false;
}

function checkMarkers(){
	if (startMarkerPlaced && endMarkerPlaced){
		enableMarkers = false;
		startMarkerPlaced = false;
		endMarkerPlaced = false;
	}
}

function allowIsochroneMarker(){
	enableMarkers = !enableMarkers;
	isochroneMarker = !isochroneMarker;
}

function enableIsochrones(){
	allowIsochroneMarker();
	
	if(document.getElementById("isochrones").style.display === "block"){
		document.getElementById("isochrones").style.display = "none";
	}
	else{
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