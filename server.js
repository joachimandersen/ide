var restify = require('restify'),
    fs = require('fs'),
    xml2js = require('xml2js');

var path = 'D:/git/bestpractice.cookie/source/cookie/cookie.csproj';


var server = restify.createServer({
    name: 'IDE',
});

server.listen(8080);

/*server.get('/load/:name', function(req, res, next) {
    fs.readFile(path, function(err, data) {
        var parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            res.send(200, result);
        });
    });
    next();
});*/

server.get('/load/:path', function(req, res, next) {
    walk('D:/git/bestpractice.cookie/source', function(err, files) {
        if (!err) {
            var structure = [];
            for (var i = 0; i < files.length; i++) {
                if ()
                var rest = files[i].substring(0, files[i].lastIndexOf("/") + 1);
                var last = files[i].substring(files[i].lastIndexOf("/") + 1, files[i].length);
                console.log(rest, last);
            };
            res.send(200, files);
        }
        else {
            res.send(500, { message: 'Unable to read files in directory' });
        }
    });
    next();
});

server.get(/\/?.*/, restify.serveStatic({
    directory: './public/',
    default: 'index.html'
}));

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                }
                else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};