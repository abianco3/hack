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
	apiKey : '0cc036f94105c0c5d39c36790a77146ab27ca3a1'

});


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

	var keywords, _this;

	_this = this;

	keywords = alchemy.data(url)

	.then(function(keywords) {
			
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

	return keywords;

};

var wiki = new API ({
	
	baseURL : 'https://en.wikipedia.org/w/api.php',
	api : 'wikipedia',
	apiKey : ''

});


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

var times = new API ({
	
	baseURL : 'https://api.nytimes.com/svc/search/v2/articlesearch.json',
	api : 'new york times',
	apiKey : '626edab52a884bcda6a6bd4b405fa60a'

});

times.search = function (title) {

	var uri, params, queries, handler;

	uri = this.baseURL;

	queries = {

		'api-key' : this.apiKey,

		'q' : title

	};

	params = {

		data : queries
	
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

function makeDiv (entry, target, click) {

	var parent, nextDiv, anchor, button, page, identity;

	console.log(click);

	identity = parseInt(target.id.slice(-1)) + 1;

	parent = target.parentElement;

	nextDiv = parent.cloneNode();

	nextDiv.className = /wiki/.test(target.className) ? 'wiki ' + click: 'news ' + click;

	var offsetTop = parseInt(nextDiv.style.top.replace('em', ''));

	var offsetRight = parseInt(nextDiv.style.right.replace('em', '')) || 0;

	console.log(offsetRight);

	nextDiv.style.top = target.id === 'button1' ? '34.86em' : offsetTop + 34.86 + 'em';

	if (click==='2') {

		nextDiv.style.right = target.id === 'button1' ? '-34.86em' : offsetRight - 34.86 + 'em';
	}

	if (click==='3') {

		nextDiv.style.right = target.id === 'button1' ? '34.86em' : offsetRight + 34.86 + 'em';

	}

	console.log(nextDiv);

	page = /wiki/.test(target.className) ? entry.query.pages[entry.query.pageids[0]] : entry;

	console.log(page);

	button = document.createElement('button');

	button.type = 'button';

	button.id = identity ? 'button' + identity : 'button 2';

	button.className = /wiki/.test(target.className) ? 'link news 0' : 'link wiki 0';

	button.name = /wiki/.test(target.className) ? 'https://en.wikipedia.org/wiki/' + page.title : page.web_url;

	button.addEventListener('click', listener);


	try {
		nextDiv.style.backgroundImage = /wiki/.test(target.className) ? 'url("' + page.thumbnail.original + '")' : 
	'url("https://static01.nyt.com/' + page.multimedia[1].url +'")';
	}

	catch (e) {
		console.log(e);
		nextDiv.style.backgroundImage = 'none';
	}

	nextDiv.title = /wiki/.test(target.className) ? page.title : page.headline.main;

	nextDiv.appendChild(button);

	document.body.appendChild(nextDiv);

}

function listener (event) {

	var url, target, click;

	target = event.target;

	click = target.className.slice(-1);

	console.log(click);


	if (target.classList.contains('wiki') === true) {
			
		if(click === '0') {

			window.open(target.name);
		}

		if ('1' <= click && click <= '3') {

			url = target.name || document.getElementById('searchUrl').value;

			console.log(url);

			var links = alchemy.search(url, target, click)
			.then(function(keywords) {
				var wikis = keywords.map(function(keyword) {
					return wiki.search(keyword);
				});

				return wikis;
			})
			.then(function(wikis) {
			
				return Promise.all(wikis)
			
				.then(function(wikis){
				
					return wikis.filter(function(wiki) {
						console.log(wiki);
						var pageId = wiki.query.pageids[0];
						var page = wiki.query.pages[pageId];
					
						return page.thumbnail;
				
					});
				});
			
			});

			links.then(function(filteredWikis) {
			
				makeDiv(filteredWikis[parseInt(click)-1], target, click);
			});

		}
		
			target.className = 'link wiki ' + (parseInt(click) + 1);

			console.log(target.className);

	}

	if (target.classList.contains('news') === true) {

		if (click ==='0') {

			window.open(target.name);

		}

		if ('1' <= click && click <= '3') {

			var title = target.parentNode.title;

			console.log(title);

			var news = times.search(title);

			news.then(function(results) {

				console.log(results);

				var result = results.response.docs[parseInt(click) - 1];

				makeDiv(result, target, click);

			});

		}

		target.className = 'link news ' + (parseInt(click) + 1);

		console.log(target.className);

	}


}

document.addEventListener('DOMContentLoaded', function () {

	var start = document.getElementById('button1');

	start.addEventListener('click', listener);
  
});