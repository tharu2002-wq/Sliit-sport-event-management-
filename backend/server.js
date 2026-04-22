import "dotenv/config.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import societyRoutes from "./routes/societyRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isExplicitlyAllowed = ALLOWED_ORIGINS.includes(origin);
    const isLocalhostOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

    if (isExplicitlyAllowed || isLocalhostOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS: origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Society Management API is running" });
});

app.use("/api/societies", societyRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = Number(port) + 1;
      console.warn(`Port ${port} is in use, retrying on ${nextPort}`);
      startServer(nextPort);
      return;
    }

    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  });
};

const bootstrap = async () => {
  await connectDB();
  startServer(PORT);
};

bootstrap();
