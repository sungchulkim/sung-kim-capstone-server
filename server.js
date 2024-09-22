import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import knex from 'knex';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL, process.env.ngrok_URL],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true //
    }
});

app.use(cors({
    origin: [process.env.CLIENT_URL, process.env.ngrok_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// SERVER TERMINAL: Check if the request is reaching the server
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});

const db = knex({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// DATABASE Connection check
app.get('/test-db', async (req, res) => {
    try {
        const result = await db.raw('SELECT 1 as dbIsConnected');
        res.json({ message: 'Database connection successful', result: result[0] });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

app.get('/current-user', authenticateToken, async (req, res) => {
    try {
        const user = await db('users').where({ id: req.user.userId }).first('id', 'username');
        if (user) {
            res.json({ username: user.username });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/rooms', authenticateToken, async (req, res) => {
    try {
        const rooms = await db('rooms').select('*');
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/rooms/:roomId', authenticateToken, async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await db('rooms').where({ id: roomId }).first();
        if (room) {
            res.json(room);
        } else {
            res.status(404).json({ error: 'Room not found' });
        }
    } catch (error) {
        console.error('Error fetching room details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/rooms/:roomId/messages', authenticateToken, async (req, res) => {
    console.log('Received request for room messages:', req.params.roomId);
    const { roomId } = req.params;
    try {
        const messages = await db('messages')
            .select('messages.*', 'users.username')
            .join('users', 'messages.user_id', 'users.id')
            .where('messages.room_id', roomId)
            .orderBy('messages.created_at', 'asc');

        for (let message of messages) {
            message.reactions = await db('reactions')
                .where('message_id', message.id)
                .select('user_id', 'emoji');
        }

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await db('messages')
            .select('messages.*', 'users.username')
            .join('users', 'messages.user_id', 'users.id')
            .orderBy('messages.created_at', 'asc');

        for (let message of messages) {
            message.reactions = await db('reactions')
                .where('message_id', message.id)
                .select('user_id', 'emoji');
        }

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/messages', authenticateToken, async (req, res) => {
    const { roomId, content } = req.body;
    const userId = req.user.userId;
    try {
        const [messageId] = await db('messages').insert({ room_id: roomId, user_id: userId, content });
        const newMessage = await db('messages')
            .select('messages.*', 'users.username')
            .join('users', 'messages.user_id', 'users.id')
            .where('messages.id', messageId)
            .first();

        // Fetch reactions for the new message
        newMessage.reactions = [];

        res.status(201).json(newMessage);
        io.to(roomId.toString()).emit('message', newMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/messages/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    console.log(`User ${userId} attempting to update message ${id} with content: ${content}`);//

    try {
        // Fetch the message to get roomId
        const message = await db('messages').where({ id, user_id: userId }).first();
        console.log('Fetched message:', message);//

        if (!message) {
            console.log('Message not found or unauthorized');//
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        const updatedCount = await db('messages')
            .where({ id, user_id: userId })
            .update({ content });
            console.log(`Updated message count: ${updatedCount}`);//

        if (updatedCount === 0) {
            console.log('No message updated');//
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        const updatedMessage = await db('messages')
            .select('messages.*', 'users.username')
            .join('users', 'messages.user_id', 'users.id')
            .where('messages.id', id)
            .first();
            console.log('Updated message:', updatedMessage);//

        res.json(updatedMessage);
        io.to(message.room_id.toString()).emit('messageEdited', { messageId: id, content, roomId: message.room_id });
        console.log(`Emitted messageEdited event: messageId=${id}, roomId=${message.room_id}`);//

    } catch (error) {
        console.error('Error updating message:', error);
        console.error('Stack trace:', error.stack);//
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/messages/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
        // First, fetch the message to get roomId
        const message = await db('messages').where({ id, user_id: userId }).first();
        if (!message) {
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        // Delete all reactions associated with this message
        await db('reactions').where({ message_id: id }).del();

        // Then, delete the message
        const deletedCount = await db('messages').where({ id, user_id: userId }).del();
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        res.status(204).end();
        io.to(message.room_id.toString()).emit('messageDeleted', { messageId: id, roomId: message.room_id });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/messages/:id/reactions', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    console.log(`\n--- Adding Reaction ---`);
    console.log(`Message ID: ${id}`);
    console.log(`User ID: ${userId}`);
    console.log(`Emoji: ${emoji}`);

    try {
        // Fetch the message to get roomId
        const message = await db('messages').where({ id }).first();
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await db('reactions').insert({ message_id: id, user_id: userId, emoji });
        res.status(201).end();
        io.to(message.room_id.toString()).emit('reaction', { messageId: id, userId, emoji, roomId: message.room_id });
    } catch (error) {
        console.error('Error adding reaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db('users').insert({ username, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db('users').where({ username }).first();
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    sessionId: Math.random().toString(36).substring(2, 15),
                    timestamp: Date.now()
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.json({ token, username: user.username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/chat', authenticateToken, async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: 'No message provided' });
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({
            reply: response.data.choices[0].message.content,
        });
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            console.error(`OpenAI API Error: ${status} - ${data.error.message}`);
            res.status(status).json({
                error: data.error.message,
            });
        } else {
            console.error(`Server Error: ${error.message}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.use((req, res) => {
    console.log('404 - Route not found:', req.method, req.url);
    res.status(404).send('Route not found');
});

// Socket.io Event Handling
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinRoom', (roomId) => {
        console.log(`Socket ${socket.id} joining room: ${roomId}`);
        socket.join(roomId.toString());
        socket.emit('joinedRoom', roomId);
    });

    socket.on('leaveRoom', (roomId) => {
        console.log(`Socket ${socket.id} leaving room: ${roomId}`);
        socket.leave(roomId.toString());
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on ${process.env.SERVER_URL}`));