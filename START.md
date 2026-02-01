# 🚀 Start Here - Run the App Locally

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

**You can use the default values for local testing - no need to change anything!**

### 3. Start the App
```bash
npm start
```

### 4. Choose Platform

**iOS Simulator:**
- Press `i` in terminal
- Requires Xcode installed

**Android Emulator:**
- Press `a` in terminal
- Requires Android Studio installed

**Physical Device:**
- Install **Expo Go** app from App Store/Play Store
- Scan the QR code shown in terminal

---

## ✅ What Works Immediately

**Local Mode** - Play right away!
- Create lobby
- Add players (2-6)
- Select categories
- Play the game

**No server or subscriptions needed for local mode!**

---

## 🌐 To Test Online Mode

### Start WebSocket Server
```bash
# In a new terminal
cd server
npm install
npm start
```

Server runs on `http://localhost:3000`

### Update Environment
Find your local IP:
```bash
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

Update `.env`:
```env
EXPO_PUBLIC_WS_SERVER_URL=ws://192.168.1.X:3000  # Use YOUR IP
```

### Test on 2 Devices
- Device A: Create online lobby
- Device B: Join with code
- Play together!

---

## 📱 Preview Landing Page

```bash
cd website
python -m http.server 8000
```

Open `http://localhost:8000` in browser

---

## 🌍 Test Languages

1. Run app: `npm start`
2. Open on device
3. Go to Settings → Language
4. Select: English, Dutch, Spanish, French, or Portuguese

**Note:** Most screens need updating to use translations. See [I18N.md](./I18N.md)

---

## 🆘 Common Issues

### "Metro bundler error"
```bash
npm start -- --clear
```

### "Can't connect to development server"
- Make sure you're on the same WiFi network
- Check firewall isn't blocking connections

### iOS Simulator not found
```bash
# Install Xcode from App Store
# Open Xcode once to install components
```

### Android emulator not found
```bash
# Install Android Studio
# Open AVD Manager and create a device
```

---

## 📖 Next Steps

Once you've tested locally:

1. **Update translations** - See [I18N.md](./I18N.md)
2. **Deploy server** - See [SETUP.md](./SETUP.md) (15 min on Render)
3. **Setup subscriptions** - See [SETUP.md](./SETUP.md) (2-4 hours)
4. **Build & deploy** - See [SETUP.md](./SETUP.md)

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Project overview & quick reference |
| [SETUP.md](./SETUP.md) | Complete setup & deployment guide |
| [I18N.md](./I18N.md) | i18n and chat integration |
| [server/README.md](./server/README.md) | WebSocket server docs |
| [website/README.md](./website/README.md) | Landing page deployment |

---

**You're all set!** 🎉

Run `npm start` and start testing the app!
