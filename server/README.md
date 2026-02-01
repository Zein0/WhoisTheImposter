# Who's The Imposter - WebSocket Server

Real-time multiplayer server for Who's The Imposter game.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload (development)
npm run dev
```

Server runs on `http://localhost:3000`

### Testing

```bash
# Health check
curl http://localhost:3000/health

# Check specific lobby
curl http://localhost:3000/lobby/ABC123
```

## Deployment

### Deploy to Railway (Recommended - 5 minutes)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize and deploy:**
```bash
cd server
railway init
railway up
```

4. **Get your URL:**
```bash
railway domain
```

Your server URL will be: `https://your-app.railway.app`

5. **Update app .env:**
```env
EXPO_PUBLIC_WS_SERVER_URL=wss://your-app.railway.app
```

**Note:** Railway free tier includes:
- 500 hours/month
- $5 credit/month
- Auto-scaling
- Zero config deployment

### Deploy to Render (Alternative)

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Click "Create Web Service"

Your URL: `https://your-app.onrender.com`

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd server
heroku create your-app-name

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main

# Get URL
heroku open
```

### Deploy to AWS (Advanced)

See AWS deployment guide in `/docs/aws-deployment.md`

## Environment Variables

No environment variables required by default. The server uses:
- `PORT` - Server port (default: 3000, auto-set by hosting platforms)

## API Endpoints

### HTTP Endpoints

**Health Check**
```
GET /health
Response: { status: 'ok', lobbies: 0, connections: 0 }
```

**Get Lobby Info**
```
GET /lobby/:code
Response: { code: 'ABC123', playerCount: 4, phase: 'discussion', hostId: 'xyz' }
```

### WebSocket Messages

All messages use JSON format:
```json
{
  "type": "MESSAGE_TYPE",
  "payload": { ... }
}
```

#### Client → Server Messages

**Create Lobby**
```json
{
  "type": "CREATE_LOBBY",
  "payload": {
    "hostId": "player-123",
    "settings": { "maxPlayers": 6, "imposterCount": 1, "timer": 180 }
  }
}
```

**Join Lobby**
```json
{
  "type": "JOIN_LOBBY",
  "payload": {
    "code": "ABC123",
    "player": { "id": "player-456", "name": "John" }
  }
}
```

**Leave Lobby**
```json
{
  "type": "LEAVE_LOBBY",
  "payload": {}
}
```

**Start Game**
```json
{
  "type": "START_GAME",
  "payload": {}
}
```

**Submit Votes**
```json
{
  "type": "SUBMIT_VOTES",
  "payload": {
    "playerId": "player-123",
    "votes": ["player-456", "player-789"]
  }
}
```

#### Server → Client Messages

**Lobby Created**
```json
{
  "type": "LOBBY_CREATED",
  "payload": { "code": "ABC123", "lobby": { ... } }
}
```

**Player Joined**
```json
{
  "type": "PLAYER_JOINED",
  "payload": { "player": { "id": "player-456", "name": "John" } }
}
```

**Game Started**
```json
{
  "type": "GAME_STARTED",
  "payload": {
    "word": "PIZZA",
    "isImposter": false,
    "phase": "revealing"
  }
}
```

**Error**
```json
{
  "type": "ERROR",
  "payload": { "message": "Lobby not found" }
}
```

## Features

- ✅ Real-time lobby system with 6-character codes
- ✅ Host controls (start, pause, settings)
- ✅ Automatic host migration on disconnect
- ✅ Player join/leave notifications
- ✅ Game state synchronization
- ✅ Voting system with vote tracking
- ✅ Automatic lobby cleanup (2 hour expiry)
- ✅ Connection health monitoring
- ✅ Error handling and reconnection support

## Monitoring

### Check Server Status

```bash
# Health check
curl https://your-server.com/health

# Response shows active lobbies and connections
{
  "status": "ok",
  "lobbies": 5,
  "connections": 23,
  "timestamp": "2026-01-30T12:00:00.000Z"
}
```

### View Logs

**Railway:**
```bash
railway logs
```

**Render:**
- View in dashboard under "Logs" tab

**Heroku:**
```bash
heroku logs --tail
```

## Scaling

### Horizontal Scaling

For high traffic, use Redis for shared state:

```bash
npm install redis
```

See `/docs/redis-scaling.md` for configuration.

### Vertical Scaling

Increase server resources in hosting platform:
- Railway: Upgrade plan
- Render: Select larger instance type
- Heroku: Scale dynos

## Troubleshooting

### Connection Issues

**Problem:** "WebSocket connection failed"

**Solutions:**
1. Check server is running: `curl https://your-server.com/health`
2. Verify URL in app `.env` starts with `wss://` (not `ws://`)
3. Check firewall allows WebSocket connections
4. Verify SSL certificate is valid (hosting platform handles this)

### Lobby Not Found

**Problem:** Players can't join lobby

**Solutions:**
1. Check lobby code is correct (case-sensitive)
2. Verify lobby hasn't expired (2 hour limit)
3. Check server logs for errors
4. Ensure host successfully created lobby

### Players Disconnecting

**Problem:** Players randomly disconnect

**Solutions:**
1. Implement ping/pong keep-alive (included in code)
2. Check client reconnection logic
3. Monitor server resources (CPU, memory)
4. Check for network issues

## Security

### Current Security

- CORS enabled for all origins (development friendly)
- No authentication required (lobby codes provide access control)
- Rate limiting not implemented

### Production Recommendations

1. **Add Rate Limiting:**
```bash
npm install express-rate-limit
```

2. **Restrict CORS:**
```javascript
app.use(cors({
  origin: ['https://your-app-domain.com']
}));
```

3. **Add Authentication (Optional):**
- JWT tokens for player identity
- Validate lobby host permissions

4. **Monitor for Abuse:**
- Limit lobby creation per IP
- Max connections per IP
- Ban malicious actors

## Performance

### Benchmarks

Tested on Railway free tier:
- ✅ 100 concurrent connections
- ✅ 20 active lobbies
- ✅ <50ms message latency
- ✅ <100MB memory usage

### Optimization Tips

1. **Enable compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Connection pooling:**
- Reuse WebSocket connections
- Implement connection limits

3. **State cleanup:**
- Current: 2-hour lobby expiry
- Consider: 30-minute idle lobbies

## Support

Issues? Check:
1. Server logs
2. Client console errors
3. Network tab in browser dev tools
4. Health endpoint status

For bugs, create issue in main repo.
