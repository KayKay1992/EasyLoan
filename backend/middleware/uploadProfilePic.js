const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const uploadDir = 'uploads';
const createUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log("✅ Uploads directory created/verified");
  } catch (err) {
    console.error('Failed to create upload directory:', err.message);
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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png formats allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const baseUrl = process.env.BASE_URL || 'https://easyloan.onrender.com';
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    console.log('Generated imageUrl:', imageUrl);
    res.status(200).json({ success: true, data: { imageUrl } });
  });
};