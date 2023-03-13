const nodemailer = require('nodemailer');
const ejs = require('ejs');
const { workerData, parentPort } = require('worker_threads');
const { query } = require('../utils/db');

async function sendEmail() {
    console.log('Sending email...');
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

    const doctors = await query('SELECT * FROM doctor, user WHERE doctor.doctorID = user.userID');
    doctors.forEach(async doctor => {
        // console.log(doctor.email)
        const now = new Date()
        // console.log(now);
        
        const minutes = Math.floor(now.getMinutes()/15)
        // console.log(minutes);
        now.setMinutes(minutes*15)
        now.setSeconds(0)
        const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
        
        // console.log(now, mysqlDateTime);
        let appointments = await query(`select * from Appointment where doctorID = ${doctor.doctorID} AND Status = 'Pending'`);
        // console.log(appointments);
        appointments = appointments.filter(appointment => {
            // console.log(appointment.Date.toISOString().slice(0, 19).replace('T', ' '), mysqlDateTime);
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
        // console.log(appointments);
        // console.log(patients);
        ejs.renderFile('./views/email.ejs', { appointments }, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                // console.log(data);
                const mailOptions = {
                    from: 'vivekdbz248@gmail.com',
                    to: `${doctor.email}`,
                    // to: 'vivekdbz248@gmail.com',
                    subject: 'Patients List',
                    html: data
                }

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
            
        });
    });
}

sendEmail();