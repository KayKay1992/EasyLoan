const multer = require('multer');
const fs = require('fs').promises;

const uploadDir = 'uploads';
const createUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    throw new Error('Failed to create upload directory');
  }
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await createUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png, and .pdf formats are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('documents');

module.exports = upload;