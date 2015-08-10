

exports.init = function (React) {

	console.log("YES from component!");

	System['import']('components/HelloWorld/template.jsx').then(function (api) {


		api.init(React);


	console.log("Rendered!");

	})['catch'](function (err) {

		console.error (err.stack || err);
	});

}
