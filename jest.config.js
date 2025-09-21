export const testEnvironment = 'jsdom';
export const transform = {};
export const watchPlugins = ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'];
export const transformIgnorePatterns = [
  // Change MODULE_NAME_HERE to your module that isn't being compiled
  '/node_modules/(?!axios).+\\.js$',
];
