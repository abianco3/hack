function API (config) {
	
	/*for (var i in config) {
		if (config.hasOwnProperty(i)) {
			this[i] = config[i];
		}
	}*/
	this.baseURL = config.baseURL;

	this.api = config.api;

	this.authURL = config.authURL;

	this.clientID = config.clientID;

	this.clientSecret = config.clientSecret;

	this.apiKey = config.apiKey;

}

API.prototype.http = function (url) {
  
  var xml = function(method, url, params) {

  	var promise = new Promise ( function (resolve, reject) {

  		var uri = url;
		
		var xhr = new XMLHttpRequest();


  		if (params.data && method === 'GET') {
  			
  			var count = 0;

  			var data = params.data;

  			uri += '?';

  			for (var key in data) {
				if (data.hasOwnProperty(key)) {
				  if (count > 0) {
				  	uri += '&';
				  }
				uri += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
				count++;
				}
			}
		}

		xhr.open(method, uri);

		if (params.headers) {

		  var headers = params.headers;

		  for (key in headers) {
			if(headers.hasOwnProperty(key)) {
			  xhr.setRequestHeader(key, headers[key]);
			}
		  }
		}



		xhr.onload = function () {
				  
			if (xhr.status >= 200 && xhr.status <= 300) {
				resolve(xhr.response);
			}

			else {
			  reject(xhr.response);
			}
		  
		};


		xhr.onerror = function () {
		  reject(xhr.response);
		};

		  

		if (method === 'PUT' || method === 'POST') {
		  xhr.send(params.data);
		}

		else {
		  xhr.send();
		}

		
		});

  	
  	return promise;

  
  };

  return {
  	
  	'get' : function (data) {
  		return xml('GET', url, data);
  	},

  	'post' : function (data) {
  		return xml('POST', url, data);
  	},

  	'put' : function (data) {
  		return xml ('PUT', url, data);
  	},
   
    'delete' : function (data) {
    	return xml ('DELETE', url, data);
    }

  };

};

var alchemy = new API ({
	
	baseURL : 'http://gateway-a.watsonplatform.net/',
	api : 'alchemy',
	apiKey : '##################'

});

alchemy.queries = {};

alchemy.data = function data (url) {

	
	var uri, params, queries, handler;

	
	uri = this.baseURL + 'calls/url/URLGetCombinedData';

	
	queries = {

		url : url,

		apikey : this.apiKey,

		outputMode : 'json'

	};

	
	params = {data : queries};


	handler = {
		
		success : function(response) {
			return JSON.parse(response);
		},

		error : function(reason) {
			console.log(reason);
		}

	};

  return this.http(uri)
         .get(params)
         .then(handler.success, handler.error)
         .catch(handler.error);

};


alchemy.search = function (url, target, click) {

	console.log(this);

	var keywords, sorted, _this;

	_this = this;

	keywords = alchemy.data(url);

	sorted = keywords.then(function(keywords) {
			
		var keys, combine;

		keys = {};

		combine = function (key) {
			if (keys[key.text]) {
				keys[key.text].push(key);
			}
			else if (key.text) {
				keys[key.text] = [];
				keys[key.text].push(key);
			}
		};

		for (var i in keywords) {
		  if (keywords.hasOwnProperty(i)) {
			if(Array.isArray(keywords[i])) {
			  keywords[i].forEach(combine);
			  }
			}
		}

		var sorted = Object.keys(keys).sort(function(a, b) {
			return keys[b].length - keys[a].length;
		});

		console.log(keywords);
		console.log(sorted);
		return sorted;
	});

	sorted.then(function(keywords) {

		_this.queries[target.id] = keywords;

		wiki.link(keywords, target, click);

	});


};

var wiki = new API ({
	
	baseURL : 'https://en.wikipedia.org/w/api.php',
	api : 'wikipedia',
	apiKey : ''

});

wiki.queries = {};

wiki.search = function (title) {

  var uri, params, queries, header, handler;

  uri = this.baseURL;

  queries = {

  	origin : '*',

  	action : 'query',

  	format : 'json',

  	list : 'search',

  	srsearch : title,

  	prop : 'info|pageimages',

  	piprop : 'original',

  	titles : title,

  	indexpageids : true

  };

  header = { 

  	'Api-User-Agent' : 'Web-Web/1.0',

  	'Content-Type' : 'application/json'

};

  params = {

  	data : queries,

  	headers : header
  
  };

  handler = {
		
	success : function(response) {
	  return JSON.parse(response);
	},

	error : function(reason) {
	  console.log(reason);
	}

  };

  return this.http(uri)
    .get(params)
    .then(handler.success, handler.error)
    .catch(handler.error);

};


wiki.link = function (keywords, target, click) {

	var wikiEntry, _this;

	wikiEntry = this.search(keywords[click-1]);

	_this = this;

	wikiEntry.then(function(entry) {

		console.log(entry);

		_this.queries[target.id] = {};

		_this.queries[target.id][click] = wikiEntry;
		
		makeDiv(entry, target, click);
	});
};

function makeDiv (entry, target, click) {

	var parent, nextDiv, anchor, button, page, identity;

	console.log(click);

	identity = parseInt(target.id.slice(-1)) + 1;

	parent = target.parentElement;

	nextDiv = parent.cloneNode();

	nextDiv.className = /wiki/.test(target.className) ? 'wiki ' + click: 'news ' + click;

	nextDiv.style.top = '34.86em';

	if (click==='2') {

		nextDiv.style.left = '34.86em';
	}

	if (click==='3') {

		nextDiv.style.right = '34.86em';

	}

	console.log(nextDiv);

	page = entry.query.pages[entry.query.pageids[0]];

	button = document.createElement('button');

	button.type = 'button';

	button.id = identity ? 'button' + identity : 'button 2';

	button.className = /wiki/.test(target.className) ? 'link news 1' : 'link wiki 1';

	button.name = 'https://en.wikipedia.org/wiki/' + page.title;

	button.addEventListener('click', listener);


	nextDiv.style.backgroundImage = 'url("' + page.thumbnail.original + '")';

	nextDiv.appendChild(button);

	document.body.appendChild(nextDiv);

}

function listener (event) {

	var url, target, click;

	target = event.target;

	click = target.className.slice(-1);

	console.log(click);


	if (target.classList.contains('wiki') === true) {

		if (click === '1') {
			
			url = document.getElementById('searchUrl').value;

			console.log(url);

			alchemy.search(url, target, click);


		}

		if ('1' < click && click <= '3') {
			
			var keywords = alchemy.queries[target.id];

			console.log(keywords);

			wiki.link(keywords, target, click);
		
		}

		target.className = 'link wiki ' + (parseInt(click) + 1);

		console.log(target.className);

	}

	if (target.classList.contains('news') === true && click === '1') {

		window.open(target.name);

	}

}

document.addEventListener('DOMContentLoaded', function () {

	var start = document.getElementById('button1');

	start.addEventListener('click', listener);
  
});