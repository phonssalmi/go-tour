window.onload = function(){
	/*Map creation*/
    var map = L.map('mapid',{
        center:[60.4500, 22.2667],
        zoom:14,
        zoomControl:true,	
		scaleControl:false,
        minZoom:4
    });
	
	/*Initial map location*/
	map.zoomControl.setPosition('bottomright');
	
    map.locate({setView:true, maxZoom:14});
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap contributors</a>'
	}).addTo(map);
	
	/*Event listeners for the map*/
	var startMarker = L.marker([],{draggable: true});
	var endMarker = L.marker([],{draggable: true});
	
	
	function onMapRightClick(e) {
		/*Place marker*/
		endMarker
			.setLatLng(e.latlng)
			.addTo(map);
		endMarker.bindPopup(JSON.stringify(endMarker.getLatLng()));
		/*Change form value for the end marker*/
		document.getElementById("routeForm").elements["routeEnd"].value = JSON.stringify(e.latlng);
	}
	map.on('contextmenu', onMapRightClick);
	
	function onMapClick(e) {
		/*Place marker*/
		startMarker
			.setLatLng(e.latlng)
			.addTo(map);
		startMarker.bindPopup(JSON.stringify(startMarker.getLatLng()));
		/*Change form value for the start marker*/
		document.getElementById("routeForm").elements["routeStart"].value = JSON.stringify(e.latlng);
	}
	map.on('click', onMapClick);
	
	function startMarkerDrag(e) {
		document.getElementById("routeForm").elements["routeStart"].value = JSON.stringify(e.latlng)
	}
	startMarker.on('move', startMarkerDrag);
	
	function endMarkerDrag(e) {
		document.getElementById("routeForm").elements["routeEnd"].value = JSON.stringify(e.latlng)
	}
	endMarker.on('move', endMarkerDrag);
}





