import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname).toLowerCase() // normalize case
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    },
})

const fileFilter = (req, file, cb) => {
    const allowedExt = /jpeg|jpg|png|webp|pdf/
    const extname = allowedExt.test(path.extname(file.originalname).toLowerCase())
    const mimetype = /image\/jpeg|image\/jpg|image\/png|image\/webp|application\/pdf/.test(
        file.mimetype,
    )

    if (extname && mimetype) {
        cb(null, true)
    } else {
        cb(new Error('Only images (jpeg, jpg, png, webp) and PDF files are allowed!'))
    }
}

export const multerUpload = multer({
    storage,
    fileFilter,
})
