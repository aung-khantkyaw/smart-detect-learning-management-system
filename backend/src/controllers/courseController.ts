import type { Request, Response } from 'express';
import { db } from '../db';
import { courseOfferings, courses } from './../db/schema';
import { eq } from "drizzle-orm";

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const allCourses = await db.select().from(courses);
    res.json({ status: 'success', data: allCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const course = await db.select().from(courses).where(eq(courses.id, id));

    if (course.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    res.json({ status: 'success', data: course[0] });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
    const { title, code, description, departmentId } = req.body;

    try {
        const existingCourse = await db.select().from(courses).where(eq(courses.code, code));

        if (existingCourse.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Course with this code already exists' });
        }

        const course = { title, code, description, departmentId };

        const newCourse = await db.insert(courses).values(course).returning();

        res.status(201).json({ status: 'success', message: 'Course created successfully', data: newCourse });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, code, description, departmentId } = req.body;

    try {
        const updatedCourse = await db.update(courses)
            .set({ title, code, description, departmentId })
            .where(eq(courses.id, id))
            .returning();

        if (updatedCourse.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Course not found' });
        }

        res.json({ status: 'success', data: updatedCourse[0] });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    const { id } = req.params;

  try {
      // Prevent deletion if linked data exists
      const hasOfferings = await db
        .select({ id: courseOfferings.id })
        .from(courseOfferings)
        .where(eq(courseOfferings.courseId, id))
        .limit(1);
      if (hasOfferings.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete course: existing course offerings found'
        });
      }

      const deletedCourse = await db.delete(courses)
        .where(eq(courses.id, id))
        .returning();

      if (deletedCourse.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Course not found' });
      }

      res.json({ status: 'success', message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getOfferingCoursesByCourseId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const offeringCourses = await db.select().from(courses).where(eq(courses.id, id));

    if (offeringCourses.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    res.json({ status: 'success', data: offeringCourses });
  } catch (error) {
    console.error('Error fetching offering courses:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};