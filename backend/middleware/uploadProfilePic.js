const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use the correct uploads directory relative to the backend directory
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists **synchronously**
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Uploads directory created");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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

const handleImageUpload = (req, res) => {
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

module.exports = {
  handleImageUpload,
};