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

connectDB();

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
app.use("/api/venues", require("./routes/venueRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});