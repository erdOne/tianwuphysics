// changeable
//
var db = require("./mysql.js");
var fs = require("fs");
var formidable = require('formidable')
var util = require('util');
const path = require('path');

var {
    createHash
} = require("crypto");

var sha256 = msg => createHash("sha256").update(msg).digest("hex");

const admin_auth = '93950cd7c6545b5cdb79812df9445c3aaae19d89cea49fd33a5c11c7f9597928';

async function formProcessor(req, res) {
    var form = new formidable.IncomingForm()
    form.multiples = false;
    form.maxFieldsSize = 200 * 1024 * 1024 * 1024;
    form.maxFileSize = 200 * 1024 * 1024 * 1024;
    //form.uploadDir = process.cwd()+"/htdocs/assets/upload";
    var msg = {};
    form.parse(req, async (err, fields, files) => {
        try {
            if (err) throw err;
            console.log(files);
            if (sha256(fields.admin) != admin_auth) throw "你不該來的喔肥弟";
            if (path.extname(files.file.path)){
                fs.unlink(files.file.path, err => console.log(err));
                throw "請上傳pdf";
            }
            msg.contestLink = `/assets/upload/${path.basename(files.file.path)}.pdf`;
            fs.copyFile(files.file.path, "./htdocs"+msg.contestLink, err => {
                if (err) console.log(err)
                fs.unlink(files.file.path, err => console.log(err));
            });
        } catch (error) {
            console.log("Got error: " + error);
            msg.result = error;
        }

        function getByteLen(normal_val) {
            // Force string type
            normal_val = String(normal_val);

            var byteLen = 0;
            for (var i = 0; i < normal_val.length; i++) {
                var c = normal_val.charCodeAt(i);
                byteLen += c < (1 << 7) ? 1 :
                    c < (1 << 11) ? 2 :
                    c < (1 << 16) ? 3 :
                    c < (1 << 21) ? 4 :
                    c < (1 << 26) ? 5 :
                    c < (1 << 31) ? 6 : Number.NaN;
            }
            return byteLen;
        }
        msg = JSON.stringify(msg);
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Content-Length": getByteLen(msg)
        });
        res.write(msg);
        console.log("message sent with data" + msg);
        res.end()
    })
}
exports.formProcessor = formProcessor;
