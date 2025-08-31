import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { Request, Response } from 'express';

export const getBackups = async (req: Request, res: Response) => {
  try {
    const backupDirs = ['weekly', 'daily', 'manual'];
    const backups: any[] = [];

    for (const dir of backupDirs) {
      const dirPath = path.join(__dirname, '../../../database/backups', dir);
      try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          if (file.endsWith('.sql.gz')) {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);
            backups.push({
              filename: file,
              path: filePath,
              size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
              created: stats.mtime,
              type: dir
            });
          }
        }
      } catch (err) {
        console.log(`Directory ${dir} not found or empty`);
      }
    }

    backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    res.json(backups);
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
};

export const restoreBackup = async (req: Request, res: Response) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const backupDirs = ['weekly', 'daily', 'manual'];
    let backupPath: string | null = null;

    for (const dir of backupDirs) {
      const filePath = path.join(__dirname, '../../../database/backups', dir, filename);
      try {
        await fs.access(filePath);
        backupPath = filePath;
        break;
      } catch (err) {
        continue;
      }
    }

    if (!backupPath) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    const restoreCommand = `gunzip -c "${backupPath}" | docker exec -i sdlms-postgres psql -U postgres -d sdlms`;
    
    exec(restoreCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Restore error:', error);
        return res.status(500).json({ error: 'Failed to restore backup: ' + error.message });
      }
      
      console.log('Backup restored successfully');
      res.json({ message: 'Backup restored successfully' });
    });

  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
};