
const express = require('express');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const sharp = require('sharp');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// MongoDB connection
let db;
const connectDB = async () => {
  try {
    const client = new MongoClient('mongodb://localhost:27017', {
      useUnifiedTopology: true
    });
    await client.connect();
    db = client.db('teacher_cms');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// File storage setup
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/content';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp4|avi|doc|docx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Compress images
const compressImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    const compressedPath = filePath.replace(ext, `_compressed${ext}`);
    await sharp(filePath)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(compressedPath);
    
    // Replace original with compressed
    await fs.unlink(filePath);
    await fs.rename(compressedPath, filePath);
  }
};

// Routes

// Upload content
app.post('/api/content/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject, chapter, grade, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Compress if image
    await compressImage(file.path);

    const contentData = {
      title,
      description,
      subject,
      chapter,
      grade: parseInt(grade),
      type,
      fileName: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      filePath: file.path,
      uploadDate: new Date(),
      teacherId: 'teacher_1' // For now, hardcoded
    };

    const result = await db.collection('content').insertOne(contentData);
    
    // Emit to all connected clients
    io.emit('contentUploaded', { ...contentData, _id: result.insertedId });
    
    res.json({ success: true, content: { ...contentData, _id: result.insertedId } });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get all content
app.get('/api/content', async (req, res) => {
  try {
    const content = await db.collection('content').find({}).sort({ uploadDate: -1 }).toArray();
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Delete content
app.delete('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await db.collection('content').findOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (content) {
      // Delete file
      try {
        await fs.unlink(content.filePath);
      } catch (fileError) {
        console.error('File deletion error:', fileError);
      }
      
      // Delete from database
      await db.collection('content').deleteOne({ _id: new require('mongodb').ObjectId(id) });
      
      // Emit to all connected clients
      io.emit('contentDeleted', id);
      
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Subject routes
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await db.collection('subjects').find({}).toArray();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const result = await db.collection('subjects').insertOne({
      ...req.body,
      createdAt: new Date()
    });
    
    const subject = { ...req.body, _id: result.insertedId };
    io.emit('subjectAdded', subject);
    
    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('subjects').updateOne(
      { _id: new require('mongodb').ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    
    io.emit('subjectUpdated', { _id: id, ...req.body });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('subjects').deleteOne({ _id: new require('mongodb').ObjectId(id) });
    
    io.emit('subjectDeleted', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
