import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ Error: MONGO_URI not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing MongoDB connection...');
console.log('📍 URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000
})
  .then(conn => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('✅ Connection closed gracefully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Failed!');
    console.error('   Error:', err.message);
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Wrong username or password in MONGO_URI');
      console.error('   2. Database user does not exist in MongoDB Atlas');
      console.error('   3. Password contains special characters that need URL encoding');
      console.error('   4. User does not have access to the specified database');
    } else if (err.message.includes('querySrv') || err.message.includes('ENOTFOUND')) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Wrong cluster hostname in MONGO_URI');
      console.error('   2. Network/DNS issues');
    } else if (err.message.includes('IP')) {
      console.error('\n💡 Possible issues:');
      console.error('   1. Your IP address is not whitelisted in MongoDB Atlas');
      console.error('   2. Go to Atlas → Network Access → Add IP Address (or use 0.0.0.0/0 for testing)');
    }
    process.exit(1);
  });

