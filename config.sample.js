exports.db = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "physics"
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
  privateKey: fs.readFileSync('priv_key')
}
