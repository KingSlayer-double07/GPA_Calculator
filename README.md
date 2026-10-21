# GPA Calculator

A free GPA calculator for university and secondary-school students. It runs as an installable web app (PWA, deployed on Vercel) and as an Android app, from a single TypeScript codebase. There is no backend: everything is calculated and stored on the user's own device.

## Features
*   **Weighted GPA**: add as many courses as you need, each with a name, units and a grade. The GPA is `Σ(units × grade points) ÷ Σ units`, rounded to two decimal places.
*   **Your own grade scale**: the default is the 5-point scale (A = 5 … F = 0). Edit the points for any grade, including decimals (0 to 10, so 4.0, 5.0 and 10-point scales all work), or reset to the default.
*   **History**: every calculation is saved with its name, GPA, date, number of courses and total units, along with the grade scale that was used, so a past result stays correct even if you change the scale later.
*   **Clear feedback**: every problem is shown next to the field it belongs to, and nothing is silently ignored. The result disappears as soon as an input changes, so it can never be out of date.
*   **Works offline**: once opened, the web app is cached by a service worker and runs without a connection. Updates install in the background.
*   **Private**: history and settings live in the browser's local storage (web) or `AsyncStorage` (Android) and are never sent anywhere.
*   **Accessible**: labelled inputs and buttons, a screen-reader-friendly structure, keyboard support, and text that meets WCAG AA contrast.

## Technologies Used

| Technology | Purpose |
| :--- | :--- |
| [React Native](https://reactnative.dev/) + [React Native Web](https://necolas.github.io/react-native-web/) | One UI codebase for Android and the web |
| [Expo](https://expo.dev/) (SDK 52) | Tooling, builds, over-the-air updates |
| [Expo Router](https://docs.expo.dev/router/introduction/) | File-based routing; the three tabs are real URLs (`/`, `/history`, `/settings`) |
| [TypeScript](https://www.typescriptlang.org/) | Type safety (`strict` mode) |
| [Async Storage](https://react-native-async-storage.github.io/async-storage/) | Local persistence |
| [Workbox](https://developer.chrome.com/docs/workbox) | Service worker generation for offline support |
| [Vitest](https://vitest.dev/) + [ESLint](https://eslint.org/) | Unit tests and linting |
| [Vercel](https://vercel.com/) | Hosting for the web app |

## Getting Started

### Prerequisites
*   Node.js 20 or newer (CI uses 22)
*   npm
*   For Android: [Android Studio](https://developer.android.com/studio) with an emulator or a connected device

### Installation
```bash
git clone https://github.com/KingSlayer-double07/GPA_Calculator.git
cd GPA_Calculator
npm install
```

### Run it
```bash
npm run web        # web app at http://localhost:8081
npm run android    # Android build on an emulator or device
```
The Expo Go app from the stores only supports the newest Expo SDK, so it cannot open this project. To run on a phone, use `npm run android` or build a development client with EAS (`eas build --profile development --platform android`).

### Scripts

| Script | What it does |
| :--- | :--- |
| `npm run web` / `android` / `start` | Start the app (Expo) |
| `npm run build:web` | Production web build into `dist/`, then generate the service worker |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint; any warning fails |
| `npm test` | Unit tests |

## Project Structure
```
app/                    Routes only (Expo Router): everything here becomes a page
  _layout.tsx           Root layout: provides the shared data (history, grade scale)
  +html.tsx             Web HTML shell: PWA tags, service worker registration
  (tabs)/               The Calculator, History and Settings tabs
src/
  components/           UI building blocks
  constants/            Default grade scale and the allowed points range
  context/              AppDataContext: history and grade scale, saved to storage
  utils/                Calculation, parsing, storage and migration, with unit tests
  styles.ts, theme.ts, types.ts
public/                 PWA manifest and icons (copied into the web build)
workbox-config.js       What the service worker caches
vercel.json             Build settings, caching and security headers for Vercel
```
Keep non-page files out of `app/`: Expo Router turns every file in it into a route.

## How It Works

### Saved data
History and the grade scale are saved under `gpaHistory.v2` and `gradeScale.v2` as `{ "version": 2, ... }`. Data written by earlier versions of the app (`gpaHistory`, `gradeScale`) is migrated the first time it is read: numbers saved as text are converted, unusable entries are dropped, and no date is invented for old entries. The old keys are never modified. Anything unreadable is treated as empty, never as an error that blocks saving. If the device refuses to save, a message says so.

### Offline and updates
`npm run build:web` exports the static site and then generates `dist/sw.js`, which precaches the pages, the JavaScript bundle and the icon font. A new deployment is installed in the background and takes over on the next reload; old caches are removed automatically. The service worker is registered only in production builds.

### Deploying
The site is deployed on Vercel. `vercel.json` sets the install and build commands, the `dist` output directory and clean URLs, and adds caching and security headers. These settings override those in the Vercel dashboard.

## Quality
`npm run typecheck`, `npm run lint` and `npm test` (unit tests for the calculation, parsing, rounding and storage migration) run together with a production build in GitHub Actions on every pull request and on pushes to `main`.

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

*   🍴 Fork the Project
*   🌿 Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
*   💾 Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
*   🚀 Push to the Branch (`git push origin feature/AmazingFeature`)
*   🔍 Open a Pull Request

Please run `npm run typecheck && npm run lint && npm test` before opening a pull request.

## Author
**[Favour Akande]**
*   GitHub: [@KingSlayer-double07](https://github.com/KingSlayer-double07)
*   Twitter: [@favourdslayer]

---

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Expo](https://img.shields.io/badge/expo-000020.svg?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
