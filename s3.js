const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const { promisify } = require("util");
require("dotenv").config();

const randomBytes = promisify(crypto.randomBytes);

const region = process.env.AWS_REGION;
const bucketName = process.env.S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const generateUploadURL = async (
  folder = "uploads",
  mimeType = "application/octet-stream"
) => {
  console.log("Generating upload URL with:", { folder, mimeType });

  const rawBytes = await randomBytes(16);
  const fileName = rawBytes.toString("hex");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `${folder}/${fileName}`,
    ContentType: mimeType,
  });

  try {
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });
    return uploadURL;
  } catch (err) {
    console.error("Error from AWS S3:", err);
    throw err;
  }
};

module.exports = { generateUploadURL };
