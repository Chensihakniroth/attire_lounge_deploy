const fs = require('fs');

const configFile = 'resources/js/config.js';
const placeholder = 'MINIO_ENDPOINT_PLACEHOLDER';
const endpoint = 'https://bucket-production-4ca0.up.railway.app'; // Correct endpoint! (◕‿◕✿)

fs.readFile(configFile, 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }
  // Construct the full URL with the bucket name
  const result = data.replace(placeholder, `${endpoint}/product-assets`);

  fs.writeFile(configFile, result, 'utf8', (err) => {
    if (err) return console.log(err);
  });
});
