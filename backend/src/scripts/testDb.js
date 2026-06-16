import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const testConnection = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  console.log('Attempting to connect to MongoDB...');
  console.log(`URI: ${uri ? '****' : 'MISSING'}`);
  console.log(`DB Name: ${dbName || 'MISSING'}`);

  if (!uri || !dbName) {
    console.error('Missing MONGO_URI or MONGO_DB_NAME in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName });
    console.log('✅ Connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    if (error.message.includes('authentication failed')) {
      console.log('\nTip: Check if your password contains special characters like @, :, or #.');
      console.log('These must be URL-encoded (e.g., @ becomes %40).');
    }
    process.exit(1);
  }
};

testConnection();
