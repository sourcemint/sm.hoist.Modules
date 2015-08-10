
// TODO: Only load if necessary
require("resources/console-polyfill");
require("resources/es5-shim/es5-shim.js");
require("resources/es5-shim/es5-sham.js");


var Context = function (CONTEXT) {
	for (var name in CONTEXT) {
		this[name] = CONTEXT[name];
	}
};
Context.prototype.wrap = function (instanceImplementationModule, instanceDescriptor, instanceFactory) {
	var CONTEXT = this;

	CONTEXT = Object.create(CONTEXT);
	CONTEXT.API = Object.create(CONTEXT.API || {});
	CONTEXT.DEPS = CONTEXT.DEPS || {};

	CONTEXT.API.JSON = CONTEXT.API.JSON || require("resources/json");

	function ensureDependencies() {
		if (!instanceDescriptor.deps) return Promise.resolve();
		Object.keys(instanceDescriptor.deps).forEach(function (alias) {
			CONTEXT.DEPS[alias] = instanceDescriptor.deps[alias];
		});
		return Promise.resolve();
	}

	return ensureDependencies().then(function () {

		var layerId = instanceImplementationModule.id.split("/").pop().replace(/\.[^\.]+$/, "");

		CONTEXT.config = ((CONTEXT.config && CONTEXT.config["/" + layerId]) || {});

		if (CONTEXT.VERBOSE) console.info("Init layer '" + layerId + "' with config: " + JSON.stringify(CONTEXT.config, null, 4));

		return new instanceFactory(CONTEXT);
	});
}
Context.prototype.clone = function () {
	return (new Context({
		VERBOSE: this.VERBOSE,
		DEBUG: this.DEBUG,
		DEPS: this.DEPS,
		API: this.API,
		config: this.config
	}));
}


module.exports = function (context) {
	var CONTEXT = new Context(context);
	return CONTEXT.wrap(module, {}, function (CONTEXT) {

		CONTEXT.loadLayer = function (uri) {

			return System['import'](uri);
		}

		CONTEXT.loadLayers = function (uris) {

			var prevPromise = Promise.resolve();

			var ctx = this;
			uris.forEach(function (uri) {
				prevPromise = prevPromise.then(function() {

					return CONTEXT.loadLayer(uri).then(function (factory) {

						return factory(ctx.clone());

					}).then(function (_ctx) {

						ctx = _ctx;
					});
				})['catch'](function (err) {
					console.error("Error loading layer '" + uri + "':", err.stack || err.message);
					throw err;
				});
			});

			return prevPromise.then(function () {

			});
		}

		return CONTEXT;
	});
}

