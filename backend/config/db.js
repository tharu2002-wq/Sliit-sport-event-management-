import mongoose from "mongoose";
import dns from "node:dns";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";

const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

if (dnsServers.length) {
  dns.setServers(dnsServers);
}

let memoryServer;

const allowMemoryFallback =
  (process.env.ALLOW_MEMORY_DB || "false").toLowerCase() === "true";

const useOldDB = (process.env.USE_OLD_DB || "false").toLowerCase() === "true";

const resolveMongoUri = () => {
  if (useOldDB && process.env.OLD_MONGO_URI) {
    return process.env.OLD_MONGO_URI;
  }

  return process.env.MONGO_URI;
};

const connectMemoryDB = async () => {
  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: process.env.MEMORY_DB_NAME || "society_management",
    },
  });

  const uri = memoryServer.getUri();
  const conn = await mongoose.connect(uri);
  console.warn("Connected to in-memory MongoDB fallback");
  console.log(`MongoDB connected: ${conn.connection.host}`);
  await seedDefaultAdmin();
};

const seedDefaultAdmin = async () => {
  try {
    const User = mongoose.model("User");
    const adminEmail = "admin@example.com";
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }

    const passwordHash = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "System Administrator",
      email: adminEmail,
      passwordHash,
      role: "Admin",
    });
    console.log("✓ Default admin user created (admin@example.com / Admin@123)");
  } catch (error) {
    console.warn(`Could not seed admin user: ${error.message}`);
  }
};

const connectDB = async () => {
  const mongoUri = resolveMongoUri();

  if (!mongoUri) {
    throw new Error("Missing MongoDB connection string. Set MONGO_URI or OLD_MONGO_URI.");
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await seedDefaultAdmin();
  } catch (error) {
    console.error(`Primary database connection failed: ${error.message}`);

    if (!allowMemoryFallback) {
      throw new Error(
        "Database connection failed and in-memory fallback is disabled"
      );
    }

    await connectMemoryDB();
  }
};

const stopMemoryDB = async () => {
  if (memoryServer) {
    await memoryServer.stop();
  }
};

process.on("SIGINT", async () => {
  await stopMemoryDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await stopMemoryDB();
  process.exit(0);
});

export default connectDB;
