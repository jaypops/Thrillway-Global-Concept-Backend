const path = require("path");
const fs = require("fs");

const uploadFile = async (file, folder) => {
  try {
    const uploadDir = path.join(__dirname, `../public/uploads/${folder}`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    const filePath = path.join(uploadDir, filename);

    // Move the file
    await fs.promises.rename(file.path, filePath);

    // Return the public URL
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("Failed to upload file");
  }
};

module.exports = { uploadFile };