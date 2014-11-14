/**
* This script bundles and serves a simple lyst view
*/

var browserify = require('browserify')
  , path = require('path')
  , http = require('http')
  , fs = require('fs')
  , bundle = new browserify()
  , bundled = 'setTimeout(function () {window.location.reload(true)}, 300)'
  , bundledAt = Date.now()
  , cssData
  , htmlData
  , PORT = 8080

function sendJS (resp) {
  resp.writeHead(200, {
    contentLength: bundled.length
  , contentType: 'application/javascript'
  })
  resp.end(bundled)
}

function _sendCSS (data, resp) {
  resp.writeHead(200, {
    contentLength: data.length
  , contentType: 'text/css'
  })

  resp.end(data)
}

function sendCSS (resp) {
  if(cssData) {
    _sendCSS(cssData, resp)
  }

  fs.readFile(path.join(__dirname, 'styles.css'), function (err, data) {
    if(err) {throw err}
    cssData = data.toString()
    _sendCSS(cssData, resp)
  })
}

function _sendHTML (data, resp) {
  resp.writeHead(200, {
    contentLength: data.length
  , contentType: 'text/html'
  })

  resp.end(data)
}

function sendHTML (resp) {
  if(htmlData) {
    _sendHTML(htmlData, resp)
  }

  fs.readFile(path.join(__dirname, 'demo.html'), function (err, data) {
    if(err) {throw err}
    htmlData = data.toString()
    _sendHTML(htmlData, resp)
  })
}

function sendBundledAt (resp) {
  var payload = JSON.stringify({
    bundledAt: bundledAt
  })

  resp.writeHead(200, {
    contentLength: payload.length
  , contentType: 'application/json'
  })

  resp.end(payload)
}

http.createServer(function (req, resp) {
  if(req.url.indexOf('.js') > -1) {
    sendJS(resp)
  }
  else if(req.url.indexOf('.css') > -1) {
    sendCSS(resp)
  }
  else if(req.url.indexOf('ping') > -1) {
    sendBundledAt(resp)
  }
  else {
    sendHTML(resp)
  }
}).listen(PORT, function () {
  console.log('Demo server listening on port ' + PORT)
})

bundle.add(path.join(__dirname, 'demo.js'))

bundle.bundle(function (err, src) {
  if(err) {
    bundled = 'window.alert("Error bundling: ' + err.toString().replace(/"/,'\'') + '")'
  }
  else {
    bundled = src.toString()
  }
})
