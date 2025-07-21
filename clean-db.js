// Simple database cleanup script
// Run with: node clean-db.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function cleanDatabase() {
    try {
        console.log('🧹 Cleaning database...');
        
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        
        const db = client.db(process.env.MONGODB_DB || 'attendanceManager');
        const collection = db.collection('attendance');
        
        // Delete all attendance records
        const result = await collection.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} attendance records`);
        
        await client.close();
        console.log('✅ Database cleaned successfully');
        
    } catch (error) {
        console.error('❌ Database cleaning failed:', error.message);
    }
}

cleanDatabase();
