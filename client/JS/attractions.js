
//var attractionTypes = {};
var typedAttractionMap = {};

var iconUrls = {
	'restaurant': 'markers_icons/purple.png',
	'museum': 'markers_icons/red_img.png'
};

var iconTypes = {};

/*var attractionIcon = L.Icon.extend({
	options: {
		iconUrl: iconUrls['museum'],
		iconSize: [ 18, 28 ],
		shadowSize: [ 18, 28 ],
		iconAnchor: [ 9, 27 ],
		popupAnchor: [ -5, 10 ]
	}
});*/

function getIcon(type) {
	if(!iconUrls[type]) return new L.Icon.Default();
	if(!iconTypes[type]) iconTypes[type] = L.icon({
		iconUrl: iconUrls[type],
		iconSize: [ 18, 28 ],
		shadowSize: [ 18, 28 ],
		iconAnchor: [ 9, 27 ],
		popupAnchor: [ -5, 10 ]
	});

	return iconTypes[type];
}

function findAttractionByName(name) {
	var types = Object.keys(typedAttractionMap);
	for(var t = 0; t < types.length; t++) {
		var curr = typedAttractionMap[types[t]];
		for(var i = 0; i < curr.data.length; i++) {
			if(curr.data[i].name === name) return curr.data[i];
		}
	}
	return null;
}

function findAttractionsByType(type) {
	if(typedAttractionMap[type].data && typedAttractionMap[type].data.length !== 0) return typedAttractionMap[type];
	return null;
}

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
		console.log('debug', e);
	});
}

function parseMapData(jsonData) {
	if(!jsonData.features) throw new Error('Error while parsing map data. Missing features');

	jsonData.features.forEach((feature) => {
		var fClass = feature.properties.class.toLowerCase();
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
			lat: feature.geometry.coordinates[1],
			lng: feature.geometry.coordinates[0]
		});
}



var boundMap = null;
function bindToMap(map) {
	boundMap = map;
	//Object.keys(typedAttractionMap).forEach((type) => {
	//	toggleLayerData(typedAttractionMap[type]);
	//});
}

function toggleLayerByName(layerName) {
	toggleLayer(findAttractionsByType(layerName));
}

function toggleLayer(layerData) {
	if(layerData === null) {
		console.log('No layer data'); 
		return;
	}

	for(var i = 0; i < layerData.data.length; i++) {
		var current = layerData.data[i];
		if(!current.lMarker) current.lMarker = makeMarker(current.lat, current.lng, current);
		if(layerData.isEnabled) {
			current.lMarker.remove();
		} else {
			current.lMarker.addTo(boundMap);
		}	
	}
	layerData.isEnabled = !layerData.isEnabled;
}

function showLayer(layerData) {
	if(layerData === null) {
		console.log('No layer data');
		return;
	}

	if(layerData.isEnabled) return;
	for(var i = 0; i < layerData.data.length; i++) {
		showAttractionMarker(layerData.data[i]);
		//var curr = layerData.data[i];
		//if(!curr.lMarker) curr.lMarker = makeMarker(curr.lat, curr.lng, curr);
		//curr.lMarker.addTo(boundMap);
	}
	
	layerData.isEnabled = true;
}

function showAttractionMarker(attrData) {
	if(!attrData.lMarker) attrData.lMarker = makeMarker(attrData.lat, attrData.lng, attrData);
	attrData.lMarker.addTo(boundMap);
}

function hideLayer(layerData) {
	if(layerData === null) {
		console.log('No layer data');
		return;
	}

	if(!layerData.isEnabled) return;
	for(var i = 0; i < layerData.data.length; i++) {
		hideAttractionMarker(layerData.data[i]);
	}

	layerData.isEnabled = false;
}

function hideAttractionMarker(attrData) {
	if(attrData.lMarker) attrData.lMarker.remove();
}

var attractionPanel = null;
var attractionContainer = null;
function makeMarker(lat, lng, attractionData) {
	if(attractionPanel === null) {
		attractionPanel = document.getElementById('attraction-panel');
		attractionContainer = document.getElementById('attraction-menu-container');
	}
	
	var mark = L.marker([ lat, lng ], { icon: getIcon(attractionData.class) });
	
	//console.log(mark);
	mark.on('click', clickEventWrapper(attractionPanel, attractionContainer, attractionData));

	return mark;
}


