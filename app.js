const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); 
const propertyRoutes = require("./routes/propertyroutes"); 
const app = express();


// Enhanced CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
// Request logging
app.use(morgan("dev"));

app.use("/api", propertyRoutes);
// Health check endpoint
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: "Endpoint not found" 
  });
});

module.exports = app;