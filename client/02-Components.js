
module.exports = function (CONTEXT) {

	return CONTEXT.wrap(module, {
		'deps': {
			'HelloWorld': require('components/HelloWorld')
		}
	}, Factory);
}

function Factory (CONTEXT) {

	const DEPS = CONTEXT.DEPS;
	const CONFIG = CONTEXT.config;


P("COMPONENTS: " + Object.keys(DEPS).length);
P("COMPONENT CONFIG: " + CONFIG.foo);

P("typeof DEPS.react: " + typeof DEPS.react);

	DEPS['HelloWorld'].init(DEPS.react);


	return CONTEXT;
}
