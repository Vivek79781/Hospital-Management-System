const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

router.get('/', async(req, res) => {
    const patients = await query('select * from Patient')
    const stays = await query('select * from Stay where DischargeDate is null')
    const rooms = await query(`select * from Room where status = 'Available'`)
    let available = true
    if(rooms.length === 0) {
        available = false
    }
    res.render('frontdesk/dashboard',{patients,stays,available});
});

router.get('/register', (req, res) => {
    res.render('frontdesk/patientregister');
});

router.post('/register', async(req, res) => {
    console.log(req.body);
    const { Name, Address, Phone, email, DateOfBirth, Gender } = req.body;
    await query(`INSERT INTO Patient (Name, DOB, Gender, Address, Phone, email, Registration_Date) VALUES ('${Name}', '${DateOfBirth}', '${Gender}', '${Address}', '${Phone}', '${email}', '${new Date().toISOString().slice(0, 19).replace('T', ' ')}' )`)
    res.redirect('/frontdesk/register');
});

module.exports = router;