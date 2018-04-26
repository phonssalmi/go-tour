/**
 *	This file is part of GoTour.
 *
 *	GoTour is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	GoTour is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with GoTour.  If not, see <http://www.gnu.org/licenses/>.
 */


const DEFAULT_OPTS = {
	mode: 'TRANSIT,WALK',
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

function requestOtpRoute(from, to, opts = {}, intermediateStops = []) {
	const requestParams = Object.assign({}, DEFAULT_OPTS, {
		fromPlace: getPositionStr(from.lat, from.lng),
		toPlace: getPositionStr(to.lat, to.lng),
		date: getDate(new Date()),
		time: getTime(new Date()),
		intermediatePlaces: getStopsList(intermediateStops)

	}, opts);

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

function getStopsList(posList) {
	var nList = [];
	for(var i = 0; i < posList.length; i++) {
		nList.push(getPositionStr(posList[i].lat, posList[i].lng));
	}
	return nList;
}

function buildRoute(params) {
	let rt = routingConfig.protocol + routingConfig.host + routingConfig.route;
	
	Object.keys(params).forEach((key, i) => {
		if(Array.isArray(params[key])) {
			for(var i = 0; i < params[key].length; i++) {
				rt += (i === 0 ? '?' : '&');
				rt += key + '=' + params[key][i];
			}

		} else {
			rt += (i === 0 ? '?' : '&');
			rt += key + '=' + params[key];
		}

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

