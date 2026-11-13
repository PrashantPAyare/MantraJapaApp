# Still

A quiet, local-only mantra counter for web, iOS, Android, and Windows. **Version 1.0.0, build 1.** Documentation and official platform requirements checked **13 November 2026**.

## Features and delivery

Large tap/click counter; keyboard input; undo; pause/resume; confirmed reset; finish-and-save; editable Unicode mantra library; targets of 27/54/108/custom; independently configurable mala length; session duration, history, daily/lifetime totals; light/dark/system themes; optional sound/haptics; opt-in screen-reader repetition announcements; automatic saves, recovery and validated backup merging. The PWA includes real icons, offline caching and explicit save-before-update behavior.

The package contains shared source, complete generated Android/iOS native projects, the Windows Electron entry point and packaging configuration, tests, production browser files in `dist/`, and an unsigned Windows installer. No account, ads, analytics, remote fonts, backend or synchronization. No public deployment or store submission has been performed.

## Architecture and framework choice

**Capacitor 8.6.2** provides maintained mobile runtimes and plugins; **Electron 45.3.1** provides Windows. All four share the same JavaScript ES-module UI, CSS, domain logic and validation. Capacitor officially supports iOS/Android/web, so Windows uses a separate host around the same app. esbuild bundles the bridge/plugin modules. This approach maximizes shared code while retaining native storage, haptics and export on mobile.

The initial React/TypeScript proposal was simplified to standard JavaScript and native HTML controls. There is no React, TypeScript or Vite dependency in the actual project.

```text
src/model.js       Pure immutable counting, statistics and backup validation
src/storage.js     Versioned repository, primary/recovery snapshots and migration
src/platform.js    Native preferences, haptics, filesystem/share adapters
src/app.js         Four screens, input handling, lifecycle and application state
src/style.css      Responsive layouts, themes, safe areas and reduced motion
public/            Manifest, service worker, icons and hosting headers
scripts/           Build, local static server and reproducible icon generation
android/           Complete Gradle project, Java activity and native resources
ios/App/           Xcode project, Swift delegates, SPM and privacy manifest
electron/main.cjs  Secure Windows host and local-asset protocol
tests/             Counting, persistence, import and offline-worker tests
```

Schema 1 contains mantras, settings, completed sessions and an active session. Sessions snapshot the mantra name, target and mala length. Statistics derive from saved/current records. `model.js` has no UI/storage dependency; `Repository` takes a storage adapter. UI strings are escaped before rendering. Imports never execute HTML or scripts.

## Precise counting behavior

1. Every completed tap/click activation adds one, including rapid inputs and both clicks of a double-click. There is no debounce that loses deliberate repetitions.
2. Space counts, U undoes and P pauses/resumes outside controls. Editable fields, links, dialogs, other buttons, modifiers and held shortcut repeats suppress global shortcuts. A focused counter uses normal Enter/Space activation; repeated held keys on it are suppressed.
3. Pause blocks counting. Undo removes only the last active-session repetition and its day attribution, including while paused; zero cannot become negative. Saved history cannot be undone.
4. Target completion fills the bar and changes a polite status message. It never resets counts or opens a modal; counting continues beyond target. Undo below target removes the completion state. Feedback stays at the user's chosen settings.
5. Malas equal `floor(session.count / session.mala)`. Partial malas do not combine between sessions. Lifetime totals include current progress. Reset discards current progress and reduces those totals.
6. Finish archives a nonempty session and begins at zero. Finishing zero creates no history entry. Reset asks before discarding nonempty progress. Switching mantras asks before saving progress and beginning another session. Deletion preserves saved session names; editing updates the active display name while historical names stay unchanged.
7. Target changes affect the current session without discarding counts. Settings defaults apply to subsequent sessions; changing mala length does not reinterpret a nonempty session.
8. The timer begins at the first repetition and excludes pause time. Undoing to zero does not erase elapsed practice time. Backgrounding/switching away pauses a nonempty session. Reload/restart restores paused. Every accepted count is journaled; duration additionally checkpoints every five seconds. Abrupt termination can lose the last timer interval, while saved counts remain recoverable. Clock changes can affect duration accuracy.
9. Each repetition gets its local calendar day at entry. Imports retain day keys across timezone changes. Today uses the receiving device's current local calendar date.
10. Web Locks enforce one writer per origin/profile where available. A storage-event fallback locks competing tabs. Without Web Locks, avoid simultaneous first writes across tabs. Close the other tab and reload to continue.

