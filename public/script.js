let idCount = 1;

/* the API constructor and instances are simple, native javascript tools for making
cors calls to the various apis used in the program, namely IBM Alchemy API, the Wikimedia
API, and the Guardian API*/

function API(config) {
  this.baseURL = config.baseURL;

  this.api = config.api;

  this.authURL = config.authURL;

  this.clientID = config.clientID;

  this.clientSecret = config.clientSecret;

  this.apiKey = config.apiKey;
}

API.prototype.http = function http(url) {
  const xml = function xml(method, url, params) {
    const promise = new Promise((resolve, reject) => {
      let uri = url;
      const xhr = new XMLHttpRequest();

      if (params.data && method === 'GET') {
        let count = 0;
        const data = params.data;
        uri += '?';
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            if (count > 0) {
              uri += '&';
            }
            uri += `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`;
            count += 1;
          }
        }
      }

      xhr.open(method, uri);

      if (params.headers) {
        const headers = params.headers;

        for (const key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
          }
        }
      }

      xhr.onload = function onload() {
        if (xhr.status >= 200 && xhr.status <= 300) {
          resolve(xhr.response);
        } else {
          reject(xhr.response);
        }
      };

      xhr.onerror = function onerror() {
        reject(xhr.response);
      };

      if (method === 'PUT' || method === 'POST') {
        xhr.send(params.data);
      } else {
        xhr.send();
      }
    });

    return promise;
  };

  return {
    get: function get(data) {
      return xml('GET', url, data);
    },
    post: function post(data) {
      return xml('POST', url, data);
    },
  };
};


const alchemy = new API({
  baseURL: 'http://gateway-a.watsonplatform.net/',
  api: 'alchemy',
  apiKey: 'a426cc16207269a76ec3bd51f0711dffd1783d4d',
});

alchemy.data = function data(url) {
  const uri = `${this.baseURL}calls/url/URLGetCombinedData`;

  const queries = {
    url,
    apikey: this.apiKey,
    outputMode: 'json',
  };

  const params = { data: queries };

  const handler = {
    success: function success(response) {
      return JSON.parse(response);
    },
    error: function error(reason) {
      console.log(reason);
    },
  };

  return this.http(uri)
         .get(params)
         .then(handler.success, handler.error)
         .catch(handler.error);
};

alchemy.search = function search(url) {
  const result = alchemy.data(url)
  .then((keywords) => {
    const keys = {};

    const combine = function combine(key) {
      if (keys[key.text]) {
        keys[key.text].push(key);
      } else if (key.text) {
        keys[key.text] = [];
        keys[key.text].push(key);
      }
    };

    for (const i in keywords) {
      if (keywords.hasOwnProperty(i)) {
        if (Array.isArray(keywords[i])) {
          keywords[i].forEach(combine);
        }
      }
    }

    const sorted = Object.keys(keys)
    .sort((a, b) => {
      return keys[b].length - keys[a].length;
    });

    return sorted;
  });

  return result;
};

const wiki = new API({
  baseURL: 'https://en.wikipedia.org/w/api.php',
  api: 'wikipedia',
  apiKey: '',
});


wiki.search = function search(title) {
  const uri = this.baseURL;

  const queries = {
    origin: '*',
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: title,
    prop: 'info|pageimages',
    piprop: 'original|thumbnail',
    titles: title,
    indexpageids: true,
  };

  const header = {
    'Api-User-Agent': 'Web-Web/1.0',
    'Content-Type': 'application/json',
  };

  const params = {
    data: queries,
    headers: header,
  };

  const handler = {
    success: function success(response) {
      return JSON.parse(response);
    },
    error: function error(reason) {
      console.log(reason);
    },
  };

  return this.http(uri)
    .get(params)
    .then(handler.success, handler.error)
    .catch(handler.error);
};

wiki.image = function image(title) {
  const uri = this.baseURL;

  const queries = {
    origin: '*',
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: title,
    generator: 'images',
    srnamespace: '6',
    prop: 'info|pageimages',
    piprop: 'original',
    indexpageids: true,
  };

  const header = {
    'Api-User-Agent': 'Web-Web/1.0',
    'Content-Type': 'application/json',
  };

  const params = {
    data: queries,
    headers: header,
  };

  const handler = {
    success: function success(response) {
      return JSON.parse(response);
    },
    error: function error(reason) {
      console.log(reason);
    },
  };

  return this.http(uri)
    .get(params)
    .then(handler.success, handler.error)
    .catch(handler.error);
};

