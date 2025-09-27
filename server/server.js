const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
const server = http.createServer(app); // Create the http server right away

// Initialize Socket.IO with the http server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Connect to Database
connectDB();

// --- Middleware Section ---
// It's best practice to group all middleware together
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Socket.IO Connection Logic ---
let onlineUsers = [];

const addUser = (userId, socketId) => {
    if (userId && !onlineUsers.some(user => user.userId === userId)) {
        onlineUsers.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

io.on("connection", (socket) => {
    console.log("A user connected.");
    
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        console.log("Online users:", onlineUsers);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected.");
        removeUser(socket.id);
    });

    socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
        try {
            // 1. Save the new message to the database
            const newMessage = new Message({
                conversationId,
                sender: senderId,
                text,
            });
            const savedMessage = await newMessage.save();
            const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'name');

            // 2. Find the recipient of the message
            const conversation = await Conversation.findById(conversationId);
            const recipientId = conversation.participants.find(p => p.toString() !== senderId).toString();
            
            // 3. Find the recipient's socket if they are online
            const recipientSocket = onlineUsers.find(user => user.userId === recipientId);

            // 4. Emit the message to the recipient
            if (recipientSocket) {
                io.to(recipientSocket.socketId).emit("receiveMessage", populatedMessage);
            }
        } catch (error) {
            console.error("Error handling sendMessage:", error);
        }
    });
});

// Middleware to attach io and onlineUsers to every request
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

// --- API Routes Section ---
app.get('/', (req, res) => {
    res.send('TraceIt API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// --- Server Listening ---
const PORT = process.env.PORT || 5000;

// Only use server.listen(), as it now manages both Express and Socket.IO
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));