const path = require('path');
const Application = require('thinkjs');

const instance = new Application({
  ROOT_PATH: __dirname,
  APP_PATH: path.join(__dirname, 'src'),
  env: 'production'
});

instance.run();
