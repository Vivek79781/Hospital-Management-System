const jwt = require('jsonwebtoken')
const ExpressError = require('../utils/ExpressError');
const { query } = require('../utils/db')
module.exports = async(req,res,next) => {
    const token = req.session.token;
    // console.log(token);
    if(!token) {
        const statusCode = 401
        const error = new ExpressError('You are not authorized to view this page', statusCode)
        next(error);
    }

    try {
        const decoded = jwt.verify(token,"This is a secret")
        const user = await query(`select * from User where userID='${decoded.user.id}'`)
        req.user = user[0];
        res.locals.currentUser = req.user;
        next()
    } catch (err) {
        console.log('Token is not valid');
        const statusCode = 401
        const error = new ExpressError('You are not authorized to view this page', statusCode)
        next(error);
    }
};