import { Server, Socket } from 'socket.io';

export class SocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-course', (courseId: string) => {
        socket.join(`course-${courseId}`);
        socket.emit('joined-course', courseId);
      });

      socket.on('leave-course', (courseId: string) => {
        socket.leave(`course-${courseId}`);
      });

      socket.on('send-message', (data: any) => {
        this.handleMessage(data);
      });

      socket.on('send-notification', (data: any) => {
        this.handleNotification(data);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  private handleMessage(data: any) {
    const { courseId, message, userId, userName } = data;
    const messageData = {
      id: Date.now(),
      message,
      userId,
      userName,
      timestamp: new Date().toISOString()
    };
    this.io.to(`course-${courseId}`).emit('new-message', messageData);
  }

  private handleNotification(data: any) {
    const { courseId, notification, type } = data;
    const notificationData = {
      id: Date.now(),
      notification,
      type,
      timestamp: new Date().toISOString()
    };
    this.io.to(`course-${courseId}`).emit('new-notification', notificationData);
  }

  public emitToCourse(courseId: string, event: string, data: any) {
    this.io.to(`course-${courseId}`).emit(event, data);
  }

  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }
}