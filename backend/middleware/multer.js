import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    callback(null, file.fieldname + '-' + uniqueSuffix + ext)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const upload = multer({ storage, fileFilter })

export default upload
