const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: true
  }
});

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://bhaviksharmawork_db_user:WO8soWgZBXa7gp0A@cluster0.yrrz06q.mongodb.net/?appName=Cluster0';
const DB_NAME = 'quizzer';
const QUIZZES_COLLECTION = 'quizzes';

let db;
let quizzesCollection;

// Store room data in memory (active sessions)
const rooms = {};

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('� Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    quizzesCollection = db.collection(QUIZZES_COLLECTION);
    console.log('✅ Connected to MongoDB successfully!');

    // Load initial quizzes count
    const count = await quizzesCollection.countDocuments();
    console.log(`📊 Total quizzes in database: ${count}`);

    // Initialize rooms from database
    const quizzes = await quizzesCollection.find({}).toArray();
    quizzes.forEach(quiz => {
      rooms[quiz.id] = {
        id: quiz.id,
        users: [],
        createdAt: new Date(),
        quiz: quiz
      };
      console.log(`✅ Loaded quiz for room ${quiz.id}: ${quiz.title}`);
    });

    // Always create default room 111111
    if (!rooms['111111']) {
      rooms['111111'] = {
        id: '111111',
        users: [],
        host: null,
        quiz: null
      };
    }

    return true;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    return false;
  }
}

// Serve quizzes data via REST API
app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await quizzesCollection.find({}).toArray();
    console.log(`📊 API: Returning ${quizzes.length} quizzes`);
    res.json({ quizzes });
  } catch (error) {
    console.error('❌ Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes', quizzes: [] });
  }
});

io.on('connection', (socket) => {
  console.log('=== NEW USER CONNECTED ===');
  console.log('User connected:', socket.id);
  console.log('Total connected users:', io.engine.clientsCount);

  socket.on('joinRoom', async (data) => {
    console.log('\n=== JOIN ROOM EVENT RECEIVED ===');
    console.log('Socket ID:', socket.id);
    console.log('Room data received:', data);

    const { roomId, username } = data;

    console.log(`User ${username} is trying to join room ${roomId}`);

    // Check if room exists in memory, if not try to load from database
    if (!rooms[roomId]) {
      try {
        const quiz = await quizzesCollection.findOne({ id: roomId });
        if (quiz) {
          rooms[roomId] = {
            id: roomId,
            users: [],
            createdAt: new Date(),
            quiz: quiz
          };
          console.log(`✅ Room ${roomId} loaded from database`);
        } else {
          console.log(`ERROR: Room ${roomId} does not exist!`);
          socket.emit('error', 'Room does not exist');
          return;
        }
      } catch (error) {
        console.error('Error checking room:', error);
        socket.emit('error', 'Error checking room');
        return;
      }
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
      users: rooms[roomId].users.map(u => u.username),
      quizTitle: rooms[roomId].quiz?.title
    });

    console.log('=== JOIN ROOM COMPLETE ===\n');
  });

  socket.on('saveQuiz', async (data) => {
    console.log('\n=== SAVE QUIZ EVENT RECEIVED ===');
    console.log('Quiz data received:', data);

    const { roomId, quizData } = data;

    try {
      // Format the quiz for database storage
      const newQuiz = {
        id: roomId,
        title: quizData.title,
        category: quizData.category || 'Custom Quiz',
        difficulty: quizData.difficulty || 'Medium',
        timeLimit: quizData.timeLimit || 30,
        questions: quizData.questions.map((q, index) => ({
          id: q.id || index + 1,
          question: q.question,
          options: q.answers.map((answer, i) => ({
            id: String.fromCharCode(65 + i),
            text: answer
          })),
          correctAnswer: String.fromCharCode(65 + q.correctIndex),
          timeLimit: q.timeLimit || 20
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to MongoDB (upsert - update if exists, insert if not)
      const result = await quizzesCollection.updateOne(
        { id: roomId },
        { $set: newQuiz },
        { upsert: true }
      );

      console.log('📝 MongoDB save result:', result);

      // Update in-memory rooms
      if (!rooms[roomId]) {
        rooms[roomId] = {
          id: roomId,
          users: [],
          createdAt: new Date(),
          quiz: newQuiz
        };
        console.log(`✅ Room ${roomId} created with quiz`);
      } else {
        rooms[roomId].quiz = newQuiz;
        console.log(`✅ Quiz updated in existing room ${roomId}`);
      }

      console.log(`✅ Quiz saved to MongoDB for room ${roomId}`);
      console.log('Quiz title:', quizData.title);
      console.log('Number of questions:', quizData.questions.length);
      console.log('=== SAVE QUIZ COMPLETE ===\n');

      // Notify quiz creator that save was successful
      socket.emit('quizSaved', { roomId, success: true });

    } catch (error) {
      console.error('❌ Error saving quiz to MongoDB:', error);
      socket.emit('quizSaved', { roomId, success: false, error: error.message });
    }
  });

  socket.on('getQuiz', async (data) => {
    console.log('\n=== GET QUIZ EVENT RECEIVED ===');
    console.log('Room ID requested:', data.roomId);

    const { roomId } = data;

    // First check in memory
    if (rooms[roomId] && rooms[roomId].quiz) {
      console.log(`✅ Quiz found in memory for room ${roomId}`);
      console.log('Quiz title:', rooms[roomId].quiz.title);
      socket.emit('quizData', { roomId, quiz: rooms[roomId].quiz });
      console.log('=== GET QUIZ COMPLETE ===\n');
      return;
    }

    // If not in memory, try database
    try {
      const quiz = await quizzesCollection.findOne({ id: roomId });

      if (quiz) {
        console.log(`✅ Quiz found in database for room ${roomId}`);
        console.log('Quiz title:', quiz.title);

        // Cache in memory
        if (!rooms[roomId]) {
          rooms[roomId] = {
            id: roomId,
            users: [],
            createdAt: new Date(),
            quiz: quiz
          };
        } else {
          rooms[roomId].quiz = quiz;
        }

        socket.emit('quizData', { roomId, quiz });
      } else {
        console.log(`❌ No quiz found for room ${roomId}`);
        socket.emit('quizData', { roomId, quiz: null });
      }
    } catch (error) {
      console.error('❌ Error fetching quiz from database:', error);
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

// Start server after MongoDB connection
const PORT = process.env.PORT || 3000;

connectToMongoDB().then((connected) => {
  if (connected) {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('✅ MongoDB connected and ready');
      console.log('Room 111111 is ready for connections');
    });
  } else {
    console.error('❌ Failed to connect to MongoDB. Server not started.');
    process.exit(1);
  }
});
