# sung-kim-capstone-server

# Project Title
Real-time group chat with AI API

## Overview

This app is a real-time group chat platform that allows users to join discussion groups, communicate in real-time, react to messages with emojis, edit and delete their own messages, and interact with an AI assistant. It provides a seamless and interactive communication experience for group discussions.

### Problem Space

There's a growing need for real-time communication platforms that can facilitate group discussions while offering enhanced features like message reactions and AI assistance.

### User Profile

This app is designed for a wide range of users, including:
Remote teams needing a platform for group discussions
Students collaborating on projects
Community groups organizing events or discussions
Any group of individuals seeking real-time communication with enhanced features

### Features

User registration and JWT token authentication
Real-time messaging within group chats
Message reactions using various emojis
Edit and delete own messages
AI assistant integration for answering questions or providing information
Persistent chat history across sessions


## Implementation

### Tech Stack

Frontend: React
Backend: Express.js
Real-time Communication: Socket.io
Database: MySQL (for storing user data and chat history)
AI Integration: meta.ai API
Styling: CSS

### APIs

meat.ai or gemini

### Sitemap

login
Signup
Chat

### Mockups

Users can belong to multiple ChatRooms: currently chat room 1
ChatRooms contain multiple Messages
Messages belong to a User and a ChatRoom
Reactions belong to a Message and a User

### Data

Users: { id, username, email, password_hash, profile_picture }
ChatRooms: { id, name, description, created_by, created_at }
Messages: { id, chat_room_id, user_id, content, timestamp, edited_at }
Reactions: { id, message_id, user_id, emoji } 

### Endpoints

POST /register
POST /login						
GET /current-user	
GET /rooms
GET /rooms/:roomId
GET /rooms/:roomId/messages				 
GET /messages					 
POST /messages					 
PUT /messages/:id					 
DELETE /messages/:id				
POST /messages/:id/reactions			
POST /api/chat					
All endpoints except '/register' and '/login' require authentication using the JWT token


## Roadmap

1. Set up project structure and environment
2. Create basic chat room functionality
3. Implement real-time messaging with Socket.io
4. Add message editing and deleting features
5. Integrate emoji reactions
6. Implement AI assistant integration
7. Thorough testing and bug fixing

## Future Implementations

Create and join a single group chat room
User profile management
