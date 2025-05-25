
const fs = require('fs');

const packageJsonPath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  "setup": "node scripts/setup.js && cd server && npm install",
  "dev:full": "concurrently \"mongod --dbpath ./data/db\" \"cd server && npm start\" \"npm run dev\"",
  "server": "cd server && npm start",
  "mongo": "mongod --dbpath ./data/db"
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Updated package.json with development scripts');
