const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store room data and quizzes
const rooms = {
  '111111': {
    users: [],
    host: null,
    quiz: null
  }
};

const quizzes = {}; // Store quizzes by room ID

io.on('connection', (socket) => {
  console.log('=== NEW USER CONNECTED ===');
  console.log('User connected:', socket.id);
  console.log('Total connected users:', io.engine.clientsCount);

  socket.on('joinRoom', (data) => {
    console.log('\n=== JOIN ROOM EVENT RECEIVED ===');
    console.log('Socket ID:', socket.id);
    console.log('Room data received:', data);
    
    const { roomId, username } = data;
    
    console.log(`User ${username} is trying to join room ${roomId}`);
    
    // Check if room exists
    if (!rooms[roomId]) {
      console.log(`ERROR: Room ${roomId} does not exist!`);
      socket.emit('error', 'Room does not exist');
      return;
    }
    
    console.log(`Room ${roomId} exists, proceeding to join...`);
    
    // Join the room
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Add user to room
    const user = {
      id: socket.id,
      username: username,
      joinedAt: new Date()
    };
    
    rooms[roomId].users.push(user);
    
    console.log(`\n✅ User ${username} successfully joined room ${roomId}`);
    console.log(`Room ${roomId} now has ${rooms[roomId].users.length} users:`);
    console.log('Users in room:', rooms[roomId].users.map(u => u.username));
    
    // Notify all users in the room
    io.to(roomId).emit('userJoined', {
      username: username,
      userCount: rooms[roomId].users.length,
      users: rooms[roomId].users.map(u => u.username)
    });
    
    // Send current room state to the new user
    socket.emit('roomState', {
      userCount: rooms[roomId].users.length,
      users: rooms[roomId].users.map(u => u.username)
    });
    
    console.log('=== JOIN ROOM COMPLETE ===\n');
  });

  socket.on('saveQuiz', (data) => {
    console.log('\n=== SAVE QUIZ EVENT RECEIVED ===');
    console.log('Quiz data received:', data);
    
    const { roomId, quizData } = data;
    
    // Create room if it doesn't exist when saving a quiz
    if (!rooms[roomId]) {
      console.log(`Room ${roomId} does not exist, creating it for quiz...`);
      rooms[roomId] = {
        id: roomId,
        users: [],
        createdAt: new Date(),
        quiz: quizData
      };
      console.log(`✅ Room ${roomId} created with quiz`);
    } else {
      // Room exists, just add/update the quiz
      rooms[roomId].quiz = quizData;
      console.log(`✅ Quiz added to existing room ${roomId}`);
    }
    
    // Store the quiz
    quizzes[roomId] = quizData;
    
    console.log(`✅ Quiz saved for room ${roomId}`);
    console.log('Quiz title:', quizData.title);
    console.log('Number of questions:', quizData.questions.length);
    console.log('Room now has quiz:', !!rooms[roomId].quiz);
    console.log('=== SAVE QUIZ COMPLETE ===\n');
    
    // Notify quiz creator that save was successful
    socket.emit('quizSaved', { roomId, success: true });
  });

  socket.on('getQuiz', (data) => {
    console.log('\n=== GET QUIZ EVENT RECEIVED ===');
    console.log('Room ID requested:', data.roomId);
    
    const { roomId } = data;
    const quiz = quizzes[roomId];
    
    console.log('Available rooms:', Object.keys(rooms));
    console.log('Available quizzes:', Object.keys(quizzes));
    console.log('Room exists:', !!rooms[roomId]);
    console.log('Quiz exists:', !!quiz);
    
    if (rooms[roomId] && rooms[roomId].quiz) {
      console.log(`✅ Quiz found in room ${roomId}`);
      console.log('Quiz title:', rooms[roomId].quiz.title);
      console.log('Sending quiz to client...');
      socket.emit('quizData', { roomId, quiz: rooms[roomId].quiz });
    } else if (quiz) {
      console.log(`✅ Quiz found in quizzes object for room ${roomId}`);
      console.log('Quiz title:', quiz.title);
      console.log('Sending quiz to client...');
      socket.emit('quizData', { roomId, quiz });
    } else {
      console.log(`❌ No quiz found for room ${roomId}`);
      console.log('Sending null quiz to client...');
      socket.emit('quizData', { roomId, quiz: null });
    }
    
    console.log('=== GET QUIZ COMPLETE ===\n');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms
    Object.keys(rooms).forEach(roomId => {
      const userIndex = rooms[roomId].users.findIndex(u => u.id === socket.id);
      if (userIndex !== -1) {
        const username = rooms[roomId].users[userIndex].username;
        rooms[roomId].users.splice(userIndex, 1);
        
        console.log(`User ${username} left room ${roomId}`);
        console.log(`Room ${roomId} now has ${rooms[roomId].users.length} users`);
        
        // Notify remaining users
        io.to(roomId).emit('userLeft', {
          username: username,
          userCount: rooms[roomId].users.length,
          users: rooms[roomId].users.map(u => u.username)
        });
      }
    });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
  console.log('Room 111111 is ready for connections');
});
