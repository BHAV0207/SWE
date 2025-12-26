const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// create uploads folder if not exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'issue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// create new issue
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // check required fields
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please provide title, description, and category' });
    }

    // check empty strings
    if (title.trim() === '' || description.trim() === '') {
      return res.status(400).json({ message: 'Title and description cannot be empty' });
    }

    // check valid category
    const validCategories = ['Electrical', 'Water', 'Internet', 'Infrastructure'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        message: 'Invalid category', 
        validCategories: validCategories 
      });
    }

    const issueData = {
      title: title.trim(),
      description: description.trim(),
      category,
      createdBy: req.user._id
    };

    if (req.file) {
      issueData.image = req.file.filename;
    }

    const issue = new Issue(issueData);
    await issue.save();
    
    await issue.populate('createdBy', 'name email');
    console.log('Issue created:', issue._id);

    res.status(201).json(issue);
  } catch (error) {
    console.log('Create issue error:', error.message);
    
    // handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message 
      });
    }
    
    // handle file upload errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image file too large. Maximum size is 5MB' });
      }
      return res.status(400).json({ message: 'File upload error', error: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// get my issues
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = { createdBy: req.user._id };
    
    // Validate category filter if provided
    if (category) {
      const validCategories = ['Electrical', 'Water', 'Internet', 'Infrastructure'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          message: 'Invalid category filter', 
          validCategories: validCategories 
        });
      }
      filter.category = category;
    }
    
    // check status filter
    if (status) {
      const validStatuses = ['Open', 'In Progress', 'Resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status filter', 
          validStatuses: validStatuses 
        });
      }
      filter.status = status;
    }

    const issues = await Issue.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    console.log('Got issues for user:', req.user._id);
    res.json(issues);
  } catch (error) {
    console.log('Get my issues error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// get all issues (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    
    // check category filter
    if (category) {
      const validCategories = ['Electrical', 'Water', 'Internet', 'Infrastructure'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          message: 'Invalid category filter', 
          validCategories: validCategories 
        });
      }
      filter.category = category;
    }
    
    // check status filter
    if (status) {
      const validStatuses = ['Open', 'In Progress', 'Resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status filter', 
          validStatuses: validStatuses 
        });
      }
      filter.status = status;
    }

    const issues = await Issue.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    console.log('Admin got all issues');
    res.json(issues);
  } catch (error) {
    console.log('Get all issues error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// update issue status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    // check if status provided
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // check valid status
    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value', 
        validStatuses: validStatuses 
      });
    }

    // check valid issue id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid issue ID format' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = status;
    if (remarks !== undefined) {
      issue.remarks = remarks;
    }

    await issue.save();
    await issue.populate('createdBy', 'name email');
    
    console.log('Issue status updated:', issue._id);
    res.json(issue);
  } catch (error) {
    console.log('Update issue error:', error.message);
    
    // handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// serve uploaded images
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

module.exports = router;

