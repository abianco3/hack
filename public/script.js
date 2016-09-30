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
	apiKey : '**********'

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

alchemy.news = function (searchTerm) {

	var uri, params, queries, handler;


	uri = this.baseURL + 'calls/data/GetNews';

	
	queries = {

		'q.enriched.url.enrichedTitle.keywords.keyword.text' : searchTerm,

		start : 'now-10d',

		end : 'now',

		count : '10',

		return : 'enriched.url.title,enriched.url.url,enriched.url.image',

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


alchemy.search = function (url) {

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
	apiKey : '*********'

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


function makeDiv (entries, target) {

	var parent, nextDiv, anchor, button, page;

	parent = target.parentElement;

	nextDiv = document.createElement('DIV');

	nextDiv.className = 'list';

	var list = document.createElement('UL');

	for (var i = 0; i < entries.length; i++) {

		var item = document.createElement('LI');

		var entry = entries[i];

		var link = document.createElement('DIV');

		link.className = 'circle';

		page = /news/.test(target.className) ? entry.query.pages[entry.query.pageids[0]] : entry;

		console.log(page);

		button = document.createElement('button');

		button.type = 'button';

		button.id = i;

		button.className = /wiki/.test(target.className) ? 'news child' : 'wiki child';

		button.name = /news/.test(target.className) ? 'https://en.wikipedia.org/wiki/' + page.title : page.web_url;

		button.addEventListener('click', listener);


		try {
			link.style.backgroundImage = /news/.test(target.className) ? 'url("' + page.thumbnail.original + '")' : 
		'url("https://static01.nyt.com/' + page.multimedia[1].url +'")' /*'url("' + page.image + '")'*/;
		}

		catch (e) {
			console.log(e);
			try {
				link.style.backgroundImage = page.multimedia[0].url;
			}
			catch (e){
				console.log(e);
				link.style.backgroundImage = 'none';
			}
		}

		link.title = /news/.test(target.className) ? page.title : page.headline.main;

		link.appendChild(button);

		item.appendChild(link);

		list.appendChild(item);
	}

	nextDiv.appendChild(list);

	document.body.appendChild(nextDiv);

	var listDiv = document.body.lastElementChild;

	var wrapper = document.createElement('DIV');

	wrapper.className = 'wrapper';


	var forLines = listDiv.firstElementChild.childNodes;

	forLines.forEach(function (node, index) {
		var line = document.createElement('DIV');

		line.className = 'vertical-line' + ' ' + index;

		wrapper.appendChild(line);

	});

	listDiv.insertBefore(wrapper, listDiv.firstElementChild);

	forLines.forEach(function (node, index) {
		var x1, x2, y1, y2, parentCoor, childCoor, line;

		line = node.closest('div').firstElementChild.childNodes[index];

		parentCoor = parent.getBoundingClientRect();

		console.log(parentCoor);

		childCoor = node.getBoundingClientRect();

		console.log(childCoor);

		x1 = (parentCoor.right - parentCoor.left) / 2 + parentCoor.left;

		console.log(x1);

		y1 = parentCoor.bottom;

		console.log(y1);

		x2 = (childCoor.right - childCoor.left) / 2 + childCoor.left;

		console.log(x2);

		y2 = childCoor.top;

		console.log(y2);

		rotateLine (x1, y1, x2, y2, line);
	});
}

function rotateLine (x1, y1, x2, y2, line) {

	var length, angle, transform;

	length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));

	angle = Math.asin((x1 - x2) / length) * 180 / Math.PI;

	transform = 'rotate('+angle+'deg)';

	console.log(transform);

	console.log(length.toString());

	line.style.height = length.toString() + 'px';

	line.style.transform = transform;

	console.log(line);
}

function listener (event) {

	var url, target, links, title, news, choices, newClass, lines;

	target = event.target;


	if (target.classList.contains('selected') === true) {
			
		if (target.id !== 'button1') {
			var newWindow = window.open(target.name);

			newWindow.blur();

			window.focus();

			if (target.closest('div.list').nextSibling !== null) {

				function removeSiblings (element) {
					if (element.nextSibling !== null) {
						element.nextSibling.remove();
						var removed = element;
						removeSiblings(removed);
					}
				}

				removeSiblings(target.closest('div.list'));
			}
		}

		
		

		if (target.classList.contains('news') === true) {

			url = target.name || document.getElementById('searchUrl').value;

			console.log(url);

			links = alchemy.search(url)
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
						
						try {
						console.log(wiki);
						var pageId, page;
						pageId = wiki.query.pageids[0];
						page = wiki.query.pages[pageId];
					
						return page.thumbnail;
						}
						catch (e) {
							console.log(e);
						}
					});
				});
			
			});

			links.then(function(filteredWikis) {
				
				var randomWikis, weight, i, j;

				randomWikis = [];

				weight = function(num) {
					return num * num;
				};

				for (i = 0; i < 3; i++) {
					j = Math.floor(weight(Math.random()) * filteredWikis.length);
					randomWikis.push(filteredWikis[j]);
					filteredWikis.splice(j, 1);
				}

				makeDiv(randomWikis, target);
			});
		}

		if (target.classList.contains('wiki') === true) {

			title = target.parentNode.title;

			console.log(title);

			news = times.search(title)
			.then(function(results) {
				return results.response.docs;
			});

			/*news = alchemy.news(title)
			.then(function(result) {
				console.log(result);
				return result.result.docs.map
				(function (article) {
					return article.source.enriched.url;
				});
			});*/

			return news.then(function(articles) {

				console.log(articles);

				var choices, weight, i, j;

				choices = [];

				weight = function(num) {
					return num * num;
				};

				for (i = 0; i < 3; i++) {
					j = Math.floor(weight(Math.random()) * articles.length);
					choices.push(articles[j]);
					articles.splice(j, 1);
				}

				makeDiv(choices, target);

			});

		}
	}

	if (target.classList.contains('child') === true) {

		choices = target.closest('ul').childNodes;

		lines = target.closest('.list').firstElementChild.childNodes;

		newClass = target.className.replace('child', 'selected');

		target.className = newClass;

		for (var i = 0; i < choices.length; i++) {
			console.log(choices[i].firstChild.firstChild.id);

			if(i !== 1) {
				lines[i].style.visibility = 'hidden';
			}

			if (choices[i].firstChild.firstChild.id != target.id) {
				choices[i].style.display = 'none';
			}

			else {
				choices[i].style.float = 'none';
			}
		}

	}
}

document.addEventListener('DOMContentLoaded', function () {

	var start = document.getElementById('button1');

	start.addEventListener('click', listener);
  
});