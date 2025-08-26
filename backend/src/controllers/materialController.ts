import { Request, Response } from 'express';
import { db } from '../db';
import { materials, courseOfferings, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

// Get all materials for a course offering
export const getMaterials = async (req: Request, res: Response) => {
  try {
    const { offeringId } = req.params;

    if (!offeringId) {
      return res.status(400).json({ error: 'Offering ID is required' });
    }

    const materialsList = await db
      .select({
        id: materials.id,
        title: materials.title,
        description: materials.description,
        fileUrl: materials.fileUrl,
        createdAt: materials.createdAt,
        createdBy: materials.createdBy,
        creatorName: users.fullName
      })
      .from(materials)
      .leftJoin(users, eq(materials.createdBy, users.id))
      .where(eq(materials.offeringId, offeringId))
      .orderBy(desc(materials.createdAt));

    res.json(materialsList);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

// Get a single material
export const getMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const material = await db
      .select({
        id: materials.id,
        title: materials.title,
        description: materials.description,
        fileUrl: materials.fileUrl,
        createdAt: materials.createdAt,
        createdBy: materials.createdBy,
        offeringId: materials.offeringId,
        creatorName: users.fullName
      })
      .from(materials)
      .leftJoin(users, eq(materials.createdBy, users.id))
      .where(eq(materials.id, id))
      .limit(1);

    if (material.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material[0]);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
};

// Create a new material
export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { offeringId } = req.params;
    const { title, description, fileUrl } = req.body;
    const userId = (req as any).user?.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Verify the offering exists
    const offering = await db
      .select()
      .from(courseOfferings)
      .where(eq(courseOfferings.id, offeringId))
      .limit(1);

    if (offering.length === 0) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    const newMaterial = await db
      .insert(materials)
      .values({
        offeringId,
        title,
        description,
        fileUrl,
        createdBy: userId
      })
      .returning();

    res.status(201).json(newMaterial[0]);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
};

// Update a material
export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl } = req.body;

    const updatedMaterial = await db
      .update(materials)
      .set({
        title,
        description,
        fileUrl
      })
      .where(eq(materials.id, id))
      .returning();

    if (updatedMaterial.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(updatedMaterial[0]);
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
};

// Delete a material
export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedMaterial = await db
      .delete(materials)
      .where(eq(materials.id, id))
      .returning();

    if (deletedMaterial.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
};
