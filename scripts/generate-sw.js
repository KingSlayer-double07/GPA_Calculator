// Generates dist/sw.js after `expo export -p web` (see the build:web script).
//
// This uses the workbox-build API rather than the workbox-cli binary: the CLI needs devDependencies to be
// installed and crashes (ERR_REQUIRE_ESM) on Node versions older than 20.19 / 22.12, and a hosted build
// (Vercel) should not depend on either.
const { generateSW } = require('workbox-build');
const config = require('../workbox-config.js');

generateSW(config)
  .then(({ count, size, warnings }) => {
    warnings.forEach((warning) => console.warn(warning));
    console.log(`The service worker (${config.swDest}) will precache ${count} URLs, totaling ${(size / 1e6).toFixed(2)} MB.`);
  })
  .catch((error) => {
    console.error('Service worker generation failed:', error);
    process.exit(1);
  });
