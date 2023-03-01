const express = require('express');
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('frontdesk/register');
});

module.exports = router;