## Prerequisites and compatibility

| Target | Minimum product baseline | Build requirements | Verification here |
| --- | --- | --- | --- |
| Web | Chrome/Edge 109+, Firefox 115+, Safari 15.4+ | Node 22.21.1+, npm 10+ to rebuild; HTTPS/localhost for PWA | Chrome 157.0.8103.78 on Windows 11 and Codex in-app browser |
| iOS/iPadOS | 15.4+ | macOS, Xcode 26+, command-line tools; signing account for release | Native project generated/synced; not compiled on this Windows host |
| Android | Android 7/API 24+, updated Chromium WebView 109+ | Android Studio 2025.2.1+, JDK 21, SDK 36 | Generated/synced; build attempt blocked by local JDK 11; no device tests |
| Windows | Windows 10 22H2+ x64; Windows 11 preferred | Node/npm; Windows SDK for AppX; certificate for trusted direct release | Unsigned NSIS installer built on Windows 11 build 26200 |

Framework minima differ from app minima: Capacitor supports iOS 15 and older WebViews, but this app's modern APIs require the browser baselines above. These are intended compatibility baselines, **not verified guarantees**. Current Edge, Safari, Firefox, physical phones/tablets/foldables, assistive technology and minimum OS versions still require release testing. Actual observations are recorded in `VALIDATION.md`.

