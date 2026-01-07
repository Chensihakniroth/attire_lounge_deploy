const fs = require('fs');

const configFile = 'resources/js/config.js';
const placeholder = 'MINIO_ENDPOINT_PLACEHOLDER';
const endpoint = process.env.MINIO_PUBLIC_ENDPOINT || 'http://127.0.0.1:9000';

fs.readFile(configFile, 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }
  const result = data.replace(placeholder, `${endpoint}/product-assets`);

  fs.writeFile(configFile, result, 'utf8', (err) => {
    if (err) return console.log(err);
  });
});
