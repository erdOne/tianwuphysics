var fs = require("fs");

exports.db = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "tianwuphysics"
}

exports.ftp = {
  host: "tianwuphysics.com",
  port: 21,
  user: "root",
  password: "root",
}

exports.ssh = {
  host: "tianwuphysics.com",
  port: 22,
  username: 'root',
 // privateKey: fs.readFileSync('priv_key')
}

exports.mail = {
  name: "tianwuphysics@gmail.com",
  auth: "root"
}
