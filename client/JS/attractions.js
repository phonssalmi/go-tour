
var attractionTypes = {};
var typedAttractionMap = {};
/*
museums: {
  isEnabled: true,	//whether this layer(museums) is shown on map or not
  museum_xyz: {
    lat: 1,
    lon: 2,
    data: { open: 123, asdf: 567 }
  }
}
*/

var boundMap = null;
bindToMap(map) {
	boundMap = map;
	Object.keys(typedAttractionMap).forEach((type) => {
		toggleLayerData(typedAttractionMap[type]);
	});
}

toggleLayer(layerName) {
	if(Object.keys(typedAttractionMap).length == 0) {
		console.log('No attraction data..');
		return;
	}
	toggleLayerData(typedAttractionMap[layerName]);
}

toggleLayerData(layerData) {
	Object.keys(layerData).forEach((attr) => {
		if(!attr.lMarker) attr.lMarker = L.marker([ attr.lat, attr.lon ]);
		if(layerData.isEnabled) {
			attr.lMarker.remove();
		} else {
			attr.lMarker.addTo(boundMap);
		}
	});
	layerData.isEnabled = !layerData.isEnabled;
}

