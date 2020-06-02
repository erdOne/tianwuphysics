// ./node/ajax
var db = require("./mysql.js");
var mail = require("./mail.js");
var { createHash } = require("crypto");

var sha256 = msg => createHash("sha256").update(msg).digest("hex");

const admin_auth = '93950cd7c6545b5cdb79812df9445c3aaae19d89cea49fd33a5c11c7f9597928';

var toMysqlDateTime = str => new Date(new Date(str) - (new Date()).getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace("T", " ");

var successMail = (name) =>
`
${name}您好：
    感謝您報名本競賽，期待您在初賽的表現！捯捯捯！

天物盃籌備團隊 敬上
`

var cancelMail = (name) =>
`
${name}您好：
    您已取消報名本競賽，若為誤按或欲更改資料，請至「立即報名」重新報名，謝謝。期待您在物理界的表現！捯捯捯！

天物盃籌備團隊 敬上
`

async function postProcessor(data, cookie, send){
    console.log(data, typeof data);
    console.log(`Recieved post data: ${JSON.stringify(data)}`);
    var msg = { request: data.request };
    var header = {"Content-Type":"application/json"};
    try {
        switch(data.request){
            case "register":
                var dataobj = JSON.parse(data.data);
                data.auth = sha256(data.auth+"paulwudaodao")
                var result = await db.query(`SELECT * FROM users WHERE email = '${dataobj.email}';`);
                if(result && result[0]) throw "您的電子郵件已報名過了";
                await db.query(`INSERT INTO users (email, auth, name, data)
                    VALUES ('${dataobj.email}', '${data.auth}', '${dataobj.name}',' ${data.data}');`);
                mail.sendMail(dataobj.email, "天物盃成功報名確認信",successMail(dataobj.name));
                break;
            case "cancel":
                var result = await db.query(`SELECT * FROM users WHERE email = '${data.email}';`);
                data.auth = sha256(data.auth+"paulwudaodao");
                if(!result || !result[0]) throw "您尚未註冊";
                if(result[0].auth != data.auth) throw "您的密碼錯誤";
                await db.query(`DELETE FROM users WHERE auth = '${data.auth}';`);
                mail.sendMail(data.email, "天物盃取消報名確認信",cancelMail(result[0].name));
                break;
            case "login":
                var result = await db.query(`SELECT * FROM users WHERE email = '${data.email}';`);
                if(!result || !result[0]) throw "no such user";
                if(result[0].auth != sha256(data.auth+"paulwudaodao")) throw "wrong password";
                break;
            case "submit":
                var result = await db.query(`SELECT * FROM users WHERE auth = '${cookie.auth}';`);
                if(!result || !result[0]) throw "no such user";
                await db.query(`UPDATE ${data.contestName} SET ${data.pid}='${data.answer}' WHERE auth = '${cookie.auth}';`);
                break;
            case "submit all":
                var result = await db.query(`SELECT * FROM users WHERE auth = '${cookie.auth}';`);
                if(!result || !result[0]) throw "no such user";
                for(var i in data.answers)
                await db.query(`UPDATE answers SET ${i}='${data.answers[i]}' WHERE auth = '${cookie.auth}';`);
                break;
            case "fetch data":
                if(sha256(data.admin) != admin_auth)throw "你不該來的喔肥弟";
                var result = await db.query(`SELECT * FROM users WHERE no > 0`);
                msg.result = JSON.stringify(result);
                break;
            case "fetch data":
                if(sha256(data.admin) != admin_auth)throw "你不該來的喔肥弟";
                var result = await db.query(`SELECT * FROM ${data.contestId}`);
                msg.result = JSON.stringify(result);
                break;
            case "fetch contests":
                if(sha256(data.admin) != admin_auth)throw "你不該來的喔肥弟";
                var result = await db.query(`SELECT * FROM contests`);
                msg.result = JSON.stringify(result);
                break;
            case "admin login":
                if(sha256(data.admin) != admin_auth)throw "你不該來的喔肥弟";
                console.log("admin login");
                data.status = "success";
                break;
            case "get contest":
                var admin = false;
                if(data.admin){
                    if(sha256(data.admin) != admin_auth)throw "你不該來的喔肥弟";
                    admin = true;
                }else{
                    var user = await db.query(`SELECT * FROM users WHERE auth = '${sha256(data.auth+"paulwudaodao")}'`);
                    if(user && user[0])
                        msg.user = JSON.parse(user[0].data);
                }
                var result = await db.query(`SELECT * FROM contests WHERE name = '${data.name}'`);
                if(!result || !result[0]) throw "no such contest";
                msg.status="fetched";
                if(new Date() < new Date(result[0].startTime)){
                    msg.status="not yet";
                    if(!admin){
                        msg.contest = {
                            startTime: result[0].startTime,
                            contestTitle: result[0].contestTitle
                        }
                        break;
                    }
                }
                if(new Date() > new Date(result[0].endTime))
                    msg.status="ended";
                if(msg.status=="fetched" && !msg.user && !admin)
                    msg.status = "not logged in";
                msg.contest = result[0]
                break;
            case "add contest":
                if(sha256(data.admin) != admin_auth)throw "你不該來的喔肥弟";
                var range = (start, end)=>new Array(end-start+1).fill(start).map((a,b)=>a+b);
                var result = await db.query(`SELECT * FROM contests WHERE name = '${data.contestName}'`);
                if(result && result[0]){
                    data.numOfProbs-=0;
                    db.query(`UPDATE contests SET
                        startTime='${toMysqlDateTime(data.startTime)}',
                        endTime='${toMysqlDateTime(data.endTime)}',
                        numOfProbs=${data.numOfProbs},
                        contestLink='${data.contestLink}',
                        contestTitle='${data.contestTitle}'
                        WHERE name = '${data.contestName}'`);
                    if(result[0].numOfProbs < data.numOfProbs){
                        db.query(`ALTER TABLE \`${data.contestName}\` ${
                            range(result[0].numOfProbs+1, data.numOfProbs)
                            .map(i=>"ADD COLUMN `"+i+"` VARCHAR(100)")
                            .join(",\n")
                        };`);
                    }
                    if(result[0].numOfProbs > data.numOfProbs){
                        db.query(`ALTER TABLE \`${data.contestName}\` ${
                            range(data.numOfProbs+1, result[0].numOfProbs)
                            .map(i=>"DROP COLUMN `"+i+"`")
                            .join(",\n")
                        };`);
                    }
                }else{
                    db.query(`INSERT INTO contests(name, title, startTime, endTime, numOfProbs, contestLink)
                    VALUES ('${data.contestName}','${data.contestTitle}','${toMysqlDateTime(data.startTime)}','${toMysqlDateTime(data.endTime)}','${data.numOfProbs}','${data.contestLink}');`);
                    db.query(`CREATE TABLE \`${data.contestName}\` (
                        \`auth\` VARCHAR(100) NOT NULL UNIQUE,
                        \`name\` VARCHAR(100) NOT NULL,
                        \`email\` VARCHAR(100) NOT NULL,
                    ${
                        range(1, data.numOfProbs)
                        .map(i=>"`"+i+"` VARCHAR(100)")
                        .join(",\n")
                    },
                    PRIMARY KEY(\`auth\`));`);
                }
                msg.status="success";

        }
    } catch (err) {
        console.log(`An error occurred: ${err}`);
        msg.error = err;
    }
    send(200, JSON.stringify(msg), header);
}

exports.postProcessor = postProcessor;