wiki.url = function url(image) {
  const uri = this.baseURL;

  const queries = {
    origin: '*',
    action: 'query',
    format: 'json',
    titles: image,
    iiprop: 'url|mediatype',
    prop: 'imageinfo',
    indexpageids: true,
  };

  const header = {
    'Api-User-Agent': 'Web-Web/1.0',
    'Content-Type': 'application/json',
  };

  const params = {
    data: queries,
    headers: header,
  };

  const handler = {
    success: function success(response) {
      return JSON.parse(response);
    },
    error: function error(reason) {
      console.log(reason);
    },
  };

  return this.http(uri)
    .get(params)
    .then(handler.success, handler.error)
    .catch(handler.error);
};


const guardian = new API({
  baseURL: 'http://content.guardianapis.com/search',
  api: 'guardian',
  apiKey: 'b854df1e-b811-460a-8846-7443f3f95b6e',
});

guardian.search = function search(title) {
  const uri = this.baseURL;

  const queries = {
    'api-key': this.apiKey,
    q: title,
    'show-elements': 'image',
    'show-fields': 'thumbnail',
  };

  const params = {
    data: queries,
  };

  const handler = {
    success: function success(response) {
      return JSON.parse(response);
    },
    error: function error(reason) {
      console.log(reason);
    },
  };

  return this.http(uri)
  .get(params)
  .then(handler.success, handler.error)
  .catch(handler.error);
};

// will only be called on articles with no thumbnail
const findImage = function findImage(name, item) {
  const it = item;
  alchemy.search(name)
  .then((keywords) => {
    wiki.image(keywords[0])
    .then((result) => {
      return result.query.search[0].title;
    })
    .catch((error) => {
      console.log(error);

      it.style.backgroundImage = 'url("public/39680012.jpg")';
    })
    .then((image) => {
      console.log(image);
      return wiki.url(image)
      .then((result) => {
        const pageId = result.query.pageids[0];

        const url = result.query.pages[pageId].imageinfo[0].url;

        it.style.backgroundImage = `url("${url}")`;
      });
    });
  });
};


// uses recursion to to remove all items below the clicked article
const removeSiblings = function removeSiblings(element) {
  if (element.nextSibling !== null) {
    element.nextSibling.remove();

    const removed = element;

    removeSiblings(removed);
  }
};

// all application flow/logic in one event listener
const listener = function listener(event) {
  const target = event.target;

  if (target.classList.contains('selected') === true) {
    /* finds if target is a previously viewed article
      and removes all following items to provide the ability
      to move back in the flow of the program*/
    try {
      if (target.closest('div.list').nextSibling !== null) {
        removeSiblings(target.closest('div.list'));
      } else if (target.id !== 'button1') {
        window.open(target.name);
      }
    } catch (error) {
      if (target.parentElement.nextSibling !== null) {
        removeSiblings(target.parentElement.nextSibling);
      } else if (target.id !== 'button1') {
        window.open(target.name);
      }
    }

    // if the target is a news article then we find related wikipedia pages
    if (target.classList.contains('news') === true) {
      const url = target.name || document.getElementById('searchUrl').value;

      // alchemy api find the keywords
      const links = alchemy.search(url)
      .then((keywords) => {
        //wiki api finds wikipedia pages
        const wikis = keywords.map((keyword) => {
          return wiki.search(keyword);
        });

        return wikis;
      })
      .then((wikis) => {
        return Promise.all(wikis)
        .then((wikis) => {
          // we can use array.filter to remove pages without image thumbnails
          return wikis.filter((article) => {
            const pageId = article.query.pageids[0];

            const page = article.query.pages[pageId];

            return page.thumbnail;
          });
        });
      });

      /* a slightly weighted randomization prevents repeated
      hits while keeping articles relevant */
      links.then((filteredWikis) => {
        const randomWikis = [];

        const weight = function weight(num) {
          return num * num;
        };

        for (let i = 0; i < 3; i++) {
          const j = Math.floor(weight(Math.random()) * filteredWikis.length);

          randomWikis.push(filteredWikis[j]);

          filteredWikis.splice(j, 1);
        }

        makeDiv(randomWikis, target);
      });
    }

    // with wikipedia pages we find related news articles
    if (target.classList.contains('wiki') === true) {
      const title = target.parentNode.title;

      const news = guardian.search(title)
      .then((results) => {
        return results.response.results;
      });

      news.then((articles) => {
        const choices = [];

        const weight = function weight(num) {
          return num * num;
        };

        for (let i = 0; i < 3; i += 1) {
          const j = Math.floor(weight(Math.random()) * articles.length);

          choices.push(articles[j]);

          articles.splice(j, 1);
        }

        makeDiv(choices, target);
      });
    }
  }

  if (target.classList.contains('child') === true) {
    const choices = target.closest('ul').childNodes;

    const lines = target.closest('.list').firstElementChild.childNodes;

    const newClass = target.className.replace('child', 'selected');

    target.className = newClass;

    for (let i = 0; i < choices.length; i += 1) {
      if (i !== 1) {
        lines[i].style.visibility = 'hidden';
      } if (choices[i].firstChild.firstChild.id !== target.id) {
        choices[i].style.display = 'none';
      } else {
        choices[i].style.float = 'none';
      }
    }
  }
};


