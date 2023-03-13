const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const path = require('path');
const fs = require('fs');

router.get('/', async (req, res) => {
    // req.user.userID = req.user.userID.toString()
    // console.log(req.user.Name);
    const id = req.user.userID;
    const patients = await query('select * from Patient, Treatment where Treatment.doctorID = ? and Treatment.patientID = Patient.patientID', [id])
    for (let i = 0; i < patients.length; i++) {
        console.log(patients[i].Name);
    }
    const stays = await query(`select * from Stay where DischargeDate is null`)
    const doctor = await query(`select * from Doctor where doctorID = ${id}`)
    console.log(doctor);
    const rooms = await query(`select * from Room where currentOccupancy < maxCapacity`)
    let available = true
    if (rooms.length === 0) {
        available = false
    }
    // current date and time
    const now = new Date()
    const minutes = Math.floor(now.getMinutes()/15)
    console.log(minutes);
    now.setMinutes(minutes*15)
    now.setSeconds(0)
    console.log(now);
    const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    
    console.log(now, mysqlDateTime);
    // show all appointments under the doctor which are not more than 30 minutes old than the current time and appointment has a Date attribute which is DateTIme in mysql
    // let dates = await query(`select Date from Appointment where doctorID = ${id} and Date > '${mysqlDateTime}'`);
    // console.log(dates);
    let appointments = await query(`select * from Appointment where doctorID = ${id} AND Status = 'Pending'`);
    console.log(appointments);
    appointments = appointments.filter(appointment => {
        console.log(appointment.Date.toISOString().slice(0, 19).replace('T', ' '), mysqlDateTime);
        return appointment.Date.toISOString().slice(0, 19).replace('T', ' ') >= mysqlDateTime;
    });
    // sort the appointments by priority in descending order
    appointments.sort((a, b) => {
        return b.priority - a.priority;
    });
    // All patients 
    const all_patients = await query(`select * from Patient`)
    // patient id and name mapping
    let patient_map = new Map();
    for (let i = 0; i < all_patients.length; i++) {
        patient_map.set(all_patients[i].patientID, all_patients[i].Name);
    }
    // add the patient name to the appointment
    for (let i = 0; i < appointments.length; i++) {
        appointments[i].patientName = patient_map.get(appointments[i].patientID);
    }
    // Treatment Schedule
    console.log(appointments);
    const treatments = await query(`select * from Treatment where treatmentStatus = 'Pending'`)
    if (appointments.length === 0) {
        const flashMessage = req.flash('success', '');
        const message = 'No appointments for today';
        res.render('doctor/dashboard', { doctor, patients, stays, available, treatments, appointments, message, flashMessage });
    } else {
        const flashMessage = 0;
        const message = 0;
        res.render('doctor/dashboard', { doctor, patients, stays, available, treatments, appointments, message, flashMessage });
    }
});


router.get('/patient/:id/treatment', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const patient = await query(`select * from Patient where patientID = ${id}`)
    const treatments = await query(`select Doctor.Name as Dname, Treatment.* from Treatment, Doctor where patientID = ${id} and  Treatment.doctorID = Doctor.doctorID`)
    console.log(treatments);
    if (treatments.length === 0) {
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
        res.render('doctor/treatment', { treatments, patient });
    }

});


router.get('/patient/:id/test', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const patient = await query(`select * from Patient where patientID = ${id}`)
    const tests = await query(`select Test.* from Test where patientID = ${id}`)
    console.log(tests);
    if (tests.length === 0) {
        // loop over patients and print the name
        for (let i = 0; i < patient.length; i++) {
            let str = patient[i].Name + ' has not undergone any test';
            req.flash('success', str);
        }
        // req.flash('success', 'This patient has not undergone any treatment');
        res.redirect('/doctor');
    }
    else {
        // sort the tests by date
        tests.sort((a, b) => {
            return new Date(a.testDate) - new Date(b.testDate);
        });
        res.render('doctor/test', { tests, patient });
    }

});

router.get('/patient', async (req, res) => {
    const patients = await query(`select * from Patient`)
    const stays = await query(`select * from Stay where DischargeDate is null`)
    const treatments = await query(`select * from Treatment where treatmentStatus = 'Pending'`)
    res.render('doctor/patient', { patients, stays, treatments });
});

router.get('/patient/:id/images', async(req, res) => {
    const { id } = req.params;
    console.log(id);
    const directoryPath = path.join(__dirname,'..', 'public', 'uploads', id);
    console.log(directoryPath);
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
    res.render('doctor/images', { id, images });
});

router.get('/patient/:id/scheduletest', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    res.render('doctor/scheduletest', { id });
});

router.post('/patient/:id/test', async(req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const { Testname, Testcenter } = req.body;
    const now = new Date();
    DateTest = now.toISOString().slice(0, 19).replace('T', ' ');
    await query(`INSERT INTO Test (patientID, TestName, TestDate, TestCenter, TestStatus) VALUES (${id}, '${Testname}', '${DateTest}', '${Testcenter}', 'Pending')`)
    req.flash('success', 'Test has been scheduled');
    res.redirect('/doctor/patient');
});


router.get('/patient/:id/scheduletreatment', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    res.render('doctor/scheduletreatment', { id });
});

router.post('/patient/:id/treatment', async(req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const { doctorID, Description, TreatmentDate, TreatmentTime } = req.body;
    const DateTreatment = TreatmentDate + ' ' + TreatmentTime
    console.log(DateTreatment);
    const treatments = await query(`select * from Treatment where doctorID = ${doctorID} and treatmentDate = '${DateTreatment}'`)
    if(treatments.length === 0) {
        await query(`INSERT INTO Treatment (patientID, doctorID, Description, TreatmentDate, TreatmentStatus) VALUES (${id}, ${doctorID}, '${Description}', '${DateTreatment}', 'Pending')`)
        req.flash('success', 'Treatment has been scheduled');
        res.redirect('/doctor/patient');
    } else {
        req.flash('error', 'Doctor is not available at this time');
        res.redirect(`/doctor/patient/${id}/scheduletreatment`);
    }

});


module.exports = router;