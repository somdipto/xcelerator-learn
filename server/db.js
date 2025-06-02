// server/db.js
import { MongoClient, ObjectId } from 'mongodb';

// TODO: Move MongoDB URI to environment variables for security and flexibility
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_cms'; // Default URI
const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (db) return db; // Return existing connection if already connected
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(); // Get default database from URI or specify one: client.db('yourDbName');

    // Create collections with schema validation if they don't exist (optional, good practice)
    // This is a more advanced setup, for now, we assume collections are created or will be created on first insert.
    // Example: await setupCollections(db);

    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process if DB connection fails
  }
}

// Optional: Function to set up collections with schema validation
// async function setupCollections(database) {
//   try {
//     const collections = await database.listCollections({ name: 'study_materials' }).toArray();
//     if (collections.length === 0) {
//       await database.createCollection('study_materials', {
//         validator: {
//           $jsonSchema: {
//             bsonType: 'object',
//             required: ['teacherId', 'title', 'type', 'createdAt', 'updatedAt'],
//             properties: {
//               teacherId: { bsonType: 'string', description: 'must be a string and is required' },
//               title: { bsonType: 'string', description: 'must be a string and is required' },
//               description: { bsonType: 'string', description: 'must be a string' },
//               type: { enum: ['video', 'pdf', 'link', 'other'], description: 'can only be one of the enum values and is required' },
//               url: { bsonType: 'string', description: 'must be a string if type is video or link' },
//               filePath: { bsonType: 'string', description: 'must be a string if type is pdf or other' },
//               subjectId: { bsonType: 'string', description: 'must be a string' },
//               chapterId: { bsonType: 'string', description: 'must be a string' },
//               createdAt: { bsonType: 'date', description: 'must be a date and is required' },
//               updatedAt: { bsonType: 'date', description: 'must be a date and is required' },
//             }
//           }
//         }
//       });
//       console.log("Created 'study_materials' collection with schema validation.");
//     }
//   } catch (err) {
//     console.error("Error setting up 'study_materials' collection:", err);
//   }
// }


// CRUD Operations for Study Materials

export async function getStudyMaterialsCollection() {
  const database = await connectDB();
  return database.collection('study_materials');
}

export async function createStudyMaterial(material) {
  const collection = await getStudyMaterialsCollection();
  // Ensure dates are stored as ISODate objects in MongoDB
  material.createdAt = new Date(material.createdAt);
  material.updatedAt = new Date(material.updatedAt);
  const result = await collection.insertOne(material);
  return { ...material, _id: result.insertedId }; // Return the material with its MongoDB _id
}

export async function getAllStudyMaterials(query = {}) {
  const collection = await getStudyMaterialsCollection();
  return await collection.find(query).toArray();
}

export async function getStudyMaterialById(id) {
  if (!ObjectId.isValid(id)) return null; // Check for valid ObjectId format
  const collection = await getStudyMaterialsCollection();
  return await collection.findOne({ _id: new ObjectId(id) });
}

export async function updateStudyMaterial(id, updates) {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getStudyMaterialsCollection();

  // Ensure dates are ISODate if provided in updates
  if (updates.createdAt) updates.createdAt = new Date(updates.createdAt);
  if (updates.updatedAt) updates.updatedAt = new Date(updates.updatedAt);
  else updates.updatedAt = new Date(); // Always update the updatedAt timestamp

  // $set operator will update only specified fields
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
  if (result.matchedCount === 0) return null; // No document found with that ID
  return await getStudyMaterialById(id); // Return the updated document
}

export async function deleteStudyMaterial(id) {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getStudyMaterialsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0; // Returns true if a document was deleted
}

// Call connectDB when the module is loaded to establish connection early,
// or call it before the first DB operation in server.js.
// For simplicity here, we rely on connectDB being called by each CRUD function's getStudyMaterialsCollection.
// connectDB(); // Optionally connect on module load

// Export connectDB if you need to explicitly call it or access the db object elsewhere
export { connectDB, ObjectId };
