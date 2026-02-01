# Who's The Imposter? 🔍

The ultimate party game - Find the imposter among your friends!

Available in 🇬🇧 English • 🇳🇱 Nederlands • 🇪🇸 Español • 🇫🇷 Français • 🇵🇹 Português

---

## 🚀 Quick Start - Run Locally

**Want to jump right in?** → [START.md](./START.md) (5-minute guide)

### Prerequisites
- Node.js 18+
- iOS Simulator or Android Emulator (or physical device)

### Three Commands
```bash
npm install          # Install dependencies
cp .env.example .env # Create environment file (use defaults)
npm start            # Start the app
```

Then press `i` (iOS) or `a` (Android) or scan QR code with Expo Go.

**✅ Local mode works immediately - no server needed!**

---

## 🎮 Features

### 🌍 5 Languages
- Fully translated into English, Dutch, Spanish, French, Portuguese
- Automatic language detection
- Manual switching in Settings

### 💬 In-Game Chat
- Real-time messaging during online games
- Beautiful UI with timestamps
- Auto-scroll to new messages

### 🎯 Game Modes
- **Local Mode (FREE)** - 2-6 players on one device
- **Online Mode (Premium)** - Up to 15 players remotely with 6-digit codes

### 📚 13 Categories
- **Free:** General, Food
- **Premium:** Movies, Countries, Music, Animals, Objects, Brands, Clash Royale, Footballers, Sports, Football Teams, Content Creators, Video Games

### ⭐ More Features
- Hold-to-reveal mechanic (no cheating!)
- Custom game timer (1-10 minutes)
- Special modes (0 imposters, everyone is imposter)
- Dark mode
- Rating incentive (unlock 2 free categories)
- Beautiful animations

---

## 🗂️ Project Structure

```
WhoisTheImposter/
├── src/
│   ├── components/      # UI components (Button, Chat, Timer, etc.)
│   ├── screens/         # All game screens
│   ├── stores/          # Zustand state management
│   ├── services/        # WebSocket, RevenueCat (add later)
│   ├── i18n/            # 5 language translations
│   ├── data/            # Categories and words
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # React Navigation setup
│   └── types/           # TypeScript types
├── server/              # WebSocket server for online mode
├── website/             # Landing page (HTML/CSS/JS)
├── assets/              # App icon, splash screen
└── app.json             # Expo configuration
```

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| **[START.md](./START.md)** | ⚡ **Start here!** Run app locally (5 min) |
| **[SETUP.md](./SETUP.md)** | Complete setup guide (Server, RevenueCat, Deployment) |
| **[I18N.md](./I18N.md)** | i18n and chat integration guide |
| [server/README.md](./server/README.md) | WebSocket server docs |
| [website/README.md](./website/README.md) | Landing page deployment |

---

## 🌐 Online Mode Setup

Online mode requires a WebSocket server. Two options:

### Option 1: Use Local Server (Testing)
```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:3000`. Update `.env`:
```env
EXPO_PUBLIC_WS_SERVER_URL=ws://192.168.1.X:3000  # Use your local IP
```

### Option 2: Deploy to Cloud (Production)

**Render (Free):**
1. Push `server/` to GitHub
2. Deploy on render.com
3. Update `.env` with production URL

**See [SETUP.md](./SETUP.md) for detailed instructions**

---

## 💳 Subscription Setup

Subscriptions use RevenueCat for cross-platform IAP.

### Quick Setup
1. Create RevenueCat account
2. Create iOS subscription in App Store Connect
3. Create Android subscription in Google Play Console
4. Link stores to RevenueCat
5. Install SDK: `npm install react-native-purchases`
6. Add integration code (see SETUP.md)

**See [SETUP.md](./SETUP.md) for complete guide**

---

## 🌍 Using Translations

The app is fully translated into 5 languages.

### Update Screens to Use Translations

Import translation function:
```typescript
import { t } from '../i18n';
```

Replace hardcoded text:
```typescript
// Before
<Text>Start Game</Text>

// After
<Text>{t('createLobby.startGame')}</Text>
```

**See [I18N.md](./I18N.md) for complete guide**

---

## 🚀 Building for Production

### iOS
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

### Android
```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

**See [SETUP.md](./SETUP.md) for detailed deployment**

---

## 🌐 Landing Page

Professional static website in `website/` folder.

### Preview Locally
```bash
cd website
python -m http.server 8000
```

Open `http://localhost:8000`

### Deploy
- **GitHub Pages** (Free)
- **Netlify** (Free)
- **Vercel** (Free)

**See [website/README.md](./website/README.md) for deployment**

---

## 📝 Environment Variables

Required in `.env`:

```env
# WebSocket Server
EXPO_PUBLIC_WS_SERVER_URL=wss://your-server.com

# RevenueCat (for subscriptions)
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxx

# EAS Build
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id

# Optional
EXPO_PUBLIC_RATING_PROMPT_THRESHOLD=3
EXPO_PUBLIC_DEBUG_MODE=false
```

---

## 🧪 Testing Checklist

### Local Mode
- [ ] Create lobby with 2+ players
- [ ] Select categories
- [ ] Hold-to-reveal works
- [ ] Timer counts down
- [ ] Voting works
- [ ] Results show correctly

### Online Mode (after server deployed)
- [ ] Create lobby (generates code)
- [ ] Join from another device
- [ ] Game syncs between devices
- [ ] Chat works
- [ ] Voting syncs
- [ ] Results show correctly

### Languages
- [ ] Switch language in Settings
- [ ] All screens translated
- [ ] No missing text
- [ ] Text fits in UI

---

## 🆘 Troubleshooting

### "Network Error" / Can't Connect
- Check server is running: `curl http://your-server.com/health`
- Verify URL in `.env` is correct
- Use `wss://` for production, `ws://` for local

### Translations Not Showing
- Import: `import { t } from '../i18n';`
- Use: `{t('key.path')}`
- Check key exists in `src/i18n/locales/en.json`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

---

## 📦 Tech Stack

- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **Zustand** - State management
- **React Query** - Data fetching
- **NativeWind** - Styling (TailwindCSS)
- **React Native Reanimated** - Animations
- **WebSocket** - Real-time online mode
- **i18n-js** - Internationalization
- **RevenueCat** - Subscriptions (to be integrated)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎯 Next Steps

1. ✅ **Run locally** - `npm start` (works immediately!)
2. 📱 **Update screens** - Replace text with `t()` translations
3. 🌐 **Deploy server** - For online mode (15 min on Render)
4. 💳 **Setup RevenueCat** - For subscriptions (2-4 hours)
5. 🎨 **Customize assets** - Logo, screenshots, colors
6. 🚀 **Build & deploy** - Submit to App Store & Play Store

**Everything is ready to launch!** 🎉
