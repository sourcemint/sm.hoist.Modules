
exports['for'] = function (CONTEXT) {

	return CONTEXT.wrap(module, {
		'deps': [
			'resources/lodash',
		    "resources/canonical-json",
//		    "resources/jsonwebtoken",
			"resources/forge",
		    "resources/jssha",
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


P("LIBRARIES: " + Object.keys(DEPS).length);
P("LIBRARY CONFIG: " + CONFIG.foo);

P("LIBRARY DEPS.lodash: " + typeof DEPS.lodash);
P("LIBRARY DEPS.canonical-json: " + typeof DEPS['canonical-json']);

P("LIBRARY DEPS.jssha: " + typeof DEPS.jssha);
P("LIBRARY DEPS.moment: " + typeof DEPS.moment);
P("LIBRARY DEPS.numeral: " + typeof DEPS.numeral);
P("LIBRARY DEPS.page: " + typeof DEPS.page);
P("LIBRARY DEPS.uuid: " + typeof DEPS.uuid);

console.log("DEPS.uuid", DEPS.uuid.v4());

P("LIBRARY DEPS.forge: " + typeof DEPS.forge);

console.log("DEPS.forge", DEPS.forge);

var md = DEPS.forge.md.sha256.create();
md.update('The quick brown fox jumps over the lazy dog');
console.log(md.digest().toHex());

}
