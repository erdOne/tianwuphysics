var {
    exec,
    spawn
} = require("child_process");
["index.js", "htdocs/**/*", 'src/**/*', "node/*", '!htdocs/images/**/*'].map(
    path => exec(`watchman-wait -m 0 . -p '${path}'`, {
        encoding: "utf-8"
    }).stdout.on("data", file => {
        if (file == "logs.txt") return;
        console.log(file.replace("\n", ""))
        var s = spawn("./sync.sh", [file.replace("\n", "")]);
        s.stdout.pipe(process.stdout);
        s.stderr.pipe(process.stderr);
    })
);
