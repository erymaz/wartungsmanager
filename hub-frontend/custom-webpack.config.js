require('dotenv-expand')(require('dotenv').config());
const webpack = require('webpack');

const ENVs = [
  // Define your ENVs here
  'APP_SERVICE_URL_ASSET',
  'APP_SERVICE_URL_FILE',
  'APP_SERVICE_URL_HUB',
  'APP_SERVICE_URL_USER',
];

// Do not edit below this line
//////

// This ensures that ENVs that are NOT defined in .env do not get replaced by
// Webpack. This is necessary to let the expressions remain in the code so that
// run-time ENVs on a Dockerimage get applied.
const defines = {};
for (const key of ENVs) {
  if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
    continue;
  }

  defines['window.env.' + key] = JSON.stringify(process.env[key] || '');
}

module.exports = {
  plugins: [new webpack.DefinePlugin(defines)],
};
