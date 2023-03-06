const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const path = require('path');
const fs = require('fs');

router.get('/', async(req, res) => {
    const patients = await query('select * from Patient');
    const tests = await query(`select * from Test where testStatus='Pending'`);
    res.render('dataEntry/dashboard', { patients, tests });
});

router.get('/patient/:id/updateTest', async(req, res) => {
    const { id } = req.params;
    const tests = await query(`select * from Test where patientID=${id} AND testStatus='Pending'`);
    console.log(tests);
    res.render('dataEntry/updateTest', { id, tests });
});

router.put('/patient/:id/updateTest/:testID', async(req, res) => {
    const { id, testID } = req.params;
    const { testResult } = req.body;
    // Update test result and testStatus
    const now = new Date();
    const dateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    await query(`update Test set testResult='${testResult}', testStatus='completed', testDate='${dateTime}' where testID=${testID}`);
    req.flash('success', 'Test result updated successfully');
    res.redirect(`/dataEntry/patient/${id}/updateTest`);
});

router.get('/patient/:id/images', async(req, res) => {
    const { id } = req.params;
    const directoryPath = path.join(__dirname,'..', 'public', 'uploads', id);
    if(fs.existsSync(directoryPath) === false) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
    const files = fs.readdirSync(directoryPath);
    
    const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')).map(file => {
        return {
            name: file,
            path: `/uploads/${id}/${file}`
        }
    });
    res.render('dataEntry/images', { id, images });
});

router.post('/patient/:id/uploadimages', async(req, res) => {
    const { id } = req.params;
    if (req.files) {
            const file = req.files.image;
            const directoryPath = path.join(__dirname,'..', 'public', 'uploads', id);
            if(fs.existsSync(directoryPath) === false) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }            
            const filepath = path.join(directoryPath, file.name);
            console.log(file);
            file.mv(filepath, function(err){
                if(err){
                    req.flash('error', 'Images uploaded unsuccessfully');
                }
            });
        req.flash('success', 'Images uploaded successfully');
    }
    res.redirect(`/dataEntry/patient/${id}/images`);
});

router.get('/patient/:id/updateTreatment', async(req, res) => {
    const { id } = req.params;
    const treatments = await query(`select * from Treatment,Doctor where patientID=${id}  AND Treatment.doctorID=Doctor.doctorID`);
    res.render('dataEntry/updateTreatment', { id, treatments });
});

router.put('/patient/:id/updateTreatment/:treatmentID', async(req, res) => {
    const { id, treatmentID } = req.params;
    const { treatmentStatus } = req.body;
    await query(`update Treatment set treatmentStatus='${treatmentStatus}' where treatmentID=${treatmentID}`);
    req.flash('success', 'Treatment updated successfully');
    res.redirect(`/dataEntry/patient/${id}/updateTreatment`);
});

router.get('/patient/:id/updateAppointment', async(req, res) => {
    const { id } = req.params;
    const appointments = await query(`select * from Appointment,Doctor where patientID=${id} AND Appointment.doctorID=Doctor.doctorID `);
    console.log(appointments);
    res.render('dataEntry/updateAppointment', { id, appointments });
});

router.put('/patient/:id/updateAppointment/:appointmentID', async(req, res) => {
    const { id, appointmentID } = req.params;
    const { appointmentStatus } = req.body;
    await query(`update Appointment set Status='${appointmentStatus}' where appointmentID=${appointmentID}`);
    req.flash('success', 'Appointment updated successfully');
    res.redirect(`/dataEntry/patient/${id}/updateAppointment`);
});

module.exports = router;