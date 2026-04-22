const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dotenv.config();

const configureDnsForMongoSrv = () => {
  const uri = process.env.MONGO_URI || "";
  if (!uri.startsWith("mongodb+srv://")) {
    return;
  }

  const preferredServers =
    process.env.NODE_DNS_SERVERS || "8.8.8.8,1.1.1.1";
  const servers = preferredServers
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    dns.setServers(servers);
  }
};

const connectDB = async () => {
  try {
    configureDnsForMongoSrv();
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
