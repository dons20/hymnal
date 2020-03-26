module.exports = {
	staticFileGlobs: [
		'build/static/css/**.css',
		'build/static/js/**.js',
		'build/**.js',
		'build/**.png',
		'build/**.svg',
		'build/songs.json'
	],
	swFilePath: './build/service-worker-local.js',
	stripPrefix: 'build/',
	importScripts: ['./service-worker-local.js'],
	handleFetch: false
};
