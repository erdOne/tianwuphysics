// ./index.js
var { router } = require('./node/router.js');
var { createServer } = require('./node/server.js');
var { postProcessor } = require('./node/ajax.js');
var { formProcessor } = require('./node/form.js');
var { createWSServer } = require('./node/websocket.js');

var Server = createServer(router, postProcessor, formProcessor);

createWSServer(Server);

process.on("end",()=>Server.close());
