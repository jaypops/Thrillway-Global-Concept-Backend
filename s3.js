const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const { promisify } = require("util");
require("dotenv").config();

const randomBytes = promisify(crypto.randomBytes);

const region = "eu-north-1";
const bucketName = "thrillway-bucket";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const generateUploadURL = async (fileType = "general") => {
    const rawBytes = await randomBytes(16);
    const fileName = rawBytes.toString("hex");
  
    const folder = fileType === "image" ? "images" : fileType === "document" ? "documents" : "uploads";
  
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${folder}/${fileName}`,
      ContentType: "application/octet-stream", 
    });
  
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });
    return uploadURL;
  };
  

module.exports = { generateUploadURL };
