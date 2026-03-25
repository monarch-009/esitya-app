const path = require('path');
const { createRequestHandler } = require('@expo/server/build/cjs/vendor/vercel');

const handler = createRequestHandler({
  build: path.join(process.cwd(), 'dist', 'server'),
});

module.exports = function (req, res) {
  return handler(req, res);
};
