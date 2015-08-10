
exports['for'] = function (CONTEXT) {

	return CONTEXT.wrap(module, {
		'deps': [

			// TODO: Only load if necessary
			"resources/html5shiv",

			"resources/jquery",
			"resources/bluebird",
			"resources/path",
			"resources/lodash",
		    "resources/canonical-json",
			"resources/forge",
		    "resources/moment",
		    "resources/numeral",
		    "resources/page",
		    "resources/uuid",
		    "resources/react"
		]
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
