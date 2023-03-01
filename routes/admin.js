const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

router.get('/', async(req, res) => {
    const users = await query('select * from User')
    // res.send('This is the admin page');
    console.log(users);
    res.render('admin/dashboard',{users});
});

router.get('/register', (req, res) => {
    res.render('admin/register');
});

router.post('/register', async(req, res) => {
    console.log(req.body);
    const { email, password, category } = req.body;
    await query(`insert into User (email, pass, role) values ('${email}', '${password}', '${category}')`);
    res.render('admin/register');
});
module.exports = router;