const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const  swaggerUi=require('swagger-ui-express')
const swaggerJson=require('./swagger.json')


const app = express()

// Mount Swagger documentation

const dbURL = 'mongodb://127.0.0.1:27017/node-crud'
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(4000, () => console.log('my app is running listening to port 4000 and connected to the database ')))
    .catch((err) => console.log(err))


    
app.use(express.static('public'))
app.use(express.static('uploads'))
app.use("/swagger",swaggerUi.serve,swaggerUi.setup(swaggerJson));
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
}))

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next()
})
//the router prefix
app.use("", require('./routes/routes'))





