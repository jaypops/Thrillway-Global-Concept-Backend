require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;
const environment = process.env.NODE_ENV || "development";

(async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`✅ ${environment.toUpperCase()} server running on port ${PORT}`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received: closing server...");
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  }
})();
