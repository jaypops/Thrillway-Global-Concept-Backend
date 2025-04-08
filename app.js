const express = require("express");
const app = express();
const propertyRoutes = require("./routes/propertyroutes");

// Middleware
app.use(express.json());

// Routes
app.use("/api", propertyRoutes);

module.exports = app;