const path = require('path')
const express = require('express')
//const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
//const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/dataBase')
const logger = require('./middleware/logger')

dotenv.config({ path: './config/config.env' })

require('./config/passport')(passport)

connectDB()

const app = express()

app.use(logger)

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
)

if( process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
  } = require('./helpers/hbs')
  

app.engine(
'.hbs',
exphbs({
    helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
    },
    defaultLayout: 'main',
    extname: '.hbs',
})
)
app.set('view engine', '.hbs');

app.use(
    session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    //store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})  

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000




app.listen( PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))