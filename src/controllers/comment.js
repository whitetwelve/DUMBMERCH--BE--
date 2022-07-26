const { comment } = require('../../models')

exports.addComment = async (req, res) => {
    try {

        const data = await comment.create({
            ...req.body
        })

        res.send({
            status  : 'Success!',
            message : 'Komentar berhasil ditambahkan!',
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

exports.getComments = async (req, res) => {
    try {

        let data = await comment.findAll({
                attributes : {
                exclude : [ 'updatedAt' , 'idUser' ]
            }
        })

        data = data.map((item) => {
            item.image = 'http://localhost:5000/uploads/' + item?.image

            return item
        })
        
        if(data == 0){
            res.send({
                message : "Komemtar Kosong!"
            })
        }
        res.send({
            status  : 'Success!',
            message : "Komentar berhasil ditampilkan!",
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

exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params

        const data = await comment.findOne({
            where : {
                id
            }
        })

        if(!data){
            return res.send({
                message : `Komentar dengan id : ${id} tidak ditemukan!`
            })
        }

        await comment.destroy({
            where : {
                id
            }
        })

        res.send({
            status  : 'success',
            message : `Komentar dengan id: ${id} berhasil dihapus!`
        })

    } catch (error) {
        console.log(error)

        res.send({
            status  : 'failed',
            message : 'Server Error'
        })
    }
}