# Quiz App - Setup and Run Instructions

## 🚀 Quick Start

### Option 1: Start Everything Together (Recommended)
```bash
npm run start-all
```
This will start both the server and the Expo development server simultaneously.

### Option 2: Start Separately
```bash
# Terminal 1: Start the server
npm run server

# Terminal 2: Start the Expo app
npm start
```

### Option 3: Use the Batch File (Windows)
Double-click on `start-all.bat` to start everything automatically.

## 📱 Production APK

The app has been built with the production server URL and is ready for deployment:

**Download APK**: https://expo.dev/artifacts/eas/s2qCFFWHi6PbCYuigqyfHT.aab

### Production Server Configuration
- **Server URL**: `https://quizzer-paov.onrender.com`
- **No local server required** - The APK connects directly to the production backend
- **Works anywhere** - As long as you have internet connection

## 🔧 Server Configuration

### Development Server
- **Local**: `http://localhost:3000`
- **Network**: `http://10.0.2.2:3000` (for Android emulator)

### Production Server
- **URL**: `https://quizzer-paov.onrender.com`
- **Always available** - No need to start local server
- **Used in APK** - Production build connects to this URL

## 📋 Available Scripts

- `npm run start-all` - Start server and Expo together
- `npm run server` - Start only the server
- `npm start` - Start only the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## 🌐 Network Setup

### For Development
For devices on the same network:
1. Find your computer's IP address (run `ipconfig` in Windows)
2. Update the server URL in the app to use your IP instead of `10.0.2.2`
3. Make sure firewall allows connections on port 3000

### For Production
- **No setup required** - APK connects to `https://quizzer-paov.onrender.com`
- **Works globally** - Any device with internet can use the app
- **Always online** - Production server runs 24/7

## 📦 Building APK

To build a new APK for distribution:
```bash
npx eas build --platform android --profile production
```

The APK will automatically connect to the production server.

## 🐛 Troubleshooting

**Production APK not working?**
- Check if `https://quizzer-paov.onrender.com` is accessible
- Make sure you have internet connection
- Try opening the server URL in a browser

**Development server not connecting?**
- Make sure the server is running on port 3000
- Check if your device is on the same network
- Try using your computer's IP address instead of `10.0.2.2`

**App not loading?**
- Restart both the server and Expo server
- Clear the app cache in Expo Go
- Make sure your phone can reach your computer

**Quiz data not saving?**
- Check the `quizzes.json` file in the project root
- Make sure the server has write permissions
- Restart the server after making changes

## 🎯 Production vs Development

| Feature | Development | Production |
|---------|-------------|------------|
| Server URL | `http://10.0.2.2:3000` | `https://quizzer-paov.onrender.com` |
| Server Start | Manual (`npm run server`) | Automatic (always running) |
| Network | Local only | Global |
| APK | Uses local server | Uses production server |
