# sung-kim-capstone-server

# Project Title

Real-time group chat with AI API

## Overview

This project is a real-time chat application with features like message editing, deletion, and reactions.

### Problem Space

There's a growing need for real-time communication platforms that can facilitate group discussions while offering enhanced features like message reactions and AI assistance.

### User Profile

Users can authenticate, join chat rooms, send messages, edit their own messages, delete messages, and add reactions to messages.

### Features

- Real-time messaging
- Message editing and deletion
- Reactions to messages
- User authentication
- Multiple chat rooms
- AI chat assistant

## Implementation

- React front-end
- Express back-end
- Database: MySQL
- Characterset utf8mb4 to support emojis

### Tech Stack

- Frontend: React, Socket.io-client, Axios, dotenv
- Backend: Node.js, Express.js, Socket.io, Knex.js, jsonwebtoken, bcrypt, cors, dotenv
- Real-time Communication: Socket.io
- Database: MySQL (for storing user data and chat history)
- AI Integration: Openai API
- Styling: CSS
- Authetication: JWT

### APIs

- RESTful API for CRUD operations on messages
- WebSocket API for real-time updates
- openai API

### Sitemap

- Landing page: Login
- Login
- Register
- Chat

### Mockups

- Users can belong to multiple ChatRooms: default chat room 1
- ChatRooms contain multiple Messages
- Messages belong to a User and a ChatRoom
- Reactions belong to a Message and a User

### Data

- Users: { id, username, email, password_hash, profile_picture }
- ChatRooms: { id, name, description, created_by, created_at }
- Messages: { id, chat_room_id, user_id, content, timestamp, edited_at }
- Reactions: { id, message_id, user_id, emoji } 

### Endpoints

- POST /register
- POST /login						
- GET /current-user	
- GET /rooms
- GET /rooms/:roomId
- GET /rooms/:roomId/messages				 
- GET /messages					 
- POST /messages					 
- PUT /messages/:id					 
- DELETE /messages/:id				
- POST /messages/:id/reactions			
- POST /api/chat					
- All endpoints except '/register' and '/login' require authentication using the JWT token


## Roadmap

1. Set up project structure and environment
2. Create basic chat room functionality
3. Implement real-time messaging with Socket.io
4. Add message editing and deleting features
5. Integrate emoji reactions
6. Implement AI assistant integration
7. Thorough testing and bug fixing

## Future Implementations

1. Create a chat room
2. User profile management
