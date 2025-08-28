import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure a directory exists (recursive)
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Base upload directory: uploads/material
const baseUploadDir = path.resolve(process.cwd(), 'uploads', 'material');
ensureDir(baseUploadDir);
ensureDir(path.join(baseUploadDir, 'image'));
ensureDir(path.join(baseUploadDir, 'video'));
ensureDir(path.join(baseUploadDir, 'document'));

// Decide destination subfolder by mimetype
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const type = (file.mimetype || '').toLowerCase();
    let sub: 'image' | 'video' | 'document' = 'document';
    if (type.startsWith('image/')) sub = 'image';
    else if (type.startsWith('video/')) sub = 'video';
    else if (
      type === 'application/pdf' ||
      type.includes('msword') ||
      type.includes('officedocument') ||
      type.startsWith('text/')
    ) {
      sub = 'document';
    }
    const dest = path.join(baseUploadDir, sub);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${safeOriginal}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const type = (file.mimetype || '').toLowerCase();
  const allowed =
    type.startsWith('image/') ||
    type.startsWith('video/') ||
    type === 'application/pdf' ||
    type.includes('msword') ||
    type.includes('officedocument') ||
    type.startsWith('text/');
  if (allowed) return cb(null, true);
  cb(new Error('Unsupported file type'));
};

export const materialUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Helper to convert saved file path to a web URL beginning with /uploads
export function filePathToUrl(filePath: string): string {
  const rel = path.relative(process.cwd(), filePath).split(path.sep).join('/');
  return `/${rel.replace(/^\/+/, '')}`;
}
