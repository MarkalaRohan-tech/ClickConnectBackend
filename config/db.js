import mongoose from 'mongoose';

export async function connectDB(uri) {
  try {
    console.log('Connecting to MongoDB URI:', uri); // debug
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
  console.log("Database name:", mongoose.connection.name);
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  }
}
