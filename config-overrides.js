const { override, useBabelRc, adjustWorkbox } = require("customize-cra");
const { InjectManifest, GenerateSW } = require("workbox-webpack-plugin");
const path = require("path");

const webpack = function (config) {
	config.plugins.push(
		new InjectManifest({
			swSrc: path.join("public", "service-worker-local.js"),
		}),
		new GenerateSW({
			clientsClaim: true,
			exclude: (config.exclude || []).concat("index.html"),
			navigateFallback: "public/" + "index.html",
		})
	);

	return config;
};

module.exports = override(useBabelRc(), adjustWorkbox(webpack));
