
// TODO: Only load if necessary
require("resources/console-polyfill");
require("resources/es5-shim/es5-shim.js");
require("resources/es5-shim/es5-sham.js");


var Context = exports.Context = function (CONTEXT) {
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
		return Promise.all(instanceDescriptor.deps.map(function (uri) {
			// NOTE: Using 'System.import' will break old browsers
			return System['import'](uri).then(function (api) {
				CONTEXT.DEPS[uri.split("/").slice(1).join("/")] = api;
			});
		}));
	}

	return ensureDependencies().then(function () {

		var layerId = instanceImplementationModule.id.split("/").pop().replace(/\.[^\.]+$/, "");

		CONTEXT.config = ((CONTEXT.config && CONTEXT.config["/" + layerId]) || {});

		if (CONTEXT.VERBOSE) console.info("Init layer '" + layerId + "' with config: " + JSON.stringify(CONTEXT.config, null, 4));

		return new instanceFactory(CONTEXT);
	});
}


exports.loadLayer = function (uri) {

	return System['import'](uri);
}

