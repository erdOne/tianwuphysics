// ./node/server.js
var http = require("http");
var url = require('url');
var qs = require('querystring');
var Readable = require('stream').Readable;
getByteLen = val => Buffer.byteLength(String(val), 'utf8');

function parseCookies(raw_cookies) {
    var list = {};

    raw_cookies && raw_cookies.split(';').forEach(function(cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}


function createServer(route, processPost, processForm) {
    function processor(request, response) {
        function sender(status, msg, header = {}) {
            response.writeHead(status, {
                //"Content-Length": getByteLen(msg),
                ...header
            });
            var ss = new Readable;
            ss.push(msg);
            ss.push(null);
            ss.pipe(response);
            //response.end();
        }

        var path = url.parse(request.url, true);
        if (path.pathname == "/ajax") {
            var data = ""
            request.on("data", chunk => data += chunk);
            request.on("end", () => processPost(qs.parse(data), parseCookies(request.headers.cookie), sender));
        } else if (path.pathname == "/form") {
            processForm(request, response);
        } else {
            console.log(`Request for ${path.pathname} recieved.`);
            var path = path.pathname;
            if (path == "/") path = "/index.html";
            if(path.indexOf(".") == -1)path+=".html";
            route(path, sender);
        }
        //request.end();
    }

    var Server = http.createServer(processor);
    Server.listen(80);

    return Server;
}

exports.createServer = createServer;
