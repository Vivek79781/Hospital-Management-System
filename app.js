// avoid commiting sensitive data in production environment
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// import library
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const bree = require('bree');
const app = express();

// import routes
const doctorRoutes = require('./routes/doctor');
const dataEntryRoutes = require('./routes/dataEntry');
const frontdeskRoutes = require('./routes/frontdesk');
const adminRoutes = require('./routes/admin');

// import middleware
const auth = require('./middleware/auth');
const isDoctor = require('./middleware/isDoctor');
const isAdmin = require('./middleware/isAdmin');
const isFrontdesk = require('./middleware/isFrontdesk');
const isDataEntry = require('./middleware/isDataEntry');

// import utils
const ExpressError = require('./utils/ExpressError');
const { query } = require('./utils/db')
const catchAsync = require('./utils/catchAsync');

const breeConfig = {
    jobs: [
        {
            name: 'email',
            cron: '30 7 * * *',
            // interval: '5 seconds',
            worker: {
                path: './jobs/email.js',
            }
        }
    ]
}

const weeklybreeConfig = {
    jobs: [
        {
            name: 'weekly',
            cron: '34 18 * * 3',
            // interval: '10 seconds',
            worker: {
                path: './jobs/weekly.js',
            }
        }
    ]
}

const breeInstance = new bree(breeConfig);
const weeklybreeInstance = new bree(weeklybreeConfig);
try {
    breeInstance.start();
    weeklybreeInstance.start();
} catch (e) {
    console.log(e);

}
// breeInstance.start();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// session configuration to store user session on server side
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60
    }
}

// app middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.use(session(sessionConfig));
app.use(flash());
app.use(upload());

// app locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// 'GET' request to home page
app.get('/', catchAsync(async(req, res) => {
    const token = req.session.token;
    if(!token) {
        res.render('home');
    } else {
        const decoded = jwt.verify(token,"This is a secret")
        const user = await query(`select * from User where userID='${decoded.user.id}'`)
        req.user = user[0];
        res.locals.currentUser = req.user;
        if(req.user.role === 'Doctor') {
            res.redirect('/doctor');
        } else if(req.user.role === 'FrontDesk') {
            res.redirect('/frontdesk');
        } else if(req.user.role === 'DataEntry') {
            res.redirect('/dataentry');
        } else if(req.user.role === 'Admin') {
            res.redirect('/admin');
        }
    }
}));

// 'POST' request to login page
app.post('/login', catchAsync(async(req, res) => {
    const { password, email } = req.body;
    const user = await query(`select * from User where email='${email}' AND pass='${password}'`)
    if(user.length === 0) {
        req.flash('error', 'Invalid email or password');
        res.redirect('/');
    }
    const payload = {
        user: {
            id: user[0].userID
        }
    }
    jwt.sign(
        payload, 
        'This is a secret',
        {expiresIn: 360000},
        (err,token) => {
            if(err) throw err;
            else {
                req.session.token = token;
                req.flash('success', 'You have successfully logged in');
                res.redirect('/');
            }
        }
        )    
}));

// 'GET' request to create admin page
app.get('/createAdmin', (req, res, next) => {
    if(process.env.NODE_ENV !== 'production'){
        res.render('createAdmin');
    } else {
        const statusCode = 401
        const err = new ExpressError('You are not authorized to view this page', statusCode)
        next(err);
    }
})

// 'POST' request to create admin page
app.post('/createAdmin', async(req,res,next) => {
    if(process.env.NODE_ENV !== 'production'){
        const { password, email } = req.body;
        const users = await query(`select max(userID) as max from User`)
        const max = users[0].max;
        
        query(`insert into User values(${max+1},'${email}','${password}','Admin')`)
        .then(() => {
            req.flash('success', 'Admin account created');
            res.redirect('/');
        })
        .catch(err => {
            req.flash('error', 'Admin account creation failed');
            res.redirect('/createAdmin');
        })
    } else {
        const statusCode = 401
        const err = new ExpressError('You are not authorized to view this page', statusCode)
        next(err);
    }
})

// 'GET' request to about page
app.get('/contact', (req, res) => {
    res.render('contact');
})

// routes for different users 
app.use('/doctor', auth, isDoctor, doctorRoutes);
app.use('/frontdesk', auth, isFrontdesk, frontdeskRoutes);
app.use('/dataentry', auth, isDataEntry, dataEntryRoutes);
app.use('/admin', auth, isAdmin, adminRoutes);

// logout route
app.use('/logout', (req, res) => {
    req.flash('success', 'You have successfully logged out');
    // req.session.destroy();
    req.session.token = null;
    res.redirect('/');
})

// error handling
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// error rendering
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

// server listening
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});