// IMPORT PACKAGE 
const jwt = require('jsonwebtoken')


exports.auth = (req, res, next) => {

    const authHeader = req.header('Authorization')

    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(404).send({
            status  : 'failed',
            message : 'Akses ditolak! Harap input token terlebih dahulu ..'

        })
    }

    try {

        const verified = jwt.verify(token, process.env.TOKEN_KEY)
        req.user = verified
        next()

    } catch (error) {

        res.status(400).send({

            status: 'failed',
            message: 'Token tidak valid!'

        })
    }
}