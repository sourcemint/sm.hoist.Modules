
module.exports = function (CONTEXT) {

	return CONTEXT.wrap(module, {
		'deps': {

			// TODO: Only load if necessary
			"html5shiv": require("resources/html5shiv"),

			"jquery": require("resources/jquery"),
			"bluebird": require("resources/bluebird"),
			"path": require("resources/path"),
			"lodash": require("resources/lodash"),
		    "canonical-json": require("resources/canonical-json"),
			"forge": require("resources/forge"),
		    "moment": require("resources/moment"),
		    "numeral": require("resources/numeral"),
		    "page": require("resources/page"),
		    "uuid": require("resources/uuid"),
		    "react": require("resources/react")
		}
	}, Factory);
}

function Factory (CONTEXT) {

	const DEPS = CONTEXT.DEPS;
	const CONFIG = CONTEXT.config;


	CONTEXT.API.Promise = CONTEXT.DEPS['bluebird'];
	CONTEXT.API.Path = CONTEXT.DEPS['path'];


	window.P = function (message) {
		var jquery = (DEPS.jquery || $);
		if (!jquery) return;
		jquery(function () {
			jquery("BODY").append('<p>' + message + '</p>');
		});
	}


	return CONTEXT;
}
