# Setup Guide - Who's The Imposter?

Quick setup guide covering WebSocket deployment, RevenueCat subscriptions, and app deployment.

---

## Prerequisites

### Required Accounts
- **Apple Developer Account** ($99/year) - iOS deployment
- **Google Play Developer Account** ($25 one-time) - Android deployment
- **Expo Account** (free) - EAS Build
- **RevenueCat Account** (free tier) - Subscriptions

### Required Tools
```bash
# Verify Node.js 18+
node --version

# Install Expo and EAS CLI
npm install -g expo-cli eas-cli

# Login to Expo
eas login
```

---

## 1. Environment Configuration

### Create Environment File
```bash
cp .env.example .env
```

### Configure Variables
Edit `.env`:
```env
# WebSocket server (see deployment section)
EXPO_PUBLIC_WS_SERVER_URL=wss://your-server.com

# RevenueCat API keys (see RevenueCat section)
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxx

# EAS Project ID
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id
```

### Update app.json
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.whoistheimposter"
    },
    "android": {
      "package": "com.yourcompany.whoistheimposter"
    },
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    }
  }
}
```

---

## 2. WebSocket Server Deployment

Choose one option based on your needs:

### Option A: Railway (Recommended)
**Cost:** ~$2-5/month | **Pros:** No cold starts, reliable, easy

```bash
# Install CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd server
railway init
railway up
railway domain
```

Your URL: `wss://your-app.railway.app`

### Option B: Render (Free Tier)
**Cost:** FREE (750 hrs/month) | **Pros:** 100% free | **Cons:** Cold starts

1. Push server code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Create **New Web Service**
4. Connect GitHub repo
5. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Deploy and get URL

Your URL: `wss://your-app.onrender.com`

