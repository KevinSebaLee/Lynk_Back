import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import type { Request } from 'express';

// Use memory storage instead of disk storage for Supabase
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Solo se permiten archivos de imagen.'));
  }
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});