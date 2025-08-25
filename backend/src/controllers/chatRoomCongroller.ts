import type { Request, Response } from 'express';
import { db } from '../db';
import { academicChatRooms, courseChatRooms } from './../db/schema';
import { eq } from "drizzle-orm";

export const getAllAcademicChatRooms = async (req: Request, res: Response) => {
  try {
    const chatRooms = await db.select().from(academicChatRooms);
    return res.status(200).json({ status: "success", data: chatRooms })
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
    return res.status(200).json({ status: "success", data: chatRooms })
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