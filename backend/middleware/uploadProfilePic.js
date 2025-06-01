const multer = require('multer');
const path = require('path');
const asyncHandler = require('express-async-handler');
const fs = require('fs').promises; // Use promises for async file operations
const { imageType } = require('image-type'); // For validating image contents
const { v4: uuidv4 } = require('uuid'); // For robust unique filenames

// Ensure uploads directory exists
const uploadDir = 'uploads/';
const createUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    throw new Error('Failed to create upload directory');
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await createUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4(); // Use UUID for unique filenames
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});

// File filter to validate image types
const fileFilter = async (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only .jpeg, .jpg, and .png formats are allowed'), false);
  }

  // Validate file contents
  const buffer = await new Promise((resolve) => {
    const chunks = [];
    file.stream.on('data', (chunk) => chunks.push(chunk));
    file.stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
  const type = await imageType(buffer);
  if (!type || !allowedTypes.includes(type.mime)) {
    return cb(new Error('Invalid image file'), false);
  }
  cb(null, true);
};

// Configure multer to expect 'image' field
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('image');

// Upload profile picture controller
const uploadProfilePic = asyncHandler(async (req, res) => {
  // Ensure authentication (example, adapt to your auth middleware)
  // if (!req.user) {
  //   return res.status(401).json({
  //     success: false,
  //     error: 'unauthorized',
  //     message: 'User not authenticated',
  //   });
  // }

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'file_too_large',
          message: 'File size exceeds 5MB limit',
        });
      }
      return res.status(400).json({
        success: false,
        error: 'upload_error',
        message: err.message === 'Unexpected field'
          ? 'Invalid field name for file upload. Expected "image".'
          : err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: 'invalid_file',
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'no_file',
        message: 'No file uploaded',
      });
    }

    try {
      // Use environment variable for base URL
      const baseUrl = process.env.BASE_URL || 'https://easyloan-1.onrender.com';
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

      // Example: Save imageUrl to user profile in MongoDB (adapt to your schema)
      // await User.updateOne(
      //   { _id: req.user._id },
      //   { profilePic: imageUrl }
      // );

      res.status(200).json({
        success: true,
        data: { imageUrl },
      });
    } catch (error) {
      // Cleanup: Delete uploaded file if subsequent operations fail
      await fs.unlink(path.join(uploadDir, req.file.filename)).catch(() => {});
      res.status(500).json({
        success: false,
        error: 'server_error',
        message: 'Failed to process image upload',
      });
    }
  });
});

module.exports = { uploadProfilePic };