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
