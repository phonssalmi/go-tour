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
	
	
	function onMapClick(e) {
		endMarker
			.setLatLng(e.latlng)
			.addTo(map);
		endMarker.bindPopup(JSON.stringify(endMarker.getLatLng()));
	}
	map.on('click', onMapClick);
	
	function onMapRightClick(e) {
		startMarker
			.setLatLng(e.latlng)
			.addTo(map);
		startMarker.bindPopup(JSON.stringify(startMarker.getLatLng()));
	}
	map.on('contextmenu', onMapRightClick);
}





