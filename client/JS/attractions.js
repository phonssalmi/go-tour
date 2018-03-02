
//var attractionTypes = {};
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
/*
{
features: [
{
properties: {}
geometry: { coordinates:[lat lng]}
}
]

}
*/

loadMapData(dataPath) {
	fetch(dataPath, {
		method: 'GET',
		referrer: 'no-referrer',
		redirect: 'error',
		credentials: 'same-origin',
		header: { 'Accept': 'application/json' }
	}).then((data) => {
		return data.json();

	}).then((jsonData) => {
		if(!jsonData.features) throw new Error('Error while parsing map data. Missing features');

		jsonData.features.forEach((feature) => {
			var fClass = feature.properties.class;
			if(typedAttractionMap[fClass].length == 0)
				typedAttractionMap[fClass] = [];

			typedAttractionMap[fClass].push(featureToAttrData(feature));
		});

	}).catch((e) => {
		console.log('Error while fetching/parsing map data');
		//inform
	});
}

function featureToAttrData(feature) {
	return Object.assign({}
		, feature.properties
		, {
			lat: feature.coordinates[0],
			lng: feature.coordinates[1]
		});
}



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
		if(!attr.lMarker) attr.lMarker = makeMarker(attr.lat, attr.lng); //L.marker([ attr.lat, attr.lon ]);
		if(layerData.isEnabled) {
			attr.lMarker.remove();
		} else {
			attr.lMarker.addTo(boundMap);
		}
		layerData.isEnabled = !layerData.isEnabled;
	});
}

makeMarker(lat, lng, attractionData) {
	var mark = L.marker([ lat, lng ]);
	mark.click = function() {
		console.log(attractionData);
	}

	return mark;
}


