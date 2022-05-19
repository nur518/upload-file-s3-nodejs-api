const uuidV4 = require('uuid').v4;
const AWS = require("aws-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");


const config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  accessSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
}

AWS.config.update(config);

exports.s3UploadV2 = async (files) => {
  const s3 = new AWS.S3()
  //single file
  // const param = {
  //   Bucket: process.env.AWS_BUCKET_NAME,
  //   Key: `images/${uuidV4()}-${file.originalname}`,
  //   Body: file.buffer
  // }

  //multiple file
  const params = files.map(file => ({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `images/${uuidV4()}-${file.originalname}`,
    Body: file.buffer
  }))

  return await Promise.all(params.map(param => s3.upload(param).promise()))
}

exports.s3UploadV3 = async (files) => {
  const s3client = new S3Client();
  //single file
  // const param = {
  //   Bucket: process.env.AWS_BUCKET_NAME,
  //   Key: `images/${uuidV4()}-${file.originalname}`,
  //   Body: file.buffer
  // }
  return s3client.send(new PutObjectCommand(param))

  //multiple file
  const params = files.map(file => ({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `images/${uuidV4()}-${file.originalname}`,
    Body: file.buffer
  }))

  return await Promise.all(params.map(param => s3client.send(new PutObjectCommand(param))))
}

exports.s3List = async (req, res) => {
  const s3 = new AWS.S3()
  const result = await s3.listObjectsV2({ Bucket: process.env.AWS_BUCKET_NAME }).promise();
  const Keys = result.Contents.map(item => item.Key)

  res.json({ status: 'success', results: Keys })
}

exports.s3Download = async (req, res) => {
  const s3 = new AWS.S3()
  const filename = req.params.filename

  const result = await s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: `images/${filename}` }).promise();

  res.send(result.Body)
}

exports.s3Delete = async (req, res, next) => {
  const s3 = new AWS.S3()
  const filename = req.params.filename;

  const result = await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: `images/${filename}` }).promise();
  console.log(result);

  res.json({ status: 'file deleted success' })
}