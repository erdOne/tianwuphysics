// /node/wsprocesser.js
var db = require("./mysql.js");

async function onMessage(msg, data, send) {
    try {
        switch (msg.request) {
            case "submit":
                var ansObj = {
                    answer: msg.answer,
                    user: data.name
                }
                await db.query(`UPDATE \`${data.contest}\` SET \`${msg.no}\`='${JSON.stringify(ansObj)}' WHERE auth = '${data.auth}';`);
                msg.answer = ansObj;
                send(msg, data.auth);
                break;
            case "blur":
                msg.user = data.name;
                send(msg, data.auth, data.no);
                break;
            case "focus":
                msg.user = data.name;
                send(msg, data.auth, data.no);
                break;
            case "message":
                send({
                    request: "message",
                    username: data.name,
                    timestamp: new Date(),
                    content: msg.content
                }, data.auth);
                break;
        }
    } catch (err) {
        console.log(`An error occurred: ${err}`);
    }
}

function onClose(user, send, callback) {
    callback();
}

async function onRequest(data, send) {
    var answers = await db.query(`SELECT * FROM \`${data.contest}\` WHERE auth = '${data.auth}';`);
    if(!answers || !answers[0])
        db.query(`INSERT INTO \`${data.contest}\`(auth, name, email) VALUES('${data.auth}','${data.name}','${data.email}')`);
    else send({
        request: "answers",
        answers: answers[0]
    }, data);
}

exports.onMessage = onMessage;
exports.onClose = onClose;
exports.onRequest = onRequest;
