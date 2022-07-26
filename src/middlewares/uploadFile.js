// IMPORT PACKAGE
const multer = require('multer')


exports.uploadImage = (fileData) => {
    
    // DESTINASI FILENYA
    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
        cb(null, 'uploads')
        },
        filename: function(req, file, cb){
        cb(null, Date.now() + '-'+ file.originalname.replace(/\s/g,""));
        }
    })
    
    // FILTER
    const fileFilter = function (req, file, cb){
        if(file.fieldname === fileData){
        if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|webp|WEBP|jfif|JFIF)$/)){
            req.fileValidationError = {
            message: 'Data file tidak sesuai ..'
            }

            return cb(new Error("Data file tidak sesuai .."), false)
        }
        }
        cb(null, true)
    }

    // Maximum File Size
    const size = 1000;
    const maxSize = size * 1000 * 1000;
    const limits = {
        fileSize: maxSize
    }


    const upload = multer({
        storage,
        fileFilter,
        limits
    }).fields([ {name : 'image'} ])


    return (req, res, next) => {
        upload(req, res, function (err) {

        // Filter
        if(req.fileValidationError){
            return res.send(req.fileValidationError)
        }
        

        // Limit
        if(err){
            if(err.code == "LIMIT_FILE_SIZE"){
            return res.send({
                message: 'Max file sized 10Mb'
            })
            }
            return res.send(err)
        }

        return next();
        })
    }
    };
