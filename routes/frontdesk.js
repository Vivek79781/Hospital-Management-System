const express = require('express');
const router = express.Router();
const { query } = require('../utils/db');
const nodemailer = require('nodemailer');
const ejs = require('ejs');

router.get('/', async(req, res) => {
    const patients = await query('select * from Patient')
    const stays = await query('select * from Stay where DischargeDate is null')
    const rooms = await query(`select * from Room where currentOccupancy < maxCapacity`)
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
    // console.log(req.body);
    try{
    const { Name, Address, Phone, email, DateOfBirth, Gender } = req.body;
    let date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    date.setHours(date.getHours() + 5);
    await query(`INSERT INTO Patient (Name, DOB, Gender, Address, Phone, email, Registration_Date) VALUES ('${Name}', '${DateOfBirth}', '${Gender}', '${Address}', '${Phone}', '${email}', '${date.toISOString().slice(0, 19).replace('T', ' ')}')`)
    req.flash('success', 'Patient has been registered');
    res.redirect('/frontdesk');
    } catch(err) {
        req.flash('error', 'Patient has not been registered');
        res.redirect('/frontdesk/register');
    }
});

router.get('/patient/:id/discharge', async(req, res) => {
    const { id } = req.params;
    const stays = await query(`select * from Stay where PatientID = ${id} and DischargeDate is null`)
    const stay = stays[0]
    const room = await query(`select * from Room where RoomNumber = ${stay.roomNumber}`)
    let occupancy = room[0].currentOccupancy;
    occupancy = occupancy - 1;
    await query(`UPDATE Stay SET DischargeDate = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}' WHERE PatientID = ${id} and DischargeDate is null`)
    await query(`UPDATE Room SET currentOccupancy = ${occupancy} WHERE RoomNumber = ${stay.roomNumber}`)
    res.redirect('/frontdesk');
});

router.get('/patient/:id/admit', async(req, res) => {
    const { id } = req.params;
    // console.log(id);
    const rooms = await query(`select * from Room where currentOccupancy < maxCapacity`)
    // console.log(rooms);
    let date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    date.setHours(date.getHours() + 5);
    await query(`INSERT INTO Stay (patientID, roomNumber, AdmitDate) VALUES (${id}, ${rooms[0].roomNumber}, '${date.toISOString().slice(0, 19).replace('T', ' ')}')`)
    let occupancy = rooms[0].currentOccupancy;
    occupancy = occupancy + 1;
    await query(`UPDATE Room SET currentOccupancy = ${occupancy} WHERE RoomNumber = ${rooms[0].roomNumber}`)
    res.redirect('/frontdesk');
});

router.get('/patient/:id/treatment', async(req, res) => {
    const { id } = req.params;
    const doctors = await query(`select * from Doctor where doctorID in (select userID from User where role = 'Doctor')`)
    res.render('frontdesk/treatment',{id,doctors});
});

router.post('/patient/:id/treatment', async(req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const { doctorID, Description, TreatmentDate, TreatmentTime } = req.body;
    const DateTreatment = TreatmentDate + ' ' + TreatmentTime
    // console.log(DateTreatment);
    const treatments = await query(`select * from Treatment where doctorID = ${doctorID} and treatmentDate = '${DateTreatment}'`)
    if(treatments.length === 0) {
        await query(`INSERT INTO Treatment (patientID, doctorID, Description, treatmentDate, treatmentStatus) VALUES (${id}, ${doctorID}, '${Description}', '${DateTreatment}', 'Pending')`)
        req.flash('success', 'Treatment has been scheduled');
        res.redirect('/frontdesk');
    } else {
        req.flash('error', 'Doctor is not available at this time');
        res.redirect(`/frontdesk/patient/${id}/treatment`);
    }

});


router.get('/patient/:id/test', async(req, res) => {
    const { id } = req.params;
    res.render('frontdesk/test',{id});
});

