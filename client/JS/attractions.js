
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

var testData = {
	type: 'test',
	features: [
		{
			type: 'feature',
			properties: {
				open: true,
				class: 'museum',
				name: 'test-place1'
			},
			coordinates: [ 60.44422270611994, 22.274436950683597 ]
		},
		{
			type: 'feature',
			properties: {
				open: true,
				class: 'museum',
				name: 'test-place2'
			},
			coordinates: [ 60.44926050852973, 22.286281585693363 ]
		},
		{
			type: 'feature',
			properties: {
				open: true,
				class: 'restaurant',
				name: 'test-place3'
			},
			coordinates: [ 60.451292342179464, 22.255983352661133 ]
		}
	]
};

function loadMapData(dataPath) {
	return fetch(dataPath, {
		method: 'GET',
		referrer: 'no-referrer',
		redirect: 'error',
		credentials: 'same-origin',
		header: { 'Accept': 'application/json' }
	}).then((data) => {
		return data.json();

	}).then((jsonData) => {
		parseMapData(jsonData);

	}).catch((e) => {
		console.log('Error while fetching/parsing map data');
		//inform
	});
}

function parseMapData(jsonData) {
	if(!jsonData.features) throw new Error('Error while parsing map data. Missing features');

	jsonData.features.forEach((feature) => {
		var fClass = feature.properties.class;
		if(!typedAttractionMap[fClass]) {
			typedAttractionMap[fClass] = { data: [], isEnabled: false };
		}

		typedAttractionMap[fClass].data.push(featureToAttrData(feature));
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
function bindToMap(map) {
	boundMap = map;
	Object.keys(typedAttractionMap).forEach((type) => {
		toggleLayerData(typedAttractionMap[type]);
	});
}

function toggleLayer(layerName) {
	if(Object.keys(typedAttractionMap).length == 0) {
		console.log('No attraction data..');
		return;
	}
	toggleLayerData(typedAttractionMap[layerName]);
}

function toggleLayerData(layerData) {
	Object.keys(layerData.data).forEach((attr) => {
		var current = layerData.data[attr];
		if(!current.lMarker) current.lMarker = makeMarker(current.lat, current.lng, current);
		if(layerData.isEnabled) {
			current.lMarker.remove();
		} else {
			current.lMarker.addTo(boundMap);
		}	
	});
	layerData.isEnabled = !layerData.isEnabled;
}

var attractionPanel = null;
var attractionContainer = null;
function makeMarker(lat, lng, attractionData) {
	if(attractionPanel === null) {
		attractionPanel = document.getElementById('attraction-panel');
		attractionContainer = document.getElementById('attraction-menu-container');
	}

	var mark = L.marker([ lat, lng ]);
	console.log(mark);
	mark.on('click', clickEventWrapper(attractionPanel, attractionContainer, attractionData));

	return mark;
}


var currentlyShownAttr = null;
function clickEventWrapper(attrDataPanel, attrDataContainer, attrData) {
	return function (evData) {
		console.log(attrData);
		if(attrDataContainer.style.display === 'none') {
			attrDataContainer.style.display = 'inherit';
		} else if(currentlyShownAttr === attrData) {
			attrDataContainer.style.display = 'none';
			return;
		}
		
		currentlyShownAttr = attrData;
		attrDataPanel.innerHTML = JSON.stringify(Object.assign({}, attrData, { lMarker: '' }));

	}
}



