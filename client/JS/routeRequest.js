///http://localhost:8080/otp/routers/default/plan?fromPlace=60.442529151721295,22.288427352905273&toPlace=60.451123027562986,22.267313003540036&time=11:15am&date=01-26-2018&mode=TRANSIT,WALK&maxWalkDistance=804.672&arriveBy=false&wheelchair=false&locale=en

const DEFAULT_OPTS = {
	mode: 'TRANSIT',
	maxWalkDistance: 800,
	arriveBy: false,
	wheelchair: false,
	showIntermediateStops: true
	//time: () => { return getTime(new Date()) },
	//date: () => { return getDate(new Date()) }
};

const routingConfig = {
	route: '/otp/routers/default/plan',
	host: 'localhost:8080',
	protocol: 'http://'
}


function requestRoute(fromLat, fromLng, toLat, toLng, opts = {}) {
	const requestParams = Object.assign({}, DEFAULT_OPTS, opts, {
		fromPlace: getPositionStr(fromLat, fromLng),
		toPlace: getPositionStr(toLat, toLng),
		date: getDate(new Date()),
		time: getTime(new Date())
	});
	const requestOpts = {
		method: 'GET',
		credentials: 'same-origin',
		headers: {
			'Accept': 'application/json'
		}
	};

	return fetch(buildRoute(requestParams), requestOpts).then((res) => {
		if(!res.ok) return res.text();
		return res.json();
	});
}

function getPositionStr(lat, lng) {
	if(typeof lat === 'object') return lat.lat + ',' + lat.lng;
	return lat + ',' + lng;
}

function buildRoute(params) {
	let rt = routingConfig.protocol + routingConfig.host + routingConfig.route;
	
	Object.keys(params).forEach((key, i) => {
		rt += (i === 0 ? '?' : '&');
		rt += key + '=' + params[key];
	});
	console.log(rt);
	return rt;
}

function getTime(date) {
	let h = date.getHours();
	let ampm = 'am';
	if(h > 12) {
		h -= 12;
		ampm = 'pm';
	}

	return h + ':' + date.getMinutes() + ampm;
}

function getDate(date) {
	return (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear();
}

