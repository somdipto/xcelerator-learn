
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Setting up Teacher CMS with MongoDB...\n');

// Create necessary directories
const dirs = ['server', 'uploads', 'uploads/content'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create MongoDB start script
const mongoScript = `#!/bin/bash
echo "Starting MongoDB..."
if command -v mongod &> /dev/null; then
    mongod --dbpath ./data/db --port 27017
else
    echo "MongoDB not found. Please install MongoDB first:"
    echo "https://docs.mongodb.com/manual/installation/"
fi
`;

fs.writeFileSync('scripts/start-mongo.sh', mongoScript);
fs.chmodSync('scripts/start-mongo.sh', '755');

// Create development start script
const devScript = `#!/bin/bash
echo "Starting Teacher CMS Development Environment..."

# Start MongoDB in background
echo "Starting MongoDB..."
mongod --dbpath ./data/db --port 27017 &
MONGO_PID=$!

# Wait for MongoDB to start
sleep 3

# Start backend server
echo "Starting backend server..."
cd server && npm start &
SERVER_PID=$!

# Start frontend
echo "Starting frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo "✅ All services started!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3001"
echo "🗄️  MongoDB: mongodb://localhost:27017"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle cleanup
cleanup() {
    echo "Stopping services..."
    kill $MONGO_PID $SERVER_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup INT TERM

# Wait for any process to exit
wait
`;

fs.writeFileSync('scripts/dev.sh', devScript);
fs.chmodSync('scripts/dev.sh', '755');

// Create package.json scripts
const packageJsonPath = './package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    "setup": "node scripts/setup.js",
    "dev:full": "bash scripts/dev.sh",
    "server": "cd server && npm start",
    "mongo": "bash scripts/start-mongo.sh"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with new scripts');
}

// Create README for setup instructions
const readmeContent = `# Teacher CMS - Local Setup

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (Community Edition)
- npm or yarn

## Installation

1. **Install MongoDB** (if not already installed):
   - macOS: \`brew install mongodb-community\`
   - Ubuntu: \`sudo apt install mongodb\`
   - Windows: Download from https://www.mongodb.com/try/download/community

2. **Create MongoDB data directory**:
   \`\`\`bash
   sudo mkdir -p /data/db
   sudo chown -R \$USER /data/db
   \`\`\`

3. **Install dependencies**:
   \`\`\`bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd server && npm install
   \`\`\`

## Running the Application

### Option 1: Full Development Environment (Recommended)
\`\`\`bash
npm run dev:full
\`\`\`
This starts MongoDB, backend server, and frontend in one command.

### Option 2: Manual Start
\`\`\`bash
# Terminal 1: Start MongoDB
npm run mongo

# Terminal 2: Start backend server
npm run server

# Terminal 3: Start frontend
npm run dev
\`\`\`

## Access Points
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3001
- 🗄️  **MongoDB**: mongodb://localhost:27017

## Features
- ✅ Real-time content upload with file compression
- ✅ MongoDB local database storage
- ✅ Live sync between teacher and student portals
- ✅ Subject and content management
- ✅ File type validation and size optimization
- ✅ Responsive design for all devices

## File Storage
- Uploaded files are stored in \`uploads/content/\`
- Images are automatically compressed using Sharp
- File metadata is stored in MongoDB
- Real-time updates via Socket.io

## Database Collections
- \`content\`: Uploaded learning materials
- \`subjects\`: Subject definitions and chapters
- \`teachers\`: Teacher authentication data

## Troubleshooting
- Ensure MongoDB is running before starting the backend
- Check that ports 5173, 3001, and 27017 are available
- Clear browser cache if experiencing sync issues
`;

fs.writeFileSync('LOCAL_SETUP.md', readmeContent);
console.log('✅ Created LOCAL_SETUP.md with instructions');

console.log('\n🎉 Setup complete!');
console.log('\n📚 Next steps:');
console.log('1. Install MongoDB if not already installed');
console.log('2. Run: cd server && npm install');
console.log('3. Run: npm run dev:full');
console.log('4. Open http://localhost:5173');
console.log('\n📖 See LOCAL_SETUP.md for detailed instructions');
