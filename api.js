var API = {
  call: function(path, data) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.onload = function() {
        if (req.status == 401) {
          localStorage.removeItem(Auth.storageKey.extensionToken);
          reject(Error("Not Authorized"));
          return;
        } else if (req.status != 200) {
          resolve(JSON.parse(req.responseText));
          return;
        } else {
          resolve(JSON.parse(req.responseText));
        }
      };
      req.onerror = function() {
        reject(Error("XHR error"));
      };
      req.open('POST', 'https://hackershare.dev/' + path);
      req.setRequestHeader('Content-Type', 'application/json; charset=UTF8');
      req.setRequestHeader('X-Accept', 'application/json');
      req.setRequestHeader('extension-token', localStorage[Auth.storageKey.extensionToken]);
      req.send(JSON.stringify(data));
    });
  },

  /**
   * Add a URL to hackershare.
   * https://hackershare.dev/extensions .
   * @param url URL to add.
   * @return A Promise of the API call result.
   */
  add: function(url) {
    var data = {url:url};
    return API.call('extensions', data).then(function(data) { return data; });
  }
};

var Auth = {
  redirectUri: chrome.extension.getURL('auth.html'),

  storageKey: {
    extensionToken: 'extension_token',
    username: 'username',
  },

  isNeeded: function() {
    return localStorage[Auth.storageKey.extensionToken] == null;
  },

  go: function() {
    window.open("https://hackershare.dev/sessions/new" + "?chrome-callback=" + Auth.redirectUri);
  },

  onGotUserPermission: function(url) {
    var url = new URL(url);

    localStorage[Auth.storageKey.extensionToken] = url.searchParams.get("extension-token");
    localStorage[Auth.storageKey.username] = url.searchParams.get("username");
  }
};
