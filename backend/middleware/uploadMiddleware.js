import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');

// Initialize directory (non-blocking, won't crash server)
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created:', uploadsDir);
  }
} catch (error) {
  console.error('❌ Error creating uploads directory:', error);
  // Don't throw - let the server start, directory creation will be retried on first upload
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware for single image upload with error handling
export const uploadProductImage = (req, res, next) => {
  // Only process multipart/form-data requests
  // If it's not multipart, skip multer and continue
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }
  
  upload.single('image')(req, res, (err) => {
    // Handle multer errors
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Unexpected file field. Use "image" field name.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      // Handle other errors (like fileFilter errors)
      if (err.message) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: 'File upload error' });
    }
    // No error, continue to next middleware
    next();
  });
};

// Helper function to get image URL
export const getImageUrl = (filename) => {
  if (!filename || typeof filename !== 'string') return null;
  // If it's already a full URL, return it as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  // If it already starts with /uploads, return as is
  if (filename.startsWith('/uploads/')) {
    return filename;
  }
  // Otherwise, return the path relative to the static route
  return `/uploads/products/${filename}`;
};

// Helper function to delete image file
export const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  
  try {
    // Extract filename from URL or path
    let filename;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // If it's a full URL, we can't delete external images
      return;
    } else if (imagePath.startsWith('/uploads/products/')) {
      filename = path.basename(imagePath);
    } else {
      filename = path.basename(imagePath);
    }
    
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Deleted image file:', filename);
    }
  } catch (error) {
    console.error('❌ Error deleting image file:', error);
    // Don't throw - file deletion failure shouldn't break the request
  }
};

