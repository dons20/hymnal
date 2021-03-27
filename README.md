# Hymns for all Times

A modern, react-powered single page application, allowing users to ditch their paper hymnals in favor of something portable. Built with Typescript, a few other awesome libraries have helped bring this project to life, including Chakra UI, FuseJS and localforage.

While this particular version is built with a specific object structure in mind (Songs), it is absolutely flexible enough to work with other setups, provided you update the types. 

## Development

Get started by ensuring you have an up-to-date version of `node` (14.15 LTS is recommended) with `yarn` installed.

* `yarn install` to get the latest dependencies installed locally
* `yarn start` - Launches the development server
* `yarn test` - Will run jest for testing
* `yarn build` - Will compile the production version of the website
* `yarn analyze` - Will analyze a compiled build folder from the step above and give you insight into how large the bundles are.