
// NOTE: This is not working and needs to be re-worked.


const DEPS = {
	path: require("path"),
	fs: require("fs"),
	qfs: require("q-io/fs"),
	Builder: require('systemjs-builder'),
	System: require('systemjs-builder/node_modules/systemjs'),
	Server: require('../server/01-System')
};


var distPath = DEPS.path.join(__dirname, 'dist');

if (!DEPS.fs.existsSync(distPath)) {
	DEPS.fs.mkdirSync(distPath);
}


function bundle () {

	return DEPS.Server.run("start").then(function (server) {

		var config = require(
			DEPS.path.join(__dirname, '../client/package.json')
		).config["github.com~systemjs/0/System.config"];


		var Loader = function () {
		}
		Loader.prototype = Object.create(DEPS.System);

		Loader.prototype.fetch = function (load) {
			var self = this;

			var uri = load.address.substring(DEPS.path.join(__dirname).length + 2);

console.log("uri", uri);

//console.log("server", server);

			return server.get(uri).then(function (body) {

//console.log("BODY", body);

				return body;
			}, function (err) {

				return DEPS.System.fetch.call(self, load);
			});


/*

			var request = DEPS.NodeMocksHTTP.createRequest({
		        method: 'GET',
		        url: uri
		    });

		    var response = DEPS.NodeMocksHTTP.createResponse();

		    app(request, response);

console.log("response", response);

//response._getData()
*/

/*
			for (var id in config.packages) {
				if (uri.substring(0, id.length) === id) {
					load.address = "file://" + DEPS.path.join(
						__dirname,
						config.packages[id].fsPath,
						uri.substring(id.length)
					);
					break;
				}
			}

			return DEPS.System.fetch.call(this, load);
*/
		}


		// @see https://github.com/systemjs/builder#self-executing-sfx-bundles
		var builder = new DEPS.Builder({
			baseURL: '',

			transpiler: 'babel'

		//	map: map
		});

		builder.reset(new Loader());


		var builderConfig = JSON.parse(JSON.stringify(config));
		for (var uri in builderConfig.packages) {
			delete builderConfig.packages[uri].fsPath;
		}
		builder.config(builderConfig);

		/*
		builder.trace('build').then(function (tree) {


		console.log("tree", tree);


		}).catch(function (err) {

			console.error('Build error');
			console.error(err.stack || err.message || err);
		});
		*/


		// TODO: Get this working.
		//	return builder.buildSFX(

		return builder.build(
			'build',
			DEPS.path.join(distPath, 'all.js'),
			{
				sfxFormat: 'cjs',
				runtime: false,
				minify: false,
				mangle: false
			}
		)
		.then(function () {

			console.log('Build complete');
		});
	}).catch(function (err) {

		console.error('Build error');
		console.error(err.stack || err.message || err);
		throw err;
	});
}

function copySystem () {
	return DEPS.qfs.copy(
		DEPS.path.join(__dirname, "../server/node_modules/systemjs/dist/system.src.js"),
		DEPS.path.join(distPath, "system.src.js")
	);
}

/*
function generateHtml () {
	var html = [];
	html.push('<!DOCTYPE HTML>');
	html.push('<html>');
	html.push('  <head>');
	html.push('  </head>');
	html.push('  <body>');
	html.push('  </body>');
	html.push('  <script src="system.src.js" type="text/javascript"></script>');
	html.push('  <script>');
	html.push('    System.import("all.js")');
	html.push('  </script>');
	html.push('</html>');
	return html.join("\n");
}
*/

bundle().then(function () {

	return copySystem().then(function () {

//		var htmlPath = DEPS.path.join(distPath, "index.html");
//		return DEPS.qfs.write(htmlPath, generateHtml());

	});

}).catch(function (err) {
	console.error("ERROR:", err.stack || err.message || err);
});

