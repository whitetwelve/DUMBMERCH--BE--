// IMPORT MODELS
const { category , product } = require('../../models')

exports.getCategory = async (req, res) => {
    try {
        
        const data = await category.findAll({
            include: [
                {
                model      : product,
                as         : "products",
                attributes : {
                    exclude : [ "createdAt" , "updatedAt" ]
                    }
                }
            ]
        })

        if(data == 0 ) {
            return res.send({
                message : "data category kosong!"
            })
        }
        res.send({
            status   : "Success!",
            message  : "Data Category berhasil ditampilkan!",
            category : data
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : 'Failed!',
            message :  `Server Error`
        })
        
    }
}


exports.addCategory = async (req, res) => {
    try {

        const newData = await category.create(req.body)

        res.send({
            status   : 'Success',
            message  : 'Data berhasil ditambahkan!',
            data : {
                id : newData.id , 
                name : newData.name
            }
        })

    } catch (error) {
        console.log(error)
        
        res.send({
            status  : 'failed',
            message : 'Server Error'
        })
    }
}


exports.getDetailCategory = async (req, res) => {
    try {

        const id = req.params.id

        const data = await category.findOne({
            where : {
                id
            },
            attributes : {
                exclude : ["createdAt", "updatedAt"]
            }
        })

        if(!data){
            return res.send({
                message : `Category dengan id ${id} tidak ditemukan!`
            })
        }

        res.send({
            status  : 'Success!',
            message : `Category dengan id ${id} berhasil ditampilkan!`,
            detailCategory : data
        })
    } catch (error) {
        console.log(error)

        res.send({
            status  : 'Failed',
            message : `Category dengan id ${id} tidak ditemukan!`
        })
    }
}


exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id

        const data = await category.findOne({
            where : {
                id
            }
        })

        if(!data){
            return res.send({
                message :`Category dengan id ${id} tidak ditemukan!`
            })
        }

        await category.destroy({
            where : {
                id
            }
        })

        res.send({
            status  : 'Success',
            message : `Produk dengan id ${id} berhasil dihapus!`
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : 'error',
            message : 'Server error!'
        })
    }
}


exports.updateCategory = async (req, res) => {
    try {

        const id = req.params.id
        
        const data = req.body

        const dataCategory = await category.update(data, {
            where : {
                id
            }
        })
    
        if(dataCategory == 0){
            return res.send({
                message : `Data category dengan id ${id} tidak ditemukan!`
            })
        }
        res.send({
            status  : "success",
            message : `Update data category dengan id : ${id} berhasil!`,
            data
        })
    } 
    catch (error) {
        console.log(error)

        res.send({
            status  : "failed",
            message : "Server Error"
        })
    }
}
