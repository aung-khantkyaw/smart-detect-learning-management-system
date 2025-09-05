import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { Request, Response } from 'express';

export const getBackups = async (req: Request, res: Response) => {
  try {
    const allowedDirs = ['daily', 'weekly', 'monthly', 'manual'];
    const filterType = (req.query.type as string | undefined)?.toLowerCase();
    if (filterType && !allowedDirs.includes(filterType)) {
      return res.status(400).json({ error: 'Invalid type filter. Use daily|weekly|monthly.' });
    }

    const dirsToScan = filterType ? [filterType] : allowedDirs;
    const backups: any[] = [];

    for (const dir of dirsToScan) {
      const dirPath = path.join(__dirname, '../../../database/backups', dir);
      try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          if (file.endsWith('.sql.gz')) {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);
            backups.push({
              filename: file,
              sizeBytes: stats.size,
              size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
              created: stats.mtime,
              type: dir
            });
          }
        }
      } catch (err) {
        // Directory may not exist (e.g., no monthly backups yet)
        continue;
      }
    }

    backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    // Summary counts and last backup timestamps per type
    const summary: Record<string, number> = {};
    const last: Record<string, string> = {};
    for (const b of backups) {
      summary[b.type] = (summary[b.type] || 0) + 1;
      if (!last[b.type]) {
        last[b.type] = new Date(b.created).toISOString();
      }
    }
    if (backups.length > 0) {
      last.overall = new Date(backups[0].created).toISOString();
    }

    res.json({ items: backups, summary, last });
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

  const backupDirs = ['daily', 'weekly', 'monthly', 'manual'];
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