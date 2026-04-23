import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { MongoMemoryServer } from "mongodb-memory-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const createAdmin = async () => {
  let memoryServer = null;
  try {
    const mongoUri = process.env.MONGO_URI;
    const allowMemoryFallback = (process.env.ALLOW_MEMORY_DB || "true").toLowerCase() === "true";
    
    try {
      if (mongoUri) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log("✓ Connected to MongoDB Atlas");
      } else {
        throw new Error("MONGO_URI not found");
      }
    } catch (atlasError) {
      console.warn("⚠ MongoDB Atlas connection failed, using in-memory database fallback...");
      
      if (!allowMemoryFallback) {
        throw new Error("Database connection failed and fallback is disabled");
      }
      
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: process.env.MEMORY_DB_NAME || "society_management",
        },
      });
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log("✓ Connected to in-memory MongoDB");
    }

    const email = "admin@example.com";
    const password = "Admin@123";
    const name = "System Administrator";
    const role = "Admin";

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`ℹ Admin with email ${email} already exists. Updating password...`);
      const passwordHash = await bcrypt.hash(password, 10);
      existingAdmin.passwordHash = passwordHash;
      await existingAdmin.save();
      console.log("✓ Admin password updated successfully.");
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        passwordHash,
        role,
      });
      console.log(`✓ Admin user created successfully!`);
    }
    
    console.log(`\n📝 Admin Credentials:\n   Email: ${email}\n   Password: ${password}`);

    mongoose.connection.close();
    
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    if (memoryServer) {
      await memoryServer.stop();
    }
    process.exit(1);
  }
};

createAdmin();
