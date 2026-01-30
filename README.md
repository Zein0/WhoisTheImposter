# Who's The Imposter?

A multiplayer party game built with React Native and Expo where players try to identify the imposter among them.

## Features

### Game Modes
- **Local Mode (Free)**: Play with friends on a single device
- **Online Mode (Premium)**: Create online lobbies with unique codes for remote play

### Game Rules
- 2-6 players (free), 7-15 players (premium)
- Configurable number of imposters (0 to all players)
- 3-minute default timer (configurable from 1-10 minutes)
- Single voting round determines the winner
- Tie votes eliminate both players
- Imposters don't know their allies until voting

### Categories
**Free Categories:**
- General
- Food

**Premium Categories:**
- Movies, Countries, Music, Animals
- Everyday Objects, Brands, Clash Royale
- Footballers, Sports, Football Teams
- Content Creators, Video Games

### Monetization
- Weekly subscription for premium features
- Rate the app for 2 free premium categories
- Only lobby creator needs subscription for online play

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **TanStack React Query** for data fetching
- **Zustand** for state management
- **NativeWind** (TailwindCSS) for styling
- **React Native Reanimated** for animations
- **React Navigation** for navigation

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # App screens
├── stores/           # Zustand state stores
├── hooks/            # Custom React hooks
├── services/         # External services (WebSocket, etc.)
├── data/             # Static data (categories, words)
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── navigation/       # Navigation configuration
└── assets/           # Images, animations, etc.
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/WhoisTheImposter.git
cd WhoisTheImposter
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Run on your device
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Game Flow

### Local Mode
1. Create lobby → Add players → Select categories
2. Configure imposter count and timer
3. Each player holds to reveal their role privately
4. Discussion phase with countdown timer
5. Host can pause to start voting
6. Players vote on who they think is the imposter
7. Results reveal winners and imposters

### Online Mode
1. Host creates lobby (requires subscription)
2. Share 6-character code with friends
3. Players join using the code (no subscription needed)
4. Same game flow as local mode
5. Real-time sync via WebSocket

## Key Components

- **HoldToRevealButton**: Secure role reveal mechanism
- **Timer**: Animated countdown with urgency states
- **PlayerCard**: Player display with voting functionality
- **RatingPrompt**: Category unlock via app rating

## Stores

- **gameStore**: Core game state and logic
- **subscriptionStore**: Premium features and rating rewards
- **onlineStore**: Online lobby management
- **settingsStore**: User preferences

## Custom Hooks

- **useTimer**: Game timer logic
- **useVoting**: Vote management
- **useHoldToReveal**: Secure reveal interaction
- **useRatingIncentive**: Rating flow management

## TODO

- [ ] Add RevenueCat SDK integration
- [ ] Implement WebSocket server for online mode
- [ ] Add Lottie animations for game events
- [ ] Add sound effects
- [ ] Add haptic feedback
- [ ] Implement custom category creation
- [ ] Add more word categories
- [ ] Add localization support

## License

MIT License - see LICENSE file for details
