const express = require('express')
const conn = require('../conn')
const router = express.Router()
const bcrypt = require('bcrypt')

let rmbuser = ''

const ifNotLogin = (req , res , next) => {
    if(!req.session.login){
        return res.render('login' , {
            errMsg: '',
            successMsg: '',
            oldusername: ''
        })
    }
    next()
}

router.get('/' , ifNotLogin , (req , res) => {
    res.render('index' , {
        img: req.session.img,
        Fname: req.session.fname,
        Lname: req.session.lname
    })
})

router.get('/register' , (req , res) => {
    res.render('register' , {
        errMsg: ''
    })
})

router.post('/register' , (req , res) => {
    const {fname , lname , email , username , password} = req.body
    if(fname.length === 0){
        res.render('register' , {
            errMsg: 'First name is required'
        })
    }else if(lname.length === 0){
        res.render('register' , {
            errMsg: 'Last name is required'
        })
    }else if(email.length === 0){
        res.render('register' , {
            errMsg: 'Email is required'
        })
    }else if(username.length === 0){
        res.render('register' , {
            errMsg: 'Username is required'
        })
    }else if(password.length === 0){
        res.render('register' , {
            errMsg: 'Password is required'
        })
    }else if(req.files === null){
        res.render('register' , {
            errMsg: 'Image is required'
        })
    }else{
        conn.query("SELECT username FROM user_db WHERE username = ?" , [username] , (err , rows) => {
            if(err){
                throw err
            }else{
                if(rows.length > 0){
                    res.render('register' , {
                        errMsg: 'Username is already exist'
                    })
                }else{
                    let file = req.files.img
                    let filename
                    let fileExtension = file.mimetype.split('/')[1]
                    filename = new Date().getTime() + '.' + fileExtension
                    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif'){
                        file.mv(`public/img/${filename}` , err => {
                            if(err){
                                throw err
                            }else{
                                bcrypt.hash(password , 12 , (err , password_hash) => {
                                    if(err){
                                        throw err
                                    }else{
                                        conn.query("INSERT INTO user_db (fname , lname , email , username , password , img) VALUES(? , ? , ? , ? , ? , ?)" , [fname , lname , email , username , password_hash , filename] , err => {
                                            if(err){
                                                throw err
                                            }else{
                                                res.render('login' , {
                                                    successMsg: 'Register successfully',
                                                    errMsg: '',
                                                    oldusername: ''
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }else{
                        res.render('register' , {
                            errMsg: 'This images used must be png jpeg gifs only.'
                        })
                    }
                }
            }
        })
    }
})

router.post('/login' , (req , res) => {
    const {username , password , remember} = req.body
    if(username.length === 0){
        res.render('login' , {
            errMsg: 'Username is required',
            successMsg: '',
            oldusername: ''
        })
    }else if(password.length === 0){
        res.render('login' , {
            errMsg: 'Password is required',
            successMsg: '',
            oldusername: ''
        })
    }else{
        if(remember === undefined){
            conn.query("SELECT * FROM user_db WHERE username = ?" , [username] , (err , rows) => {
                if(err){
                    throw err
                }else{
                    if(rows.length > 0){
                        bcrypt.compare(password , rows[0].password , (err , result) => {
                            if(err){
                                throw err
                            }else{
                                if(result === true){
                                    req.session.login = true
                                    req.session.img = rows[0].img
                                    req.session.fname = rows[0].fname
                                    req.session.lname = rows[0].lname
                                    rmbuser = ''
                                    res.redirect('/')
                                }else{
                                    res.render('login' , {
                                        errMsg: 'Invalid password',
                                        successMsg: '',
                                        oldusername: ''
                                    })
                                }
                            }
                        })
                    }else{
                        res.render('login' , {
                            errMsg: 'Invalid username',
                            successMsg: '',
                            oldusername: ''
                        })
                    }
                }
            })
        }else{
            conn.query("SELECT * FROM user_db WHERE username = ?" , [username] , (err , rows) => {
                if(err){
                    throw err
                }else{
                    if(rows.length > 0){
                        bcrypt.compare(password , rows[0].password , (err , result) => {
                            if(err){
                                throw err
                            }else{
                                if(result === true){
                                    req.session.login = true
                                    req.session.img = rows[0].img
                                    req.session.fname = rows[0].fname
                                    req.session.lname = rows[0].lname
                                    rmbuser = rows[0].username
                                    res.redirect('/')
                                }else{
                                    res.render('login' , {
                                        errMsg: 'Invalid password',
                                        successMsg: '',
                                        oldusername: ''
                                    })
                                }
                            }
                        })
                    }else{
                        res.render('login' , {
                            errMsg: 'Invalid username',
                            successMsg: '',
                            oldusername: ''
                        })
                    }
                }
            })
        }
    }
})

router.get('/logout' , (req , res) => {
    if(rmbuser !== ''){
        req.session = null
        res.render('login' , {
            errMsg: '',
            successMsg: '',
            oldusername: rmbuser
        }) 
    }else{
        req.session = null
        res.redirect('/')
    }
})

router.get('/reset' , (req , res) => {
    res.render('reset' , {
        errMsg: ''
    })
})

router.post('/reset' , (req , res) => {
    const {email , password , confirmpassword} = req.body
    if(email.length === 0){
        res.render('reset' , {
            errMsg: 'Email is required'
        })
    }else if(password.length === 0){
        res.render('reset' , {
            errMsg: 'Password is required'
        })
    }else if(confirmpassword.length === 0){
        res.render('reset' , {
            errMsg: 'Comfirm password is required'
        })
    }else if(password !== confirmpassword){
        res.render('reset' , {
            errMsg: 'Password do not match'
        })
    }else{
        conn.query("SELECT * FROM user_db WHERE email = ?" , [email] , (err , rows) => {
            if(err){
                throw err
            }else{
                if(rows.length > 0){
                    bcrypt.hash(password , 12 , (err , password_hash) => {
                        if(err){
                            throw err
                        }else{
                            conn.query("UPDATE user_db SET password = '" + password_hash + "' WHERE email = '" + email + "' AND password = '" + rows[0].password + "' " , err => {
                                if(err){
                                    throw err
                                }else{
                                    res.render('login' , {
                                        errMsg: '',
                                        successMsg: 'Your password is updated',
                                        oldusername: ''
                                    })
                                }
                            })
                        }
                    })
                }else{
                    res.render('reset' , {
                        errMsg: 'Invalid email address' 
                    })
                }
            }
        })
    }
})

router.use('/' , (req , res) => {
    res.status(404).send('<h1>404 Page not found</h1>')
})

module.exports = router