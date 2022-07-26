const { user, transaction, product, profile } = require('../../models')
const midtransClient = require("midtrans-client");


exports.detailTransaction = async (req, res) => {
    try {
        const idBuyer  = req.params.id
        let transactions = await transaction.findAll({
            where: {
                idBuyer,
            },
            order: [["createdAt", "DESC"]],
            attributes: {
                exclude: ["updatedAt", "idBuyer", "idSeller", "idProduct"],
            },
            include: [
                {
                    model: product,
                    as: "product",
                    attributes: {
                        exclude: [
                        "createdAt",
                        "updatedAt",
                        "idUser",
                        "qty",
                        "price",
                        "desc",
                        ],
                    },
                },
                {
                    model: user,
                    as: "buyer",
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password", "status"],
                    },
                },
                {
                    model: user,
                    as: "seller",
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password", "status"],
                    },
                },
            ],
        });

        transactions = JSON.parse(JSON.stringify(transactions));

        transactions = transactions.map(item => (
            item = {
                ...item,
                product : {
                    ...item.product,
                    image : process.env.IMG_FILE + item.product.image
                }
            }
        ))
        
        if(transactions == 0){
            return res.send({
                message: "Transaksi tidak ditemukan!"
            })
        }

        res.send({
            status  : "Success!",
            data    : transactions,
            message : "Data transaksi berhasil ditampilkan!"
        });
    } catch (error) {
        console.log(error)

        res.send({
            status  : 'failed',
            message : 'Server Error'
        })
    }
}

exports.addTransaction = async (req, res) => {
    try {
        
        let data = req.body.body

        data = JSON.parse(data)
            // Create id transaksi here
            data = {
            id: parseInt(data.idProduct + Math.random().toString().slice(3, 8)),
            ...data,
            status: "pending",
            };

            // Buat data transaksi
            const newData = await transaction.create(data);

            // Cari data buyer by id 
            const buyerData = await user.findOne({
                include: {
                  model: profile,
                  as: "profile",
                  attributes: {
                    exclude: ["createdAt", "updatedAt", "idUser"],
                  },
                },
                where: {
                  id: newData.idBuyer,
                },
                attributes: {
                  exclude: ["createdAt", "updatedAt", "password"],
                },
              });

              let snap = new midtransClient.Snap({
                // Set to true if you want Production Environment (accept real transaction).
                isProduction: false,
                serverKey: process.env.MIDTRANS_SERVER_KEY,
              });

              let parameter = {
                transaction_details: {
                  order_id: newData.id,
                  gross_amount: newData.price,
                },
                credit_card: {
                  secure: true,
                },
                customer_details: {
                  full_name: buyerData?.name,
                  email: buyerData?.email,
                  phone: buyerData?.profile?.phone,
                },
              };

              const payment = await snap.createTransaction(parameter);

        res.send({
            status  : 'pending',
            message : 'Pembayaran sedang pending harap bersabar!',
            payment,
            product : {
                id : data.idProduct
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


// Create configurate midtrans client with CoreApi here ...
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY

const core = new midtransClient.CoreApi();

core.apiConfig.set({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY
})

/**
 *  Handle update transaction status after notification
 * from midtrans webhook
 * @param {string} status
 * @param {transactionId} transactionId
 */

// Create function for handle https notification / WebHooks of payment status here ...
exports.notification = async ( req , res ) => {
  try {

    const statusResponse = await core.transaction.notification(req.body)

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        // TODO set transaction status on your database to 'challenge'
        // and response with 200 OK
        updateTransaction("pending", orderId);
        res.status(200);
      } else if (fraudStatus == "accept") {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        updateProduct(orderId);
        updateTransaction("success", orderId);
        res.status(200);
      }
    } else if (transactionStatus == "settlement") {
      // TODO set transaction status on your database to 'success'
      // and response with 200 OK
      updateTransaction("success", orderId);
      res.status(200);
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      // TODO set transaction status on your database to 'failure'
      // and response with 200 OK
      updateTransaction("failed", orderId);
      res.status(200);
    } else if (transactionStatus == "pending") {
      // TODO set transaction status on your database to 'pending' / waiting payment
      // and response with 200 OK
      updateTransaction("pending", orderId);
      res.status(200);
    }
  } catch (error) {
    console.log(error)
    res.send({
      message: 'Server Error'
    })
  }
}

const updateTransaction = async (status, transactionId) => {
  await transaction.update(
    {
      status,
    },
    {
      where: {
        id: transactionId,
      },
    }
  );
};

exports.deleteTransaction = async (req, res) => {
    try {
        const id = req.params.id

        const data = await transaction.findOne({
            where : {
                id
            }
        })

        if(!data){
            return res.send({
                message :`Transaksi dengan id ${id} tidak ditemukan!`
            })
        }

        await transaction.destroy({
            where : {
                id
            }
        })

        res.send({
            status  : 'Success',
            message : `Transaksi dengan id ${id} berhasil dihapus!`
        })

    } catch (error) {
        console.log(error)
        
        res.send({
            status  : 'error',
            message : 'Server error!'
        })
    }
}

const updateProduct = async (orderId) => {
  const transactionData = await transaction.findOne({
    where: {
      id: orderId,
    },
  });
  const productData = await product.findOne({
    where: {
      id: transactionData.idProduct,
    },
  });
  const qty = productData.qty - 1;
  await product.update({ qty }, { where: { id: productData.id } });
};