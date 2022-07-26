const { user, profile } = require('../../models')


exports.getProfile = async (req, res) => {
    try {
        const id  = req.params.id
        let data = await profile.findOne({
            where: {
                id
            },
            include: {
                model: user,
                as: 'Data User',
                attributes : {
                    exclude : ["createdAt", "updatedAt", "password"]
                },
            },
            attributes : {
                exclude : ["createdAt", "updatedAt"]
            }
        })
        

        if(data == null) {
            return res.send({
                message : `Data profile dengan id ${id} tidak ditemukan!`
            })
        }
        res.send({
            status: 'success',
            message:`data profile dengan id ${id} berhasil ditampilkan!`,
            data
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const id = req.params.id
        
        let data = req.body
        let dataProfile = await profile.update(data, {
            where : {
                id
            }
        })
        console.log(data);
        if(dataProfile != 1 ) { 
            return res.status(404).send({
                message : `Data profile dengan id ${id} tidak ditemukan!`
            })
        }

        res.send({
            status  : "success",
            message : `Update data profile dengan id : ${id} berhasil!`,
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

exports.addProfile = async (req, res) => {
    try {

        let datas = req.body

        let data = await profile.create({
            ...datas,
            image : req.files["image"][0].filename
        })

        // data = JSON.parse(JSON.stringify(data));

        // data = {
        //     ...data,
        //     image: process.env.IMG_FILE + data.image + ".PNG"
        // };

        res.send({
            status  : 'Success!',
            message : 'Data profile berhasil ditambahkan!',
            data
        })

    } catch (error) {
        console.log(error)

        res.status(500).send({
            status  : 'failed',
            message : 'Server Error'
        })
    }
}

exports.getProfiles = async (req, res) => {
    try {

        let data = await profile.findAll({
            include : [
                {
                model : user,
                as    : "Data User",
                attributes : {
                    exclude : [ "createdAt" , "updatedAt","password" ]
                }
            }
        ],
            attributes : {
                exclude : [ 'createdAt' , 'updatedAt' , 'idUser' ]
            }
        })

        data = data.map((item) => {
            item.image = 'http://localhost:5000/uploads/' + item.image

            return item
        })
        
        res.send({
            status  : 'Success!',
            message : "Data profile berhasil ditampilkan!",
            data
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : 'failed',
            message : 'Server Error'
        })
    }
}

exports.deleteProfile = async (req, res) => {
    try {
        const { id } = req.params

        const data = await profile.findOne({
            where : {
                id
            }
        })

        if(!data){
            return res.send({
                message : `Profile data dengan id : ${id} tidak ditemukan!`
            })
        }

        await profile.destroy({
            where : {
                id
            }
        })

        res.send({
            status  : 'success',
            message : `Data profile dengan id: ${id} berhasil dihapus!`
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : 'failed',
            message : 'Server Error'
        })
    }
}