const rotateLine = function rotateLine(x1, y1, x2, y2, line) {
  const length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));

  const angle = Math.asin((x1 - x2) / length) * 180 / Math.PI;

  const transform = `rotate(${angle}deg)`;

  const li = line;

  li.style.height = `${length.toString()}px`;

  li.style.transform = transform;
};

/* this helper function builds three suggestions for each clicked article;
it's pulled out of the for loop in makeDiv for readability*/
const makeList = function makeList(entry, target, list) {
  const item = document.createElement('LI');

  const link = document.createElement('DIV');

  link.className = 'circle';

  const page = /news/.test(target.className) ? entry.query.pages[entry.query.pageids[0]] : entry;

  const button = document.createElement('button');

  button.type = 'button';

  idCount += 1;

  button.id = `button${idCount}`;

  button.className = /wiki/.test(target.className) ? 'news child' : 'wiki child';

  button.name = /news/.test(target.className) ? `https://en.wikipedia.org/wiki/${page.title}` : page.webUrl;

  button.addEventListener('click', listener);

  link.title = /news/.test(target.className) ? page.title : page.webTitle;

  try {
    link.style.backgroundImage = /news/.test(target.className) ? `url("${page.thumbnail.original}")` : `url("${page.fields.thumbnail}")`;
  } catch (e1) {
    console.log(e1);
    try {
      const name = button.name;

      const passedItem = link;

      findImage(name, passedItem);
    } catch (e2) {
      console.log(e2);
    }
  }

  link.appendChild(button);

  item.appendChild(link);

  list.appendChild(item);
};

// uses native javascript per project specs to build the UI with data from apis
const makeDiv = function makeDiv(entries, target) {
  const parent = target.parentElement;

  const nextDiv = document.createElement('DIV');

  nextDiv.className = 'list';

  const list = document.createElement('UL');

  for (let i = 0; i < entries.length; i += 1) {
    makeList(entries[i], target, list);
  }

  nextDiv.appendChild(list);

  document.body.appendChild(nextDiv);

  const listDiv = document.body.lastElementChild;

  const wrapper = document.createElement('DIV');

  wrapper.className = 'wrapper';

  const forLines = Array.from(listDiv.firstElementChild.childNodes);

  forLines.forEach((node, index) => {
    const line = document.createElement('DIV');

    line.className = `vertical-line ${index}`;

    wrapper.appendChild(line);
  });

  listDiv.insertBefore(wrapper, listDiv.firstElementChild);

  forLines.forEach((node, index) => {
    const line = node.closest('div').firstElementChild.childNodes[index];

    const parentCoor = parent.getBoundingClientRect();

    const childCoor = node.getBoundingClientRect();

    const x1 = (parentCoor.right - parentCoor.left) / 2 + parentCoor.left;

    const y1 = parentCoor.bottom;

    const x2 = (childCoor.right - childCoor.left) / 2 + childCoor.left;

    const y2 = childCoor.top;

    rotateLine(x1, y1, x2, y2, line);
  });

  window.scrollTo(0, document.body.scrollHeight);
};


// adds the event listener to the program's entry point
document.addEventListener('DOMContentLoaded', function () {
  const start = document.getElementById('button1');

  start.addEventListener('click', listener);
});
