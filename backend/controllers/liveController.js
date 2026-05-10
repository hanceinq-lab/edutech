const rooms = new Map();

export const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      rooms.get(roomId).set(socket.id, { userId, userName });

      socket.to(roomId).emit('user-joined', { socketId: socket.id, userId, userName });
      socket.emit('room-participants', {
        participants: Array.from(rooms.get(roomId).entries())
          .filter(([sid]) => sid !== socket.id)
          .map(([sid, u]) => ({ socketId: sid, ...u })),
      });
    });

    socket.on('offer',         ({ targetSocketId, offer })     => socket.to(targetSocketId).emit('offer',         { from: socket.id, offer }));
    socket.on('answer',        ({ targetSocketId, answer })    => socket.to(targetSocketId).emit('answer',        { from: socket.id, answer }));
    socket.on('ice-candidate', ({ targetSocketId, candidate }) => socket.to(targetSocketId).emit('ice-candidate', { from: socket.id, candidate }));

    socket.on('chat-message', ({ roomId, message, userName }) => {
      io.to(roomId).emit('chat-message', { message, userName, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          participants.delete(socket.id);
          socket.to(roomId).emit('user-left', { socketId: socket.id });
          if (participants.size === 0) rooms.delete(roomId);
        }
      });
    });
  });
};
