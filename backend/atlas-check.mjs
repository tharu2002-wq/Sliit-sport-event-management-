import "dotenv/config.js";
import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI not found in environment");
  process.exit(1);
}

console.log("Attempting to connect with URI pattern:", uri.replace(/:([^@]+)@/, ":****@"));

try {
  await mongoose.connect(uri, { 
    serverSelectionTimeoutMS: 15000,
  });
  console.log("SUCCESSFULLY CONNECTED TO:", mongoose.connection.host);
  await mongoose.disconnect();
} catch (e) {
  console.error("CONNECTION FAILED");
  console.error("ERROR NAME:", e.name);
  console.error("ERROR MESSAGE:", e.message);
  if (e?.cause) {
    console.error("CAUSE:", e.cause?.message || e.cause);
  }
}
process.exit(0);
