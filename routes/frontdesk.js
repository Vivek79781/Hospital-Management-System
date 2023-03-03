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
    // Treatment Schedule
    const treatments = await query(`select * from Treatment where treatmentStatus = 'Pending'`)
    res.render('frontdesk/dashboard',{patients,stays,available,treatments});
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

router.get('/patient/:id/discharge', async(req, res) => {
    const { id } = req.params;
    const stays = await query(`select * from Stay where PatientID = ${id} and DischargeDate is null`)
    const stay = stays[0]
    const room = await query(`select * from Room where RoomNumber = ${stay.roomNumber}`)
    await query(`UPDATE Stay SET DischargeDate = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}' WHERE PatientID = ${id} and DischargeDate is null`)
    await query(`UPDATE Room SET status = 'Available' WHERE RoomNumber = ${stay.roomNumber}`)
    res.redirect('/frontdesk');
});

router.get('/patient/:id/admit', async(req, res) => {
    const { id } = req.params;
    console.log(id);
    const rooms = await query(`select * from Room where status = 'Available'`)
    console.log(rooms);
    await query(`INSERT INTO Stay (patientID, roomNumber, AdmitDate) VALUES (${id}, ${rooms[0].roomNumber}, '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`)
    await query(`UPDATE Room SET status = 'Occupied' WHERE roomNumber = ${rooms[0].roomNumber}`)
    res.redirect('/frontdesk');
});

router.get('/patient/:id/treatment', async(req, res) => {
    const { id } = req.params;
    const doctors = await query(`select * from Doctor where doctorID in (select userID from User where role = 'Doctor')`)
    res.render('frontdesk/treatment',{id,doctors});
});

router.post('/patient/:id/treatment', async(req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const { doctorID, Description, TreatmentDate, TreatmentTime } = req.body;
    DateTreatment = TreatmentDate + ' ' + TreatmentTime
    const treatments = await query(`select * from Treatment where doctorID = ${doctorID} and treatmentDate = '${DateTreatment}'`)
    if(treatments.length === 0) {
        await query(`INSERT INTO Treatment (patientID, doctorID, Description, TreatmentDate, TreatmentStatus) VALUES (${id}, ${doctorID}, '${Description}', '${DateTreatment}', 'Pending')`)
        req.flash('success', 'Treatment has been scheduled');
        res.redirect('/frontdesk');
    } else {
        req.flash('error', 'Doctor is not available at this time');
        res.redirect('/frontdesk/patient/:id/treatment');
    }

});


router.get('/patient/:id/test', async(req, res) => {
    const { id } = req.params;
    res.render('frontdesk/test',{id});
});

router.post('/patient/:id/test', async(req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const { Testname, TestDate, TestTime, Testcenter } = req.body;
    DateTest = TestDate + ' ' + TestTime
    await query(`INSERT INTO Test (patientID, TestName, TestDate, TestCenter, TestStatus) VALUES (${id}, '${Testname}', '${DateTest}', '${Testcenter}', 'Pending')`)
    req.flash('success', 'Test has been scheduled');
    res.redirect('/frontdesk');
});

router.get('/patient/:id/appointment', async(req, res) => {
    const { id } = req.params;
    res.render('frontdesk/appointment',{id});
});

module.exports = router;