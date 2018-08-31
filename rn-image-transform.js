
const path = require('path');
const createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');

module.exports = {
  // Mocks asset requires to return the filename. Makes it possible to test that
  // the correct images are loaded for components. Essentially
  // require('img1.png') becomes `Object { "testUri": 'path/to/img1.png' }` in
  // the Jest snapshot.
  // This now uses the current directory ('.') instead of __dirname because
  // npm run scripts always use the root of the module as the current dir.
  process: (contents, filename) => {
    return `module.exports = {
      testUri: ${JSON.stringify(path.relative('.', filename))}
    };`
  },
  getCacheKey: createCacheKeyFunction([__filename]),
};
