const express = require('express')
const router = express.Router();
const User = require('../models/users')
const multer = require('multer')
const fs = require('fs')
const _=require('lodash')


//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`)
    }
})

var upload = multer({
    storage: storage
}).single('image')

//inserting the user into the database 
router.post('/adduser', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    })
    user.save().then(() => {
        console.log("Success")
        res.redirect('/')
    }).catch(err => { console.log(`An error has occured ${err}`) })
})

// get all the users route
router.get("/", (req, res) => {
    User.find().then(users => {
        if (users) {
            console.log("Data fetched successfully");
            res.render("index", {
                title: "Home Page",
                users
            })
        }
        else {
            console.log("No corresponding results")
        }
    }).catch(err => {
        console.log(`An error occured: ${err}`);
    })
})

router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        res.render("editusers", {
            title: "Edit User",
            user: user
        });
    } catch (err) {
        res.redirect("/");
    }
});

//update user router
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id
    let new_image = ''
    console.log(req.body, req.file)
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image)
        } catch (err) {
            console.log(err)
        }
    } else {
        new_image = req.body.old_image
    }

    const user = await User.updateOne({ _id: id }, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    });

    console.log({ user })

    req.session.message = {
        type: 'success',
        message: 'User updated successfully'
    }
    res.redirect('/')
})


//deleting the route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let result = await User.findByIdAndRemove(id);
        if (result && result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }
        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.get("/adduser", (req, res) => {
    res.render('adduser')
})

router.get('/landing',(req,res)=>{
    res.render('landingpage')
})

router.get('/auth',(req,res)=>{
    res.render('login')
})
router.get('/signup',(req,res)=>{
    res.render('sign')
})

module.exports = router