var currentlyShownAttr = null;
function clickEventWrapper(attrDataPanel, attrDataContainer, attrData) {
	return function (evData) {
		//console.log(attrData);
		toggleAttractionContainer(attrDataContainer, attrData);
		
		currentlyShownAttr = attrData;
		updateAttrPanel(attrData, attrDataPanel);
		//attrDataPanel.innerHTML = JSON.stringify(Object.assign({}, attrData, { lMarker: '' }));

	}
}

function updateAttrPanel(attrData, attrDataPanel) {
	document.getElementById('attrName').innerHTML = attrData.name;
	document.getElementById('attrClass').innerHTML = attrData.class;
	document.getElementById('attrAddress').innerHTML = attrData.address;
	document.getElementById('attrWebsite').innerHTML = attrData.website;
	document.getElementById('attrWebsite').href = attrData.website;
	
	document.getElementById('attrMonday').innerHTML = attrData.monday;
	document.getElementById('attrTuesday').innerHTML = attrData.tuesday;
	document.getElementById('attrWednesday').innerHTML = attrData.wednesday;
	document.getElementById('attrThursday').innerHTML = attrData.thursday;
	document.getElementById('attrFriday').innerHTML = attrData.friday;
	document.getElementById('attrSaturday').innerHTML = attrData.saturday;
	document.getElementById('attrSunday').innerHTML = attrData.sunday;
	
	document.getElementById('attrDescription').innerHTML = attrData.description;
	
}

function searchByString(str) {
	if(str === null || str.length === 0) return [];
	var query = str.toLowerCase();

	var possibleResList = [];

	var attractionTypes = Object.keys(typedAttractionMap);
	for(var i = 0; i < attractionTypes.length; i++) {
		if(attractionTypes[i].startsWith(query))
			possibleResList.push(asSearchResult(attractionTypes[i]));
	}

	for(var i = 0; i < attractionTypes.length; i++) {
		typedAttractionMap[attractionTypes[i]].data.forEach((attrData) => {
			if(attrData.name.toLowerCase().startsWith(query))
				possibleResList.push(asSearchResult(attrData));
		});
	}

	return possibleResList;
}

function asSearchResult(data) {
	var type = (data instanceof Object) ? 'item' : 'list';
	return {
		name: type === 'item' ? data.name : data,
		type: type,
		data: data
	};
}

function onSearchButtonClick() {
	console.log('wat');
	document.getElementById('search-container').classList.toggle('search-focused');
	var inputEl = document.getElementById('search-in');
	inputEl.oninput = searchInputEventHandlerWrapper(inputEl);
}

function searchInputEventHandlerWrapper(inElement) {
	var lastInputValue = '';

	return function searchInputHandler(ev) {
		var inputValue = inElement.value;
		if(inputValue === lastInputValue) return;

		lastInputValue = inputValue;
		console.log(inputValue);

		if(inputValue === '') {
			document.getElementById('search-suggestive').value = '';
			return;
		}

		var searchResults = searchByString(inputValue);
		console.log(searchResults);
		if(searchResults.length !== 0) {
			document.getElementById('search-suggestive').value = searchResults[0].name;
		}
	}
}

/*Currently moves map to markers location on successful search*/
/*TODO: Show the attraction information side bar*/
function onSearchSubmit() {
	console.log("submit called");
	var inputValue = document.getElementById('search-in').value;
	var searchResults = searchByString(inputValue);
	
	console.log(inputValue);
	console.log(searchResults[0].name);
	
	if(inputValue.toLowerCase() === searchResults[0].name.toLowerCase()) { /*Complete match found*/
		console.log("Match found");
		map.flyTo([searchResults[0].data.lat, searchResults[0].data.lng]);
		showAttractionMarker(searchResults[0].data);
	} else if(searchResults[0].name.length != 0){ /*Partial match found*/
		console.log("Partial match found");
		map.flyTo([searchResults[0].data.lat, searchResults[0].data.lng]);
		showAttractionMarker(searchResults[0].data);
	}
}

function toggleAttractionContainer(attrDataContainer, attrData) {
	if(attrDataContainer === null) { /*For call from close button*/
		attrDataContainer = document.getElementById('attraction-menu-container');
		attrDataContainer.style.display = 'none';
	}	
	else if(attrDataContainer.style.display === 'none') {
		attrDataContainer.style.display = 'block';
	} 
	else if(currentlyShownAttr === attrData) {
		attrDataContainer.style.display = 'none';
		return;
	}
}
