require('dotenv').config()
const express = require('express');
const multer = require('multer');
const multers3 = require('multer-s3');

const { s3UploadV2, s3UploadV3, s3List, s3Download, s3Delete } = require('./s3Service');
const uuidV4 = require('uuid').v4;
const app = express();

//single file
// const upload = multer({ dest: 'uploads' })
// app.post('/upload', upload.single('file'), (req, res) => {
//   res.json({ status: 'success' })
// })

//multiple file
// const upload = multer({ dest: 'uploads' })
// app.post('/upload', upload.array('file', 2), (req, res) => {
//   res.json({ status: 'success' })
// })

//multiple field
// const upload = multer({ dest: 'uploads' })
// const multiUpload = upload.fields([
//   { name: 'avatar', maxCount: 1 },
//   { name: 'resume', maxCount: 1 }
// ])

// custom file name
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads')
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, `${uuidV4()}-${originalname}`)
//   }
// })

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true)
  } else {
    // cb(new Error('file is not of the correct type'), false)
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false)
  }
}

// limit 3 mb // maximum 2
const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 3, files: 2 } })
//V2
// app.post('/upload', upload.array('file'), async (req, res) => {
//   // const file = req.files[0];
//   const results = await s3UploadV2(req.files)
//   res.json({ status: 'success', results })
// })

//V3
app.post('/upload', upload.array('file'), async (req, res) => {
  // const file = req.files[0];
  // const results = await s3UploadV3(file)
  const results = await s3UploadV3(req.files)
  res.json({ status: 'success', results })
})


app.get('/list', s3List)

app.get('/download/:filename', s3Download)

app.delete('/delete/:filename', s3Delete)




// ========= Error handler ==========
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large' })
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'File limit reached' })
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'File must be an image' })
    }
  }
})

app.listen(5000, () => {
  console.log("listening on 5000");
})