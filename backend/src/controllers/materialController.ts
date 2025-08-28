import { Request, Response } from 'express';
import { db } from '../db';
import { materials, courseOfferings, users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import path from 'path';

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

    // Determine fileUrl from uploaded file if present
    const uploaded = (req as any).file as Express.Multer.File | undefined;
    let storedFileUrl: string | null = null;
    if (uploaded && uploaded.path) {
      const rel = path
        .relative(process.cwd(), uploaded.path)
        .split(path.sep)
        .join('/');
      storedFileUrl = `/${rel.replace(/^\/+/, '')}`; // ensure leading slash
    } else if (fileUrl) {
      storedFileUrl = fileUrl; // fallback to provided URL
    }

    const newMaterial = await db
      .insert(materials)
      .values({
        offeringId,
        title,
        description,
        fileUrl: storedFileUrl || null,
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

    // Compute potential new fileUrl from uploaded file
    const uploaded = (req as any).file as Express.Multer.File | undefined;
    let nextFileUrl: string | undefined = undefined;
    if (uploaded && uploaded.path) {
      const rel = path
        .relative(process.cwd(), uploaded.path)
        .split(path.sep)
        .join('/');
      nextFileUrl = `/${rel.replace(/^\/+/, '')}`;
    } else if (typeof fileUrl !== 'undefined') {
      nextFileUrl = fileUrl;
    }

    const updatePayload: Partial<{
      title: string;
      description: string;
      fileUrl: string | null;
    }> = {};
    if (typeof title !== 'undefined') updatePayload.title = title;
    if (typeof description !== 'undefined') updatePayload.description = description;
    if (typeof nextFileUrl !== 'undefined') updatePayload.fileUrl = nextFileUrl || null;

    const updatedMaterial = await db
      .update(materials)
      .set(updatePayload)
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

// Download a material file (forces attachment)
export const downloadMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const material = await db
      .select({
        id: materials.id,
        title: materials.title,
        fileUrl: materials.fileUrl,
      })
      .from(materials)
      .where(eq(materials.id, id))
      .limit(1);

    if (material.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const item = material[0];
    if (!item.fileUrl) {
      return res.status(400).json({ error: 'No file attached to this material' });
    }

    // Compute absolute file path safely
    const rel = item.fileUrl.replace(/^\//, '');
    const absPath = path.resolve(process.cwd(), rel);

    // Set a reasonable filename
    const fileName = item.title || path.basename(absPath);

    return res.download(absPath, fileName);
  } catch (error) {
    console.error('Error downloading material:', error);
    return res.status(500).json({ error: 'Failed to download material' });
  }
};
