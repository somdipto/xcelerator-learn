// server/server.js
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'uploads' directory, making them accessible via /uploads URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Save files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Sanitize filename to prevent path traversal and other issues
    const safeOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._\-]/g, ''); // Escaped hyphen in regex
    cb(null, Date.now() + '-' + safeOriginalName); // Prepend timestamp to ensure uniqueness
  }
});
const upload = multer({ storage: storage });

// In-memory store for study materials (replace with actual database interaction later)
let studyMaterials = [
    {
        id: '1',
        teacherId: 'teacher1', // Example teacherId
        title: 'Initial Mock PDF Material from Server',
        description: 'A PDF loaded from server. Assumes mockfile.pdf exists or client handles missing file.',
        type: 'pdf',
        filePath: 'uploads/mockfile.pdf', // Relative path for client access
        subjectId: 'subj1',
        chapterId: 'chap1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        teacherId: 'teacher1',
        title: 'Initial Mock Video Material from Server',
        description: 'A video link loaded from server.',
        type: 'video',
        url: 'https://www.example.com/mockvideo',
        subjectId: 'subj1',
        chapterId: 'chap2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
let nextId = 3; // Counter for generating unique IDs for new materials

// API Endpoints for Study Materials

// GET all study materials
app.get('/api/studymaterials', (req, res) => {
  // TODO: Implement filtering by teacherId based on authentication later
  res.json(studyMaterials);
});

// POST a new study material
// upload.single('file') middleware handles a single file upload from a form field named 'file'
app.post('/api/studymaterials', upload.single('file'), (req, res) => {
  const { title, description, type, url, subjectId, chapterId, teacherId = 'teacher1' } = req.body; // Default teacherId for now

  if (!title || !type) {
    return res.status(400).json({ message: 'Title and type are required fields.' });
  }

  const newMaterial = {
    id: String(nextId++),
    teacherId, // This should come from authenticated user session in a real app
    title,
    description: description || '',
    type,
    subjectId: subjectId || '',
    chapterId: chapterId || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (req.file) {
    // If a file is uploaded, store its relative path (accessible via /uploads/filename)
    newMaterial.filePath = `uploads/${req.file.filename}`;
  } else if (type === 'link' || type === 'video') {
    if (!url) return res.status(400).json({ message: 'URL is required for link or video types.'});
    newMaterial.url = url;
  } else if (type === 'pdf' || type === 'other') {
    // These types expect a file, but none was provided.
     return res.status(400).json({ message: 'A file is required for PDF or Other material types if not editing.' });
  }

  studyMaterials.push(newMaterial);
  res.status(201).json(newMaterial);
});

// PUT (update) an existing study material by ID
app.put('/api/studymaterials/:id', upload.single('file'), (req, res) => {
  const { id } = req.params;
  const { title, description, type, url, subjectId, chapterId } = req.body; // teacherId is not typically updatable here
  const materialIndex = studyMaterials.findIndex(m => m.id === id);

  if (materialIndex === -1) {
    return res.status(404).json({ message: 'Study material not found.' });
  }

  const materialToUpdate = { ...studyMaterials[materialIndex] }; // Create a copy to modify

  // Update fields if provided in the request
  materialToUpdate.title = title || materialToUpdate.title;
  materialToUpdate.description = description || materialToUpdate.description;
  materialToUpdate.type = type || materialToUpdate.type;
  materialToUpdate.subjectId = subjectId || materialToUpdate.subjectId;
  materialToUpdate.chapterId = chapterId || materialToUpdate.chapterId;
  materialToUpdate.updatedAt = new Date().toISOString();

  if (req.file) { // If a new file is uploaded
    // Delete the old file if it exists
    if (materialToUpdate.filePath) {
      const oldFilePath = path.join(__dirname, materialToUpdate.filePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlink(oldFilePath, err => {
          if (err) console.error("Error deleting old file during update:", oldFilePath, err);
        });
      }
    }
    materialToUpdate.filePath = `uploads/${req.file.filename}`; // Set new file path
    materialToUpdate.url = undefined; // Clear URL if a file is now primary
  } else if (materialToUpdate.type === 'link' || materialToUpdate.type === 'video') {
    materialToUpdate.url = url || materialToUpdate.url; // Update URL
    // If type was changed to link/video and there was an old file, delete it
    if (materialToUpdate.filePath && (type === 'link' || type === 'video')) {
         const oldFilePath = path.join(__dirname, materialToUpdate.filePath);
         if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, err => {
                if (err) console.error("Error deleting old file when switching to URL type:", oldFilePath, err);
            });
         }
         materialToUpdate.filePath = undefined; // Clear file path
    }
  } else if (type === 'pdf' || type === 'other') { // Type is file-based but no new file uploaded
      // Keep existing filePath if no new file, unless type changed from url to file-based without a file.
      if (!materialToUpdate.filePath && !req.file){
           // This case is tricky: type changed to PDF/Other, but no file uploaded.
           // Depending on desired behavior, could error or leave as is.
           // For now, if no file path exists and no new file, it remains without a file.
           // Client-side validation should ideally prevent this if a file is mandatory for the type.
      }
  }


  studyMaterials[materialIndex] = materialToUpdate;
  res.json(materialToUpdate);
});

// DELETE a study material by ID
app.delete('/api/studymaterials/:id', (req, res) => {
  const { id } = req.params;
  const materialIndex = studyMaterials.findIndex(m => m.id === id);

  if (materialIndex === -1) {
    return res.status(404).json({ message: 'Study material not found.' });
  }

  const materialToDelete = studyMaterials[materialIndex];
  // If there's an associated file, delete it from the server
  if (materialToDelete.filePath) {
    const filePathToDelete = path.join(__dirname, materialToDelete.filePath);
     if (fs.existsSync(filePathToDelete)) {
        fs.unlink(filePathToDelete, err => {
            if (err) {
                console.error("Error deleting file from filesystem:", filePathToDelete, err);
                // Decide if you should still proceed to remove from DB / send success
            }
        });
    }
  }

  studyMaterials.splice(materialIndex, 1); // Remove from in-memory array
  res.status(200).json({ message: 'Study material deleted successfully.' });
});

// Basic error handling middleware (add more specific error handlers as needed)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke on the server!');
});

// Start the server, excluding in test environment to prevent EADDRINUSE errors
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(\`Server listening on port \${PORT}\`);
        console.log(\`Uploads directory: \${uploadsDir}\`);
        console.log(\`Serving uploaded files from /uploads path\`);
    });
}

export default app; // Export app for potential testing or programmatic use
