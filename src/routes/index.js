const express = require('express')
const router = express.Router()


// CONTROLLERS 
const { addUsers, getUsers, getUser, deleteUser, updateUser } = require('../controllers/user')
const { addProfile, getProfile, getProfiles, updateProfile, deleteProfile} = require('../controllers/profile')
const { addProduct, getDetailProduct, getProducts, deleteProduct, updateProduct } = require('../controllers/product')
const { getCategory, getDetailCategory, addCategory, deleteCategory, updateCategory } = require('../controllers/category')
const { detailTransaction , addTransaction, deleteTransaction, notification } = require('../controllers/transaction')
const { addComment, getComments, deleteComment } = require('../controllers/comment')
const { register, login, checkAuth } = require('../controllers/auth')


// MIDDLEWARES
const { auth } = require('../middlewares/auth')
const { uploadImage } = require('../middlewares/uploadFile')


// ROUTES FOR USER 
router.post('/user', addUsers)
router.patch('/user/:id', updateUser)
router.get('/users', getUsers)
router.get('/user/:id', getUser)
router.delete('/user/:id', deleteUser)


// ROUTES FOR PROFILES 
router.post('/profile', auth, uploadImage('image'), addProfile)
router.patch('/profile/:id', auth, uploadImage('image'), updateProfile)
router.get('/profiles', getProfiles)
router.get('/profile/:id', auth, getProfile)
router.delete('/profile/:id', auth, deleteProfile)


// ROUTES FOR PROFILES
router.post('/product', auth , uploadImage('image') , addProduct)
router.get('/products', getProducts)
router.get('/product/:id', auth, getDetailProduct)
router.delete('/product/:id', auth, deleteProduct)
router.patch('/product/:id', uploadImage('image') , updateProduct)


// ROUTES FOR CATEGORY 
router.post('/category', auth, addCategory)
router.delete('/category/:id', auth, deleteCategory)
router.patch('/category/:id', auth, updateCategory)
router.get('/categories', getCategory)
router.get('/category/:id', auth, getDetailCategory)


// ROUTES FOR TRANSACTION
router.post('/transaction', auth, addTransaction)
router.get('/transaction/:id', auth, detailTransaction)
router.delete('transaction', auth, deleteTransaction)
router.post("/notification", notification);


// ROUTES FOR AUTH
router.post('/register', register)
router.get('/check-auth', auth, checkAuth)
router.post('/login', login)


// ROUTES FOR COMMENT 
router.post('/comment', auth, addComment)
router.get('/comments', getComments)
router.delete('/comment/:id', auth, deleteComment)
module.exports = router