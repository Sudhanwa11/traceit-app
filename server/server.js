// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import models used in socket handlers
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

dotenv.config();
const app = express();
const server = http.createServer(app);

// --- SOCKET.IO CONFIG ---
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
});

// --- DATABASE CONNECTION ---
connectDB();

// --- CORE MIDDLEWARE ---
app.disable('x-powered-by');
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Parse only JSON payloads (multipart handled by Multer in routes)
app.use(express.json({ limit: '2mb' }));

// Serve static files (optional, if you still save anything locally)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- SOCKET PRESENCE TRACKING ---
let onlineUsers = [];

const addUser = (userId, socketId) => {
  if (userId && !onlineUsers.some(u => u.userId === userId)) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter(u => u.socketId !== socketId);
};

// --- SOCKET EVENTS ---
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    console.log('Online users:', onlineUsers);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    removeUser(socket.id);
  });

  // Chat messaging example
  socket.on('sendMessage', async ({ conversationId, senderId, text }) => {
    try {
      const newMessage = new Message({ conversationId, sender: senderId, text });
      const saved = await newMessage.save();
      const populated = await Message.findById(saved._id).populate('sender', 'name');

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const recipientId = conversation.participants.find(
        p => p.toString() !== senderId
      )?.toString();
      if (!recipientId) return;

      const recipientSocket = onlineUsers.find(u => u.userId === recipientId);
      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit('receiveMessage', populated);
      }
    } catch (err) {
      console.error('Error handling sendMessage:', err);
    }
  });
});

// Attach io + onlineUsers for controller use (notifications, etc.)
app.use((req, _res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
});

// --- ROUTES ---
app.get('/', (_req, res) => res.send('TraceIt API is running...'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes')); // ← Multer used here
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Optional debug routes
try {
  app.use('/api/debug', require('./routes/debugRoutes'));
} catch (_) {
  // ignore if not present
}

// --- 404 HANDLER ---
app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));

// --- GLOBAL ERROR HANDLER ---
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ msg: 'Server error' });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// --- GRACEFUL SHUTDOWN ---
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
