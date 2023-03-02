const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

router.get('/', async(req, res) => {
    const users = await query('select * from User')
    // res.send('This is the admin page');
    // console.log(users);
    res.render('admin/dashboard',{users});
});

router.get('/register', (req, res) => {
    res.render('admin/register');
});

router.post('/register', async(req, res) => {
    console.log(req.body);
    const { email, password, category } = req.body;
    const users = await query(`select max(userID) from User`);
    const emails = await query(`select email from User`);

    for(let userEmail of emails) {
        if(userEmail.email === email) {
            req.flash('error', 'Email already exists');
            res.redirect('/admin/register');
            return;
        }
    }
    console.log(users);
    const id = users[0]['max(userID)'] + 1;
    await query(`insert into User (userID, email, pass, role) values (${id}, '${email}', '${password}', '${category}')`);
    if(category === 'Doctor') {
        await query(`insert into Doctor (doctorID)`)
    }
    res.redirect('/admin');
});

router.delete('/user', async(req, res) => {
    console.log(req.body);
    const { userID } = req.body;
    await query(`delete from User where userID='${userID}'`);
    res.redirect('/admin');
});
module.exports = router;