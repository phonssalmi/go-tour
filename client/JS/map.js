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
	var popup = L.popup();

	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent("You clicked the map at " + e.latlng.toString())
			.openOn(map);
	}

	map.on('click', onMapClick);
}





