# Validation record

Verified on **13 November 2026 (Asia/Calcutta)**. Results distinguish executed checks from intended compatibility.

## Automated results

- `npm run check`: PASS; JavaScript syntax checks.
- `npm run build`: PASS; final production web bundle and content-versioned offline worker.
- `npm test`: **26 passed, 0 failed**. Full TAP output: TEST-RESULTS.txt.
- Rules: 1,000 rapid domain activations, target 108 and custom 54, mala boundaries/custom mala, undo at zero and below completion, pause/resume elapsed time, discard/reset, finish without duplication, date boundaries, preserved session settings, Unicode persistence, valid/invalid backups, idempotent duplicate handling and timezone-preserving imports.
- Persistence: roundtrip, version-0 migration, quota error, corrupt primary fallback, both copies corrupt, interrupted repair preserving the sole valid recovery slot.
- Offline/build: all precached files exist, root navigation and query-string asset fetches work with network unavailable in the worker harness, activation requires explicit message, earlier caches are retained, non-GET/cross-origin requests are untouched, manifest PNGs are real and bridge code is bundled.
- Accessibility: core foreground/background tokens meet 4.5:1 normal-text contrast; focus, reduced-motion and minimum control-height rules exist. These tests are not an accessibility certification or a replacement for assistive-technology testing.
- `npx --no-install cap sync`: PASS for both Android and iOS, all four native plugins registered. Generated Xcode and Gradle projects included.
- Production-only dependency audit: **0 findings**; machine-readable result in AUDIT-PRODUCTION.json. Full toolchain audit: six moderate findings in electron-builder/minimatch development chain. Recheck upstream fixes before release; incompatible forced overrides were not used.

## Actual browser observations

Chrome **157.0.8103.78**, installed on Windows 11 build 26200, and the connected Codex in-app browser were used. The primary real-browser offline/update checks used http://127.0.0.1:4173/ to isolate test storage from an earlier localhost test tab.

- In-app browser: 3 clicks then undo displayed 2; reload restored count 2 paused. Added a Devanagari mantra through the library form and observed its saved tile.
- Chrome: set target 27, clicked 28 times, undid once; count 27 remained at target with a quiet completion message. No forced reset/modal occurred.
- Stopped the local server process, reloaded Chrome, observed saved count 27 paused. Resumed and counted while the server remained stopped; count became 28. This is an actual offline reload/count check, separate from the simulated worker tests. The connection indicator can still say online when only the local server is stopped; network reachability and navigator.onLine are different signals.
- Restarted server with a changed production bundle. Observed Save & update. Accepted it, reloaded into the replacement and retained 28 repetitions, paused. Repeated explicit updates while finalizing responsive changes; no count loss observed.
- Layout checks: desktop, 390×844 phone, 320×720 narrow phone, 844×390 landscape and 768×1024 tablet viewport simulations. Found 320px navigation overflow, fixed by stacking icons/labels; final measured content width 305px within a 320px viewport with scrollbar. Other observed content widths were within the viewport. These are simulated viewport checks, not physical foldable/safe-area tests.
- Settings dark theme selection and form/native control accessibility labels observed. Per-repetition announcements remain disabled by default; target completion is a separate polite status.
- Multiple-tab protection observed: second writer refused with an explicit close-other-tab/reload message.

## Native and packaging results

**Windows:** `electron-builder --win nsis --publish never --config.electronDist=node_modules/electron/dist` succeeded using electron-builder 26.18.0 and Electron 45.3.1. Output `release/Still Setup 1.0.0.exe` is unsigned; packaging log is WINDOWS-BUILD-RESULTS.txt. The secure-origin/sandboxed host source is included.

`npm run windows:test` supplies an isolated render/count/persistence smoke harness. The actual attempt was blocked before app startup: Windows application-container ACLs did not permit Electron's sandboxed process to read its runtime directory. No sandbox disabling or broad ACL changes were made. Therefore Windows runtime/installer usability is **not verified**, despite successful packaging. No signed AppX/store build was attempted because actual publisher identity, signing and account details are absent.

**Android:** generated project and plugin sync passed. Ran `android/gradlew.bat -p android assembleDebug` with a project-local Gradle cache; Gradle 8.14.3 downloaded successfully. Build failed at Android plugin initialization because the selected local JDK was 11 (AGP needs at least 17, and Capacitor's Java source target needs 21). No suitable JDK 21/Android SDK build environment or device was available. No APK/AAB or device compatibility claim is made.

**iOS:** Xcode project, Swift delegates, SPM dependencies and native resources generated/synced. Deployment target 15.4 and privacy-manifest resource configured. This Windows host cannot run Xcode; simulator, archive, signing, App Store validation, VoiceOver and device behavior remain unverified.

## Remaining release checks

- Current Safari, Firefox and Edge; minimum browser versions; iOS/Android native execution and mobile PWA installation.
- Physical small/large phones, tablets and foldables; real safe areas, landscape, touch, display scaling and large accessibility text/200% zoom.
- VoiceOver/TalkBack/Narrator and keyboard-only end-to-end flows; complete contrast/nontext/focus audits.
- Native audio/haptics, native import/export/share pickers, private-mode behavior, persistent-storage denial, quota exhaustion, process kill/reboot, cross-device backup transfer and repeated upgrades with old tabs open.
- Signed Windows installer/AppX, actual installer launch/uninstall/update behavior on clean devices and certification kit.
- Signed Android AAB, native page-size checks, Play tracks; signed iOS archive/TestFlight; privacy disclosure review and all store certification.
- Public HTTPS deployment, domain verification and live-host offline/PWA/update checks. No live URL exists.

## Reproduction

```sh
npm ci
npm run build
npm run check
npm test
npm run preview
```

Open http://localhost:4173/. Use README.md for complete platform/release commands and configuration examples. To reproduce the offline check, load and cache online, stop this local server, reload/count, then restart with a changed bundle and accept Save & update. Keep a backup before clearing any browser storage.
