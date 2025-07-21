import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

// MongoDB Atlas compatible options with proper SSL configuration
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority',
  tls: true,
  tlsAllowInvalidCertificates: true, // Only this one for development
};

let client;
let clientPromise;

// Create connection with proper error handling
const createConnection = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    const mongoClient = new MongoClient(uri, options);
    await mongoClient.connect();
    
    // Test the connection with ping
    const admin = mongoClient.db('admin');
    await admin.command({ ping: 1 });
    console.log('✅ MongoDB Atlas connected successfully');
    
    return mongoClient;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Don't throw immediately, let the calling code handle it
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createConnection();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createConnection();
}

export default clientPromise;
