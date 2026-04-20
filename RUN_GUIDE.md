# Run Guide — Windows 11

Detailed, click-by-click setup for running Gift Remembrance on:

1. **[Android Studio emulator (AVD)](#path-a--android-studio-avd-recommended-for-dev)** — most reliable, free.
2. **[BlueStacks](#path-b--bluestacks-5)** — faster if you already have it installed.
3. **[LDPlayer](#path-c--ldplayer-9)** — alternative Android emulator.
4. **[Physical Android phone via USB](#path-d--physical-android-phone-via-usb)** — fastest iteration.
5. **[iPhone via EAS Build + Sideloadly](#path-e--iphone-via-eas-build--sideloadly-7-day-expiry)** — no Mac needed, 7-day cert expiry.

This file assumes you have already cloned the repo and run `npm install`. If not:

```powershell
cd C:\Users\Winka\OneDrive\Documents
git clone https://github.com/Winka173/gift-remembrance.git
cd gift-remembrance
npm install
```

---

## Prerequisites (all paths)

### Node.js 20+
Verify:
```powershell
node -v
```
If missing or < 20: download from https://nodejs.org/ → pick the **LTS** installer (`.msi`) → default options → reboot PowerShell after install.

### Java JDK 17 (required for Android builds)
Download **Eclipse Temurin 17** (free, open): https://adoptium.net/temurin/releases/?version=17
- Pick **Windows x64 → JDK → .msi**
- Installer → check "Set JAVA_HOME variable" and "Add to PATH" → Install.
- Verify:
  ```powershell
  java -version
  echo $env:JAVA_HOME
  ```

Both must print a value. If `JAVA_HOME` is empty, set it manually:
- Start → type "environment variables" → "Edit the system environment variables" → "Environment Variables…" → System variables → New → `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.0.X-hotspot` (adjust to your exact path) → OK → **restart PowerShell**.

### Git
Already installed if you cloned this repo. Otherwise: https://git-scm.com/download/win.

---

## Path A — Android Studio AVD (recommended for dev)

**Why this path:** It's the reference emulator Google ships. Every React Native / Expo module is tested against it. Slowest to boot but 99% compatible.

### A1. Download Android Studio

1. Go to https://developer.android.com/studio
2. Click **Download Android Studio Ladybug** (or current stable) → accept terms → download **`.exe`** (~1.2 GB).
3. Run installer → **Next** through all defaults → finish. Launch Android Studio at the end.

### A2. SDK setup

First launch: **Setup Wizard** appears.
1. **Welcome** → Next.
2. Install Type → **Standard** → Next.
3. UI Theme → pick anything → Next.
4. Verify Settings — shows what's downloading (~4 GB) → **Next** → **Finish**. Wait for download.

After setup finishes, at the Welcome window:
5. Click **More Actions** (top-right dropdown) → **SDK Manager**.
6. **SDK Platforms** tab → check **Android 14 (UpsideDownCake)** API level 34 → Apply.
7. **SDK Tools** tab → check:
   - ✅ Android SDK Build-Tools 34.x
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ Google Play services
   - ✅ Intel x86 Emulator Accelerator (HAXM installer) — only if prompted on Intel CPUs. Skip on AMD/Ryzen; use Windows Hypervisor Platform instead (step A3).

   Click **Apply** → **OK** → accept licenses → wait.

### A3. Enable hypervisor (required for emulator speed)

On AMD (Ryzen) or modern Intel:
1. Start → type **"Turn Windows features on or off"** → open.
2. Check:
   - ✅ **Windows Hypervisor Platform**
   - ✅ **Virtual Machine Platform**
3. Click **OK** → reboot when prompted.

Also ensure **SVM / VT-x is enabled in BIOS** (almost always on by default on modern machines; check only if the emulator refuses to start). BIOS key is usually F2/F10/Del on boot.

### A4. Create a virtual device (AVD)

Back in Android Studio Welcome window:
1. **More Actions** → **Virtual Device Manager**.
2. Click **Create Device**.
3. **Phone** category → pick **Pixel 7** (or Pixel 6) → Next.
4. System Image → **Recommended** tab → click **Download** next to **UpsideDownCake / API 34 / Google Play**. Wait ~1.5 GB.
5. After download, select it → Next.
6. AVD Name: leave default (e.g. "Pixel 7 API 34") → **Finish**.
7. In Device Manager, click the **▶ Play** button next to your AVD. First boot takes 1–3 min.

The emulator opens in its own window. Leave it running.

### A5. Environment variables

Set these so Expo CLI + `adb` can find the SDK.

Start → "environment variables" → System variables → New:
- `ANDROID_HOME` = `C:\Users\Winka\AppData\Local\Android\Sdk`
- `ANDROID_SDK_ROOT` = same value

Edit **Path** → add:
- `%ANDROID_HOME%\platform-tools`
- `%ANDROID_HOME%\emulator`
- `%ANDROID_HOME%\cmdline-tools\latest\bin`

OK → **restart PowerShell**. Verify:

```powershell
adb --version
adb devices
```

`adb devices` should show your running AVD as `emulator-5554 device`.

### A6. Build & run

In the project root PowerShell:
```powershell
npx expo prebuild --clean
npx expo run:android
```

First `run:android` takes ~10–15 min (Gradle downloads ~500 MB of Android-side deps). After finish, the app auto-launches on the AVD.

Subsequent runs: just `npx expo start` — JS reloads over the already-built native dev client. Only re-run `expo run:android` when you add a new native dependency.

---

## Path B — BlueStacks 5

**Why this path:** You may already have it installed. Faster to launch than AVD, but uses an older Android version that sometimes chokes on newer React Native releases.

### B1. Install BlueStacks

1. Download: https://www.bluestacks.com/download.html → **Download BlueStacks 5**.
2. Run the installer → pick install location → Install.
3. First launch takes a few minutes. Sign into Google Play if prompted.

### B2. Pick the right instance

BlueStacks ships multiple Android versions via "Instance Manager":
1. Click the **Instance Manager** icon (bottom-right dock, looks like a monitor).
2. If the default instance is Android 7 (Nougat 32-bit), click **+ New Instance** → **Fresh Instance** → choose **Pie 64-bit** or **Android 11 (Rooted)** if available → **Download**.
3. Start the Android 11 instance (newer is always safer with modern RN).

### B3. Enable ADB

1. In BlueStacks, click the **gear** icon (top-right) → **Settings**.
2. **Advanced** tab → check ✅ **Android Debug Bridge (ADB)**.
3. **Save changes**.
4. The settings panel shows a line like: `ADB Port: 127.0.0.1:5565` (the number varies per instance). Copy this.

### B4. Connect and run

```powershell
adb connect 127.0.0.1:5565      # use the port BlueStacks showed
adb devices                      # should list BlueStacks
npx expo prebuild --clean
npx expo run:android
```

If `adb` isn't found, you skipped Path A step **A5** — do that first (install Android Studio SDK for the platform-tools).

Known issue: BlueStacks sometimes refuses `adb install` with "INSTALL_FAILED_UPDATE_INCOMPATIBLE" after you reinstall the app. Uninstall the old copy in BlueStacks (long-press icon → Uninstall) and retry.

---

## Path C — LDPlayer 9

**Why this path:** Alternative emulator; some people prefer its UI/perf over BlueStacks.

### C1. Install LDPlayer

1. Download: https://www.ldplayer.net/ → pick **LDPlayer 9** with Android 9 or Android 11 image. Prefer Android 11.
2. Installer → defaults → Install.

### C2. Enable ADB

1. Launch LDPlayer → click the **gear** icon on the right toolbar.
2. **Other settings** → **ADB debugging** → select **Local connection**. Enable.
3. Save. Note the default port: `127.0.0.1:5555` (confirm in the settings screen).

### C3. Connect and run

Same as BlueStacks:
```powershell
adb connect 127.0.0.1:5555
adb devices
npx expo prebuild --clean
npx expo run:android
```

---

## Path D — Physical Android phone via USB

**Why this path:** Fastest iteration once set up, no emulator overhead, real hardware (camera, haptics, biometrics all work).

### D1. Enable Developer Mode on the phone

1. Phone → **Settings → About phone**.
2. Tap **Build number** 7 times. A toast says "You are now a developer".
3. Back → **Settings → System → Developer options** (location varies by brand).
4. Enable ✅ **USB debugging**.

### D2. Connect

1. Plug the phone into the PC via USB. Use the **cable that came with the phone** — cheap cables are often charge-only.
2. On the phone, a dialog appears: **"Allow USB debugging?"** → check **Always allow from this computer** → Allow.
3. In PowerShell:
   ```powershell
   adb devices
   ```
   Your phone appears (e.g. `R3CN70XXXXX    device`).

   If it shows `unauthorized`: check the phone dialog and allow.
   If blank: plug-unplug, or try a different USB port/cable.

### D3. Build & run

```powershell
npx expo prebuild --clean
npx expo run:android
```

The app installs and launches on your physical phone. `npx expo start` thereafter hot-reloads JS over WiFi (as long as phone + PC are on the same WiFi).

---

## Path E — iPhone via EAS Build + Sideloadly (7-day expiry)

**Why this path:** The only way to get the app on an iPhone from Windows without owning a Mac. Free Apple ID works — no paid Developer account needed — but provisioning expires every 7 days.

### E1. Install tools on PC

1. **EAS CLI** (cloud build service):
   ```powershell
   npm install -g eas-cli
   eas --version
   ```

2. **Expo account**: https://expo.dev/signup → free account.

3. **Sideloadly**: https://sideloadly.io/ → download **Windows x64** → run installer → default options.

4. **iTunes** (Sideloadly needs Apple's USB drivers): https://support.apple.com/en-us/HT210384 → download **iTunes for Windows 10+ 64-bit** from Apple. Install. You won't actually use iTunes — Sideloadly just needs the drivers it bundles.

### E2. Log into EAS

In project root PowerShell:
```powershell
eas login
# enter your Expo email + password
eas whoami
```

### E3. Configure EAS build profile

One-time setup:
```powershell
eas build:configure
```
- Select: **iOS** when prompted → creates `eas.json` in the project root.
- Open the generated `eas.json` and ensure there's a `development` profile:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": false }
    }
  }
}
```

Commit:
```powershell
git add eas.json
git commit -m "chore: add eas build config"
```

### E4. Generate an IPA for sideloading

```powershell
eas build --profile development --platform ios
```

When EAS asks "Do you want EAS to manage your Apple credentials?":
- If you have a free Apple ID: login with it when prompted. EAS generates a 7-day development cert tied to your Apple ID.
- EAS will also ask for a device UDID — get it from **Settings → General → About → scroll to Identifier** on your iPhone. Or plug in iPhone and use `eas device:create`.

The build takes ~15 min in the cloud. When done, EAS gives you a URL → **Download build** → save the `.ipa` file to your PC.

### E5. Sideload with Sideloadly

1. Plug iPhone into PC via USB. Unlock the phone. If the phone asks **"Trust This Computer?"** → Trust.
2. Open **Sideloadly**.
3. Drag the downloaded `.ipa` onto the Sideloadly window (or click the paperclip icon to browse).
4. **Apple ID** field: enter your Apple ID email.
5. Click **Start**. Enter your Apple ID password when prompted.
6. Sideloadly signs the app with your free Apple ID cert and installs it. ~2–3 min.
7. When done, the app appears on your home screen.

### E6. Trust the developer certificate on iPhone

First launch shows "Untrusted Developer":
1. iPhone → **Settings → General → VPN & Device Management**.
2. Under **Developer App**, tap your Apple ID email.
3. Tap **Trust** → confirm.

### E7. Run Metro from Windows

```powershell
npx expo start --dev-client
```

On the iPhone, tap to open the Gift Remembrance app. It should find the Metro dev server (phone + PC must be on the same WiFi). If it doesn't auto-connect: shake the phone → "Change bundle location" → enter `http://<your-PC-LAN-IP>:8081`.

Find your LAN IP:
```powershell
ipconfig
# look for IPv4 Address under your active WiFi adapter
```

### E8. Every 7 days

The cert Sideloadly issued expires. The app icon will grey out and refuse to open.
1. Plug in iPhone → open Sideloadly → drag the **same `.ipa`** → Start.
2. Sideloadly re-signs and re-installs. Your on-device data survives (MMKV + photos persist across re-installs via the same bundle id).

---

## Troubleshooting

### "SDK location not found"
- Confirm `ANDROID_HOME` is set and PowerShell was restarted.
- Create `android/local.properties` with:
  ```
  sdk.dir=C\:\\Users\\Winka\\AppData\\Local\\Android\\Sdk
  ```

### Gradle build fails on `:app:mergeReleaseNativeLibs`
- Happens when two native libs ship conflicting `.so` files. Clean and retry:
  ```powershell
  cd android
  ./gradlew clean
  cd ..
  npx expo run:android
  ```

### Emulator: "This device is missing Google Play services"
- You picked a non-Play system image. In AVD Manager, delete and re-create picking an image marked **Google Play** (has the Play Store icon).

### MMKV / Nitro crash at runtime ("NitroModules could not find…")
- You ran `npx expo start` against a device that was built before `react-native-nitro-modules` was installed. Rebuild:
  ```powershell
  npx expo prebuild --clean
  npx expo run:android
  ```

### iOS bundle hangs at 99%
- Metro has a known issue with `expo-router`'s typed routes on first build. Delete cache:
  ```powershell
  npx expo start -c
  ```

### "INSTALL_FAILED_USER_RESTRICTED" on BlueStacks
- BlueStacks requires you to enable "Allow from unknown sources" inside the emulator: Settings → Apps & Notifications → Special app access → Install unknown apps → BlueStacks → Allow.

### Reanimated "ReanimatedError: JS threading"
- Confirm `babel.config.js` has `'react-native-worklets/plugin'` as the **last** plugin.
- Clear Metro cache: `npx expo start -c`.
- If still broken, delete `node_modules` and `npm install` again.

---

## What's my recommended path?

1. **Dev iteration:** Path A (Android Studio AVD) — most reliable.
2. **Fastest real-device testing:** Path D (Android phone via USB) — 1-second reloads over WiFi.
3. **iPhone smoke testing before release:** Path E (EAS + Sideloadly) — every ~7 days.

For daily coding I'd use Path A. BlueStacks/LDPlayer (Paths B/C) are fine if you already have them but sometimes lag behind on Android updates.

---

**Last updated:** 2026-04-19