router.post('/patient/:id/test', async(req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const { Testname, Testcenter } = req.body;
    const now = new Date();
    DateTest = now.toISOString().slice(0, 19).replace('T', ' ');
    await query(`INSERT INTO Test (patientID, TestName, TestDate, TestCenter, TestStatus) VALUES (${id}, '${Testname}', '${DateTest}', '${Testcenter}', 'Pending')`)
    req.flash('success', 'Test has been scheduled');
    res.redirect('/frontdesk');
});

router.get('/patient/:id/bookappointment', async(req, res) => {
    const { id } = req.params;
    const doctors = await query(`select * from Doctor where doctorID in (select userID from User where role = 'Doctor')`)
    res.render('frontdesk/appointment',{id,doctors});
});

router.post('/patient/:id/bookappointment', async(req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const { doctorID, Date, time, reason } = req.body;
    const DateAppointment = Date + ' ' + time
    const appointments = await query(`select * from Appointment where doctorID = ${doctorID} and Date = '${DateAppointment}'`)
    // console.log(appointments);
    if(appointments.length === 0) {
        // console.log(`${id}, ${doctorID}, 2, '${DateAppointment}', '${reason}', 'Pending'`);
        await query(`INSERT INTO Appointment (patientID, doctorID, priority, Date, Reason, Status) VALUES (${id}, ${doctorID}, 2, '${DateAppointment}', '${reason}', 'Pending')`)
        req.flash('success', 'Appointment has been scheduled');
        res.redirect('/frontdesk');
    } else {
        req.flash('error', 'Doctor is not available at this time');
        res.redirect(`/frontdesk/patient/${id}/bookappointment`);
    }
});

router.get('/patient/:id/emergency', async(req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    now = new Date();
    now.setHours(now.getHours() + 5);
    now.setMinutes(now.getMinutes() + 30);
    const minutes = Math.floor(now.getMinutes()/15);
    now.setMinutes(minutes * 15);
    now.setSeconds(0);
    dateTime = now.toISOString().slice(0, 19).replace('T', ' ');

    // Available doctors
    const doctors = await query(`select * from Doctor where doctorID in (select userID from User where role = 'Doctor') AND doctorID NOT IN (select doctorID from Appointment where Date = '${dateTime}')`)
    if(doctors.length !== 0) {
        await query(`INSERT INTO Appointment (patientID, doctorID, Priority, Date, Reason, Status) VALUES (${id}, ${doctors[0].doctorID}, 3, '${dateTime}', 'Emergency', 'Pending')`)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'vivekdbz248@gmail.com',
                // pass: 'zltasmuetrabsatu'
                pass: 'qpieytqwtdhpecuu'
                // pass: 'htqeryxbcgfstpaa'
            }
        });

        const doctor = await query(`SELECT * FROM doctor, user WHERE doctor.doctorID = user.userID AND doctor.doctorID = ${doctors[0].doctorID}`);
        const patient = await query(`SELECT * FROM patient WHERE patient.patientID = ${id}`);
        const mailOptions = {
            from: 'vivekdbz248@gmail.com',
            to: `${doctor[0].email}`,
            // to: 'vivekdbz248@gmail.com',
            subject: 'Emergency Appointment',
            html: `<b>You have an emergency appointment now.
            </b><div class="card col-4 mx-2 my-2 mb-4" style="width: 25rem">
                    <div class="card-body">
                    <p class="card-text">
                        <strong>PatientID :</strong>${id}
                    </p>
                    <p class="card-text">
                        <strong>Patient Name :</strong> ${patient[0].Name}
                    </p>
                    <p class="card-text"><strong>Email :</strong> ${patient[0].email}</p>
                    <p class="card-text"><strong>Phone :</strong> ${patient[0].Phone}</p>
                    </div>
                </div>`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        req.flash('success', `Emergency Appointment has been scheduled to ${doctors[0].Name}`);
        
        res.redirect('/frontdesk');
    } else {
        req.flash('error', 'Sorry, no doctors are available at this time');
        res.redirect(`/frontdesk/patient/${id}/bookappointment`);
    }
});

module.exports = router;