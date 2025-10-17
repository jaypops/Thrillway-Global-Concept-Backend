const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const GRoutes = require("./routes/GRoutes");

const app = express();

// Use security middleware
app.use(helmet());
app.use(compression());
app.use(cookieParser());

// Environment-based CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://thrillway-global-concept-4pnqpf1z2.vercel.app"]
    : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Parse incoming JSON
app.use(express.json());

// Use request logger only in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Base route (prevents 404 on GET /)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Thrillway Global Concept API is running ",
    environment: process.env.NODE_ENV,
  });
});

// Health check endpoint (for uptime monitors)
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Mount all main routes
app.use("/api", GRoutes);

// 404 handler (must come after all other routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

module.exports = app;
