var startlng = 0;
var startlat = 0;
var endlng = 0;
var endlat = 0;
var polyline = null;
var map;
window.onload = function () {
	/*Map creation*/
	map = L.map('mapid', {
		center: [60.4500, 22.2667],
		zoom: 14,
		zoomControl: true,
		scaleControl: false,
		minZoom: 4
	});
	/*Initial map location*/
	map.zoomControl.setPosition('bottomright');

	map.locate({ setView: true, maxZoom: 14 });
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap contributors</a>'
	}).addTo(map);

	/*Event listeners for the map*/
	var startMarker = L.marker([], { draggable: true });
	var endMarker = L.marker([], { draggable: true });

	function onMapRightClick(e) {
		/*Place marker*/
		endMarker
			.setLatLng(e.latlng)
			.addTo(map);
		endMarker.bindPopup(JSON.stringify(endMarker.getLatLng()));
		endlng = e.latlng.lng;
		endlat = e.latlng.lat;
		/*Change form value for the end marker*/
		document.getElementById("routeForm").elements["routeEnd"].value = JSON.stringify(e.latlng);
		if (startlng != 0 && startlat != 0) {
			getRoute();
		}
	}
	map.on('contextmenu', onMapRightClick);

	function onMapClick(e) {
		/*Place marker*/
		startMarker
			.setLatLng(e.latlng)
			.addTo(map);
		startMarker.bindPopup(JSON.stringify(startMarker.getLatLng()));
		startlng = e.latlng.lng;
		startlat = e.latlng.lat;
		if (endlng != 0 && endlat != 0) {
			getRoute();
		}
		/*Change form value for the start marker*/
		document.getElementById("routeForm").elements["routeStart"].value = JSON.stringify(e.latlng);
	}
	map.on('click', onMapClick);

	function startMarkerDrag(e) {
		document.getElementById("routeForm").elements["routeStart"].value = JSON.stringify(e.latlng)
		startlng = e.latlng.lng;
		startlat = e.latlng.lat;
	}
	startMarker.on('move', startMarkerDrag);

	function endMarkerDrag(e) {
		document.getElementById("routeForm").elements["routeEnd"].value = JSON.stringify(e.latlng)
		endlng = e.latlng.lng;
		endlat = e.latlng.lat;
	}
	endMarker.on('move', endMarkerDrag);

	startMarker.on('dragend', getRoute);
	endMarker.on('dragend', getRoute);
}
function getRoute() {
	var transportType = document.getElementById("transportType").value;
	var request = new XMLHttpRequest();
	var requestURI = 'https://api.openrouteservice.org/directions?api_key=58d904a497c67e00015b45fce7820addba544082bfb751a87dd60ca8&coordinates='
		+ startlng + '%2C' + startlat + '%7C' + endlng + '%2C' + endlat + '&profile=' + transportType;
	request.open('GET', requestURI);
	request.setRequestHeader('Accept', 'text/json; charset=utf-8');

	request.onreadystatechange = function () {
		if (this.readyState === 4) {
			var encoded = JSON.parse(this.response).routes[0].geometry;
			console.log(this.responseText);
			if (polyline != null) {
				map.removeLayer(polyline);
			}
			polyline = L.Polyline.fromEncoded(encoded).addTo(map);

		}
	};

	request.send();
}
