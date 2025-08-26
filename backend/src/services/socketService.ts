import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  roomType: 'ACADEMIC' | 'COURSE';
  senderId: string;
  message?: string;
  fileUrl?: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    username: string;
  };
}

interface TypingData {
  roomId: string;
  roomType: 'ACADEMIC' | 'COURSE';
  userId: string;
  userName: string;
}

export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private typingUsers: Map<string, Set<string>> = new Map(); // roomKey -> Set of userIds

  constructor(io: Server) {
    this.io = io;
    this.initializeHandlers();
  }

  private initializeHandlers() {
    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.id} (User ID: ${socket.userId})`);
      
      // Store user connection
      if (socket.userId) {
        this.connectedUsers.set(socket.id, socket.userId);
        this.userSockets.set(socket.userId, socket.id);
      }

      // Join chat room
      socket.on('join-chat-room', (data: { roomId: string; roomType: 'ACADEMIC' | 'COURSE' }) => {
        const roomKey = `${data.roomType}-${data.roomId}`;
        socket.join(roomKey);
        socket.emit('joined-chat-room', { roomId: data.roomId, roomType: data.roomType });
        console.log(`User ${socket.userId} joined room: ${roomKey}`);
      });

      // Leave chat room
      socket.on('leave-chat-room', (data: { roomId: string; roomType: 'ACADEMIC' | 'COURSE' }) => {
        const roomKey = `${data.roomType}-${data.roomId}`;
        socket.leave(roomKey);
        
        // Remove from typing users
        const typingSet = this.typingUsers.get(roomKey);
        if (typingSet && socket.userId) {
          typingSet.delete(socket.userId);
          this.broadcastTypingUpdate(roomKey);
        }
        
        console.log(`User ${socket.userId} left room: ${roomKey}`);
      });

      // Handle typing indicators
      socket.on('typing-start', (data: TypingData) => {
        const roomKey = `${data.roomType}-${data.roomId}`;
        
        if (!this.typingUsers.has(roomKey)) {
          this.typingUsers.set(roomKey, new Set());
        }
        
        if (socket.userId) {
          this.typingUsers.get(roomKey)!.add(socket.userId);
          this.broadcastTypingUpdate(roomKey);
        }
      });

      socket.on('typing-stop', (data: TypingData) => {
        const roomKey = `${data.roomType}-${data.roomId}`;
        const typingSet = this.typingUsers.get(roomKey);
        
        if (typingSet && socket.userId) {
          typingSet.delete(socket.userId);
          this.broadcastTypingUpdate(roomKey);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id} (User ID: ${socket.userId})`);
        
        if (socket.userId) {
          // Remove from all typing indicators
          this.typingUsers.forEach((typingSet, roomKey) => {
            if (typingSet.has(socket.userId!)) {
              typingSet.delete(socket.userId!);
              this.broadcastTypingUpdate(roomKey);
            }
          });
          
          // Remove from connection maps
          this.connectedUsers.delete(socket.id);
          this.userSockets.delete(socket.userId);
        }
      });

      // Legacy course events (keeping for backward compatibility)
      socket.on('join-course', (courseId: string) => {
        socket.join(`course-${courseId}`);
        socket.emit('joined-course', courseId);
      });

      socket.on('leave-course', (courseId: string) => {
        socket.leave(`course-${courseId}`);
      });
    });
  }

  private broadcastTypingUpdate(roomKey: string) {
    const typingSet = this.typingUsers.get(roomKey);
    const typingUserIds = typingSet ? Array.from(typingSet) : [];
    
    this.io.to(roomKey).emit('typing-update', {
      roomKey,
      typingUsers: typingUserIds
    });
  }

  // Broadcast new message to chat room
  public broadcastMessage(roomId: string, roomType: 'ACADEMIC' | 'COURSE', message: ChatMessage) {
    const roomKey = `${roomType}-${roomId}`;
    this.io.to(roomKey).emit('new-message', message);
  }

  // Broadcast message deletion
  public broadcastMessageDeleted(roomId: string, roomType: 'ACADEMIC' | 'COURSE', messageId: string) {
    const roomKey = `${roomType}-${roomId}`;
    this.io.to(roomKey).emit('message-deleted', { messageId, roomId, roomType });
  }

  // Get online users in a room
  public async getOnlineUsersInRoom(roomId: string, roomType: 'ACADEMIC' | 'COURSE'): Promise<string[]> {
    const roomKey = `${roomType}-${roomId}`;
    const sockets = await this.io.in(roomKey).fetchSockets();
    return sockets.map(socket => (socket as unknown as AuthenticatedSocket).userId).filter(Boolean) as string[];
  }

  // Send notification to specific user
  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Legacy methods (keeping for backward compatibility)
  public emitToCourse(courseId: string, event: string, data: any) {
    this.io.to(`course-${courseId}`).emit(event, data);
  }

  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Emit to chat room
  public emitToChatRoom(roomId: string, roomType: 'ACADEMIC' | 'COURSE', event: string, data: any) {
    const roomKey = `${roomType}-${roomId}`;
    this.io.to(roomKey).emit(event, data);
  }
}