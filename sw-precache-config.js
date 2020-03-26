module.exports = {
    staticFileGlobs: [
        "build/static/css/**.css",
        "build/static/js/**.js",
        "build/static/media/**.svg",
        "build/songs.json",
        "build/**.js",
        "build/**.png"
    ],
    swFilePath: "./build/service-worker-local.js",
    stripPrefix: "build/",
    importScripts: ["./service-worker-local.js"],
    handleFetch: false
};
