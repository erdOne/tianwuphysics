// /node/websocket.js
var WebSocketServer = require("websocket").server;
var WebSocketProcessor = require("./wsprocessor.js");
var db = require("./mysql.js");
var conns = {};
var { createHash } = require("crypto");

var sha256 = msg => createHash("sha256").update(msg).digest("hex");

function send (msg, conn, exclude) {
    console.log("send", conn, exclude);
    if(typeof conn == "string"){
        for(var i in conns[conn]) if(i != exclude) send(msg, {auth: conn, no: i});
    }else if(conns[conn.auth] && conns[conn.auth][conn.no] && conns[conn.auth][conn.no].connected){
        console.log(`Message sent to ${JSON.stringify(conn)}`);
        conns[conn.auth][conn.no].send(JSON.stringify(msg));
    }else{
        console.log("no", conn, conns[conn.auth])
    }
}

function onMessage (msg) {
    console.log(`Websocket message recieved from ${this.data.name}: ${msg.utf8Data}`);
    WebSocketProcessor.onMessage(JSON.parse(msg.utf8Data), this.data, send);
}

function onClose (reason, description) {
    console.log(`Websocket number ${this.data.no} disconnected with reason: ${reason}.`);
    WebSocketProcessor.onClose(this.data, send, ()=>{
        delete conns[this.data.auth][this.data.no];
        if(!conns[this.data.auth])delete conns[this.data.auth];
    });
}

async function onRequest (request) {
    console.log("Requested");
    var auth = sha256(request.resourceURL.query.auth+"paulwudaodao");
    var result = await db.query(`SELECT * FROM users WHERE auth='${auth}';`);
    if(!result || !result[0])return request.reject();
    var conn = request.accept(null, request.origin);
    var no;
    do no = Math.round(Math.random() * 8999 + 1000);
    while (conns[no] != undefined);
    conn.data = { ...result[0], ...request.resourceURL.query, no, auth};
    console.log(conn.data);
    if(!conns[conn.data.auth])conns[conn.data.auth] = [];
    conns[conn.data.auth][no] = conn;
    conn.on("close", onClose);
    conn.on("message", onMessage);

    WebSocketProcessor.onRequest(conn.data, send);

    console.log(`Websocket from ${conn.data.name} accepted with number ${no}.`);
}

function createWSServer (Server) {
    var WSServer = new WebSocketServer({
        httpServer: Server,
        autoAcceptConnections: false
    });

    WSServer.on("request", onRequest);
}

exports.createWSServer = createWSServer;
