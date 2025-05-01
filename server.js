const app = require("./app");
const connectDB = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});