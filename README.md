# Real-Time Chat Application

A full-stack real-time chat application built with React (client-side) and Node.js (server-side) using WebSockets via Socket.IO.

## Project Structure

The project is organized into two main directories:

```
/
├── client/         # React client application
└── server/         # Node.js server
```

## Technologies

### Client-Side
- React.js
- Socket.IO Client

### Server-Side
- Node.js
- Express.js
- Socket.IO

## Features

- Real-time chat messaging
- User connection/disconnection handling
- User connected or disconnected indicator

## Installation & Running

### Prerequisites
- Node.js (version 14.0.0 or higher)
- npm or yarn

### Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm start
```

The server will run at [http://localhost:5000](http://localhost:5000)

### Client Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run the client app in development mode
npm run dev
```

The client application will be available at [http://localhost:5173](http://localhost:5173).

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Enter your name to join the chat
3. Start sending messages!

## Author

This project was developed as an assignment by [Rachel Israeli].

## License

This project is licensed under the MIT License. See the LICENSE file for more information.
