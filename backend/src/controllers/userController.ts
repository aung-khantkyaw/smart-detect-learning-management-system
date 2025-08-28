import type { Request, Response } from 'express';
import { db } from '../db';
import { academicChatRooms, chatMembers, courseChatRooms, courseOfferings, enrollments, users, courses } from '../db/schema'
import { and, desc, eq, not, inArray, sql } from 'drizzle-orm';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users).where(not(eq(users.role, 'ADMIN'))).orderBy(desc(users.createdAt));
    
    res.json({ status: 'success', data: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({ status: 'success', data: user[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, role, fullName, department_id, position_id, major_id, academic_year_id, studentNumber } = req.body;
  
  try {
    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const updateUser = {
      username: user[0].email.split('@')[0],
      email: email || user[0].email,
      role: role || user[0].role,
      fullName: fullName || user[0].fullName,

      departmentId: department_id || user[0].departmentId,
      positionId: position_id || user[0].positionId,

      majorId: major_id || user[0].majorId,
      academicYearId: academic_year_id || user[0].academicYearId,
      studentNumber: studentNumber || user[0].studentNumber,
    };

    const updatedUser = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();

    res.json({ status: 'success', message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const banUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const user = await db.select().from(users).where(eq(users.id, id));

    if (user.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const isActive = user[0].isActive ? false : true;

    const banUser = await db.update(users).set({ isActive }).where(eq(users.id, id)).returning();

    res.json({ status: 'success', message: 'User banned successfully', data: banUser });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await db.select().from(users).where(eq(users.role, 'STUDENT'));
    res.json({ status: 'success', data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

export const getEnrollmentByStudentId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Return list of enrolled offerings for the given student, enriched with course info
    const rows = await db
      .select({
        enrollmentId: enrollments.id,
        offeringId: courseOfferings.id,
        courseId: courseOfferings.courseId,
        code: courses.code,
        title: courses.title,
      })
      .from(enrollments)
      .leftJoin(courseOfferings, eq(enrollments.offeringId, courseOfferings.id))
      .leftJoin(courses, eq(courseOfferings.courseId, courses.id))
      .where(eq(enrollments.studentId, id));

    return res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching enrollment by student ID:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getCourseChatRoomsByStudentId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const chatRooms = await db.select().from(chatMembers).where(and(eq(chatMembers.userId, id), eq(chatMembers.roomType, 'COURSE')));

    if (chatRooms.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No chat rooms found for this student' });
    }

    const chatRoomDetails: any[] = [];

    await Promise.all(chatRooms.map(async (chatRoom) => {
      const chatRoomDetail = await db.select().from(courseChatRooms).where(eq(courseChatRooms.id, chatRoom.roomId));
      chatRoomDetails.push(chatRoomDetail);
    }));

    res.json({ status: 'success', data: chatRoomDetails });
  } catch (error) {
    console.error('Error fetching course chat rooms by student ID:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getAcademicChatRoomByStudentId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const chatRooms = await db.select().from(chatMembers).where(and(eq(chatMembers.userId, id), eq(chatMembers.roomType, 'ACADEMIC')));

    if (chatRooms.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No chat rooms found for this student' });
    }

    const chatRoomDetails: any[] = [];

    await Promise.all(chatRooms.map(async (chatRoom) => {
      const chatRoomDetail = await db.select().from(academicChatRooms).where(eq(academicChatRooms.id, chatRoom.roomId));
      chatRoomDetails.push(chatRoomDetail);
    }));

    res.json({ status: 'success', data: chatRoomDetails });
  } catch (error) {
    console.error('Error fetching academic chat rooms by student ID:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await db.select().from(users).where(eq(users.role, 'TEACHER'));
    res.json({ status: 'success', data: teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getOfferingCoursesByTeacherId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const offeringCourses = await db
      .select()
      .from(courseOfferings)
      .where(eq(courseOfferings.teacherId, id));

    if (offeringCourses.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No offering courses found for this teacher' });
    }

    // Collect enrollment counts per offering
    const offeringIds = offeringCourses.map((o) => o.id);
    let countsMap = new Map<string, number>();
    if (offeringIds.length > 0) {
      const counts = await db
        .select({ offeringId: enrollments.offeringId, count: sql<number>`count(*)` })
        .from(enrollments)
        .where(inArray(enrollments.offeringId, offeringIds))
        .groupBy(enrollments.offeringId);
      countsMap = new Map(counts.map((c) => [c.offeringId, Number(c.count)]));
    }

    const enriched = offeringCourses.map((o) => ({
      ...o,
      enrolledCount: countsMap.get(o.id) || 0,
    }));

    res.json({ status: 'success', data: enriched });
  } catch (error) {
    console.error('Error fetching offering courses by teacher ID:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getCourseChatRoomsByTeacherId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const chatRooms = await db.select().from(chatMembers).where(and(eq(chatMembers.userId, id), eq(chatMembers.roomType, 'COURSE')));

    if (chatRooms.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No chat rooms found for this teacher' });
    }

    const chatRoomDetails: any[] = [];

    await Promise.all(chatRooms.map(async (chatRoom) => {
      const chatRoomDetail = await db.select().from(courseChatRooms).where(eq(courseChatRooms.id, chatRoom.roomId));
      chatRoomDetails.push(chatRoomDetail);
    }));

    res.json({ status: 'success', data: chatRoomDetails });
  } catch (error) {
    console.error('Error fetching course chat rooms by teacher ID:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};