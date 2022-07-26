// IMPORT MODEL && PACKAGES
const { user } = require("../../models")
const joi      = require('joi')
const bcrypt   = require('bcrypt')
const jwt      = require('jsonwebtoken')


exports.register = async (req, res) =>{

    const schema = joi.object({
        name    : joi.string().min(5).required(),
        email   : joi.string().email().required(),
        password: joi.number().min(6).required(),
        status  : joi.string().min(5)
    })
    
    const { error } = schema.validate(req.body)
    
    if(error){
          return res.status(400).send({
              error : error.details[0].message
        })
    }
    
      try {


// HASHING && SALT PASSWORD
    let pw = req.body.password

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync( pw, salt)
    
    const newUser = await user.create({
      name    : req.body.name,
      email   : req.body.email,
      password: hashedPassword,
      status  : "customer"
    })
    
    const token = jwt.sign(newUser.id, process.env.TOKEN_KEY)

      res.status(200).send({
          message: 'Register berhasil!',
          dataUser : {
            name : newUser.name,
            email: newUser.email,
            token
        }
      })
    } 
        catch (error) {
          
          console.log(error)

          res.status(400).send({
            status : 'Failed',
            message: 'Server Error'
        })
      }
    }

exports.login = async (req, res) => {

      const schema = joi.object({
        email: joi.string().email().min(6).required(),
        password: joi.string().min(4).required()
      })
    
      const { error } = schema.validate(req.body)
    
      if (error)
        return res.status(400).send({
          error : {
            message : error.details[0].message
          }
        })
    
      try {
        const dataUser = await user.findOne({
          where : {
            email : req.body.email
          },
          attributes : {
            exclude : [ "createdAt" , "updatedAt" ],
          },
        })
    
        if( dataUser === null ){
          return res.status(404).send({
              message : `Email ${req.body.email} tidak ditemukan!`
          })
        }
    
        const isValid = await bcrypt.compare( req.body.password , dataUser.password )
    
        if(isValid !== true){
          return res.status(404).send({
            message : `Password anda salah!`
        })
      }

      const token = jwt.sign( dataUser.id, process.env.TOKEN_KEY)
    
        res.status(200).send({
          status: "Login berhasil!",
          data  : {
            id : dataUser.id,
            name   : dataUser.name,
            email  : dataUser.email,
            status : dataUser.status,
            token
          }
        })

      } catch (error) {
        console.log(error)
        
        res.status(500).send({
          status : "failed",
          message: "Server Error"
        })
      }
    }
    
exports.checkAuth = async (req, res) => {
      try {
          const id        = req.user
          const dataUser  = await user.findOne({
              where       : {
                  id
              },
              attributes  : {
                  exclude : ['createdAt', 'updatedAt', 'password']
              }
          })
          if (!dataUser) {
              res.status(404).send({
                  status  : 'failed'
              })
          }
  
          res.status(200).send({
              status  : 'success',
              message : 'Token Valid!',
              data    : {
                  user    : {
                      id      : dataUser.id,
                      name    : dataUser.name,
                      email   : dataUser.email,
                      status  : dataUser.status
                  }
              }
          })
      } catch (error) {
          res.status(500).send({
              status  : 'failed',
              message : error?.message
          })
      }
    }