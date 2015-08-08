
((function (window) {


	const VERBOSE = true;
	const DEBUG = true;


	System.config({
		transpiler: 'babel',
		babelOptions: {

		},
		packages: {
			'resources/layer': {
				format: 'cjs'
			},

			'components/HelloWorld': {
				main: 'index.js',
				format: 'cjs'
			},

			'resources/console-polyfill': {
				main: 'index.js',
				format: 'global'
			},
			'resources/es5-shim': {
				format: 'global'
			},
			'resources/html5shiv': {
				main: 'html5shiv.js',
				format: 'global'
			},
			'resources/json': {
				main: 'json3.js',
				format: 'global'
			},
			'resources/lodash': {
				main: 'index.js',
				format: 'cjs'
			},
			'resources/jquery': {
				main: 'jquery.js',
				format: 'cjs'
			},
			'resources/bluebird': {
				main: 'bluebird.js',
				format: 'cjs'
			},
			'resources/extend': {
				main: 'index.js',
				format: 'cjs'
			},
			'resources/path': {
				main: 'index.js',
				format: 'cjs'
			},
			'resources/browser-builtins': {
				format: 'cjs'
			},
			'resources/canonical-json': {
				main: 'index.js',
				format: 'cjs'
			},
			'resources/forge': {
				main: 'forge.min.js',
				format: 'amd'
			},
/*
			'resources/jsonwebtoken': {
				main: 'index.js',
				format: 'global'
			},
*/
			'resources/jssha': {
				main: 'sha.js',
				format: 'cjs'
			},
			'resources/moment': {
				main: 'moment.js',
				format: 'cjs'
			},
			'resources/numeral': {
				main: 'numeral.js',
				format: 'cjs'
			},
			'resources/page': {
				main: 'page.js',
				format: 'global'
			},
			'resources/uuid': {
				main: 'uuid.js',
				format: 'amd'
			},
			'resources/react': {
				main: 'react.js',
				format: 'global'
			}
		}
	});


	function load (uri) {
		// NOTE: Using 'System.import' will break old browsers
		return System['import'](uri);
	}

	function loadPolyfills () {
		// TODO: Only load if necessary
		return load("resources/console-polyfill").then(function () {
			return load("resources/es5-shim/es5-shim.js").then(function () {
				
			}).then(function () {
				return load("resources/es5-shim/es5-sham.js");
			}).then(function () {
				return load("resources/html5shiv");
			}).then(function () {
				return load("resources/json");
			});
		});
	}

	function loadDeps () {
		var DEPS = {};

		return load("resources/jquery").then(function (api) {

			DEPS['jquery'] = api;

			return load("resources/extend").then(function (api) {

				DEPS['extend'] = api;

			}).then(function () {

				return load("resources/path").then(function (api) {

					DEPS['path'] = api;

				});				
			}).then(function () {

				return load("resources/bluebird").then(function (api) {

					DEPS['bluebird'] = api;

				});				
			});
		}).then(function () {
			return DEPS;
		});
	}

	const hasConsole = (typeof window.console !== 'undefined');


	loadPolyfills().then(function () {
		return loadDeps();
	}).then(function (DEPS) {


		window.P = function (message) {
			var jquery = (DEPS.jquery || $);
			if (!jquery) return;
			jquery(function () {
				jquery("BODY").append('<p>' + message + '</p>');
			});
		}


		var Context = function (CONTEXT) {
			CONTEXT.API.Extend(false, this, CONTEXT);
		};
		Context.prototype.wrap = function (instanceImplementationModule, instanceDescriptor, instanceFactory) {
			var CONTEXT = this;

			return CONTEXT.API.Promise.resolve().then(function () {

				CONTEXT = Object.create(CONTEXT);
				CONTEXT.API = Object.create(CONTEXT.API);

				function ensureDependencies() {
					if (!instanceDescriptor.deps) return CONTEXT.API.Promise.resolve();
					return CONTEXT.API.Promise.all(instanceDescriptor.deps.map(function (uri) {

console.log("uri", uri);

						return load(uri).then(function (api) {
							CONTEXT.DEPS[uri.split("/").slice(1).join("/")] = api;
						});
					}));
				}

				return ensureDependencies().then(function () {

					var layerId = CONTEXT.API.Path.basename(
						instanceImplementationModule.id
					).replace(/\.[^\.]+$/, "");

					CONTEXT.config = (CONTEXT.config["/" + layerId] || {});

					if (CONTEXT.VERBOSE) console.info("Init layer '" + layerId + "' with config: " + JSON.stringify(CONTEXT.config, null, 4));

					return new instanceFactory(CONTEXT);
				});
			});
		}

		DEPS['bluebird'].attempt(function () {

			return load('resources/layer/02-Libraries.js').then(function (api) {

				return api['for'](new Context({

					VERBOSE: VERBOSE,
					DEBUG: DEBUG,

					DEPS: DEPS,

					API: {
						'Path': DEPS['path'],
						'Extend': DEPS['extend'],
						'Promise': DEPS['bluebird']
					},

					config: {
						"/02-Libraries": {
							foo: "bar 1"
						}
					}

				}));
			}).then(function (libraries) {

				return load('resources/layer/03-Components.js').then(function (api) {

					return api['for'](new Context({

						VERBOSE: VERBOSE,
						DEBUG: DEBUG,

						DEPS: DEPS,

						API: {
							'Path': DEPS['path'],
							'Extend': DEPS['extend'],
							'Promise': DEPS['bluebird']
						},

						config: {
							"/03-Components": {
								foo: "bar 2"
							}
						}

					}));
				}).then(function (components) {

P("DONE!");

				});
			});

		}).caught(function (err) {
			if (hasConsole) {
				console.error("Got Systems ERROR:", (err.stack || err));
			} else {
				window.P("Got Systems ERROR: " + (err.stack || err));
			}
		});

	});

})(window));

