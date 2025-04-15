const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Reusable storage creator (called ONCE only)
const createStorage = (folder) => {
  const fullPath = path.join('uploads', folder);
  fs.mkdirSync(fullPath, { recursive: true });

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName = `${folder}-${Date.now()}${ext}`;
      console.log('Saving file:', uniqueName); // Debug upload
      cb(null, uniqueName);
    }
  });
};

// File filter to allow only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed'), false);
  }
};

// Create storage only once for each upload type
const repaymentStorage = createStorage('repayments');
const documentStorage = createStorage('documents');

// Use predefined storage objects
const uploadRepayment = multer({ storage: repaymentStorage, fileFilter });
const uploadDocument = multer({ storage: documentStorage, fileFilter });

module.exports = {
  uploadDocument,
  uploadRepayment,
};
