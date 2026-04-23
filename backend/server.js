const express = require("express");
const cors = require("cors");
const dns = require("dns");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS.split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (servers.length > 0) {
    try {
      dns.setServers(servers);
      console.log(`Using custom DNS servers: ${servers.join(", ")}`);
    } catch (error) {
      console.warn(`Failed to apply DNS_SERVERS: ${error.message}`);
    }
  }
}

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sport Event Management System API is running...");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/players", require("./routes/playerRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/team-requests", require("./routes/teamRequestRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/venues", require("./routes/venueRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/player-requests", require("./routes/playerRequestRoutes"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred on the server.",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();