# WSEI Communicator - Chat Application

A real-time chat application built with Vue 3, Express, MongoDB, and Socket.IO.

## Features

- **Authentication**: User registration and login with JWT tokens stored in secure cookies
- **Real-time Messaging**: Socket.IO integration for real-time message delivery
- **User Directory**: Browse and select users from a preloaded contact list
- **Message History**: Load full conversation history with selected users
- **Responsive UI**: Built with Tailwind CSS for a modern, clean interface

## Tech Stack

### Frontend
- Vue 3 with TypeScript
- Pinia for state management
- Socket.IO Client for real-time communication
- Tailwind CSS for styling
- Vite for fast development and building

### Backend
- Express.js for REST API
- MongoDB with Mongoose for data persistence
- Socket.IO for real-time messaging
- JWT for authentication
- bcryptjs for password hashing

## Project Structure

```
wsei-communicator-client/          # Vue 3 frontend
├── src/
│   ├── api/
│   │   └── client.ts              # Axios instance with cookie support
│   ├── components/
│   │   ├── MessageDisplay.vue      # Message list with real-time updates
│   │   ├── MessageInput.vue        # Message input form
│   │   └── UserSidebar.vue         # User list/contacts
│   ├── composables/
│   │   └── useSocket.ts            # Socket.IO composable
│   ├── stores/
│   │   ├── authStore.ts            # Authentication state
│   │   └── chatStore.ts            # Chat/messages state
│   ├── views/
│   │   ├── LoginPage.vue           # Login/Register page
│   │   └── ChatPage.vue            # Main chat interface
│   ├── router/
│   │   └── index.ts                # Route configuration with auth guard
│   └── App.vue                     # Root component

wsei-communicator-server/          # Express backend
├── src/
│   ├── controllers/
│   │   ├── authController.ts       # Register/Login endpoints
│   │   └── messageController.ts    # Messages & users endpoints
│   ├── models/
│   │   ├── User.ts                 # User schema
│   │   └── Message.ts              # Message schema
│   └── main.ts                     # Server setup with Socket.IO
```

## Setup Instructions

### Prerequisites
- Node.js 20+ and npm
- MongoDB running on localhost:27017 or configured via MONGO_URI

### Backend Setup

1. Navigate to server directory:
```bash
cd wsei-communicator-server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/wsei_communicator
PORT=3000
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
```

5. Start the server:
```bash
npm start
```

The server will listen on `http://localhost:3000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd wsei-communicator-client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Ensure `VITE_API_URL` is set to your backend URL:
```env
VITE_API_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## How to Use

1. **Register/Login**: Create a new account or login with existing credentials
2. **View Contacts**: The left sidebar displays all registered users
3. **Start Chat**: Click on any user to load conversation history
4. **Send Messages**: Type message and click Send or press Enter
5. **Real-time Updates**: Messages appear instantly via Socket.IO

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  - Request: `{ email, password, passwordConfirm, nickname? }`
  - Response: `{ token, user }`

- `POST /api/auth/login` - Login user
  - Request: `{ email, password }`
  - Response: `{ token, user }`

### Users & Messages
- `GET /api/users` - Get all users
  - Response: `[{ _id, email, nickname }]`

- `GET /api/messages/load` - Load messages with a user
  - Query: `userId` (the other user's ID)
  - Response: `[{ _id, sender, recipient, content, createdAt }]`

- `POST /api/messages/send` - Send a message
  - Request: `{ recipientId, content }`
  - Response: `{ _id, sender, recipient, content, createdAt }`

## Socket.IO Events

### Client → Server
- `message:send` - Send message in real-time
  - Data: `{ recipientId, content }`

### Server → Client
- `message:receive` - Receive message in real-time
  - Data: `{ _id, sender, recipient, content, createdAt }`

- `message:sent` - Confirmation message was sent
  - Data: `{ _id }`

## Authentication Flow

1. User registers/logs in via REST API
2. Backend returns JWT token in httpOnly cookie
3. Axios client automatically includes cookie in all requests
4. Socket.IO connection authenticates using the same token
5. All messages are associated with authenticated user ID from JWT payload

## Development Notes

- Cookies are automatically sent with all requests due to `withCredentials: true` in Axios
- Socket.IO uses token from authentication header for secure real-time connection
- Messages are sorted chronologically and display with timestamps
- Date separators appear between messages from different days
- User sidebar highlights selected conversation
- All form inputs have validation and error feedback

## Production Deployment

- Set `JWT_SECRET` to a strong random string
- Update `CORS_ORIGIN` to your frontend domain
- Use secure MongoDB connection string
- Enable SSL/HTTPS for Socket.IO
- Set `NODE_ENV=production`
- Build frontend: `npm run build`

## Troubleshooting

**Messages not appearing in real-time?**
- Check Socket.IO connection in browser console
- Verify CORS settings allow Socket.IO connections
- Ensure JWT_SECRET is consistent between sessions

**Login redirect not working?**
- Clear localStorage and restart
- Check browser console for auth errors
- Verify backend is returning valid JWT token

**Contacts not loading?**
- Confirm backend is running and `/api/users` endpoint works
- Check MongoDB connection
- Verify CORS_ORIGIN allows your frontend domain

## License

ISC
