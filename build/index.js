
const DEPS = {
	path: require("path"),
	fs: require("fs"),
	Builder: require('systemjs-builder')
};


var distPath = DEPS.path.join(__dirname, 'dist');

if (!DEPS.fs.existsSync(distPath)) {
	DEPS.fs.mkdirSync(distPath);
}


// @see https://github.com/systemjs/builder#self-executing-sfx-bundles
var builder = new DEPS.Builder({
	baseURL: DEPS.path.join(__dirname, '../client'),

	transpiler: 'babel'

})
.buildSFX(
	'01-System.js',
	DEPS.path.join(distPath, '01-System.js'),
	{
		sfxFormat: 'cjs',
		runtime: false,
		minify: false,
		mangle: false
	}
)
.then(function () {

	console.log('Build complete');
})
.catch(function (err) {

	console.error('Build error');
	console.error(err.stack || err);
});
