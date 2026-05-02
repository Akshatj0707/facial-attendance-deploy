const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('placeholder')) {
    console.log('⚠️  No MONGO_URI set — running in LOCAL JSON mode');
    console.log('   Set MONGO_URI env var to connect MongoDB Atlas');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.log('⚠️  Falling back to LOCAL JSON mode');
    return false;
  }
};

module.exports = connectDB;
