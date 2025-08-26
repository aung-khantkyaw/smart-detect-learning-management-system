import type { Request, Response } from 'express';
import { db } from '../db';
import { academicChatRooms, chatMembers, chatMessages, courseChatRooms, users } from './../db/schema';
import { and, eq, desc } from "drizzle-orm";
import path from 'path';
import fs from 'fs';

export const getAllChatRooms = async (req: Request, res: Response) => {
    try {
        // Get all academic chat rooms
        const academicChatRoom = await db.select().from(academicChatRooms);

        const courseChatRoom = await db.select().from(courseChatRooms);

        return res.status(200).json({ status: "success", data: { academicChatRoom, courseChatRoom } })
    } catch (error) {
        console.error("Error fetching academic chat rooms:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const getAllAcademicChatRooms = async (req: Request, res: Response) => {
    try {
        // Get all academic chat rooms
        const chatRooms = await db.select().from(academicChatRooms);

        // For each chat room, get its members
        const chatRoomsWithMembers = await Promise.all(
            chatRooms.map(async (room: any) => {
                const members = await db.select().from(chatMembers).where(
                    and(
                        eq(chatMembers.roomId, room.id),
                        eq(chatMembers.roomType, 'ACADEMIC')
                    )
                );
                return { ...room, members, membersCount: members.length };
            })
        );

        return res.status(200).json({ status: "success", data: chatRoomsWithMembers })
    } catch (error) {
        console.error("Error fetching academic chat rooms:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const getAcademicChatRoomById = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
        const chatRoom = await db.select().from(academicChatRooms).where(eq(academicChatRooms.id, id));

        if (chatRoom.length === 0) {
            return res.status(404).json({ status: "error", message: "Chat room not found" });
        }
        
        return res.status(200).json({ status: "success", data: chatRoom })
    } catch (error) {
        console.error("Error fetching academic chat rooms:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const getAllCourseChatRooms = async (req: Request, res: Response) => {
  try {
    const chatRooms = await db.select().from(courseChatRooms);

    const chatRoomsWithMembers = await Promise.all(
            chatRooms.map(async (room: any) => {
                const members = await db.select().from(chatMembers).where(
                    and(
                        eq(chatMembers.roomId, room.id),
                        eq(chatMembers.roomType, 'COURSE')
                    )
                );
                return { ...room, members, membersCount: members.length };
            })
        );

    return res.status(200).json({ status: "success", data: chatRoomsWithMembers })
  } catch (error) {
      console.error("Error fetching course chat rooms:", error);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

export const getCourseChatRoomById = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
        const chatRoom = await db.select().from(courseChatRooms).where(eq(courseChatRooms.id, id));
        
        if (chatRoom.length === 0) {
            return res.status(404).json({ status: "error", message: "Chat room not found" });
        }
        
        return res.status(200).json({ status: "success", data: chatRoom })
    } catch (error) {
        console.error("Error fetching academic chat rooms:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const getAcademicChatRoomMembers = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      const memberList = await db.select().from(chatMembers).where(and(
        eq(chatMembers.roomId, id),
        eq(chatMembers.roomType, 'ACADEMIC')
      ));

      if (memberList.length === 0) {
          return res.status(404).json({ status: "error", message: "No members found for this chat room" });
      }

      return res.status(200).json({ status: "success", data: memberList, count: memberList.length })
    } catch (error) {
        console.error("Error fetching chat room members:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const getCourseChatRoomMembers = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const memberList = await db.select().from(chatMembers).where(and(
            eq(chatMembers.roomId, id),
            eq(chatMembers.roomType, 'COURSE')
        ));

        if (memberList.length === 0) {
            return res.status(404).json({ status: "error", message: "No members found for this chat room" });
        }

        return res.status(200).json({ status: "success", data: memberList, count: memberList.length })
    } catch (error) {
        console.error("Error fetching chat room members:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const getChatMessages = async (req: Request, res: Response) => {
    const { roomId, roomType } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    try {
        // Validate roomType
        if (!['ACADEMIC', 'COURSE'].includes(roomType)) {
            return res.status(400).json({ 
                status: "error", 
                message: "Invalid roomType. Must be either 'ACADEMIC' or 'COURSE'" 
            });
        }

        const messages = await db
            .select({
                id: chatMessages.id,
                message: chatMessages.message,
                fileUrl: chatMessages.fileUrl,
                createdAt: chatMessages.createdAt,
                sender: {
                    id: users.id,
                    fullName: users.fullName,
                    username: users.username
                }
            })
            .from(chatMessages)
            .leftJoin(users, eq(chatMessages.senderId, users.id))
            .where(and(
                eq(chatMessages.roomId, roomId),
                eq(chatMessages.roomType, roomType)
            ))
            .orderBy(desc(chatMessages.createdAt))
            .limit(Number(limit))
            .offset(Number(offset));

        return res.status(200).json({ 
            status: "success", 
            data: messages,
            count: messages.length,
            pagination: {
                limit: Number(limit),
                offset: Number(offset)
            }
        });
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    const { roomId, roomType, senderId, message } = req.body;
    const file = req.file;

    try {
        // Prepare message data (validation already done in middleware)
        const messageDetails: any = {
            roomId,
            roomType,
            senderId,
            message: message || null,
            fileUrl: file ? file.path : null
        };

        const newMessage = await db.insert(chatMessages).values(messageDetails).returning();

        // Get sender information for real-time broadcast
        const senderInfo = await db
            .select({
                id: users.id,
                fullName: users.fullName,
                username: users.username
            })
            .from(users)
            .where(eq(users.id, senderId));

        // Broadcast message to all users in the chat room via WebSocket
        if (global.socketService && senderInfo.length > 0) {
            const messageForBroadcast = {
                id: newMessage[0].id,
                roomId: newMessage[0].roomId,
                roomType: newMessage[0].roomType as 'ACADEMIC' | 'COURSE',
                senderId: newMessage[0].senderId,
                message: newMessage[0].message || undefined,
                fileUrl: newMessage[0].fileUrl || undefined,
                createdAt: newMessage[0].createdAt.toISOString(),
                sender: senderInfo[0]
            };
            
            global.socketService.broadcastMessage(roomId, roomType as 'ACADEMIC' | 'COURSE', messageForBroadcast);
        }

        return res.status(201).json({ 
            status: "success", 
            data: newMessage[0],
            messageType: file ? 'file' : 'text',
            fileName: file ? file.originalname : null
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const deleteMessage = async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const { userId } = req.body; // User requesting deletion

    try {
        // First, check if the message exists and get its details
        const existingMessage = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.id, messageId));

        if (existingMessage.length === 0) {
            return res.status(404).json({ 
                status: "error", 
                message: "Message not found" 
            });
        }

        const message = existingMessage[0];

        // Check if the user is the sender of the message
        if (message.senderId !== userId) {
            return res.status(403).json({ 
                status: "error", 
                message: "You can only delete your own messages" 
            });
        }

        // Delete the message
        await db.delete(chatMessages).where(eq(chatMessages.id, messageId));

        // Broadcast message deletion to all users in the chat room via WebSocket
        if (global.socketService) {
            global.socketService.broadcastMessageDeleted(
                message.roomId, 
                message.roomType as 'ACADEMIC' | 'COURSE', 
                messageId
            );
        }

        // If message had a file, optionally delete the file from filesystem
        // (You might want to implement file cleanup logic here)

        return res.status(200).json({ 
            status: "success", 
            message: "Message deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting message:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

export const downloadChatFile = async (req: Request, res: Response) => {
    const { messageId } = req.params;

    try {
        // Get the message with file URL
        const message = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.id, messageId));

        if (message.length === 0) {
            return res.status(404).json({ 
                status: "error", 
                message: "Message not found" 
            });
        }

        const messageData = message[0];

        if (!messageData.fileUrl) {
            return res.status(400).json({ 
                status: "error", 
                message: "This message does not contain a file" 
            });
        }

        const filePath = path.resolve(messageData.fileUrl);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                status: "error", 
                message: "File not found on server" 
            });
        }

        // Get original filename from path
        const fileName = path.basename(filePath);
        
        // Set appropriate headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({ status: "error", message: "Error downloading file" });
            }
        });

    } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};
