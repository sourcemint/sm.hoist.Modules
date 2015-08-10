
console.log("BUILD!!!");

exports.main = function () {

	var runtimeFactory = require('runtime');

	require('resources/layer/01-Libraries.js');
	require('resources/layer/02-Components.js');


console.log("runtimeFactory", runtimeFactory);

	return runtimeFactory({

		VERBOSE: true,
		DEBUG: true

	}).then(function (runtimeContext) {

		return runtimeContext.loadLayer('resources/layer/01-Libraries.js').then(function (factory) {

			return factory(runtimeContext.clone());

		}).then(function (context) {

			return runtimeContext.loadLayer('resources/layer/02-Components.js').then(function (factory) {

				return factory(context.clone());

			}).then(function (context) {

			});

		}).then(function (appContext) {


console.log("ALL LOADED!");

		});

	});
}
