// socket-server.ts (at the project root)
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

const port = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT, 10) : 3001;

const httpServer = http.createServer(); // Create a plain HTTP server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // Allow all origins for simplicity in development
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected:', socket.id);
  });

  // Events that can be emitted by clients (e.g., staff panel)
  socket.on('tokenStatusUpdate', (data: { tokenId: string; status: string }) => {
    console.log(`Received token status update from ${socket.id}:`, data);
    // Broadcast this update to all connected clients (e.g., waiting room displays)
    io.emit('tokenStatusChanged', data);
  });

  socket.on('queueUpdateTrigger', (data: { doctorId: string }) => {
    console.log(`Received queue update trigger for doctor ${data.doctorId}`);
    // This event signifies that a doctor's queue might have changed.
    // The backend should re-fetch the queue and emit a detailed update.
    // For now, we'll just re-broadcast to simulate.
    io.emit('refreshQueue', data); // Clients (display/staff) will re-fetch data
  });
});

httpServer.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
});

// Export the io instance so it can be imported and used by other backend logic
export { io };
