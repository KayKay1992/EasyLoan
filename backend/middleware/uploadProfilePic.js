const multer = require("multer");
const path = require("path");
const asyncHandler = require("express-async-handler");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

const uploadDir = "uploads/";
const createUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    throw new Error("Failed to create upload directory");
  }
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await createUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = async (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only .jpeg, .jpg, and .png formats are allowed"),
      false
    );
  }

  // Dynamically import image-type
  const { default: imageType } = await import("image-type");

  const buffer = await new Promise((resolve) => {
    const chunks = [];
    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
  const type = await imageType(buffer);
  if (!type || !allowedTypes.includes(type.mime)) {
    return cb(new Error("Invalid image file"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

const uploadProfilePic = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          error: "file_too_large",
          message: "File size exceeds 5MB limit",
        });
      }
      return res.status(400).json({
        success: false,
        error: "upload_error",
        message:
          err.message === "Unexpected field"
            ? 'Invalid field name for file upload. Expected "image".'
            : err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: "invalid_file",
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "no_file",
        message: "No file uploaded",
      });
    }

    try {
      const baseUrl = process.env.BASE_URL || "https://easyloan.onrender.com";
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      res.status(200).json({
        success: true,
        data: { imageUrl },
      });
    } catch (error) {
      await fs.unlink(path.join(uploadDir, req.file.filename)).catch(() => {});
      res.status(500).json({
        success: false,
        error: "server_error",
        message: "Failed to process image upload",
      });
    }
  });
});

module.exports = { uploadProfilePic };
