
exports.for = function (CONTEXT) {
	return CONTEXT.wrap(module, {
		'deps': [
			'http',
			'express',
			'send',
			'body-parser',
			'compression',
			'morgan',
			'defs',
			'browserify',
			'babel',
			'escape-regexp-component',
			'request'
		]
	}, Factory);
}

function Factory (CONTEXT) {

	const DEPS = CONTEXT.DEPS;
	const CONFIG = CONTEXT.config;


	var app = DEPS.express();

	app.use(DEPS.morgan("combined", {
		skip: function (req, res) {
			if (CONTEXT.DEBUG) return false;
			return (res.statusCode < 400);
		}
	}));
	app.use(DEPS.compression());
	app.use(DEPS['body-parser'].urlencoded({
		extended: true
	}));
	app.use(DEPS['body-parser'].json({
		type: [
			'application/json',
			'application/vnd.api+json'
		]
	}));

	app.use(function (req, res, next) {

		var origin = null;
        if (req.headers.origin) {
            origin = req.headers.origin;
        } else
        if (req.headers.host) {
            origin = [
                (CONFIG.port === 443) ? "https" : "http",
                "://",
                req.headers.host
            ].join("");
        }
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie");
        if (req.method === "OPTIONS") {
            return res.end();
        }

        return next();
	});



// TODO: Move into routing layer.

	const CLIENT_PACKAGES = {

		"console-polyfill": "runtime/node_modules/console-polyfill",
		"es5-shim": "runtime/node_modules/es5-shim",
		"html5shiv": "client/01-Libraries/node_modules/html5shiv/dist",
		"json": "runtime/node_modules/json3/lib",
		"jquery": "client/01-Libraries/node_modules/jquery/dist",
		"bluebird": "server/node_modules/bluebird/js/browser",
		"extend": "server/node_modules/extend",
		"path": "client/01-Libraries/node_modules/path-browserify",

		"build": "build",
		"runtime": "runtime",
		"layer": "client",

		"browser-builtins": "client/01-Libraries/node_modules/browser-builtins/builtin",
		"lodash": "client/01-Libraries/node_modules/lodash-compat",
		"canonical-json": "client/01-Libraries/node_modules/canonical-json",
		"forge": "server/node_modules/node-forge/js",
		"moment": "client/01-Libraries/node_modules/moment",
		"numeral": "client/01-Libraries/node_modules/numeral",
		"page": "client/01-Libraries/node_modules/page",
		"uuid": "client/01-Libraries/node_modules/uuid",
		"react": "client/01-Libraries/node_modules/react/dist"
	};

	const CONVERT_DEFS = {

	};


	function replaceVars (data, path) {

		// Replace '{{config:*}}' variables.
		// e.g. '{{config:github.com~systemjs/0/System.config}}'
        var re = /\{\{config:([^\}]+)\}\}/g;
        var m = null;
        while (m = re.exec(data)) {
        	if (typeof CONFIG[m[1]] === "undefined") {
        		throw new Error("Config variable '" + m[1] + "' used in '" + path + "' not declared!");
        	}
        	data = data.replace(
        		new RegExp(DEPS['escape-regexp-component'](m[0]), 'g'),
        		JSON.stringify(CONFIG[m[1]], null, 4)
        	);
        }

		return data;
	}

	function transformJS (data, path) {

		data = DEPS.defs(data, {
			"environments": [
				"browser"
			],
			"loopClosures": "iife",
			"disallowVars": false,
			"disallowDuplicated": false,
			"disallowUnknownReferences": false			
		});

		return data.src;
	}

	function storeInDistribution (uri, data) {
		var distPath = DEPS.path.join(__dirname, "../build/dist", uri);
		if (!DEPS.fs.existsSync(DEPS.path.dirname(distPath))) {
			DEPS.fs.mkdirsSync(DEPS.path.dirname(distPath));
		}
		DEPS.fs.outputFileSync(distPath, data, "utf8");
	}

	function serveStaticFile (uri, fullPath, res, next, options) {
		// TODO: Use async.
		if (!DEPS.fs.existsSync(fullPath)) {
			return next();
		}

		options = options || {};

		function load (callback) {
			if (/\.jsx$/.test(fullPath)) {
				return DEPS.babel.transformFile(fullPath, {

				}, function (err, result) {
					if (err) return callback(err);
					return callback(null, result.code);
				});
			}
			return DEPS.fs.readFile(fullPath, "utf8", callback);
		}

		return load(function (err, data) {
			if (err) return next(err);

			data = replaceVars(data, fullPath);

			if (
				/\.js$/.test(fullPath) ||
				/\.jsx$/.test(fullPath)
			) {

				if (options.nodefs !== true) {
					data = transformJS(data, fullPath);
				}

				res.writeHead(200, {
					"Content-Type": "application/javascript"
				});
			} else
			if (/\.html?$/.test(fullPath)) {
				res.writeHead(200, {
					"Content-Type": "text/html"
				});
			}

			storeInDistribution (uri, data);

			return res.end(data);
		});
	}


	// TODO: Remove '(?:\/)?' prefix once https://github.com/systemjs/systemjs is fixed for IE 8
	app.get(/^(?:\/)?\/resources\/(.+)$/, function (req, res, next) {

		var moduleUri = req.params[0];
		var modulePackage = moduleUri.split("/").shift();
		moduleUri = moduleUri.split("/").splice(1).join("/");

		var packageBasePath = CLIENT_PACKAGES[modulePackage];
		if (!packageBasePath) return next(new Error("Package '" + modulePackage + "' not declared!"));

		var path = moduleUri;
		if (CONTEXT.VERBOSE) console.log(("Loading module '" + moduleUri + "' for package '" + modulePackage + "' from '" + packageBasePath + "'").data);

		if (
			modulePackage === "layer" &&
			/\.js$/.test(path)
		) {
			return serveStaticFile(
				"resources/" + req.params[0],
				DEPS.path.join(__dirname, "../", packageBasePath, path),
				res,
				next
			);
		} else
		if (
			modulePackage === "uuid"
		) {
			var fullPath = DEPS.path.join(__dirname, "../", packageBasePath, path);
			var browserify = DEPS.browserify({
				basedir: DEPS.path.dirname(fullPath),
				standalone: modulePackage
			});
			browserify.add("./" + DEPS.path.basename(fullPath));
			return browserify.bundle(function (err, data) {
				if (err) return next(err);

				data = transformJS(data.toString(), fullPath);

				storeInDistribution ("resources/" + req.params[0], data);

				res.writeHead(200, {
					"Content-Type": "application/javascript"
				});
				return res.end(data);
			});
		}

		return serveStaticFile(
			"resources/" + req.params[0],
			DEPS.path.join(__dirname, "..", packageBasePath, path),
			res,
			next,
			{
				nodefs: true
			}
		);
/*
		return DEPS.send(req, path, {
			// TODO: We should be able to resolve this nicely via `CONTEXT`.
			root: DEPS.path.join(__dirname, "..", packageBasePath)
		}).on("error", next).pipe(res);
*/
	});

	app.get(/^(?:\/)?\/components\/(.+)$/, function (req, res, next) {

		var moduleUri = req.params[0];
		var modulePackage = moduleUri.split("/").shift();
		moduleUri = moduleUri.split("/").splice(1).join("/");

		var packageBasePath = "client/02-Components";

		var path = moduleUri;
		if (CONTEXT.VERBOSE) console.log(("Loading module '" + moduleUri + "' for package '" + modulePackage + "' from '" + packageBasePath + "'").data);

		if (
			/\.js$/.test(path) ||
			/\.jsx$/.test(path)
		) {
			return serveStaticFile(
				"components/" + req.params[0],
				DEPS.path.join(__dirname, "../", packageBasePath, modulePackage, path),
				res,
				next
			);
		}

		return DEPS.send(req, path, {
			// TODO: We should be able to resolve this nicely via `CONTEXT`.
			root: DEPS.path.join(__dirname, "..", packageBasePath)
		}).on("error", next).pipe(res);
	});

	app.get(/^(?:\/)?\/runtime\/(.+)$/, function (req, res, next) {
		return serveStaticFile(
			"runtime/" + req.params[0],
			DEPS.path.join(__dirname, "../", "runtime", req.params[0]),
			res,
			next
		);
	});

	app.get(/^(?:\/)?\/build\/(.*)$/, function (req, res, next) {
		var path = req.params[0] || "index.html";
		return DEPS.send(req, path, {
			root: DEPS.path.join(__dirname, "../build/dist")
		}).on("error", next).pipe(res);
	});

	app.get(/^\/(system\.js|system\.src\.js|system-polyfills\.js)$/, function (req, res, next) {
		var path = req.params[0];
		return DEPS.send(req, path, {
			// TODO: We should be able to resolve this nicely via `CONTEXT`.
			root: DEPS.path.join(__dirname, "node_modules/systemjs/dist")
		}).on("error", next).pipe(res);
	});

	app.get(/^\/(.*)$/, function (req, res, next) {
		var path = req.params[0] || "index.html";

		if (
			/\.js$/.test(path) ||
			/\.html?$/.test(path)
		) {
			return serveStaticFile(
				path,
				DEPS.path.join(__dirname, "../client", path),
				res,
				next
			);
		}

		return DEPS.send(req, path, {
			root: DEPS.path.join(__dirname, "../client")
		}).on("error", next).pipe(res);
	});



	return {
		start: function () {

			var server = DEPS.http.createServer(app);

			if (CONFIG.bind) {
				server.listen(parseInt(CONFIG.port), CONFIG.bind);
			} else {
				server.listen(parseInt(CONFIG.port));
			}

			var baseUrl = "http://" + CONFIG.bind + ":" + CONFIG.port;

			console.log("Server listening at: " + baseUrl);


			DEPS.qfs.copy(
				DEPS.path.join(__dirname, "../server/node_modules/systemjs/dist/system.src.js"),
				DEPS.path.join(__dirname, "../build/dist", "system.src.js")
			);

			DEPS.qfs.copy(
				DEPS.path.join(__dirname, "../server/node_modules/systemjs/dist/system-polyfills.js"),
				DEPS.path.join(__dirname, "../build/dist", "system-polyfills.js")
			);

			return {
				get: function (uri) {

					var url = baseUrl + "/" + uri;

					return new CONTEXT.DEPS.bluebird.Promise(function (resolve, reject) {

						return DEPS.request(url, function (err, res, body) {
							if (err) return reject(err);
							if (res.statusCode !== 200) return reject(new Error("Got status '" + res.statusCode + "' while calling url '" + url + "'"));
							return resolve(body);
						});
					});
				}
			}
		}
	}
}
