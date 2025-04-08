const express = require("express");
const app = express();
const productRoutes = require("./routes/productroutes");

// Middleware
app.use(express.json());

// Routes
app.use("/api", productRoutes);

module.exports = app;