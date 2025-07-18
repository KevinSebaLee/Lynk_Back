import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: path.join(process.cwd(), 'uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;