// MongoDB
require('./mongodbConnModule').connect()

// Express and middleware
const express = require('express')
const app = express()

app.use(express.json())
app.use(require('body-parser').urlencoded({ extended: false }))
app.use(require('cookie-parser')())
app.use(require('helmet')())
app.use(require('morgan')('dev'))
app.use(require('cors')())

// Load secret key from env file
require('dotenv').config()
const secret = process.env.SECRET

const jwt = require('jsonwebtoken')
const verifyLogin = async (req, res, next) => {
    // Attempt to parse token from the incoming request
    const token = req.cookies.token || ''
    if (!token) {
        return res.status(401).json('You need to Login')
    }
    try {
        // Decrypt the token
        const decrypt = await jwt.verify(token, secret);
        // Attach our requesting User to the passing 'req' object
        //      so we will be able to determine inside API endpoints
        //      which user is currently logged in
        req.user = {
            uid: decrypt.uid
        }
        // console.log('[DEBUG] User authenticated!')
        // console.table(req.user)
        return next()
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
};

//set Routers
app.use('/api/auth', require('./routes/auth')) // Public routes
app.use('/api/courses', verifyLogin, require('./routes/courses'))
app.use('/api/users', verifyLogin, require('./routes/users'))
app.use('/api/profile', verifyLogin, require('./routes/profiles'))
app.use('/api/quiz', verifyLogin, require('./routes/quiz'))

app.use('/static', express.static('public'));

module.exports = app