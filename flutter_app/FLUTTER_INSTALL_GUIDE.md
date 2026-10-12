# 📱 Gondar Traffic Bajaj Control - Flutter & Supabase Mobile App Guide

This guide walks you through setting up **Supabase**, running the **Flutter app**, and installing the **APK** directly onto your phone.

---

## 🗄️ Step 1: Set up Supabase in 2 Minutes (Free)

1. Go to [supabase.com](https://supabase.com) and create a free project named `gondar-traffic`.
2. In the Supabase Dashboard, click on **SQL Editor** on the left menu.
3. Paste the **whole** file `supabase/migrations/20261012000000_shared_realtime_backend.sql` into the SQL editor
   and click **Run**. **Required** – it creates all tables, realtime sync with the ERP website, the inspections
   log and secure (hashed) login.
4. Optional: run `flutter_app/supabase_schema.sql` the same way to add sample vehicles and reports.
5. Go to **Project Settings** (gear icon) → **API**:
   - Copy **Project URL** (e.g. `https://xxxx.supabase.co`)
   - Copy **Project API Key (anon/public)**.
6. In `flutter_app/lib/main.dart`, paste them into (and use the **same** values for the website, see the root `README.md`):
   ```dart
   await Supabase.initialize(
     url: 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co',
     anonKey: 'YOUR_SUPABASE_ANON_PUBLIC_KEY',
   );
   ```

---

## 💻 Step 2: Open and Run with Flutter

Ensure you have Flutter installed ([flutter.dev](https://flutter.dev)).

```bash
# 1. Navigate to the flutter_app directory
cd flutter_app

# 2. Get packages
flutter pub get

# 3. Connect your Android or iOS phone via USB (with USB Debugging turned ON)
# Verify your phone is recognized:
flutter devices

# 4. Run the app on your phone
flutter run
```

---

## 📲 Step 3: Build & Install the APK on Your Android Phone

To generate a standalone `.apk` install file that you can send over Telegram, WhatsApp, or install directly:

```bash
# Generate release APK
flutter build apk --release
```

The APK file will be created at:
```
flutter_app/build/app/outputs/flutter-apk/app-release.apk
```

### Installing on your phone:
- Connect phone via USB:
  ```bash
  flutter install
  ```
  *(Or simply transfer `app-release.apk` to your phone via USB or Telegram and tap to Install).*

---

## 🚦 Features Included in this Mobile Codebase:
1. **Live Camera QR Code Scanner** (`mobile_scanner`): Point camera at the Bajaj sticker to scan and verify immediately.
2. **Supabase Cloud Backend**: Real queries by Digital ID, Plate Number (`AA-12345`), and VIN.
3. **Validity First Screen**: Displays the large Green (`VALID`) or Amber (`EXPIRED`) verdict first, with driver photo, plain-text phone, and Kebele address.
4. **Full Details Page**: Detailed 15-attribute technical inspection card.
5. **Live sync with the ERP website**: every inspection and violation report shows up on the HQ dashboard instantly.
6. **Offline outbox**: with no network, reports are saved on the phone and uploaded automatically later.
