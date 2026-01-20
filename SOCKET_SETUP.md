# Socket Server Setup

## 1. Install Server Dependencies
```bash
cd c:\Users\BhavikSharma\Downloads\quizzingapp\my-app
npm install express socket.io
```

## 2. Start the Socket Server
```bash
node server.js
```

## 3. Start the React Native App
```bash
npm start
```

## How It Works

1. **Room ID**: The app uses room ID `111111` for all connections
2. **Username**: Currently hardcoded as "Alexa Johnson"
3. **Socket Events**:
   - `joinRoom`: When a user enters the room
   - `userJoined`: Broadcasted when a new user joins
   - `userLeft`: Broadcasted when a user leaves
   - `roomState`: Current room state sent to new users

## Console Output

When users join/leave, you'll see console logs like:
```
User Alexa Johnson is trying to join room 111111
User Alexa Johnson successfully joined room 111111
Room 111111 now has 1 users
```

## Features

- Real-time user list updates
- Automatic connection/disconnection handling
- Room-based communication
- Error handling for invalid room IDs
