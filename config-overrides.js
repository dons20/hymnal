const { override, useBabelRc, adjustWorkbox } = require("customize-cra");
const { InjectManifest, GenerateSW } = require("workbox-webpack-plugin");
const path = require("path");

const webpack = function (config, env) {
	config.plugins.push(
		new InjectManifest({
			globPatterns: ["./rainbow/*.jpg"],
			globDirectory: "build",
			swSrc: path.join("public", "service-worker-local.js"),
			swDest: "service-worker-local.js",
			include: [/\.html$/],
		})
		/* new GenerateSW({
            clientsClaim: true,
            exclude: [/\.map$/, /asset-manifest\.json$/],
            importWorkboxFrom: "cdn",
            navigateFallback: "public/" + "index.html",
            navigateFallbackBlacklist: [
                // Exclude URLs starting with /_, as they're likely an API call
                new RegExp("^/_")
                // Exclude any URLs whose last part seems to be a file extension
                // as they're likely a resource and not a SPA route.
                // URLs containing a "?" character won't be blacklisted as they're likely
                // a route with query params (e.g. auth callbacks).
                //new RegExp('/[^/?]+\\.[^/]+$'),
            ]
        }) */
	);

	return config;
};

module.exports = override(
	useBabelRc(),
	adjustWorkbox(wb => {
		Object.assign(wb, {
			skipWaiting: true,
			exclude: (wb.exclude || []).concat("index.html"),
		});
	})
);
