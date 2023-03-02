module.exports = (req, res, next) => {
    if (req.user === 'Doctor') {
        return next();
    } else {
        const statusCode = 401
        const err = new ExpressError('You are not authorized to view this page', statusCode)
        next(err);
    }
}