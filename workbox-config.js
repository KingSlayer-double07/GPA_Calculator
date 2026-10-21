// Generates dist/sw.js after `expo export -p web` (see the build:web script).
module.exports = {
  globDirectory: 'dist',
  // Everything the app needs to start offline: pages, the JS bundle, the icon font and the manifest.
  globPatterns: ['**/*.{html,js,json,ttf,ico}'],
  globIgnores: [
    // The service worker and its runtime must never precache themselves.
    'sw.js',
    'workbox-*.js',
    // Dev-only sitemap page, and the duplicate copies Expo Router emits for the (tabs) route group.
    '_sitemap.html',
    '(tabs)*',
    '(tabs)/**',
  ],
  swDest: 'dist/sw.js',
  // Take over open pages as soon as a new version is installed, and drop caches of old versions.
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid$/
  ]
};
