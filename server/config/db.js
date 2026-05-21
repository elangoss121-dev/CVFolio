import mongoose from 'mongoose';

export let connected = false;

export async function connectToDatabase(uri) {
  try {
    await mongoose.connect(uri, { connectTimeoutMS: 10000 });
    connected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    connected = false;
    console.warn('MongoDB connection failed, running with in-memory fallback store.');
    console.warn(error.message);
  }
}
