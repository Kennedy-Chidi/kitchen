const crypto = require("crypto");
let multer = require("multer");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const storage = multer({});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "audio/mpeg" ||
    file.mimetype === "audio/wave" ||
    file.mimetype === "audio/wav" ||
    file.mimetype === "audio/mp3"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRETE_KEY,
  },
  region: process.env.BUCKET_REGION,
});

const randomName = crypto.randomBytes(32).toString("hex");

exports.sendFile = async (file) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${randomName}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  const command = new PutObjectCommand(params);

  await s3.send(command);

  return randomName;
};

exports.getFileUrl = async (emails) => {
  for (const email of emails) {
    if (email.banner) {
      const getObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: email.banner,
      };
      const commandGet = new GetObjectCommand(getObjectParams);
      let url = await getSignedUrl(s3, commandGet);
      email.url = url;
    }
  }

  return emails;
};

exports.getAFileUrl = async (data) => {
  const getObjectParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: data,
  };
  const commandGet = new GetObjectCommand(getObjectParams);
  if (data && data != "") {
    let url = await getSignedUrl(s3, commandGet);
    newData = url;

    return newData;
  } else {
    return "";
  }
};

exports.deleteFile = async (req, res, next) => {
  let filenames = req.files;
  if (!Array.isArray(filenames)) {
    filenames = new Array(filenames);
  }

  if (filenames.length > 0) {
    for (let i = 0; i < filenames.length; i++) {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: filenames[i],
      };

      const command = new DeleteObjectCommand(params);
      await s3.send(command);
      console.log("File deleted successfully");
    }
  }

  let user;
  if (req.user) {
    user = req.user;
  }

  next();
};

exports.upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
