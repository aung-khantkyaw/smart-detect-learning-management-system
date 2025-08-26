import multer from "multer";
import path from "path";
import fs from "fs";

// Dynamic multer storage for any sub-folder under 'uploads'
export function getMulterUpload(subFolder: string) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = `uploads/${subFolder}/`;
            // Create directory if it doesn't exist
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    });
    return multer({ storage });
}