const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');

const createUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('✅ Uploads directory ensured');
  } catch (err) {
    console.error('❌ Failed to create upload directory:', err.message);
    throw new Error('Failed to create upload directory');
  }
};

// Call this once during app startup
createUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Now purely sync
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
