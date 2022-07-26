const { user, profile, product } = require('../../models')

exports.addUsers = async (req, res) => {
    try {
        await user.create(req.body)
    
        res.send({
            status  : "success",
            message : "Data user berhasil ditambahkan!",
            data : req.body
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : "failed",
            message : "Server Error"
        })
    }
}


exports.getUsers = async (req, res) => {
    try {
    
        const users = await user.findAll({
            include : {
                model : profile,
                as    : 'profile',
                attributes : {
                    exclude : [ 'createdAt', 'updatedAt']
                }
            },
            attributes : {
                exclude : [ 'password' , 'createdAt' , 'updatedAt' ]
            }
        })
        
        console.log(users);
        if(users < 1) {
            return res.send({
                message : 'data user kosong!'
            })
        }
        
        res.send({
            status  : "success",
            message : "Data users berhasil ditampilkan!",
            data    : {
                users
            }
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : "failed",
            message : "Server Error"
        })
    }
}


exports.getUser = async (req, res) => {
    try {
        const id    = req.params.id;
        const users = await user.findOne({
            where       : {
                id
            },
            include     : [
                {
                model       : profile,
                as          : 'profile',
                attributes  : {
                    exclude : ['createdAt', 'updatedAt', 'idUser']
                    }
                },
                {
                model       : product,
                as          : 'products',
                attributes  : {
                    exclude : ['createdAt', 'updatedAt', 'idUser']
                    }
                }
            ],
            attributes  : {
                exclude : ['createdAt', 'updatedAt', 'password']
            }
        });

        if(users == null) {
            return res.send({
                message : `Data user dengan id ${id} tidak ditemukan!`
            })
        }
        res.send({
            status  : "success",
            data    : {
                users
            }
        })
    } catch (error) {
        res.status(500).send({
            status  : error?.name,
            message : error?.message
        });
    }
}


exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id
        
        const data = req.body

        const dataUser = await user.update(data, {
            where : {
                id
            },
            attributes : {
                exclude : [ 'updatedAt' , 'createdAt' ]
            }
        })
        console.log(data);
        console.log(dataUser);
        if(dataUser != 1 ) { 
            return res.send({
                message : `Data user dengan id ${id} tidak ditemukan!`
            })
        }
        
        res.send({
            status  : "success",
            message : `Update data user dengan id : ${id} berhasil!`,
            data
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : "failed",
            message : "Server Error"
        })
    }
}


exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        const data = await user.findOne({
            where : {
                id
            }
        })

        if(!data){
            return res.send({
                message : `User data dengan id : ${id} tidak ditemukan!`
            })
        }

        await user.destroy({
            where : {
                id
            }
        })

        res.send({
            status  : 'success',
            message : `Data user dengan id: ${id} berhasil dihapus!`
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : 'failed',
            message : 'Server Error'
        })
    }
}