References: [Capacitor environment](https://capacitorjs.com/docs/getting-started/environment-setup), [iOS](https://capacitorjs.com/docs/ios), [Android](https://capacitorjs.com/docs/android), [Electron](https://www.electronjs.org/docs/latest/). Checked-in Android tooling: AGP 8.13.0, Gradle 8.14.3, compile/target SDK 36, min SDK 24, Java 21 source target.

## Installation, development and tests

Open a terminal in this project directory:

```sh
npm ci
npm run build
npm run check
npm test
npm run dev
```

Open **http://localhost:4173/**. `dev` builds once and serves `dist`; there is no hot reload. Rebuild/restart after edits and accept pending PWA updates. `npm run preview` serves an existing `dist` without rebuilding. The included build can run without installing dependencies using `node scripts/serve.mjs dist`.

The default npm registry returned 401/503 in this delivery environment. Installation succeeded through a public npm mirror:

```sh
npm ci --registry=https://registry.yarnpkg.com
```

The lockfile records exact versions and integrity hashes; some tarball URLs still use npm's registry. Restricted networks must permit the recorded endpoints. No registry credentials are included. If package install scripts must be deferred:

```powershell
npm ci --ignore-scripts --registry=https://registry.yarnpkg.com
$env:electron_config_cache = "$PWD/../../work/electron-cache"
node node_modules/electron/install.js
```

No application secrets or `.env` values are needed. Signing configuration is separate below. `npm run icons` regenerates native/web artwork from source geometry. Native folders already exist: use `npm run native:prepare`, not `*:add` unless deliberately recreating a platform. Tests use Node's built-in runner; build before testing because offline tests inspect shipped assets. `TEST-RESULTS.txt` contains the actual run. Browser UI checks used connected automation; no checked-in cross-browser runner or hosted CI is claimed.

## Run and Deploy the Web Application

### 1. Run locally

```sh
npm ci
npm run dev
```

Open **http://localhost:4173/**. Alternatively run `node scripts/serve.mjs dist` against the included build. The server listens on all interfaces: another device on a trusted LAN may open `http://YOUR-COMPUTER-LAN-IP:4173/` if the firewall permits. A plain HTTP LAN URL generally cannot use PWA/offline APIs; use HTTPS for those tests. Do not expose this development server publicly.

### 2. Production build

```sh
npm run build
```

Output: **`dist/`**. Upload its contents, including `index.html`, `src`, icons, manifest, `_headers` and the generated worker. The build embeds a content-derived cache version and asset list. Do not host `public/sw.js` directly: it contains build tokens. Do not upload the source root, node_modules or signing material.

### 3. Deploy to Cloudflare Pages — manual, not performed

1. Create/sign in to your own Cloudflare account and review its terms/plan.
2. In Workers & Pages, create a Pages project using **Direct Upload** and choose an available name.
3. Build locally. Zip the **contents** of `dist/` with `index.html` at the archive root, or use the dashboard's supported folder upload.
4. Upload, review and explicitly deploy yourself. Record the actual HTTPS address returned by the dashboard.
5. At that address, test count/reload recovery, backup roundtrip and offline launch before sharing.
6. For later releases, upload the complete rebuilt directory atomically. Preserve origin and base path to retain local data.

**Live URL: NOT DEPLOYED. Placeholder only: `https://<your-pages-project>.pages.dev/`.** Replace it with the actual hosting result. No working public URL is invented.

Optional Git integration uses `npm ci && npm run build`, output directory `dist`, and Node satisfying package.json; this is a recommendation, not configured CI. Official guides: [Static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

### 4. HTTPS, routing, base paths and updates

Use HTTPS. Imports, manifest and icon URLs are relative; a subdirectory deployment works when its URL ends in `/`. Scope is relative to the worker/manifest location. Keep that path stable. Navigation stays in the root document, so no SPA routing fallback is needed. Serve directory requests as `index.html` with correct MIME types.

`_headers` supplies Cloudflare no-cache rules for entry/worker/source assets, a same-origin Content Security Policy, no framing/referrers and MIME-sniffing protection. Other hosts must reproduce those settings. Do not apply long immutable caching to `sw.js` or `index.html`.

The initial worker precaches the app. A replacement waits until **Save & update** succeeds. That tab reloads with its session restored paused. It never erases practice data. Other tabs are not forced to reload; old caches are retained for their existing version. Earlier caches accumulate in this release. Export before clearing site storage, because that also erases practice data. Keep rollback deployments and add explicit migrations before any future schema change.

### 5. Custom domain

Pages project → Custom domains → Set up a custom domain. Enter a domain you own and follow the supplied DNS/verification steps. Associate it in Pages before adding DNS: an apex usually requires Cloudflare DNS; an external-DNS subdomain uses the provided CNAME. Wait for an Active certificate and test HTTPS/offline behavior. [Official instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/).

A new domain is a new storage origin. Export from the old address and import at the new one. Domain purchases and DNS changes remain manual and can incur cost.

### 6. PWA installation and offline use

First load online over HTTPS, allow caching to complete and reload once. Chrome/Edge generally offer an address-bar/menu Install action. iPhone/iPad Safari uses Share → Add to Home Screen; macOS Safari may offer Add to Dock. Firefox desktop does not offer the same built-in desktop PWA installation flow; the ordinary website can still use offline caching. Installation availability varies by browser/OS/policy and is optional.

After caching, disconnect and reopen the same URL/profile. The first-ever load needs connectivity. A partial/cleared cache or unavailable service worker prevents offline startup. Native packages bundle web assets and do not use the web worker.

### 7. Access from other devices

Open the actual deployed HTTPS URL on each phone, tablet or desktop. No account or installation is required. Layout adapts to orientation/window size. Each device/browser starts with separate local state; backups transfer data manually. There is no automatic synchronization.

### 8. Browser limitations and storage

Web and Electron use localStorage snapshots. Mobile adds native Preferences (UserDefaults/SharedPreferences) plus a WebView recovery journal. Site data can be cleared or evicted; private browsing may retain it only for that session. Settings can request persistent storage explicitly, but browsers may deny it. Keep backups regardless.

iOS browsers do not support browser vibration; desktops/other browsers may also omit it. Native haptics use the plugin where hardware permits. Audio is gesture-initiated and may be blocked or muted. Unsupported feedback is skipped gracefully. If all storage is blocked, the app visibly warns that it can only retain the practice in memory and still permits export before closing. Current Safari/Firefox/Edge and mobile installation remain unverified.

## Data, backup validation and deletion

`still.v1` holds the current complete snapshot; `still.v1.previous` holds the last valid recovery snapshot. Validation precedes each atomic key write. A failed write does not advance UI counts. A corrupt primary falls back to the previous valid copy; two unreadable copies produce a visible recovery-export action rather than silently deleting data. Repair never replaces the only valid recovery copy with a corrupt one. Version 0 (same structure, missing the announcement preference) migrates to version 1. Unknown schemas are rejected; future migrations need explicit code/tests.

Mobile journals synchronously in WebView storage, then serializes native preference writes. Startup selects the newest valid timestamped copy. A native write failure is reported and leaves the journal intact. Termination can interrupt a pending native mirror write. Storage is not application-encrypted; device OS protections apply. Exported JSON is plaintext.

Settings → Export backup downloads JSON on web/Windows or writes a temporary cache file and opens the native OS share/save sheet on mobile. Import uses a file picker and validates the 25 MB size limit, schema, strings, numeric ranges, IDs, relationships and event/count consistency before changing data. It unions unique IDs; existing records win. Reimport is idempotent. An imported nonempty active session is archived, while the receiving device's active practice and settings remain unchanged. Distinct IDs may have identical names. This is merge-only, with no destructive replace mode.

Delete history confirms before removing saved sessions/totals and retains the active session and mantras. It also overwrites the recovery slot. External backups remain under user control. To erase all data, export first and clear the site's/app profile storage, or remove the app as appropriate. Android cloud backup is disabled. OS/device backup policies elsewhere are controlled by the OS/user; the app provides no cloud synchronization.

The format keeps one event per repetition for exact undo/day totals. Large histories increase snapshot size and serialization cost and can reach browser or native preference limits. Quota errors are visible. Export, verify the backup and delete old history if needed; IndexedDB/SQLite would be an appropriate future repository for unbounded history. This limitation is not hidden behind a promise of unlimited storage.

## Android development and release

The example application ID is `org.still.mantra`. Before public release choose an identifier you control and update capacitor.config.json, android/app/build.gradle, Java package/path and related native identifiers. Keep published identity stable.

```sh
npm ci
npm run native:prepare
npm run android:open
```

Install Android SDK 36, select JDK 21 for Gradle in Android Studio and set `JAVA_HOME` for terminal builds. Use a real device or emulator with an updated WebView. Windows debug build:

```powershell
./android/gradlew.bat -p android assembleDebug
```

macOS/Linux:

```sh
chmod +x android/gradlew
./android/gradlew -p android assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

Create a release upload key outside source control; interactive prompts keep passwords out of shell history:

```sh
keytool -genkeypair -v -keystore /secure/path/still-upload.jks -alias still-upload -keyalg RSA -keysize 2048 -validity 10000
```

Back up the key, alias, passwords and Play signing recovery information in separate secured locations. Gradle reads `STILL_KEYSTORE`, `STILL_STORE_PASSWORD`, `STILL_KEY_ALIAS` and `STILL_KEY_PASSWORD` from the environment. Set an absolute keystore path and supply passwords through a secure environment/secret manager. Never commit those values. Build the release bundle:

```powershell
./android/gradlew.bat -p android bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`. Without signing variables, release output is unsigned and cannot be described as submission-ready.

In Play Console manually create the app, enroll in Play App Signing, complete listing/Data safety/content rating/target audience/app-access answers, upload to internal testing, then use required closed/open tracks and review pre-launch results. Account-specific production access can require additional testing; follow the console. Only after QA should you request a production rollout.

Since 31 August 2026 new phone/tablet apps and updates require **target API 36+**; this project targets 36. Recheck at submission: [Google Play target API policy](https://support.google.com/googleplay/android-developer/answer/11926878), [Capacitor deployment](https://capacitorjs.com/docs/android/deploying-to-google-play). Verify packaged native libraries meet current page-size requirements and test resizing/foldables. The native wrapper retains its standard INTERNET permission for the local web runtime and requests vibration for optional haptics; the app makes no remote API calls and has no camera, microphone, contacts or location permission.

## iOS/iPadOS development and release

Xcode project: `ios/App/App.xcodeproj`; Swift Package Manager dependencies: `ios/App/CapApp-SPM`. On a Mac:

```sh
npm ci
npm run native:prepare
npm run ios:open
xcodebuild -resolvePackageDependencies -project ios/App/App.xcodeproj -scheme App
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build
```

In Xcode choose an Apple team and owned bundle ID. Enable automatic signing, or install matching distribution certificates/provisioning profiles. Bundle ID, entitlements, App Store Connect record and profiles must agree. Device testing may require developer-mode/trust setup. Keep certificates/profiles outside source control.

Archive:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath work/Still.xcarchive -allowProvisioningUpdates archive
```

Copy `ios/ExportOptions.example.plist` to a private location, replace the team ID and review the distribution method:

```sh
xcodebuild -exportArchive -archivePath work/Still.xcarchive -exportOptionsPlist /secure/path/ExportOptions.plist -exportPath work/ios-export -allowProvisioningUpdates
```

Use Xcode Organizer to validate/distribute to App Store Connect. Complete export-compliance answers, wait for processing, invite internal TestFlight testers and submit external testing for beta review if required. After QA, prepare a release submission. No automated upload/account creation is implemented.

Since 28 April 2026 uploads require **Xcode 26+ with iOS/iPadOS 26+ SDKs**; deployment targets may remain older. [Official Apple requirement](https://developer.apple.com/news/upcoming-requirements/?id=04282026a). The app targets iOS/iPadOS 15.4+.

The checked-in privacy manifest is included as an Xcode Resources build input and declares UserDefaults reason `CA92.1` and FileTimestamp reason `C617.1`, matching [Preferences](https://capacitorjs.com/docs/apis/preferences) and [Filesystem](https://capacitorjs.com/docs/apis/filesystem) documentation. Review the actual archived privacy report and every dependency before submission. A source manifest alone does not prove App Store acceptance.

## Windows packaging, signing and distribution

```sh
npm ci
npm run windows:dev
npm run windows:build
```

Installer: `release/Still Setup 1.0.0.exe`. Unpacked app: `release/win-unpacked/Still.exe`. The included installer is **unsigned**, for local evaluation; trusted public distribution needs signing. SmartScreen/certificate behavior depends on the environment. A successful packaging run is not proof of usability on every Windows version.

The app uses a secure `still://app/` asset origin. Renderer Node integration is disabled, context isolation and sandboxing are enabled, new windows are blocked and navigation is restricted to local app content. No remote content is loaded. Progress is stored in the Electron profile's localStorage.

With an already downloaded runtime in a restricted build environment:

```sh
npx --no-install electron-builder --win nsis --publish never --config.electronDist=node_modules/electron/dist
```

For Store distribution install the Windows SDK, reserve a name in Partner Center and replace every `build.appx` identity/publisher placeholder with its exact account values. Then:

```sh
npm run windows:store
```

This implements **AppX** packaging in the MSIX/AppX submission path; renaming files to MSIX is not claimed. Prepare Store logos/screenshots, run Windows App Certification Kit, upload the package, complete privacy/content/ratings/hardware information and configure visibility/flights before certification. The Store signs accepted packages. [Microsoft first-app guide](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/publish-first-app), [Store onboarding](https://learn.microsoft.com/en-us/windows/apps/publish/get-started), [electron-builder Windows](https://www.electron.build/docs/win/).

For optional direct NSIS distribution, use a trusted certificate or signing service. Configure electron-builder using `CSC_LINK`, `CSC_KEY_PASSWORD` or your certificate-store signing setup; keep credentials outside source. Test the signed installer/download on a clean Windows device. No auto-updater is implemented: use Store updates or deliberately install a later signed download. Retain app/profile identity and export before upgrades. No public installer upload was authorized or performed.

## IDs, versions, artwork and splash screens

- Name: Still. Example app/bundle ID: `org.still.mantra`. Adopt an owned namespace before shipping.
- Package version `1.0.0`; Android `versionName 1.0.0`, `versionCode 1`; Xcode `MARKETING_VERSION 1.0.0`, `CURRENT_PROJECT_VERSION 1`. Increment native build numbers for each store upload and package version for Windows releases.
- Web SVG and 192/512/1024 PNG icons, maskable 512 icon and Windows ICO are supplied. Android density/adaptive launcher resources and the iOS 1024 AppIcon use the same source artwork.
- iOS splash: Assets.xcassets/Splash.imageset and Base.lproj/LaunchScreen.storyboard. Android splash: res/drawable* and launch styles. Preview on real devices, including status-bar colors and safe areas. `npm run icons` regenerates supplied artwork; store screenshots/promotional artwork still need preparation.
- Windows publisher identity and Apple export team are clearly marked configuration examples, not functional signing setups or credentials.

## Store materials and remaining manual steps

Provide real support contact details and owned support/privacy-policy URLs. Do not invent them. Prepare titles, short/full descriptions, category, localized listings, release notes, device-specific screenshots, app icons and promotional artwork. Google Play generally needs a 512-square listing icon and 1024×500 feature graphic; follow current console dimensions for each store/device/locale.

Publish an accessible privacy policy explaining local data, plaintext backups, deletion, no account/sync/analytics, optional sound/haptics, OS backups and hosting access logs. A static host can process request data even when the app has no analytics. Review Apple App Privacy, Google Data safety and Microsoft disclosures against the final binary, dependencies and hosting. Complete current Apple age-rating, Google content-rating/target-audience and Microsoft ratings questionnaires, export compliance and licensing. This app makes no medical-treatment claims.

Release checklist:

- [ ] Review VALIDATION.md, resolve release gaps, recheck official policies and dependency advisories.
- [ ] Set owned IDs, publisher identity, support contacts, privacy URLs and store records.
- [ ] Create signing identities, back up keys/recovery access and produce signed release binaries.
- [ ] Confirm Android API 36/JDK 21, Apple Xcode/SDK 26+ and Windows package identity.
- [ ] Test small/large phones, tablets, foldables, portrait/landscape, safe areas, accessibility text, 200% zoom and resizable desktops.
- [ ] Exercise VoiceOver, TalkBack, Narrator, keyboard-only navigation, focus/contrast, reduced motion and real audio/haptic hardware.
- [ ] Test background/force-stop/reboot recovery, full/denied storage, day boundaries, multilingual text and backup roundtrips on each platform.
- [ ] Test current Chrome/Edge/Safari/Firefox, HTTPS offline/PWA install, active-session updates and custom-domain data transfer.
- [ ] Verify final privacy manifests/disclosures/permissions, age ratings, screenshots and policy/support links.
- [ ] Complete TestFlight, Play testing tracks and Windows flights/certification before deliberate production rollout.
- [ ] Export data, prepare rollback and preserve persistence on upgrades.

Only implementation, local tests and unsigned packaging were automated. Account enrollment, agreements, purchases, signing identities, domains, hosting, uploads, questionnaires, review and final publication remain manual. They were not performed.

## Troubleshooting and limitations

- **Android build failure:** JDK 11 was selected here. Select JDK 21 in Android Studio and JAVA_HOME, and install SDK 36. JDK 17 can run AGP but does not satisfy Capacitor's Java 21 source target.
- **Resolver access denied:** this managed Windows environment required additional filesystem access for esbuild's dependency resolution. A normal checkout should run `npm run build` with ordinary permissions. Do not weaken global protections.
- **npm/download errors:** use a reachable registry, retain integrity checks and keep tokens out of source. Electron downloads its official runtime separately; `electron_config_cache` selects a writable cache.
- **Old code after rebuilding:** reload to check for an update and choose Save & update. Do not erase practice data simply to refresh code.
- **Offline launch fails:** initial caching must succeed on HTTPS/localhost. `file://` is unsupported; plain LAN HTTP is insufficient for PWA checks.
- **Missing progress:** check device, hostname, base path, browser profile and private mode. localhost and 127.0.0.1 intentionally have separate data. Import a backup at the intended origin.
- **Quota errors:** export immediately. Full JSON snapshots grow with history; large histories can slow counting or exhaust storage. There is no cloud recovery.
- **Silent feedback:** check settings, gesture restrictions and OS mute/volume; test supported hardware. Unsupported haptics/audio are skipped.
- **Store identity error:** replace example Partner Center publisher values before AppX packaging.
- **Audit:** the delivery audit found six moderate advisories in electron-builder's development dependency chain (minimatch glob amplification). Recheck/update before public release. Do not force incompatible overrides or downgrade the toolchain just to silence the report. See VALIDATION.md for the separate production-only result.
- **Windows runtime smoke test:** `npm run windows:test` is supplied, but the attempt was blocked by Windows application-container ACLs on the runtime directory. No sandbox disabling or broad ACL changes were applied.
- **Coverage:** physical-device, Edge/Safari/Firefox, screen-reader and signed-store testing are not claimed. Installation on every minimum OS is unverified. Older web caches are retained; history storage is bounded by device quota.

## Technology Stack Used

Versions match package.json/package-lock.json. Native dependencies are additionally pinned/configured by Gradle and Swift Package Manager project files. Optional hosting/CI recommendations are separated from implemented tools.

| Implemented technology | Version | Purpose | Platforms |
| --- | --- | --- | --- |
| JavaScript ES modules, HTML5, CSS | ES2022 language target; no language package | Shared UI, native controls, themes, responsive layout, reduced motion/safe areas | All |
| Node.js / npm | Tested 22.23.2 / 10.9.8; Node minimum 22.21.1 | Build, server and test tooling | Development |
| Capacitor core/Android/iOS/CLI | 8.6.2 each | Native runtimes, synchronization and bridge | Mobile; web fallback |
| Immutable state functions | Project 1.0.0 | Counting/settings state without external manager | All |
| Application view selection | Project 1.0.0 | Four-screen navigation without router dependency | All |
| localStorage / versioned JSON | Web Storage API; schema 1 | Atomic primary/recovery snapshots | Web/Windows; mobile journal |
| Capacitor Preferences | 8.0.1 | UserDefaults/SharedPreferences mirror | iOS/Android |
| Web Audio / Vibration | Browser APIs | Gesture-initiated tone; supported browser haptics | Web/Windows as supported |
| Capacitor Haptics | 8.0.2 | Optional native light impact | Mobile hardware |
| Capacitor Filesystem / Share | 8.1.5 / 8.0.3 | Backup cache file and OS share/save sheet | iOS/Android |
| JSON validation / Blob / File picker | Project 1.0.0 and browser APIs | Merge-only backup import/export | All; native export adapter |
| Manifest / custom service worker / Cache API | Standards; content-hashed worker | PWA install, offline assets and explicit updates | Supporting browsers |
| esbuild | 0.28.2 | Bundle bridge/plugin modules | Build for all targets |
| Node test runner / assert / vm | Node 22.23.2 built-ins | Domain, persistence/import and worker tests | Development |
| Connected browser automation | Chrome 157.0.8103.78 plus Codex browser; not an app dependency | UI/recovery/offline/update validation | Delivery checks |
| Electron | 45.3.1 | Isolated sandboxed Windows runtime | Windows |
| electron-builder / NSIS | 26.18.0 / NSIS 3.0.4.1 download | NSIS installer and AppX configuration | Windows builds |
| Android Gradle Plugin / Gradle / SDK | 8.13.0 / 8.14.3 / target+compile 36, min 24 | Android builds and packaging | Android |
| Java / Swift / Swift Package Manager | JDK 21 source target; Swift toolchain supplied by Xcode 26 | Native host and package integration | Mobile build hosts |
| Xcode | 26+ required; unavailable here | Simulator, archive/signing | macOS build host |
| Node static server/build scripts | Project 1.0.0 | Local serving and dist generation | Web development |
| Cloudflare Pages headers | Static _headers; dashboard upload not performed | Selected documented hosting destination | Web; manual deployment |
| CI/CD | None implemented | Optional Pages Git integration is documented only | Not applicable |
