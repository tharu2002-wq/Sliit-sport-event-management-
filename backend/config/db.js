const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("MONGO_URI is not set. Starting server without database connection.");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.warn("Continuing without database connection.");
  }
};

module.exports = connectDB;
