// import models
const {chat, user, profile} = require("../../models")
const jwt = require('jsonwebtoken')

const {Op} = require('sequelize')

let connectedUser = {}
const socketIo = (io) => {


  io.use((socket, next) => {
    if(socket.handshake.auth.token){
      console.log('token', socket.handshake.auth.token)
      next()
    }else {
      next(new Error('Not Authorized, please send a token'))
    }
  })


  io.on('connection', (socket) => {
    console.log('client connect: ', socket.id)

    const token = socket.handshake.auth.token
    const TOKEN_KEY = process.env.TOKEN_KEY
    const id  = jwt.verify(token, TOKEN_KEY )

    connectedUser[id] = socket.id
    // define listener on event load admin contact
    socket.on("load admin contact", async () => {
      try {
        const adminContact = await user.findOne({
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
          where: {
            status: "admin"
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        });

        socket.emit("admin contact", adminContact)
      } catch (err) {
        console.log(err)
      }
    });

    // define listener on event load customer contact
    socket.on("load customer contacts", async () => {
      try {
        let customerContacts = await user.findAll({
          where : {
            status : "customer"
          },
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: chat,
              as: "recipientMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
              },
            },
            {
              model: chat,
              as: "senderMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        });

        customerContacts = JSON.parse(JSON.stringify(customerContacts))
        customerContacts = customerContacts.map(item => ({
          ...item,
          image: item.profile?.image ? process.env.IMG_FILE + item.profile?.image : null
        }))
        
        socket.emit("customer contacts", customerContacts)
      } catch (err) {
        console.log(err)
      }
    })

    socket.on("load messages", async (payload) => {
      const idRecipient = payload
      const idSender = id

      const data = await chat.findAll({
        where : {
          idSender : {
            [Op.or] : [idRecipient, idSender]
          },
          idRecipient : {
            [Op.or] : [idRecipient, idSender]
          }
        },
        include : [
          {
            model : user,
            as : "recipient",
            attributes : {
              exclude: ['createdAt', 'updatedAt', 'password']
            }
          },
          {
            model : user,
            as : "sender",
            attributes : {
              exclude: ['createdAt', 'updatedAt', 'password']
            }
          }
        ],
        attributes : {
          exclude:['createdAt', 'updatedAt', 'idRecipient', 'idSender']
        },
        order:[["createdAt", "ASC"]]
      })

      socket.emit('messages',data)

    })

    socket.on("send messages", async (payload) => {
      try {
        
        const { message, idRecipient } = payload

        await chat.create({
          message, 
          idRecipient,
          idSender : id
        })

        io.to(socket.id).to(connectedUser[idRecipient]).emit("new message")
      } catch (error) {
        console.log(error);
      }
    })
    socket.on("disconnect", () => {
      console.log("client disconnect")
      delete connectedUser[id]
    })
  })
}

module.exports = socketIo