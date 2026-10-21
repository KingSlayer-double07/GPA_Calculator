import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta
          name="description"
          content="Free GPA calculator for university and secondary school students. Add your courses, set your own grade scale and keep a history of your results."
        />

        {/* PWA: manifest, browser theme colour and the icon used when added to an iOS home screen. */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#007AFF" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />

        {/* Register the service worker. Production only: `expo start` does not serve /sw.js. */}
        {process.env.NODE_ENV === 'production' && <script dangerouslySetInnerHTML={{ __html: sw }} />}

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Add any additional <head> elements that you want globally available on web... */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9112862070745151"
     crossOrigin="anonymous"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}

const sw = `
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
}
`;
