import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    const id = req.params.id
    const dir = path.join(process.cwd(), 'uploads')

    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  }, filename: (req, res, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, 'photo' + ext)
  }
})

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Solo se permiten archivos de imagen.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter
});

export default { upload, storage };