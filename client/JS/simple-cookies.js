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


function getCookieHandler() {
	var _cookieData = {
		cookies: {
		}
	};
	
	readCookie();
	
	function readCookie() {
		var pairs = document.cookie.split('; ');
		for(var i = 0; i < pairs.length; i++) {
			if(pairs[i].indexOf('=') !== -1) {
				_cookieData.cookies[pairs[i].split('=')[0]] = pairs[i].split('=')[1];
			} else {
				_cookieData.cookies[pairs[i]] = pairs;
			}
		}
	}

	/*function writeCookie() {
		var tempStr = '';
		var cks = Object.keys(_cookieData.cookies);
		for(var i = 0; i < cks.length; i++) {
			if(_cookieData.cookies[cks[i]] === null) continue;
			if(i !== 0) tempStr += ';';
			tempStr += cks[i] + '=' + _cookieData.cookies[cks[i]];
		}
		document.cookie = tempStr;
	}*/
	
	function getCookie(name) {
		if(!name) return null;
		if(_cookieData.cookies[name]) return _cookieData.cookies[name];
		else return null;
	}

	function setCookie(name, value, maxAge = 86400) {
		if(!name || !value) return;

		_cookieData.cookies[name] = value;
		document.cookie = name + '=' + value + '; max-age=' + maxAge;
	}

	function removeCookie(name) {
		if(_cookieData.cookies[name]) {
			_cookieData.cookies[name] = null;
			setCookie(name, ' ', 1);
		}
	}

	return {
		get: getCookie,
		set: setCookie,
		load: readCookie,
		remove: removeCookie
	}
}
