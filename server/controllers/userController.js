const { User, Article } = require('../models')
const bcrypt = require('bcryptjs')
const jwtAccess = require('../jwtAccess')
const ObjectID = require('mongoose').Types.ObjectId
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)

module.exports = {
    getCurrentUser(req, res, next) {
        User.findById(req.currentUserId)
            .then(data => {
                res.status(200).json(data)
            })
            .catch(err => {
                console.log(err.message)
                next(err)
            })
    },
    getOneUser(req, res, next) {
        if (req.query.userId) {
            User.findById(req.query.userId).select('username')
                .then(data => {
                    res.status(200).json(data)
                })
                .catch(err => {
                    console.log(err.message)
                    next(err)
                })
        } else if (req.query.username) {
            User.find({username: {$regex: req.query.username, $options:'i'}}) 
                .then(data => {
                    res.status(200).json(data)
                })
                .catch(err => {
                    console.log(err.message)
                    next(err)   
                })
        }
    },
    newUser(req, res, next) {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        })
            .then(data => {
                res.status(201).json(data)
            })
            .catch(err => {
                console.log(err.message)
                next(err)
            })
    },
    signIn(req, res, next) {
        User.findOne({email: req.body.email})
            .then(user => {
                if (!user) {
                    res.status(400).json({error: 'Username/Password is wrong!'})
                } else {
                    if (bcrypt.compareSync(req.body.password, user.password)) {
                        let access_token = jwtAccess.sign({_id: user._id}, process.env.JWT_SECRET)
                        res.status(200).json({user, access_token})
                    } else {
                        res.status(400).json({error: 'Username/Password is wrong!'})
                    }
                }
            })
            .catch(err => {
                console.log(err.message)
                next(err)
            })
    },
    googleSignIn(req, res, next) {
        let userData = null;
        client.verifyIdToken({
            idToken: req.body.google_token,
            audience: process.env.CLIENT_ID
        })
            .then(ticket => {
                userData = ticket.getPayload();
                return User.findOne({
                    email: userData.email
                })
            })
            .then(user => {
                if(user) {
                    return user
                } else {
                    return User.create({
                        username: userData.fullname,
                        email: userData.email,
                        password: process.env.DEFAULT_PASSWORD_OAUTH
                    })
                }
            })
            .then(user => {
                const access_token = jwt.sign({
                    _id: user._id
                }, process.env.JWT_SECRET)
                res.status(200).json({access_token})
            })
            .catch(err => {
                console.log(err)
                next(err)
            })
    }
}