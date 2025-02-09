const { , validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: '3dynamo-web',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

