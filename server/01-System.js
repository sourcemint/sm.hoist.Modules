
const VERBOSE = true;
const DEBUG = true;


const COLORS = require('colors');

COLORS.setTheme({
	silly: 'rainbow',
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

process.env.BLUEBIRD_DEBUG = "1";


const DEPS = {
	'stream': require('stream'),
	'path': require('path'),
	'fs': require('fs'),
	'extend': require('extend'),
	'bluebird': require('bluebird'),
	'lodash': require('lodash')
};


var Context = function (CONTEXT) {
	CONTEXT.API.Extend(false, this, CONTEXT);
};
Context.prototype.wrap = function (instanceImplementationModule, instanceDescriptor, instanceFactory) {
	var CONTEXT = this;

	CONTEXT = Object.create(CONTEXT);
	CONTEXT.API = Object.create(CONTEXT.API || {});
	CONTEXT.DEPS = CONTEXT.DEPS || {};

	if (instanceDescriptor.deps) {
		instanceDescriptor.deps.forEach(function (name) {
			CONTEXT.DEPS[name] = require(name);
		});
	}

	var layerId = CONTEXT.API.Path.basename(
		instanceImplementationModule.id
	).replace(/\.[^\.]+$/, "");

	CONTEXT.config = DEPS.lodash.merge(

		// TODO: In production, only include the config keys actually used within
		//       the context after running all code paths.
		CONTEXT.config,

		(CONTEXT.config["/" + layerId] || {})
	);

	if (CONTEXT.VERBOSE) console.info(("Init layer '" + layerId + "' with config: " + JSON.stringify(CONTEXT.config, null, 4)).info);

	return new instanceFactory(CONTEXT);
}


DEPS['bluebird'].attempt(function () {

	return require('./02-Server.js').for(new Context({

		VERBOSE: VERBOSE,
		DEBUG: DEBUG,

		DEPS: DEPS,

		API: {
			'Path': DEPS['path'],
			'Extend': DEPS['extend'],
			'Promise': DEPS['bluebird']
		},

		config: {
			"/02-Server": {
				port: 8085,
				bind: '127.0.0.1'
			},
			"github.com~systemjs/0/System.config": require(
				DEPS.path.join(__dirname, '../client/package.json')
			).config["github.com~systemjs/0/System.config"]
		}

	}));

}).then(function (api) {

	return api.start();

}).catch(function (err) {
	console.error(("Got Systems ERROR:").error, ("" + (err.stack || err)).error);
	process.exit(1);
});

