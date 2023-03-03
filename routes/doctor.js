const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');

router.get('/', async(req, res) => {
    // req.user.userID = req.user.userID.toString()
    // console.log(req.user.Name);
    const id = req.user.userID;
    const patients = await query('select * from Patient')
    for (let i = 0; i < patients.length; i++) {
        console.log(patients[i].Name);
    }
    const stays = await query(`select * from Stay where DischargeDate is null`)
    const doctor = await query(`select * from Doctor where doctorID = ${id}`)
    console.log(doctor);
    const rooms = await query(`select * from Room where currentOccupancy < maxCapacity`)
    let available = true
    if(rooms.length === 0) {
        available = false
    }
    // Treatment Schedule
    const treatments = await query(`select * from Treatment where treatmentStatus = 'Pending'`)
    res.render('doctor/dashboard',{doctor, patients, stays, available, treatments});
});


router.get('/patient/:id/treatment', async(req, res) => {
    const { id } = req.params;
    console.log(id);
    const patient = await query(`select * from Patient where patientID = ${id}`)
    const treatments = await query(`select Doctor.Name as Dname, Treatment.* from Treatment, Doctor where patientID = ${id} and  Treatment.doctorID = Doctor.doctorID`)
    console.log(treatments);
    if(treatments.length === 0) {
        // loop over patients and print the name
        for (let i = 0; i < patient.length; i++) {
            let str = patient[i].Name + ' has not undergone any treatment';
            req.flash('success', str);
        }
        // req.flash('success', 'This patient has not undergone any treatment');
        res.redirect('/doctor');
    }
    else {
        // sort the treatments by date
        treatments.sort((a, b) => {
            return new Date(a.treatmentDate) - new Date(b.treatmentDate);
        });
        res.render('doctor/treatment',{treatments, patient});
    }

});




module.exports = router;