**Prevent cold starts:** Use [cron-job.org](https://cron-job.org) to ping `/health` every 10 minutes

### Option C: Fly.io (Power Users)
**Cost:** 3 VMs free | **Pros:** No cold starts, always-on

```bash
# Install and login
brew install flyctl
flyctl auth login

# Deploy
cd server
flyctl launch
flyctl deploy
flyctl info
```

Your URL: `wss://your-app.fly.dev`

### Update Environment
Add server URL to `.env`:
```env
EXPO_PUBLIC_WS_SERVER_URL=wss://your-server-url
```

---

## 3. RevenueCat Setup

### Initial Setup

1. Create account at [app.revenuecat.com](https://app.revenuecat.com)
2. Create new app:
   - **Name:** Who's The Imposter
   - **Bundle ID (iOS):** `com.yourcompany.whoistheimposter`
   - **Package (Android):** `com.yourcompany.whoistheimposter`
3. Get API keys from **Settings → API Keys**
4. Add to `.env`:
```env
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxx
```

### iOS Setup

**1. Create Subscription in App Store Connect**
1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Select app → **Features → In-App Purchases**
3. Create subscription:
   - **Product ID:** `com.yourcompany.whoistheimposter.weekly`
   - **Type:** Auto-Renewable Subscription
   - **Duration:** 1 Week
   - **Price:** $4.99
   - **Subscription Group:** Premium Access

**2. Link to RevenueCat**
1. In App Store Connect: **Users & Access → Keys → In-App Purchase**
2. Generate API key, download `.p8` file
3. In RevenueCat: **App Store Connect Integration**
4. Upload `.p8` file, enter Issuer ID and Key ID

**3. Configure Product in RevenueCat**
1. Go to **Products** → **Add Product**
2. Enter Product ID: `com.yourcompany.whoistheimposter.weekly`
3. Type: Subscription, Duration: Weekly

### Android Setup

**1. Create Subscription in Google Play Console**
1. Go to [play.google.com/console](https://play.google.com/console)
2. Select app → **Monetize → Subscriptions**
3. Create subscription:
   - **Product ID:** `com.yourcompany.whoistheimposter.weekly`
   - **Billing period:** 1 Week
   - **Price:** $4.99
   - **Free trial:** 7 days (optional)
4. Activate subscription

**2. Link to RevenueCat**
1. Google Play Console: **Setup → API Access**
2. Create service account in Google Cloud Console
3. Download JSON key file
4. Grant "Admin" access to service account
5. RevenueCat: Upload JSON key file

**3. Configure Product in RevenueCat**
1. **Products** → **Add Product**
2. Product ID: `com.yourcompany.whoistheimposter.weekly`
3. Platform: Android

### Create Entitlements & Offerings

**Entitlements:**
1. **Entitlements** → **Add Entitlement**
2. Identifier: `premium`
3. Attach iOS and Android products

**Offerings:**
1. **Offerings** → Edit "default"
2. Add package:
   - **Identifier:** weekly
   - **Type:** Weekly
   - **Product:** Select both iOS and Android products

### Testing Subscriptions

**iOS (Sandbox):**
1. App Store Connect → **Users & Access → Sandbox Testers**
2. Add tester with unique email
3. Build with `eas build --profile preview`
4. Install on physical device
5. Sign out of App Store, test purchase with sandbox account

**Android (License Testing):**
1. Play Console → **Setup → License Testing**
2. Add your Google account email
3. Upload to Internal Testing track
4. Test purchase (no money charged)

---

## 4. App Deployment

### Initialize EAS

```bash
# First time only
eas init
eas build:configure
```

This creates `eas.json` with build profiles.

### iOS Deployment

**Build:**
```bash
# Preview (testing)
eas build --platform ios --profile preview

# Production (TestFlight/App Store)
eas build --platform ios --profile production
```

**Submit to TestFlight:**
```bash
eas submit --platform ios --latest
```

Or manually upload `.ipa` via [App Store Connect](https://appstoreconnect.apple.com)

### Android Deployment

**Build:**
```bash
# Preview (testing)
eas build --platform android --profile preview

# Production (Play Store)
eas build --platform android --profile production
```

**Submit to Google Play:**
```bash
eas submit --platform android --latest
```

Or manually upload `.aab` via [Play Console](https://play.google.com/console)

### Over-The-Air Updates

For JavaScript-only changes:
```bash
eas update --branch production --message "Bug fixes"
```

Users get updates on next app restart.

For native changes (dependencies, permissions):
```bash
# Increment version in app.json first
eas build --platform all --profile production
eas submit --platform all --latest
```

---

## 5. Testing Checklist

### App Testing
- [ ] Local mode works offline
- [ ] Online mode connects to server (if subscribed)
- [ ] Subscription flow works on both platforms
- [ ] Rating prompt appears after games
- [ ] Dark mode works correctly
- [ ] All languages display properly
- [ ] No crashes on different OS versions

### Server Testing
- [ ] WebSocket connections establish
- [ ] Lobby creation and joining works
- [ ] Game state syncs across devices
- [ ] Voting system works
- [ ] Disconnections handled gracefully
- [ ] Reconnection logic works

### Subscription Testing
- [ ] New subscription purchase
- [ ] Restore purchases works
- [ ] Subscription status checked correctly
- [ ] RevenueCat dashboard shows purchases
- [ ] Entitlements unlock features

---

## 6. Production Checklist

Before submitting to stores:

- [ ] Remove all console.logs
- [ ] Test on multiple devices
- [ ] Verify privacy policy URL
- [ ] Verify terms of service URL
- [ ] Test offline mode
- [ ] Add app screenshots
- [ ] Write app description
- [ ] Set age rating correctly
- [ ] Test IAP restoration
- [ ] Configure app permissions

---

## Common Issues

### "Keystore not found" (Android)
```bash
eas credentials --platform android
```

### WebSocket connection fails
- Check server is running: `curl https://your-server.com/health`
- Verify `EXPO_PUBLIC_WS_SERVER_URL` in `.env`
- Ensure using `wss://` not `ws://`

### "Cannot connect to iTunes Store" (iOS)
- Use physical device (not simulator)
- Sign out of App Store in Settings
- Use sandbox tester account
- Verify product ID matches exactly

### "Item unavailable" (Android)
- Wait 24 hours after creating product
- Ensure product is "Active" in Play Console
- Check license tester is configured
- Reinstall app from Play Store

### Purchases not in RevenueCat
- Check API key is correct
- Verify store integration completed
- Wait 5-10 minutes for sync
- Check RevenueCat dashboard for errors

---

## Cost Summary

### Monthly Costs
- **WebSocket Server:**
  - Railway: ~$2-5/month
  - Render: FREE (or $7/month paid)
  - Fly.io: FREE (within limits)

- **RevenueCat:** FREE (up to $10k revenue/month)
- **EAS Build:** FREE (for indie devs)
- **App Store:** $99/year
- **Play Store:** $25 one-time

**Total monthly:** $2-10 (after initial setup costs)

---

## Resources

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [RevenueCat Docs](https://docs.revenuecat.com/)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs)
- [App Store Connect](https://developer.apple.com/app-store-connect/)
- [Google Play Console](https://support.google.com/googleplay/android-developer)

---

## Quick Reference

### Deploy Server (Railway)
```bash
railway login
cd server
railway init
railway up
railway domain
```

### Build iOS App
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

### Build Android App
```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

### Update App (OTA)
```bash
eas update --branch production --message "Description"
```

### Check Server Logs
```bash
# Railway
railway logs

# Render
# Dashboard → Logs tab

# Fly.io
flyctl logs
```
